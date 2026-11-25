import { createHash } from "node:crypto";
import { diffLines } from "diff";
import { chunkTextWithLines } from "./chunker.js";
import { RAG_CONFIG } from "./config.js";
import { readFromCorpusMirror } from "./mirror.js";
import { extractNormalizedText } from "./pdf.js";
import type {
  ChunkDiffItem,
  DiffStats,
  DocumentChunk,
  LineDiffItem,
  PimsAdapterInterface,
  PimsDocumentFetcher,
  StructuralDiff,
} from "./types.js";

/**
 * Dedicated typed error naming WHICH document and version is missing.
 */
export class MissingVersionError extends Error {
  readonly pims_doc_id: string;
  readonly missing_version: string;

  constructor(pims_doc_id: string, missing_version: string, details?: string) {
    const detailMsg = details !== undefined ? `: ${details}` : "";
    super(
      `Document '${pims_doc_id}' is missing version '${missing_version}'${detailMsg}`
    );
    this.name = "MissingVersionError";
    this.pims_doc_id = pims_doc_id;
    this.missing_version = missing_version;
    Object.setPrototypeOf(this, MissingVersionError.prototype);
  }
}

export interface VersionCompareOptions {
  readonly fetcher?: PimsDocumentFetcher | PimsAdapterInterface;
  readonly mirrorDir?: string;
  readonly targetChars?: number;
  readonly overlapLines?: number;
}

interface LoadedVersionData {
  readonly version: string;
  readonly text: string;
  readonly chunks: DocumentChunk[];
  readonly sha256: string;
  readonly supersedes: string | null;
}

/**
 * Fetches document version from local mirror or falls back to PIMS fetcher.
 * Throws typed MissingVersionError naming the exact version if not found.
 */
async function loadVersionData(
  pims_doc_id: string,
  version: string,
  options: VersionCompareOptions
): Promise<LoadedVersionData> {
  const mirrorDir = options.mirrorDir ?? RAG_CONFIG.CORPUS_MIRROR_DIR;

  // 1. Try reading from local corpus mirror
  try {
    const mirror = readFromCorpusMirror(pims_doc_id, version, mirrorDir);
    const chunks = chunkTextWithLines(mirror.text, {
      targetChars: options.targetChars ?? RAG_CONFIG.DEFAULT_CHUNK_SIZE,
      overlapLines: options.overlapLines ?? RAG_CONFIG.DEFAULT_CHUNK_OVERLAP,
    });
    return {
      version,
      text: mirror.text,
      chunks,
      sha256: mirror.sha256,
      supersedes: mirror.manifestEntry.supersedes,
    };
  } catch (mirrorErr) {
    // 2. If mirror read fails, check injected PIMS fetcher
    if (options.fetcher !== undefined) {
      const fetcherFn =
        typeof options.fetcher === "function"
          ? options.fetcher
          : (id: string, v: string) =>
              (options.fetcher as PimsAdapterInterface).fetchDocumentVersion(id, v);

      try {
        const doc = await fetcherFn(pims_doc_id, version);
        if (!doc || doc.pims_version !== version) {
          throw new MissingVersionError(
            pims_doc_id,
            version,
            "PIMS fetcher returned empty or mismatched version"
          );
        }

        const text = extractNormalizedText(doc.content, doc.filename);

        const sha256 = createHash("sha256").update(text, "utf8").digest("hex");
        const chunks = chunkTextWithLines(text, {
          targetChars: options.targetChars ?? RAG_CONFIG.DEFAULT_CHUNK_SIZE,
          overlapLines: options.overlapLines ?? RAG_CONFIG.DEFAULT_CHUNK_OVERLAP,
        });

        return {
          version,
          text,
          chunks,
          sha256,
          supersedes: doc.supersedes ?? null,
        };
      } catch (fetchErr) {
        if (fetchErr instanceof MissingVersionError) {
          throw fetchErr;
        }
        throw new MissingVersionError(
          pims_doc_id,
          version,
          `Failed fetching from mirror and PIMS: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
        );
      }
    }

    throw new MissingVersionError(
      pims_doc_id,
      version,
      `Not found in local corpus mirror and no PIMS fetcher provided`
    );
  }
}

const DIFF_CONTEXT_LINES = 2;

function computeMyersLineDiffs(
  textA: string,
  textB: string
): {
  lineDiffs: LineDiffItem[];
  linesAdded: number;
  linesRemoved: number;
} {
  const changes = diffLines(textA, textB, {
    ignoreNewlineAtEof: true,
    stripTrailingCr: true,
  });

  const allLineDiffs: LineDiffItem[] = [];
  let linesAdded = 0;
  let linesRemoved = 0;
  let lineA = 1;
  let lineB = 1;

  for (const part of changes) {
    if (part.value.length === 0) {
      continue;
    }

    const trimmedValue = part.value.endsWith("\n")
      ? part.value.slice(0, -1)
      : part.value;
    const partLines = trimmedValue.split("\n");

    if (part.added) {
      for (const text of partLines) {
        linesAdded++;
        allLineDiffs.push({
          type: "added",
          line_number_b: lineB,
          text,
        });
        lineB++;
      }
    } else if (part.removed) {
      for (const text of partLines) {
        linesRemoved++;
        allLineDiffs.push({
          type: "removed",
          line_number_a: lineA,
          text,
        });
        lineA++;
      }
    } else {
      for (const text of partLines) {
        allLineDiffs.push({
          type: "unchanged",
          line_number_a: lineA,
          line_number_b: lineB,
          text,
        });
        lineA++;
        lineB++;
      }
    }
  }

  // Emit only changed hunks plus +/- DIFF_CONTEXT_LINES unchanged context lines
  const keep = new Array<boolean>(allLineDiffs.length).fill(false);
  for (let i = 0; i < allLineDiffs.length; i++) {
    if (allLineDiffs[i].type !== "unchanged") {
      const start = Math.max(0, i - DIFF_CONTEXT_LINES);
      const end = Math.min(allLineDiffs.length - 1, i + DIFF_CONTEXT_LINES);
      for (let j = start; j <= end; j++) {
        keep[j] = true;
      }
    }
  }

  const lineDiffs = allLineDiffs.filter((_, idx) => keep[idx]);

  return { lineDiffs, linesAdded, linesRemoved };
}

/**
 * Computes structural differences between two versions of a document.
 */
export async function compareVersions(
  pims_doc_id: string,
  versionA: string,
  versionB: string,
  options: VersionCompareOptions = {}
): Promise<StructuralDiff> {
  // Load version A first; raises MissingVersionError naming versionA if missing
  const dataA = await loadVersionData(pims_doc_id, versionA, options);

  // Load version B next; raises MissingVersionError naming versionB if missing
  const dataB = await loadVersionData(pims_doc_id, versionB, options);

  // Compute chunk-level diffs
  const chunkDiffs: ChunkDiffItem[] = [];
  const maxChunkCount = Math.max(dataA.chunks.length, dataB.chunks.length);

  let chunksAdded = 0;
  let chunksRemoved = 0;
  let chunksModified = 0;
  let chunksUnchanged = 0;

  for (let i = 0; i < maxChunkCount; i++) {
    const chunkA = dataA.chunks[i];
    const chunkB = dataB.chunks[i];

    if (chunkA !== undefined && chunkB !== undefined) {
      if (chunkA.sha256 === chunkB.sha256) {
        chunksUnchanged++;
        chunkDiffs.push({
          type: "unchanged",
          chunk_id_a: chunkA.chunk_id,
          chunk_id_b: chunkB.chunk_id,
          lines_a: chunkA.lines,
          lines_b: chunkB.lines,
          text_a: chunkA.text,
          text_b: chunkB.text,
          sha256_a: chunkA.sha256,
          sha256_b: chunkB.sha256,
        });
      } else {
        chunksModified++;
        chunkDiffs.push({
          type: "modified",
          chunk_id_a: chunkA.chunk_id,
          chunk_id_b: chunkB.chunk_id,
          lines_a: chunkA.lines,
          lines_b: chunkB.lines,
          text_a: chunkA.text,
          text_b: chunkB.text,
          sha256_a: chunkA.sha256,
          sha256_b: chunkB.sha256,
        });
      }
    } else if (chunkA !== undefined && chunkB === undefined) {
      chunksRemoved++;
      chunkDiffs.push({
        type: "removed",
        chunk_id_a: chunkA.chunk_id,
        lines_a: chunkA.lines,
        text_a: chunkA.text,
        sha256_a: chunkA.sha256,
      });
    } else if (chunkA === undefined && chunkB !== undefined) {
      chunksAdded++;
      chunkDiffs.push({
        type: "added",
        chunk_id_b: chunkB.chunk_id,
        lines_b: chunkB.lines,
        text_b: chunkB.text,
        sha256_b: chunkB.sha256,
      });
    }
  }

  // Compute line-level diffs using Myers diff algorithm (with +/- 2 line context hunks)
  const { lineDiffs, linesAdded, linesRemoved } = computeMyersLineDiffs(
    dataA.text,
    dataB.text
  );

  const stats: DiffStats = {
    chunks_added: chunksAdded,
    chunks_removed: chunksRemoved,
    chunks_modified: chunksModified,
    chunks_unchanged: chunksUnchanged,
    lines_added: linesAdded,
    lines_removed: linesRemoved,
  };

  const summary =
    `Diff ${pims_doc_id} (v${versionA} -> v${versionB}): ` +
    `${chunksModified} chunks modified, ${chunksAdded} added, ${chunksRemoved} removed, ` +
    `${chunksUnchanged} unchanged. (${linesAdded} lines added, ${linesRemoved} lines removed).`;

  return {
    pims_doc_id,
    version_a: versionA,
    version_b: versionB,
    chunks_a_count: dataA.chunks.length,
    chunks_b_count: dataB.chunks.length,
    sha256_a: dataA.sha256,
    sha256_b: dataB.sha256,
    supersedes: dataB.supersedes ?? dataA.version,
    chunk_diffs: chunkDiffs,
    line_diffs: lineDiffs,
    stats,
    summary,
  };
}
