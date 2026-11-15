import { SQL } from "bun";
import { RAG_CONFIG } from "../../packages/rag-mirror/config.ts";
import type { DatabaseClient, QueryResult } from "../../packages/rag-mirror/types.ts";

/**
 * Creates a PostgreSQL DatabaseClient backed by Bun's built-in SQL driver.
 */
export function createBunPgClient(
  databaseUrl: string = RAG_CONFIG.DATABASE_URL,
): DatabaseClient & { close: () => Promise<void> } {
  const sql = new SQL(databaseUrl);

  return {
    async query<T = unknown>(
      queryText: string,
      params: unknown[] = [],
    ): Promise<QueryResult<T>> {
      const rows = (await sql.unsafe(queryText, params)) as T[];
      return { rows };
    },
    async close(): Promise<void> {
      await sql.close();
    },
  };
}
