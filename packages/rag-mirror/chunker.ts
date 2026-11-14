import { createHash } from "node:crypto";
import { RAG_CONFIG } from "./config.js";
import type { DocumentChunk } from "./types.js";

export interface ChunkerOptions {
  readonly targetChars?: number;
  readonly overlapLines?: number;
}

/**
 * Deterministically splits text into chunks while tracking exact 1-indexed line ranges.
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
  const overlapLines = options.overlapLines ?? 2;

  const lines = rawText.split(/\r?\n/);
  if (lines.length === 0) {
    return [];
  }

  const chunks: DocumentChunk[] = [];
  let currentChunkLines: string[] = [];
  let currentStartLine = 1;
  let currentChars = 0;
  let chunkIndex = 0;

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
      const sha256 = createHash("sha256").update(chunkText, "utf8").digest("hex");

      chunks.push({
        chunk_id: String(chunkIndex),
        text: chunkText,
        lines: lineRange,
        sha256,
      });

      chunkIndex++;

      if (!isLastLine) {
        // Carry over overlap lines
        const keepCount = Math.min(overlapLines, currentChunkLines.length);
        currentChunkLines = currentChunkLines.slice(currentChunkLines.length - keepCount);
        currentStartLine = lineNumber - keepCount + 1;
        currentChars = currentChunkLines.reduce((acc, l) => acc + l.length + 1, 0);
      } else {
        currentChunkLines = [];
        currentChars = 0;
      }
    }
  }

  return chunks;
}
