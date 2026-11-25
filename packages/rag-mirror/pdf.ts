import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Normalized text extraction for PDF and text-based mirror artifacts.
 * Supports authoring-agnostic PDFs via `pdftotext -layout -nopgbrk`, plus an
 * explicit deterministic OCR branch (`pdfinfo` -> `pdftoppm -png` -> `tesseract`)
 * for scanned PDFs without an embedded text layer.
 */

export function normalizeTextWhitespace(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function runTool(cmd: string[], filename: string, stdin?: Uint8Array): string {
  let proc: ReturnType<typeof Bun.spawnSync>;
  try {
    proc = Bun.spawnSync(cmd, {
      ...(stdin !== undefined ? { stdin } : {}),
      stdout: "pipe",
      stderr: "pipe",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`${cmd[0]} execution failed for ${filename}: ${msg}`);
  }

  if (proc.exitCode !== 0) {
    const errText = new TextDecoder().decode(proc.stderr).trim();
    throw new Error(
      `${cmd[0]} extraction failed for ${filename} [exit ${proc.exitCode ?? proc.signalCode ?? "unknown"}]: ${errText}`,
    );
  }

  return new TextDecoder().decode(proc.stdout);
}

function extractPdfWithOcr(bytes: Uint8Array, filename: string): string {
  const workDir = mkdtempSync(join(tmpdir(), "pims-pdf-ocr-"));
  try {
    const pdfPath = join(workDir, "input.pdf");
    writeFileSync(pdfPath, bytes);

    const infoOutput = runTool(["pdfinfo", pdfPath], filename);
    const pagesMatch = /^Pages:\s*(\d+)/m.exec(infoOutput);
    const pageCount = pagesMatch !== null ? Number.parseInt(pagesMatch[1], 10) : Number.NaN;
    if (!Number.isFinite(pageCount) || pageCount <= 0) {
      throw new Error(
        `pdfinfo reported invalid or zero page count for ${filename}: ${infoOutput.trim()}`,
      );
    }

    const pagePrefix = join(workDir, "page");
    runTool(["pdftoppm", "-png", pdfPath, pagePrefix], filename);

    const pageImages = readdirSync(workDir)
      .filter((entry) => entry.startsWith("page-") && entry.endsWith(".png"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (pageImages.length === 0) {
      throw new Error(
        `pdftoppm produced no PNG page images for ${filename} (expected ${pageCount} page(s))`,
      );
    }

    const pageTexts: string[] = [];
    for (const imageFile of pageImages) {
      const ocrOutput = runTool(
        ["tesseract", join(workDir, imageFile), "stdout", "-l", "spa+eng"],
        `${filename}:${imageFile}`,
      );
      pageTexts.push(ocrOutput.replace(/\f/g, ""));
    }

    const normalizedOcr = normalizeTextWhitespace(pageTexts.join("\n\n"));
    if (normalizedOcr.replace(/\s+/g, "").length === 0) {
      throw new Error(
        `OCR extraction via tesseract yielded empty text for scanned PDF ${filename} (${pageImages.length} page(s))`,
      );
    }

    return normalizedOcr;
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

export function extractNormalizedText(
  bytesOrText: Uint8Array | string,
  filename: string,
): string {
  if (typeof bytesOrText === "string") {
    return normalizeTextWhitespace(bytesOrText);
  }

  if (filename.toLowerCase().endsWith(".pdf")) {
    const extracted = runTool(
      ["pdftotext", "-layout", "-nopgbrk", "-", "-"],
      filename,
      bytesOrText,
    );

    if (extracted.replace(/\s+/g, "").length > 0) {
      return normalizeTextWhitespace(extracted);
    }

    return extractPdfWithOcr(bytesOrText, filename);
  }

  return normalizeTextWhitespace(new TextDecoder().decode(bytesOrText));
}
