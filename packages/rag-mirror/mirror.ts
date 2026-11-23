import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { RAG_CONFIG } from "./config.js";
import { extractNormalizedText } from "./pdf.js";
import type { CorpusMirrorManifest, ManifestVersionEntry } from "./types.js";

export interface WriteMirrorOptions {
  readonly pims_doc_id: string;
  readonly code: string;
  readonly pims_version: string;
  readonly status: string;
  readonly filename: string;
  readonly content: Uint8Array | string;
  readonly extracted_text?: string;
  readonly chunk_count: number;
  readonly chunk_sha256s: string[];
  readonly supersedes?: string | null;
  readonly mold_path?: string | null;
  readonly uploaded_at?: string;
  readonly mirrorDir?: string;
}

export interface ReadMirrorResult {
  readonly pims_doc_id: string;
  readonly code: string;
  readonly pims_version: string;
  readonly filePath: string;
  readonly textPath: string;
  readonly content: Uint8Array;
  readonly text: string;
  readonly sha256: string;
  readonly manifestEntry: ManifestVersionEntry;
}

/**
 * Resolves mirror directory path strictly relative to project root.
 */
export function getDocMirrorDir(docId: string, mirrorDir: string = RAG_CONFIG.CORPUS_MIRROR_DIR): string {
  return join(mirrorDir, docId);
}

/**
 * Returns manifest path for a given doc ID.
 */
export function getManifestPath(docId: string, mirrorDir: string = RAG_CONFIG.CORPUS_MIRROR_DIR): string {
  return join(getDocMirrorDir(docId, mirrorDir), "manifest.json");
}

/**
 * Reads manifest for a document from local corpus mirror.
 * Returns null if manifest does not exist.
 */
export function readCorpusManifest(
  docId: string,
  mirrorDir: string = RAG_CONFIG.CORPUS_MIRROR_DIR
): CorpusMirrorManifest | null {
  const manifestPath = getManifestPath(docId, mirrorDir);
  if (!existsSync(manifestPath)) {
    return null;
  }
  const raw = readFileSync(manifestPath, "utf8");
  return JSON.parse(raw) as CorpusMirrorManifest;
}

/**
 * Writes or updates a file version in the local corpus mirror.
 * Maintains immutable versioned files (corpus_mirror/<doc_id>/v<n>.<ext>)
 * and tracks the supersedes chain in manifest.json.
 */
export function writeToCorpusMirror(options: WriteMirrorOptions): {
  filePath: string;
  manifestPath: string;
  fileSha256: string;
  manifest: CorpusMirrorManifest;
} {
  const mirrorDir = options.mirrorDir ?? RAG_CONFIG.CORPUS_MIRROR_DIR;
  const docDir = getDocMirrorDir(options.pims_doc_id, mirrorDir);

  if (!existsSync(docDir)) {
    mkdirSync(docDir, { recursive: true });
  }

  // Derive file extension
  const ext = extname(options.filename) || ".bin";
  const versionFileName = `v${options.pims_version}${ext}`;
  const filePath = join(docDir, versionFileName);

  // Normalize content to Buffer/Uint8Array
  const contentBytes =
    typeof options.content === "string"
      ? Buffer.from(options.content, "utf8")
      : Buffer.from(options.content);

  const fileSha256 = createHash("sha256").update(contentBytes).digest("hex");
  writeFileSync(filePath, contentBytes);

  // Persist sibling normalized UTF-8 text (v<n>.txt) for PDF/binary files so reads/diffs never decode %PDF- bytes
  const txtFileName = `v${options.pims_version}.txt`;
  const textPath = ext.toLowerCase() === ".txt" ? filePath : join(docDir, txtFileName);
  const extractedText =
    options.extracted_text !== undefined
      ? options.extracted_text
      : extractNormalizedText(
          typeof options.content === "string" ? options.content : contentBytes,
          options.filename,
        );
  if (textPath !== filePath) {
    writeFileSync(textPath, extractedText, "utf8");
  }

  // Read existing manifest or initialize new
  const manifestPath = getManifestPath(options.pims_doc_id, mirrorDir);
  const existingManifest = readCorpusManifest(options.pims_doc_id, mirrorDir);

  const previousLatest = existingManifest?.latest_version ?? null;
  const resolvedSupersedes =
    options.supersedes !== undefined
      ? options.supersedes
      : previousLatest !== null && previousLatest !== options.pims_version
        ? previousLatest
        : null;

  const versionEntry: ManifestVersionEntry = {
    pims_doc_id: options.pims_doc_id,
    pims_version: options.pims_version,
    filename: versionFileName,
    file_path: filePath,
    text_path: textPath,
    sha256: fileSha256,
    chunk_count: options.chunk_count,
    chunk_sha256s: options.chunk_sha256s,
    supersedes: resolvedSupersedes,
    mold_path: options.mold_path ?? null,
    uploaded_at: options.uploaded_at ?? new Date().toISOString(),
    status: options.status,
  };

  let updatedVersions: ManifestVersionEntry[];
  if (existingManifest !== null) {
    const existingIndex = existingManifest.versions.findIndex(
      (v) => v.pims_version === options.pims_version
    );
    if (existingIndex >= 0) {
      updatedVersions = existingManifest.versions.map((v, i) =>
        i === existingIndex ? versionEntry : v
      );
    } else {
      updatedVersions = [...existingManifest.versions, versionEntry];
    }
  } else {
    updatedVersions = [versionEntry];
  }

  // Sort versions ascending by numerical version
  const sortedVersions = [...updatedVersions].sort((a, b) => {
    const vA = parseFloat(a.pims_version);
    const vB = parseFloat(b.pims_version);
    return vA - vB;
  });

  const latestVersion = sortedVersions[sortedVersions.length - 1]?.pims_version ?? options.pims_version;

  const manifest: CorpusMirrorManifest = {
    pims_doc_id: options.pims_doc_id,
    code: options.code,
    latest_version: latestVersion,
    versions: sortedVersions,
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  return {
    filePath,
    manifestPath,
    fileSha256,
    manifest,
  };
}

/**
 * Reads a specific version of a document from local corpus mirror.
 * Throws an explicit error if missing.
 */
export function readFromCorpusMirror(
  docId: string,
  version: string,
  mirrorDir: string = RAG_CONFIG.CORPUS_MIRROR_DIR
): ReadMirrorResult {
  const manifest = readCorpusManifest(docId, mirrorDir);
  if (manifest === null) {
    throw new Error(`Corpus mirror manifest not found for document '${docId}' in '${mirrorDir}'`);
  }

  const versionEntry = manifest.versions.find((v) => v.pims_version === version);
  if (versionEntry === undefined) {
    throw new Error(
      `Version '${version}' not found in corpus mirror manifest for document '${docId}'`
    );
  }

  if (!existsSync(versionEntry.file_path)) {
    throw new Error(
      `Corpus mirror file missing at '${versionEntry.file_path}' for document '${docId}' v${version}`
    );
  }

  const content = readFileSync(versionEntry.file_path);
  const candidateTxtPath = versionEntry.text_path ?? join(dirname(versionEntry.file_path), `v${version}.txt`);
  const text = existsSync(candidateTxtPath) && candidateTxtPath !== versionEntry.file_path
    ? readFileSync(candidateTxtPath, "utf8")
    : extractNormalizedText(content, versionEntry.filename);

  return {
    pims_doc_id: docId,
    code: manifest.code,
    pims_version: version,
    filePath: versionEntry.file_path,
    textPath: existsSync(candidateTxtPath) ? candidateTxtPath : versionEntry.file_path,
    content,
    text,
    sha256: versionEntry.sha256,
    manifestEntry: versionEntry,
  };
}
