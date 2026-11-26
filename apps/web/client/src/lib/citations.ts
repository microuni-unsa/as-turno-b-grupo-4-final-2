import {
  DELIVERABLE_LINK_REGEX,
  EXTERNAL_SERVICE_URL_REGEX,
  PIMS_CITATION_REGEX,
  RESERVED_SUBDOMAIN_SLUGS,
} from "@/lib/constants";

export interface ParsedPimsCitation {
  raw: string;
  doc: string;
  version: string;
  chunkId: string;
  lines: string;
}

export interface ExternalServiceLink {
  url: string;
  slug: string;
}

/**
 * Parses canonical pims: citations in both formats:
 * - pims:G4-SOA-01:v4.00:5:L114-L133
 * - pims:G4-ALC-01:v3.00:chunk_5:lines:114-133
 */
export function parsePimsCitation(raw: string): ParsedPimsCitation | null {
  const cleaned = raw.trim().replace(/[.,;:\])`]+$/, "");
  if (!cleaned.startsWith("pims:")) return null;

  const rest = cleaned.slice("pims:".length);
  const parts = rest.split(":");
  if (parts.length < 3) return null;

  const doc = parts[0] ?? "";
  const verRaw = parts[1] ?? "";
  if (!doc || !/^v[0-9.]+$/i.test(verRaw)) return null;
  const version = verRaw.replace(/^v/i, "");

  // Format B: pims:DOC:v3.00:chunk_5:lines:114-133
  if (parts.length >= 5 && parts[3] === "lines") {
    const chunkId = parts[2] ?? "";
    const linePart = parts[4] ?? "";
    const normalizedLines = linePart.startsWith("L")
      ? linePart
      : linePart.includes("-")
        ? linePart
            .split("-")
            .map((p) => (p.startsWith("L") ? p : `L${p}`))
            .join("-")
        : `L${linePart}`;
    return {
      raw: cleaned,
      doc,
      version,
      chunkId,
      lines: normalizedLines,
    };
  }

  // Format A: pims:DOC:v4.00:5:L114-L133
  const chunkId = parts[2] ?? "";
  const lines = parts.slice(3).join(":") || "L1-L40";
  return {
    raw: cleaned,
    doc,
    version,
    chunkId,
    lines,
  };
}

export function extractPimsCitations(markdown: string): ParsedPimsCitation[] {
  const seen = new Set<string>();
  const results: ParsedPimsCitation[] = [];
  const regex = new RegExp(PIMS_CITATION_REGEX.source, "g");
  let match: RegExpExecArray | null = regex.exec(markdown);
  while (match !== null) {
    const parsed = parsePimsCitation(match[0]);
    if (parsed && !seen.has(parsed.raw)) {
      seen.add(parsed.raw);
      results.push(parsed);
    }
    match = regex.exec(markdown);
  }
  return results;
}

export function extractDeliverableSlugs(markdown: string): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  const regex = new RegExp(DELIVERABLE_LINK_REGEX.source, "g");
  let match: RegExpExecArray | null = regex.exec(markdown);
  while (match !== null) {
    const slug = match[1];
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      slugs.push(slug);
    }
    match = regex.exec(markdown);
  }
  return slugs;
}

export function extractExternalServiceLinks(markdown: string): ExternalServiceLink[] {
  const seen = new Set<string>();
  const links: ExternalServiceLink[] = [];
  const regex = new RegExp(EXTERNAL_SERVICE_URL_REGEX.source, "gi");
  let match: RegExpExecArray | null = regex.exec(markdown);
  while (match !== null) {
    const rawUrl = match[0].replace(/[.,;)\]]+$/, "");
    const slug = (match[1] ?? "").toLowerCase();
    if (slug && !RESERVED_SUBDOMAIN_SLUGS.has(slug) && !seen.has(rawUrl)) {
      seen.add(rawUrl);
      links.push({ url: rawUrl, slug });
    }
    match = regex.exec(markdown);
  }
  return links;
}
