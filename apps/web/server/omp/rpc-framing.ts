import { RPC_MAX_REASSEMBLED_BYTES } from "../../shared/constants.ts";

export class RpcFramingError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "RpcFramingError";
    this.code = code;
  }
}

export interface RpcChunkFrame {
  type: "rpc_chunk";
  chunkId: string;
  index: number;
  count: number;
  byteLength: number;
  data: string;
}

export interface RpcFrameDecoderOptions {
  maxReassembledBytes?: number;
}

interface ActiveChunkAssembly {
  chunkId: string;
  count: number;
  byteLength: number;
  nextIndex: number;
  receivedBytes: number;
  chunks: Uint8Array[];
}

const STRICT_BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeStrictBase64(data: string, chunkId: string, index: number): Uint8Array {
  if (data.length === 0 || data.length % 4 !== 0 || !STRICT_BASE64_REGEX.test(data)) {
    throw new RpcFramingError(
      "INVALID_CHUNK_BASE64",
      `Invalid base64 payload in rpc_chunk ${chunkId}[${index}]`,
    );
  }
  const buf = Buffer.from(data, "base64");
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

function concatUint8Arrays(parts: Uint8Array[], totalLength: number): Uint8Array {
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.byteLength;
  }
  return combined;
}

/**
 * Decodes newline-delimited (0x0A-only) JSON frames from `omp --mode rpc-ui` stdout
 * and reassembles protocol v2 `rpc_chunk` sequences with strict validation.
 */
export class RpcFrameDecoder {
  private readonly maxReassembledBytes: number;
  private readonly utf8Decoder = new TextDecoder("utf-8", { fatal: true });
  private pendingLineBytes: Uint8Array = new Uint8Array(0);
  private activeAssembly: ActiveChunkAssembly | null = null;

  constructor(options: RpcFrameDecoderOptions = {}) {
    const limit = options.maxReassembledBytes ?? RPC_MAX_REASSEMBLED_BYTES;
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new RpcFramingError(
        "INVALID_MAX_REASSEMBLED_BYTES",
        `maxReassembledBytes must be a positive integer, got ${String(limit)}`,
      );
    }
    this.maxReassembledBytes = limit;
  }

  /**
   * Feeds a raw byte chunk from child stdout and returns all complete decoded JSON frames.
   * Splits strictly on 0x0A (`\n`) so U+2028/U+2029 inside strings never break frames.
   */
  feed(chunk: Uint8Array): Record<string, unknown>[] {
    if (chunk.byteLength === 0) {
      return [];
    }

    const combined =
      this.pendingLineBytes.byteLength === 0
        ? chunk
        : concatUint8Arrays([this.pendingLineBytes, chunk], this.pendingLineBytes.byteLength + chunk.byteLength);

    const frames: Record<string, unknown>[] = [];
    let lineStart = 0;

    for (let i = 0; i < combined.byteLength; i++) {
      if (combined[i] === 0x0a) {
        const lineBytes = combined.subarray(lineStart, i);
        lineStart = i + 1;
        if (lineBytes.byteLength === 0) {
          continue;
        }
        const decoded = this.processLineBytes(lineBytes);
        if (decoded !== null) {
          frames.push(decoded);
        }
      }
    }

    this.pendingLineBytes =
      lineStart < combined.byteLength ? combined.slice(lineStart) : new Uint8Array(0);

    return frames;
  }

  /**
   * Verifies no partial line or incomplete `rpc_chunk` sequence remains when stdout closes.
   */
  assertCleanEnd(): void {
    if (this.pendingLineBytes.byteLength > 0) {
      this.pendingLineBytes = new Uint8Array(0);
      throw new RpcFramingError(
        "TRAILING_PARTIAL_FRAME",
        "RPC stdout ended with an unterminated frame",
      );
    }
    if (this.activeAssembly !== null) {
      const { chunkId, nextIndex, count } = this.activeAssembly;
      this.activeAssembly = null;
      throw new RpcFramingError(
        "INCOMPLETE_CHUNK_SEQUENCE",
        `RPC stdout ended mid-sequence for rpc_chunk ${chunkId} (${nextIndex}/${count})`,
      );
    }
  }

  reset(): void {
    this.pendingLineBytes = new Uint8Array(0);
    this.activeAssembly = null;
  }

  private processLineBytes(lineBytes: Uint8Array): Record<string, unknown> | null {
    // Strip optional trailing CR only if part of CRLF; JSON objects cannot end in CR otherwise.
    const trimmedBytes =
      lineBytes.byteLength > 0 && lineBytes[lineBytes.byteLength - 1] === 0x0d
        ? lineBytes.subarray(0, lineBytes.byteLength - 1)
        : lineBytes;

    if (trimmedBytes.byteLength === 0) {
      return null;
    }

    let lineText: string;
    try {
      lineText = this.utf8Decoder.decode(trimmedBytes);
    } catch (err: unknown) {
      this.activeAssembly = null;
      const msg = err instanceof Error ? err.message : String(err);
      throw new RpcFramingError("INVALID_UTF8_FRAME", `Invalid UTF-8 in RPC line: ${msg}`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(lineText);
    } catch (err: unknown) {
      this.activeAssembly = null;
      const msg = err instanceof Error ? err.message : String(err);
      throw new RpcFramingError("INVALID_JSON_FRAME", `Malformed JSON in RPC line: ${msg}`);
    }

    if (!isPlainRecord(parsed)) {
      this.activeAssembly = null;
      throw new RpcFramingError("INVALID_FRAME_TYPE", "RPC frame must be a JSON object");
    }

    if (parsed.type === "rpc_chunk") {
      return this.handleChunkFrame(parsed);
    }

    if (this.activeAssembly !== null) {
      const interruptedId = this.activeAssembly.chunkId;
      this.activeAssembly = null;
      throw new RpcFramingError(
        "INTERRUPTED_CHUNK_SEQUENCE",
        `Received non-chunk frame (${String(parsed.type)}) while assembling rpc_chunk ${interruptedId}`,
      );
    }

    return parsed;
  }

  private handleChunkFrame(raw: Record<string, unknown>): Record<string, unknown> | null {
    const { chunkId, index, count, byteLength, data } = raw;

    if (typeof chunkId !== "string" || chunkId.trim().length === 0) {
      this.activeAssembly = null;
      throw new RpcFramingError("INVALID_CHUNK_HEADER", "rpc_chunk missing non-empty chunkId");
    }
    if (typeof count !== "number" || !Number.isInteger(count) || count <= 0) {
      this.activeAssembly = null;
      throw new RpcFramingError(
        "INVALID_CHUNK_HEADER",
        `rpc_chunk ${chunkId} has invalid count: ${String(count)}`,
      );
    }
    if (
      typeof index !== "number" ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= count
    ) {
      this.activeAssembly = null;
      throw new RpcFramingError(
        "INVALID_CHUNK_HEADER",
        `rpc_chunk ${chunkId} has out-of-range index ${String(index)} for count ${count}`,
      );
    }
    if (typeof byteLength !== "number" || !Number.isInteger(byteLength) || byteLength <= 0) {
      this.activeAssembly = null;
      throw new RpcFramingError(
        "INVALID_CHUNK_HEADER",
        `rpc_chunk ${chunkId} has invalid byteLength: ${String(byteLength)}`,
      );
    }
    if (byteLength > this.maxReassembledBytes) {
      this.activeAssembly = null;
      throw new RpcFramingError(
        "REASSEMBLED_FRAME_TOO_LARGE",
        `rpc_chunk ${chunkId} byteLength ${byteLength} exceeds limit ${this.maxReassembledBytes}`,
      );
    }
    if (typeof data !== "string") {
      this.activeAssembly = null;
      throw new RpcFramingError(
        "INVALID_CHUNK_HEADER",
        `rpc_chunk ${chunkId}[${index}] data must be a base64 string`,
      );
    }

    if (this.activeAssembly === null) {
      if (index !== 0) {
        throw new RpcFramingError(
          "OUT_OF_ORDER_CHUNK",
          `Expected initial rpc_chunk index 0 for ${chunkId}, got ${index}`,
        );
      }
      this.activeAssembly = {
        chunkId,
        count,
        byteLength,
        nextIndex: 0,
        receivedBytes: 0,
        chunks: [],
      };
    } else {
      if (this.activeAssembly.chunkId !== chunkId) {
        const expectedId = this.activeAssembly.chunkId;
        this.activeAssembly = null;
        throw new RpcFramingError(
          "INTERLEAVED_CHUNK_SEQUENCE",
          `Interleaved rpc_chunk ${chunkId} while assembling ${expectedId}`,
        );
      }
      if (this.activeAssembly.count !== count || this.activeAssembly.byteLength !== byteLength) {
        this.activeAssembly = null;
        throw new RpcFramingError(
          "MISMATCHED_CHUNK_METADATA",
          `rpc_chunk ${chunkId}[${index}] changed count or byteLength mid-sequence`,
        );
      }
      if (index !== this.activeAssembly.nextIndex) {
        const expected = this.activeAssembly.nextIndex;
        this.activeAssembly = null;
        throw new RpcFramingError(
          "OUT_OF_ORDER_CHUNK",
          `Expected rpc_chunk ${chunkId} index ${expected}, got ${index}`,
        );
      }
    }

    let decodedChunk: Uint8Array;
    try {
      decodedChunk = decodeStrictBase64(data, chunkId, index);
    } catch (err: unknown) {
      this.activeAssembly = null;
      throw err;
    }

    this.activeAssembly.chunks.push(decodedChunk);
    this.activeAssembly.receivedBytes += decodedChunk.byteLength;
    this.activeAssembly.nextIndex += 1;

    if (
      this.activeAssembly.receivedBytes > this.activeAssembly.byteLength ||
      this.activeAssembly.receivedBytes > this.maxReassembledBytes
    ) {
      const received = this.activeAssembly.receivedBytes;
      const declared = this.activeAssembly.byteLength;
      this.activeAssembly = null;
      throw new RpcFramingError(
        "CHUNK_BYTE_LENGTH_EXCEEDED",
        `rpc_chunk ${chunkId} received ${received} bytes exceeding declared ${declared} bytes`,
      );
    }

    if (this.activeAssembly.nextIndex < this.activeAssembly.count) {
      return null;
    }

    const assembly = this.activeAssembly;
    this.activeAssembly = null;

    if (assembly.receivedBytes !== assembly.byteLength) {
      throw new RpcFramingError(
        "CHUNK_BYTE_LENGTH_MISMATCH",
        `rpc_chunk ${chunkId} reassembled ${assembly.receivedBytes} bytes, expected ${assembly.byteLength}`,
      );
    }

    const fullBytes = concatUint8Arrays(assembly.chunks, assembly.byteLength);
    let jsonText: string;
    try {
      jsonText = this.utf8Decoder.decode(fullBytes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new RpcFramingError(
        "INVALID_UTF8_REASSEMBLED",
        `Invalid UTF-8 in reassembled rpc_chunk ${chunkId}: ${msg}`,
      );
    }

    let reassembled: unknown;
    try {
      reassembled = JSON.parse(jsonText);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new RpcFramingError(
        "INVALID_JSON_REASSEMBLED",
        `Malformed JSON in reassembled rpc_chunk ${chunkId}: ${msg}`,
      );
    }

    if (!isPlainRecord(reassembled)) {
      throw new RpcFramingError(
        "INVALID_FRAME_TYPE",
        `Reassembled rpc_chunk ${chunkId} must decode to a JSON object`,
      );
    }

    return reassembled;
  }
}

export function encodeRpcFrame(obj: unknown): string {
  return `${JSON.stringify(obj)}\n`;
}
