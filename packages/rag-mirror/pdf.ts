/**
 * Normalized text extraction for PDF and text-based mirror artifacts.
 * Fails fast if pdftotext returns a non-zero exit code; never decodes PDF bytes as raw UTF-8.
 */

export function normalizeTextWhitespace(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractNormalizedText(
  bytesOrText: Uint8Array | string,
  filename: string,
): string {
  if (typeof bytesOrText === "string") {
    return normalizeTextWhitespace(bytesOrText);
  }

  if (filename.toLowerCase().endsWith(".pdf")) {
    const proc = Bun.spawnSync(["pdftotext", "-", "-"], {
      stdin: bytesOrText,
      stdout: "pipe",
      stderr: "pipe",
    });
    if (proc.exitCode !== 0) {
      const err = new TextDecoder().decode(proc.stderr);
      throw new Error(
        `pdftotext extraction failed for ${filename} [exit ${proc.exitCode}]: ${err}`,
      );
    }
    return normalizeTextWhitespace(new TextDecoder().decode(proc.stdout));
  }

  return normalizeTextWhitespace(new TextDecoder().decode(bytesOrText));
}
