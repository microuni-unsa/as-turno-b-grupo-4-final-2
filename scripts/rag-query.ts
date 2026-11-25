#!/usr/bin/env bun
/**
 * scripts/rag-query.ts
 *
 * Bun CLI for one-shot direct read of vectorized data from pgvector mirror,
 * or full normalized document text via --full --doc <code_or_id> [--version <v>].
 *
 * Usage:
 *   bun scripts/rag-query.ts "<query text>" [--limit N] [--doc <pims_doc_id>] [--version <v>] [--status <s>] [--include-obsolete] [--json]
 *   bun scripts/rag-query.ts --query "<query text>" [--limit N] [--doc <pims_doc_id>] [--version <v>] [--status <s>] [--include-obsolete] [--json]
 *   bun scripts/rag-query.ts --full --doc <pims_doc_id> [--version <v>] [--json]
 *   bun scripts/rag-query.ts --help
 */

import { RAG_CONFIG } from "../packages/rag-mirror/config.ts";
import { createOpenAICompatibleEmbedder } from "../packages/rag-mirror/embedder.ts";
import {
  normalizeDocumentVersion,
  readCorpusManifest,
  readFromCorpusMirror,
} from "../packages/rag-mirror/mirror.ts";
import { query } from "../packages/rag-mirror/query.ts";
import type { QueryFilter, QueryResultItem } from "../packages/rag-mirror/types.ts";
import { createBunPgClient } from "./lib/pg-client.ts";

function printHelpAndExit(): never {
  const helpText = `Uso: bun scripts/rag-query.ts "<query text>" [opciones]
       bun scripts/rag-query.ts -q|--query "<query text>" [opciones]
       bun scripts/rag-query.ts --full --doc <pims_doc_id> [--version <v>] [--json]

Opciones:
  -q, --query <text>  Texto de consulta (alias de argumento posicional)
  --limit <N>         Número máximo de resultados a retornar (por defecto: ${RAG_CONFIG.DEFAULT_QUERY_LIMIT})
  --doc <pims_doc_id> Filtrar por código o ID de documento PIMS (ej: G4-POL-01)
  --version <v>       Filtrar por versión de documento (ej: 3.00)
  --status <s>        Filtrar por estado (ej: R, V, O)
  --include-obsolete  Incluir versiones obsoletas (status = 'O') en la búsqueda
  --full              Volcar el texto completo normalizado del documento (--doc obligatorio)
  --json              Imprimir los resultados en formato JSON plano
  -h, --help          Mostrar esta ayuda y salir

Ejemplos:
  bun scripts/rag-query.ts "tratamiento de riesgos"
  bun scripts/rag-query.ts --query "tratamiento de riesgos" --include-obsolete
  bun scripts/rag-query.ts "politica de privacidad" --limit 3 --status R
  bun scripts/rag-query.ts --full --doc G4-POL-01
  bun scripts/rag-query.ts "auditoria interna" --json
`;
  console.log(helpText);
  process.exit(0);
}

interface CliArgs {
  queryText?: string;
  limit?: number;
  doc?: string;
  version?: string;
  status?: string;
  includeObsolete: boolean;
  full: boolean;
  json: boolean;
}

function parseCliArgs(args: string[]): CliArgs {
  const result: CliArgs = {
    includeObsolete: false,
    full: false,
    json: false,
  };

  const positional: string[] = [];
  let flagQuery: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      printHelpAndExit();
    } else if (arg === "--full") {
      result.full = true;
    } else if (arg === "--json") {
      result.json = true;
    } else if (arg === "--include-obsolete") {
      result.includeObsolete = true;
    } else if (arg === "--query" || arg === "-q") {
      i++;
      if (i >= args.length) {
        console.error(`Error: ${arg} requiere un texto de consulta`);
        process.exit(1);
      }
      flagQuery = args[i];
    } else if (arg === "--limit") {
      i++;
      if (i >= args.length) {
        console.error("Error: --limit requiere un valor numérico");
        process.exit(1);
      }
      const parsedLimit = parseInt(args[i], 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        console.error(`Error: límite inválido '${args[i]}'`);
        process.exit(1);
      }
      result.limit = parsedLimit;
    } else if (arg === "--doc") {
      i++;
      if (i >= args.length) {
        console.error("Error: --doc requiere un pims_doc_id");
        process.exit(1);
      }
      result.doc = args[i];
    } else if (arg === "--version") {
      i++;
      if (i >= args.length) {
        console.error("Error: --version requiere un identificador de versión");
        process.exit(1);
      }
      result.version = args[i];
    } else if (arg === "--status") {
      i++;
      if (i >= args.length) {
        console.error("Error: --status requiere un valor de estado");
        process.exit(1);
      }
      result.status = args[i];
    } else if (arg.startsWith("-")) {
      console.error(`Error: opción desconocida '${arg}'`);
      process.exit(1);
    } else {
      positional.push(arg);
    }
  }

  if (result.full) {
    if (!result.doc || result.doc.trim() === "") {
      console.error("Error: --full requiere especificar --doc <pims_doc_id> (ej: G4-POL-01).");
      process.exit(1);
    }
  } else if (flagQuery !== undefined && positional.length > 0) {
    console.error("Error: Especifique la consulta mediante --query/-q o argumento posicional, no ambos.");
    process.exit(1);
  } else if (flagQuery !== undefined) {
    if (flagQuery.trim() === "") {
      console.error("Error: --query/-q requiere un texto de consulta no vacío.");
      process.exit(1);
    }
    result.queryText = flagQuery;
  } else if (positional.length > 0) {
    result.queryText = positional.join(" ");
  } else {
    console.error("Error: Se requiere el texto de consulta. Use --help para ver la sintaxis.");
    process.exit(1);
  }

  return result;
}

async function dumpFullDocument(docId: string, requestedVersion: string | undefined, asJson: boolean): Promise<void> {
  const manifest = readCorpusManifest(docId, RAG_CONFIG.CORPUS_MIRROR_DIR);
  if (manifest !== null) {
    const targetVersion = requestedVersion ?? manifest.latest_version;
    const mirror = readFromCorpusMirror(docId, targetVersion, RAG_CONFIG.CORPUS_MIRROR_DIR);
    if (asJson) {
      console.log(
        JSON.stringify(
          {
            source: "corpus_mirror",
            pims_doc_id: mirror.pims_doc_id,
            code: mirror.code,
            pims_version: mirror.pims_version,
            text_path: mirror.textPath,
            sha256: mirror.sha256,
            text: mirror.text,
          },
          null,
          2,
        ),
      );
      return;
    }
    console.log(`[FUENTE: corpus_mirror (${mirror.textPath}) | ${mirror.code} v${mirror.pims_version}]`);
    console.log(mirror.text);
    return;
  }

  const db = createBunPgClient();
  try {
    let targetVersion = requestedVersion === undefined ? undefined : normalizeDocumentVersion(requestedVersion);
    if (targetVersion === undefined) {
      const reg = await db.query<{ pims_version: string }>(
        `SELECT pims_version
         FROM pims_registry
         WHERE pims_doc_id = $1 OR code = $1
         ORDER BY updated_at DESC
         LIMIT 1`,
        [docId],
      );
      if (reg.rows.length === 0) {
        throw new Error(`Document '${docId}' not found in CORPUS_MIRROR_DIR or pims_registry.`);
      }
      targetVersion = reg.rows[0].pims_version;
    }

    const rows = await db.query<{ chunk_id: string; lines: string; text: string; status: string }>(
      `SELECT chunk_id, lines, text, status
       FROM chunks
       WHERE pims_doc_id = $1 AND pims_version = $2`,
      [docId, targetVersion],
    );
    if (rows.rows.length === 0) {
      throw new Error(`No chunks stored for '${docId}' v${targetVersion}.`);
    }

    const ordered = [...rows.rows].sort((a, b) => {
      const numA = parseInt(a.chunk_id.replace(/[^0-9]/g, ""), 10) || 0;
      const numB = parseInt(b.chunk_id.replace(/[^0-9]/g, ""), 10) || 0;
      return numA - numB;
    });

    if (asJson) {
      console.log(
        JSON.stringify(
          {
            source: "pgvector_db",
            pims_doc_id: docId,
            pims_version: targetVersion,
            chunks: ordered,
          },
          null,
          2,
        ),
      );
      return;
    }

    console.log(`[FUENTE: pgvector mirror chunks (pimsai-db) | ${docId} v${targetVersion}]`);
    for (const chunk of ordered) {
      console.log(`--- pims:${docId}:v${targetVersion}:${chunk.chunk_id}:lines:${chunk.lines} [${chunk.status}] ---`);
      console.log(chunk.text);
    }
  } finally {
    await db.close();
  }
}

async function main(): Promise<void> {
  const cliArgs = parseCliArgs(process.argv.slice(2));

  if (cliArgs.full && cliArgs.doc) {
    await dumpFullDocument(cliArgs.doc, cliArgs.version, cliArgs.json);
    process.exit(0);
  }

  if (!process.env.DATABASE_URL && !RAG_CONFIG.DATABASE_URL) {
    console.error("Error: DATABASE_URL no está configurado.");
    process.exit(1);
  }

  if (!process.env.EMBEDDINGS_API_KEY) {
    console.error("Error: EMBEDDINGS_API_KEY no está configurado.");
    process.exit(1);
  }

  const normalizedVersion =
    cliArgs.version !== undefined ? normalizeDocumentVersion(cliArgs.version) : undefined;

  let embedder: ReturnType<typeof createOpenAICompatibleEmbedder>;
  try {
    embedder = createOpenAICompatibleEmbedder();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error inicializando embedder: ${msg}`);
    process.exit(1);
  }

  let db: ReturnType<typeof createBunPgClient>;
  try {
    db = createBunPgClient();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error inicializando conexión a base de datos: ${msg}`);
    process.exit(1);
  }

  const filter: QueryFilter = {
    ...(cliArgs.doc !== undefined ? { pims_doc_id: cliArgs.doc } : {}),
    ...(normalizedVersion !== undefined ? { pims_version: normalizedVersion } : {}),
    ...(cliArgs.status !== undefined ? { status: cliArgs.status } : {}),
    ...(cliArgs.includeObsolete ? { includeObsolete: true } : {}),
  };

  const hasFilter =
    filter.pims_doc_id !== undefined ||
    filter.pims_version !== undefined ||
    filter.status !== undefined ||
    filter.includeObsolete !== undefined;

  let results: QueryResultItem[];
  try {
    results = await query({
      db,
      queryText: cliArgs.queryText ?? "",
      filter: hasFilter ? filter : undefined,
      limit: cliArgs.limit ?? RAG_CONFIG.DEFAULT_QUERY_LIMIT,
      embedder,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error ejecutando consulta en mirror pgvector: ${msg}`);
    try {
      await db.close();
    } catch (closeErr: unknown) {
      const closeMsg = closeErr instanceof Error ? closeErr.message : String(closeErr);
      console.error(`Error adicional cerrando conexión a base de datos: ${closeMsg}`);
    }
    process.exit(1);
  }

  await db.close();

  if (cliArgs.json) {
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  }

  if (results.length === 0) {
    console.log(`Sin resultados en el mirror pgvector para: ${cliArgs.queryText}`);
    process.exit(0);
  }

  console.log("[FUENTE: pgvector mirror (cache de PIMS)]");
  for (const hit of results) {
    const dist = typeof hit.distance === "number" ? hit.distance.toFixed(3) : Number(hit.distance).toFixed(3);
    const shaShort = hit.sha256.substring(0, 12);
    console.log(`- Cita: ${hit.citation}`);
    console.log(`  Distancia: ${dist} | Estado: ${hit.status} | SHA256: ${shaShort}`);
    console.log("  Texto:");
    console.log(hit.text);
  }
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Error fatal no manejado: ${msg}`);
  process.exit(1);
});
