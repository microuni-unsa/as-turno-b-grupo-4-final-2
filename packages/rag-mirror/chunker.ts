import { createHash } from "node:crypto";
import { RAG_CONFIG } from "./config.js";
import type { DocumentChunk } from "./types.js";

export interface ChunkerOptions {
  readonly targetChars?: number;
  readonly overlapLines?: number;
  readonly minTrailingChars?: number;
}

interface InternalChunk {
  startLine: number;
  endLine: number;
  text: string;
  lines: string;
  sha256: string;
}

function computeSha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Deterministically splits text into chunks while tracking exact 1-indexed line ranges.
 * Merges undersized trailing fragments (< MIN_TRAILING_CHUNK_CHARS) into the preceding chunk.
 * Computes per-chunk SHA-256 for integrity and citation generation.
 */
export function chunkTextWithLines(
  rawText: string,
  options: ChunkerOptions = {}
): DocumentChunk[] {
  if (rawText.length === 0) {
    return [];
  }

  const targetChars = options.targetChars ?? RAG_CONFIG.DEFAULT_CHUNK_SIZE;
  const overlapLines = options.overlapLines ?? RAG_CONFIG.DEFAULT_CHUNK_OVERLAP;
  const minTrailingChars = options.minTrailingChars ?? RAG_CONFIG.MIN_TRAILING_CHUNK_CHARS;

  if (targetChars <= 0) {
    throw new Error(`Invalid targetChars (${targetChars}): must be positive`);
  }
  if (overlapLines < 0) {
    throw new Error(`Invalid overlapLines (${overlapLines}): must be non-negative`);
  }
  if (minTrailingChars < 0) {
    throw new Error(`Invalid minTrailingChars (${minTrailingChars}): must be non-negative`);
  }

  const lines = rawText.split(/\r?\n/);
  if (lines.length === 0) {
    return [];
  }

  const chunks: InternalChunk[] = [];
  let currentChunkLines: string[] = [];
  let currentStartLine = 1;
  let currentChars = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i];
    currentChunkLines.push(line);
    currentChars += line.length + 1; // +1 for newline

    const isLastLine = i === lines.length - 1;
    const exceedsTarget = currentChars >= targetChars;

    if (exceedsTarget || isLastLine) {
      const chunkText = currentChunkLines.join("\n");
      const endLine = lineNumber;
      const lineRange = `L${currentStartLine}-L${endLine}`;

      chunks.push({
        startLine: currentStartLine,
        endLine,
        text: chunkText,
        lines: lineRange,
        sha256: computeSha256(chunkText),
      });

      if (!isLastLine) {
        // Carry over overlap lines, never exceeding currentChunkLines.length - 1
        const keepCount = Math.min(overlapLines, Math.max(0, currentChunkLines.length - 1));
        currentChunkLines = keepCount > 0 ? currentChunkLines.slice(currentChunkLines.length - keepCount) : [];
        currentStartLine = lineNumber - keepCount + 1;
        currentChars = currentChunkLines.reduce((acc, l) => acc + l.length + 1, 0);
      } else {
        currentChunkLines = [];
        currentChars = 0;
      }
    }
  }

  if (chunks.length > 1) {
    const lastChunk = chunks[chunks.length - 1];
    if (lastChunk.text.length < minTrailingChars) {
      chunks.pop();
      const prevChunk = chunks[chunks.length - 1];
      const mergedText = lines.slice(prevChunk.startLine - 1, lastChunk.endLine).join("\n");
      prevChunk.endLine = lastChunk.endLine;
      prevChunk.text = mergedText;
      prevChunk.lines = `L${prevChunk.startLine}-L${lastChunk.endLine}`;
      prevChunk.sha256 = computeSha256(mergedText);
    }
  }

  return chunks.map((chunk, idx) => ({
    chunk_id: String(idx),
    text: chunk.text,
    lines: chunk.lines,
    sha256: chunk.sha256,
  }));
}
