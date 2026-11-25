import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { chunkTextWithLines } from "./chunker.js";
import { RAG_CONFIG } from "./config.js";
import { compareVersions } from "./diff.js";
import { createMockEmbedder } from "./embedder.js";
import { extractNormalizedText, normalizeTextWhitespace } from "./pdf.js";
import { formatCitation, parseCitation, query } from "./query.js";
import type { DatabaseClient, PimsDocumentFetcher, QueryResult } from "./types.js";

describe("normalizeTextWhitespace & extractNormalizedText", () => {
  test("preserves -layout horizontal column spacing while stripping CRLF, trailing spaces, and 3+ blank lines", () => {
    const rawLayout = [
      "Código           Título                          Estado   \r",
      "G4-POL-01        Política de Privacidad          V\t  \r",
      "\r",
      "\r",
      "\r",
      "\r",
      "G4-SOA-01\t  Declaración de Aplicabilidad     R   ",
    ].join("\n");

    const normalized = normalizeTextWhitespace(rawLayout);

    expect(normalized).toBe(
      [
        "Código           Título                          Estado",
        "G4-POL-01        Política de Privacidad          V",
        "",
        "G4-SOA-01\t  Declaración de Aplicabilidad     R",
      ].join("\n"),
    );
    expect(normalized).not.toContain("\r");
    expect(normalized).not.toMatch(/[ \t]+$/m);
    expect(normalized).not.toMatch(/\n{3,}/);
  });

  test("extractNormalizedText normalizes string and non-PDF UTF-8 buffers, and fails fast on invalid PDF bytes", () => {
    expect(extractNormalizedText("Col1    Col2   \r\n", "notes.txt")).toBe("Col1    Col2");

    const txtBytes = new TextEncoder().encode("Fila 1    Dato 1  \r\n\r\n\r\nFila 2    Dato 2  ");
    expect(extractNormalizedText(txtBytes, "notas.txt")).toBe(
      "Fila 1    Dato 1\n\nFila 2    Dato 2",
    );

    const invalidPdfBytes = new TextEncoder().encode("%PDF-1.7\nnot-a-valid-pdf-stream");
    expect(() => extractNormalizedText(invalidPdfBytes, "corrupt.pdf")).toThrow(/pdftotext/);
  });
});

describe("chunkTextWithLines", () => {
  test("defines MIN_TRAILING_CHUNK_CHARS = 120 in RAG_CONFIG", () => {
    expect(RAG_CONFIG.MIN_TRAILING_CHUNK_CHARS).toBe(120);
  });

  test("merges undersized trailing footer chunk (< 120 chars) into preceding chunk without duplicating overlap lines", () => {
    const bodyLines = Array.from(
      { length: 8 },
      (_, idx) => `Línea ${idx + 1}: Contenido normativo de seguridad y privacidad ISO/IEC 27701:2025.`,
    );
    const footerLine = "ver. 1.0 ... Página 8 de 8";
    const text = [...bodyLines, footerLine].join("\n");

    // Target 320 chars so bodyLines split before line 9, leaving a tiny <120 char tail
    const chunks = chunkTextWithLines(text, {
      targetChars: 320,
      overlapLines: 2,
    });

    // Verify all lines from L1..L9 are covered cleanly without a tiny trailing chunk
    const lastChunk = chunks[chunks.length - 1];
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(lastChunk.text.endsWith(footerLine)).toBe(true);
    expect(lastChunk.lines).toMatch(/^L\d+-L9$/);

    // Ensure overlap lines were NOT duplicated during merge
    const lastChunkLines = lastChunk.text.split("\n");
    const uniqueLineSet = new Set(lastChunkLines);
    expect(uniqueLineSet.size).toBe(lastChunkLines.length);

    // Verify exact sha256 recomputation after merge
    const expectedSha = createHash("sha256").update(lastChunk.text, "utf8").digest("hex");
    expect(lastChunk.sha256).toBe(expectedSha);
  });

  test("merges trailing < 120 char chunk cleanly when overlapLines = 0 and keeps >= 120 char trailing chunk separate", () => {
    const chunk0Lines = [
      "Línea 1: Primera cláusula de alcance organizacional.",
      "Línea 2: Segunda cláusula de controles de privacidad.",
      "Línea 3: Tercera cláusula de transferencia internacional.",
    ];
    const shortFooter = "Página 8 de 8";
    const mergedResult = chunkTextWithLines([...chunk0Lines, shortFooter].join("\n"), {
      targetChars: 140,
      overlapLines: 0,
    });

    expect(mergedResult).toHaveLength(1);
    expect(mergedResult[0].chunk_id).toBe("0");
    expect(mergedResult[0].lines).toBe("L1-L4");
    expect(mergedResult[0].text).toBe([...chunk0Lines, shortFooter].join("\n"));
    expect(mergedResult[0].sha256).toBe(
      createHash("sha256").update(mergedResult[0].text, "utf8").digest("hex"),
    );

    const longTail =
      "Línea 4: Este párrafo final supera ampliamente los ciento veinte caracteres requeridos para permanecer como un chunk independiente del anterior.";
    expect(longTail.length).toBeGreaterThanOrEqual(RAG_CONFIG.MIN_TRAILING_CHUNK_CHARS);

    const unmergedResult = chunkTextWithLines([...chunk0Lines, longTail].join("\n"), {
      targetChars: 140,
      overlapLines: 0,
    });

    expect(unmergedResult).toHaveLength(2);
    expect(unmergedResult[0].lines).toBe("L1-L3");
    expect(unmergedResult[1].lines).toBe("L4-L4");
    expect(unmergedResult[1].text).toBe(longTail);
  });

  test("preserves a single short chunk when there is no preceding chunk", () => {
    const singleShort = "ver. 1.0 Página 1 de 1";
    const chunks = chunkTextWithLines(singleShort);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].lines).toBe("L1-L1");
    expect(chunks[0].text).toBe(singleShort);
  });
});

describe("query() active-version filtering", () => {
  interface CapturedDb extends DatabaseClient {
    readonly calls: Array<{ sql: string; params: unknown[] }>;
  }

  function createCaptureDb(
    rows: Array<{
      pims_doc_id: string;
      pims_version: string;
      chunk_id: string;
      text: string;
      lines: string;
      sha256: string;
      status: string;
      distance: number;
    }>,
  ): CapturedDb {
    const calls: Array<{ sql: string; params: unknown[] }> = [];
    return {
      calls,
      async query<T = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
        calls.push({ sql, params });
        let filtered = [...rows];
        if (sql.includes("status <> 'O'")) {
          filtered = filtered.filter((r) => r.status !== "O");
        }
        const docMatch = /pims_doc_id = \$(\d+)/.exec(sql);
        if (docMatch !== null) {
          const val = params[Number(docMatch[1]) - 1];
          filtered = filtered.filter((r) => r.pims_doc_id === val);
        }
        const verMatch = /pims_version = \$(\d+)/.exec(sql);
        if (verMatch !== null) {
          const val = params[Number(verMatch[1]) - 1];
          filtered = filtered.filter((r) => r.pims_version === val);
        }
        const statusMatch = /status = \$(\d+)/.exec(sql);
        if (statusMatch !== null) {
          const val = params[Number(statusMatch[1]) - 1];
          filtered = filtered.filter((r) => r.status === val);
        }
        return { rows: filtered as unknown as T[] };
      },
    };
  }

  const sampleRows = [
    {
      pims_doc_id: "G4-POL-01",
      pims_version: "1.00",
      chunk_id: "0",
      text: "Texto obsoleto v1",
      lines: "L1-L5",
      sha256: "a".repeat(64),
      status: "O",
      distance: 0.05,
    },
    {
      pims_doc_id: "G4-POL-01",
      pims_version: "3.00",
      chunk_id: "0",
      text: "Texto vigente v3",
      lines: "L1-L5",
      sha256: "b".repeat(64),
      status: "R",
      distance: 0.1,
    },
  ];

  const embedder = createMockEmbedder(1024);

  test("excludes status = 'O' by default when no filter or only pims_doc_id is provided", async () => {
    const db = createCaptureDb(sampleRows);
    const resultsNoFilter = await query({
      db,
      embedder,
      queryText: "politica de privacidad",
    });

    expect(db.calls[0].sql).toContain("status <> 'O'");
    expect(resultsNoFilter).toHaveLength(1);
    expect(resultsNoFilter[0].pims_version).toBe("3.00");
    expect(resultsNoFilter[0].status).toBe("R");
    expect(resultsNoFilter[0].citation).toBe(
      formatCitation("G4-POL-01", "3.00", "0", "L1-L5"),
    );
    expect(parseCitation(resultsNoFilter[0].citation)).toEqual({
      pims_doc_id: "G4-POL-01",
      pims_version: "3.00",
      chunk_id: "0",
      lines: "L1-L5",
    });

    const resultsDocOnly = await query({
      db,
      embedder,
      queryText: "politica de privacidad",
      filter: { pims_doc_id: "G4-POL-01" },
    });
    expect(db.calls[1].sql).toContain("status <> 'O'");
    expect(resultsDocOnly).toHaveLength(1);
    expect(resultsDocOnly[0].status).toBe("R");
  });

  test("allows obsolete rows when includeObsolete: true is passed", async () => {
    const db = createCaptureDb(sampleRows);
    const results = await query({
      db,
      embedder,
      queryText: "politica de privacidad",
      filter: { includeObsolete: true },
    });

    expect(db.calls[0].sql).not.toContain("status <> 'O'");
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.status)).toEqual(["O", "R"]);
  });

  test("allows obsolete rows when explicit status or explicit pims_version is passed", async () => {
    const db = createCaptureDb(sampleRows);

    const byStatus = await query({
      db,
      embedder,
      queryText: "politica",
      filter: { status: "O" },
    });
    expect(db.calls[0].sql).not.toContain("status <> 'O'");
    expect(db.calls[0].sql).toContain("status = $2");
    expect(byStatus).toHaveLength(1);
    expect(byStatus[0].pims_version).toBe("1.00");

    const byVersion = await query({
      db,
      embedder,
      queryText: "politica",
      filter: { pims_version: "1.00" },
    });
    expect(db.calls[1].sql).not.toContain("status <> 'O'");
    expect(db.calls[1].sql).toContain("pims_version = $2");
    expect(byVersion).toHaveLength(1);
    expect(byVersion[0].status).toBe("O");
  });
});

describe("compareVersions() Myers line diff", () => {
  function makeTextFetcher(versions: Record<string, string>): PimsDocumentFetcher {
    return async (pimsDocId: string, version: string) => {
      const content = versions[version];
      if (content === undefined) {
        throw new Error(`Missing version ${version}`);
      }
      return {
        pims_doc_id: pimsDocId,
        code: pimsDocId,
        pims_version: version,
        status: "V",
        filename: `${pimsDocId}-v${version}.txt`,
        content,
        supersedes: null,
      };
    };
  }

  test("handles inserted line at top as +1/-0 without shifting subsequent lines, and emits ±2 context", async () => {
    const body = Array.from({ length: 10 }, (_, idx) => `Cláusula ${idx + 1}: Contenido estable.`);
    const fetcher = makeTextFetcher({
      "1.00": body.join("\n"),
      "2.00": ["NUEVA PORTADA SUPERIOR", ...body].join("\n"),
    });

    const diff = await compareVersions("G4-TEST-01", "1.00", "2.00", {
      fetcher,
      mirrorDir: "nonexistent_mirror_dir_for_unit_test",
    });

    expect(diff.pims_doc_id).toBe("G4-TEST-01");
    expect(diff.version_a).toBe("1.00");
    expect(diff.version_b).toBe("2.00");
    expect(diff.stats.lines_added).toBe(1);
    expect(diff.stats.lines_removed).toBe(0);

    // 1 added line + 2 trailing context lines (Cláusula 1, Cláusula 2)
    expect(diff.line_diffs).toEqual([
      { type: "added", line_number_b: 1, text: "NUEVA PORTADA SUPERIOR" },
      { type: "unchanged", line_number_a: 1, line_number_b: 2, text: "Cláusula 1: Contenido estable." },
      { type: "unchanged", line_number_a: 2, line_number_b: 3, text: "Cláusula 2: Contenido estable." },
    ]);
  });

  test("omits unchanged cover page and distant footer, emitting only hunks with ±2 context lines", async () => {
    const cover = Array.from({ length: 8 }, (_, idx) => `Portada línea ${idx + 1}`);
    const footer = Array.from({ length: 8 }, (_, idx) => `Pie de página línea ${idx + 1}`);
    const v1 = [...cover, "Regla vigente anterior", ...footer].join("\n");
    const v2 = [...cover, "Regla vigente actualizada", ...footer].join("\n");

    const diff = await compareVersions("G4-TEST-02", "1.00", "2.00", {
      fetcher: makeTextFetcher({ "1.00": v1, "2.00": v2 }),
      mirrorDir: "nonexistent_mirror_dir_for_unit_test",
    });

    expect(diff.stats.lines_added).toBe(1);
    expect(diff.stats.lines_removed).toBe(1);
    expect(diff.line_diffs).toEqual([
      { type: "unchanged", line_number_a: 7, line_number_b: 7, text: "Portada línea 7" },
      { type: "unchanged", line_number_a: 8, line_number_b: 8, text: "Portada línea 8" },
      { type: "removed", line_number_a: 9, text: "Regla vigente anterior" },
      { type: "added", line_number_b: 9, text: "Regla vigente actualizada" },
      { type: "unchanged", line_number_a: 10, line_number_b: 10, text: "Pie de página línea 1" },
      { type: "unchanged", line_number_a: 11, line_number_b: 11, text: "Pie de página línea 2" },
    ]);
  });

  test("emits empty line_diffs for identical versions", async () => {
    const content = "Línea 1\nLínea 2\nLínea 3";
    const diff = await compareVersions("G4-TEST-03", "1.00", "2.00", {
      fetcher: makeTextFetcher({ "1.00": content, "2.00": content }),
      mirrorDir: "nonexistent_mirror_dir_for_unit_test",
    });

    expect(diff.stats.lines_added).toBe(0);
    expect(diff.stats.lines_removed).toBe(0);
    expect(diff.line_diffs).toEqual([]);
  });
});
