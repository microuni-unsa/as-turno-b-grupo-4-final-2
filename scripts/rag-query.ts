#!/usr/bin/env bun
/**
 * scripts/rag-query.ts
 *
 * Bun CLI for one-shot direct read of vectorized data from pgvector mirror.
 *
 * Usage:
 *   bun scripts/rag-query.ts "<query text>" [--limit N] [--doc <pims_doc_id>] [--version <v>] [--status <s>] [--json]
 *   bun scripts/rag-query.ts --help
 */

import { RAG_CONFIG } from "../packages/rag-mirror/config.ts";
import { createOpenAICompatibleEmbedder } from "../packages/rag-mirror/embedder.ts";
import { query } from "../packages/rag-mirror/query.ts";
import type { QueryFilter, QueryResultItem } from "../packages/rag-mirror/types.ts";
import { createBunPgClient } from "./lib/pg-client.ts";

function printHelpAndExit(): never {
  const helpText = `Uso: bun scripts/rag-query.ts "<query text>" [opciones]

Opciones:
  --limit <N>         Número máximo de resultados a retornar (por defecto: ${RAG_CONFIG.DEFAULT_QUERY_LIMIT})
  --doc <pims_doc_id> Filtrar por ID de documento PIMS
  --version <v>       Filtrar por versión de documento
  --status <s>        Filtrar por estado (ej: R, V, O)
  --json              Imprimir los resultados en formato JSON plano
  -h, --help          Mostrar esta ayuda y salir

Ejemplos:
  bun scripts/rag-query.ts "tratamiento de riesgos"
  bun scripts/rag-query.ts "politica de privacidad" --limit 3 --status R
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
  json: boolean;
}

function parseCliArgs(args: string[]): CliArgs {
  const result: CliArgs = {
    json: false,
  };

  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      printHelpAndExit();
    } else if (arg === "--json") {
      result.json = true;
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

  if (positional.length === 0) {
    console.error("Error: Se requiere el texto de consulta. Use --help para ver la sintaxis.");
    process.exit(1);
  }

  result.queryText = positional.join(" ");
  return result;
}

async function main(): Promise<void> {
  const cliArgs = parseCliArgs(process.argv.slice(2));

  if (!process.env.DATABASE_URL && !RAG_CONFIG.DATABASE_URL) {
    console.error("Error: DATABASE_URL no está configurado.");
    process.exit(1);
  }

  if (!process.env.EMBEDDINGS_API_KEY) {
    console.error("Error: EMBEDDINGS_API_KEY no está configurado.");
    process.exit(1);
  }

  let db: ReturnType<typeof createBunPgClient>;
  let embedder: ReturnType<typeof createOpenAICompatibleEmbedder>;

  try {
    db = createBunPgClient();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error inicializando conexión a base de datos: ${msg}`);
    process.exit(1);
  }

  try {
    embedder = createOpenAICompatibleEmbedder();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error inicializando embedder: ${msg}`);
    process.exit(1);
  }

  const filter: QueryFilter = {};
  if (cliArgs.doc !== undefined) {
    filter.pims_doc_id = cliArgs.doc;
  }
  if (cliArgs.version !== undefined) {
    filter.pims_version = cliArgs.version;
  }
  if (cliArgs.status !== undefined) {
    filter.status = cliArgs.status;
  }

  const hasFilter =
    filter.pims_doc_id !== undefined ||
    filter.pims_version !== undefined ||
    filter.status !== undefined;

  let results: QueryResultItem[];
  try {
    results = await query({
      db,
      queryText: cliArgs.queryText,
      filter: hasFilter ? filter : undefined,
      limit: cliArgs.limit ?? RAG_CONFIG.DEFAULT_QUERY_LIMIT,
      embedder,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error ejecutando consulta en mirror pgvector: ${msg}`);
    try {
      await db.close();
    } catch {
      // ignore close error on failure exit
    }
    process.exit(1);
  }

  try {
    await db.close();
  } catch {
    // ignore
  }

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
