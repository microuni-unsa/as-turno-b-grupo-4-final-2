import { describe, expect, test } from "bun:test";
import { RpcFrameDecoder, RpcFramingError, encodeRpcFrame } from "./rpc-framing.ts";

const enc = new TextEncoder();

describe("encodeRpcFrame", () => {
  test("serializes object as single-line JSON terminated by LF", () => {
    const encoded = encodeRpcFrame({ id: "req_1", type: "get_state" });
    expect(encoded).toBe('{"id":"req_1","type":"get_state"}\n');
  });
});

describe("RpcFrameDecoder", () => {
  test("decodes multiple frames and partial UTF-8 splits across feed calls", () => {
    const decoder = new RpcFrameDecoder();
    const line1 = encodeRpcFrame({ type: "ready", protocolVersion: 1 });
    const line2 = encodeRpcFrame({ type: "notice", text: "Árbol ISO/IEC 27701 — cláusula 5.2 🚀" });
    const bytes = enc.encode(line1 + line2);

    // Split right in the middle of a multi-byte UTF-8 character in line2
    const splitPoint = enc.encode(line1).byteLength + 34;
    const partA = bytes.subarray(0, splitPoint);
    const partB = bytes.subarray(splitPoint);

    const outA = decoder.feed(partA);
    const outB = decoder.feed(partB);
    decoder.assertCleanEnd();

    expect(outA).toEqual([{ type: "ready", protocolVersion: 1 }]);
    expect(outB).toEqual([{ type: "notice", text: "Árbol ISO/IEC 27701 — cláusula 5.2 🚀" }]);
  });

  test("preserves literal U+2028 and U+2029 inside JSON strings by splitting strictly on 0x0A", () => {
    const decoder = new RpcFrameDecoder();
    const payload = {
      type: "message_update",
      text: "line1\u2028line2\u2029line3",
    };
    const raw = enc.encode(encodeRpcFrame(payload));

    const frames = decoder.feed(raw);
    decoder.assertCleanEnd();

    expect(frames).toHaveLength(1);
    expect(frames[0]).toEqual(payload);
  });

  test("reassembles valid protocol v2 multi-chunk frame", () => {
    const decoder = new RpcFrameDecoder();
    const target = {
      type: "response",
      id: "req_42",
      command: "get_messages_page",
      success: true,
      data: {
        messages: [{ role: "assistant", text: "Contenido largo con eñe ñ y acentos áéíóú ".repeat(20) }],
      },
    };
    const fullBytes = enc.encode(JSON.stringify(target));
    const chunk0Bytes = fullBytes.subarray(0, Math.floor(fullBytes.byteLength / 3));
    const chunk1Bytes = fullBytes.subarray(
      Math.floor(fullBytes.byteLength / 3),
      Math.floor((fullBytes.byteLength * 2) / 3),
    );
    const chunk2Bytes = fullBytes.subarray(Math.floor((fullBytes.byteLength * 2) / 3));

    const f0 = encodeRpcFrame({
      type: "rpc_chunk",
      chunkId: "rpc-1",
      index: 0,
      count: 3,
      byteLength: fullBytes.byteLength,
      data: Buffer.from(chunk0Bytes).toString("base64"),
    });
    const f1 = encodeRpcFrame({
      type: "rpc_chunk",
      chunkId: "rpc-1",
      index: 1,
      count: 3,
      byteLength: fullBytes.byteLength,
      data: Buffer.from(chunk1Bytes).toString("base64"),
    });
    const f2 = encodeRpcFrame({
      type: "rpc_chunk",
      chunkId: "rpc-1",
      index: 2,
      count: 3,
      byteLength: fullBytes.byteLength,
      data: Buffer.from(chunk2Bytes).toString("base64"),
    });

    expect(decoder.feed(enc.encode(f0))).toEqual([]);
    expect(decoder.feed(enc.encode(f1))).toEqual([]);
    expect(decoder.feed(enc.encode(f2))).toEqual([target]);
    decoder.assertCleanEnd();
  });

  test("rejects interleaved chunkId sequences", () => {
    const decoder = new RpcFrameDecoder();
    const payload = enc.encode(JSON.stringify({ ok: true }));
    const c0 = encodeRpcFrame({
      type: "rpc_chunk",
      chunkId: "rpc-1",
      index: 0,
      count: 2,
      byteLength: payload.byteLength,
      data: Buffer.from(payload.subarray(0, 4)).toString("base64"),
    });
    const interleaved = encodeRpcFrame({
      type: "rpc_chunk",
      chunkId: "rpc-2",
      index: 0,
      count: 2,
      byteLength: payload.byteLength,
      data: Buffer.from(payload.subarray(0, 4)).toString("base64"),
    });

    decoder.feed(enc.encode(c0));
    expect(() => decoder.feed(enc.encode(interleaved))).toThrow(RpcFramingError);
  });

  test("rejects non-chunk frame interrupting an active chunk sequence", () => {
    const decoder = new RpcFrameDecoder();
    const payload = enc.encode(JSON.stringify({ ok: true }));
    const c0 = encodeRpcFrame({
      type: "rpc_chunk",
      chunkId: "rpc-1",
      index: 0,
      count: 2,
      byteLength: payload.byteLength,
      data: Buffer.from(payload.subarray(0, 4)).toString("base64"),
    });
    const interrupt = encodeRpcFrame({ type: "agent_start" });

    decoder.feed(enc.encode(c0));
    expect(() => decoder.feed(enc.encode(interrupt))).toThrow(RpcFramingError);
  });

  test("rejects out-of-order chunk index", () => {
    const decoder = new RpcFrameDecoder();
    const payload = enc.encode(JSON.stringify({ ok: true }));
    const c1First = encodeRpcFrame({
      type: "rpc_chunk",
      chunkId: "rpc-1",
      index: 1,
      count: 2,
      byteLength: payload.byteLength,
      data: Buffer.from(payload.subarray(0, 4)).toString("base64"),
    });

    expect(() => decoder.feed(enc.encode(c1First))).toThrow(RpcFramingError);
  });

  test("rejects oversize byteLength exceeding maxReassembledBytes", () => {
    const decoder = new RpcFrameDecoder({ maxReassembledBytes: 64 });
    const payload = enc.encode(JSON.stringify({ big: "x".repeat(100) }));
    const frame = encodeRpcFrame({
      type: "rpc_chunk",
      chunkId: "rpc-big",
      index: 0,
      count: 1,
      byteLength: payload.byteLength,
      data: Buffer.from(payload).toString("base64"),
    });

    expect(() => decoder.feed(enc.encode(frame))).toThrow(RpcFramingError);
  });

  test("rejects chunk byteLength mismatch", () => {
    const decoder = new RpcFrameDecoder();
    const payload = enc.encode(JSON.stringify({ ok: true }));
    const frame = encodeRpcFrame({
      type: "rpc_chunk",
      chunkId: "rpc-bad-len",
      index: 0,
      count: 1,
      byteLength: payload.byteLength + 5,
      data: Buffer.from(payload).toString("base64"),
    });

    expect(() => decoder.feed(enc.encode(frame))).toThrow(RpcFramingError);
  });

  test("rejects invalid base64 in chunk", () => {
    const decoder = new RpcFrameDecoder();
    const frame = encodeRpcFrame({
      type: "rpc_chunk",
      chunkId: "rpc-bad-b64",
      index: 0,
      count: 1,
      byteLength: 4,
      data: "not*valid*b64",
    });

    expect(() => decoder.feed(enc.encode(frame))).toThrow(RpcFramingError);
  });

  test("assertCleanEnd throws on trailing partial line or incomplete chunk sequence", () => {
    const d1 = new RpcFrameDecoder();
    d1.feed(enc.encode('{"type":"ready"'));
    expect(() => d1.assertCleanEnd()).toThrow(RpcFramingError);

    const d2 = new RpcFrameDecoder();
    d2.feed(
      enc.encode(
        encodeRpcFrame({
          type: "rpc_chunk",
          chunkId: "rpc-incomplete",
          index: 0,
          count: 2,
          byteLength: 20,
          data: Buffer.from("{\"type\":\"ready\"").toString("base64"),
        }),
      ),
    );
    expect(() => d2.assertCleanEnd()).toThrow(RpcFramingError);
  });
});
