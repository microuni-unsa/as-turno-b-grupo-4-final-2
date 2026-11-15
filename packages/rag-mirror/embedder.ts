import { createHash } from "node:crypto";
import { RAG_CONFIG } from "./config.js";
import type { Embedder } from "./types.js";

export interface EmbedderOptions {
  readonly baseUrl?: string;
  readonly model?: string;
  readonly apiKey?: string;
  readonly fetchFn?: typeof fetch;
}

/**
 * Creates an OpenAI-compatible embedder targeting mistral-embed or any compatible endpoint.
 * Base URL and model are resolved from centralized config unless overridden.
 */
export function createOpenAICompatibleEmbedder(options: EmbedderOptions = {}): Embedder {
  const baseUrl = options.baseUrl ?? RAG_CONFIG.EMBEDDING_BASE_URL;
  const model = options.model ?? RAG_CONFIG.EMBEDDING_MODEL;
  const apiKey = options.apiKey ?? process.env.EMBEDDINGS_API_KEY;
  const fetchFn = options.fetchFn ?? fetch;

  return {
    async embed(texts: string[]): Promise<number[][]> {
      if (texts.length === 0) {
        return [];
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (apiKey !== undefined && apiKey.length > 0) {
        headers.Authorization = `Bearer ${apiKey}`;
      }

      const url = `${baseUrl.replace(/\/+$/, "")}/embeddings`;
      const response = await fetchFn(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          input: texts,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Embedding API request failed [${response.status} ${response.statusText}] at ${url}: ${errorBody}`
        );
      }

      const json = (await response.json()) as {
        data: Array<{ embedding: number[]; index?: number }>;
      };

      if (!Array.isArray(json.data)) {
        throw new Error(
          `Embedding API response invalid: expected 'data' array, got ${typeof json.data}`
        );
      }

      if (json.data.length !== texts.length) {
        throw new Error(
          `Embedding API response count mismatch: requested ${texts.length}, received ${json.data.length}`
        );
      }

      // Preserve input order
      const sorted = [...json.data].sort((a, b) => {
        const idxA = a.index ?? 0;
        const idxB = b.index ?? 0;
        return idxA - idxB;
      });

      return sorted.map((item, i) => {
        if (!Array.isArray(item.embedding)) {
          throw new Error(`Embedding data at index ${i} is not a valid vector array`);
        }
        if (item.embedding.length !== RAG_CONFIG.EMBEDDING_DIM) {
          throw new Error(
            `Embedding dimension mismatch at index ${i}: expected ${RAG_CONFIG.EMBEDDING_DIM}, got ${item.embedding.length}`
          );
        }
        return item.embedding;
      });
    },
  };
}

/**
 * Creates a deterministic offline mock embedder producing unit vectors of EMBEDDING_DIM.
 * Guaranteed no network calls; suitable for offline fixtures and CI smoke tests.
 */
export function createMockEmbedder(dimension: number = RAG_CONFIG.EMBEDDING_DIM): Embedder {
  return {
    async embed(texts: string[]): Promise<number[][]> {
      return texts.map((text) => {
        const vector: number[] = new Array<number>(dimension);
        let normSq = 0;

        for (let i = 0; i < dimension; i++) {
          const hash = createHash("sha256")
            .update(`${text}:${i}`)
            .digest();
          const val = (hash.readInt16LE(0) / 32768.0);
          vector[i] = val;
          normSq += val * val;
        }

        const norm = Math.sqrt(normSq);
        if (norm === 0) {
          throw new Error("Zero vector generated in mock embedder");
        }

        return vector.map((v) => v / norm);
      });
    },
  };
}
