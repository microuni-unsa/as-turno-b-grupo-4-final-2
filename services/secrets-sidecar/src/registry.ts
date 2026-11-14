import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import pg from 'pg';
import { SecretRegistryEntry } from './types.js';
import { logAudit, logError } from './logger.js';

export interface RegistryConfig {
  storeDir: string;
  databaseUrl?: string;
}

export class SecretsRegistryRepository {
  private readonly storeDir: string;
  private readonly localRegistryFile: string;
  private pgPool: pg.Pool | null = null;

  constructor(config: RegistryConfig) {
    this.storeDir = config.storeDir;
    this.localRegistryFile = path.join(this.storeDir, 'registry.json');

    if (config.databaseUrl && config.databaseUrl.trim().length > 0) {
      this.pgPool = new pg.Pool({
        connectionString: config.databaseUrl.trim()
      });
    }
  }

  /**
   * Initializes local registry file on agent volume if not present.
   */
  public async initialize(): Promise<void> {
    await fs.mkdir(this.storeDir, { recursive: true });
    try {
      await fs.access(this.localRegistryFile);
    } catch {
      await fs.writeFile(this.localRegistryFile, JSON.stringify([], null, 2), { mode: 0o644 });
    }
  }

  /**
   * Calculates the next version integer for a given secret name.
   */
  public async getNextVersion(name: string): Promise<number> {
    const entries = await this.readLocalEntries();
    const matching = entries.filter((e) => e.name === name);
    if (matching.length === 0) {
      return 1;
    }
    const maxVersion = Math.max(...matching.map((e) => e.version));
    return maxVersion + 1;
  }

  /**
   * Inserts a record into secrets_registry in PostgreSQL (if configured)
   * and appends to local store registry on the agent volume.
   */
  public async insertEntry(entry: SecretRegistryEntry): Promise<void> {
    // 1. Persist to agent volume local registry
    const entries = await this.readLocalEntries();
    entries.push(entry);
    const tempFile = `${this.localRegistryFile}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(entries, null, 2), { mode: 0o644 });
    await fs.rename(tempFile, this.localRegistryFile);

    // 2. Persist to PostgreSQL database if configured (owned by packages/rag-mirror schema.sql)
    if (this.pgPool) {
      try {
        const query = `
          INSERT INTO secrets_registry (name, version, created_at, created_by, scope)
          VALUES ($1, $2, $3, $4, $5)
        `;
        await this.pgPool.query(query, [
          entry.name,
          entry.version,
          entry.created_at,
          entry.created_by,
          entry.scope
        ]);
      } catch (err) {
        logError('postgres_registry_insert_failed', err);
        throw err;
      }
    }

    logAudit({
      event: 'registry_entry_inserted',
      label: entry.name,
      version: entry.version,
      scope: entry.scope
    });
  }

  public async getEntry(name: string, version: number): Promise<SecretRegistryEntry | null> {
    const entries = await this.readLocalEntries();
    const found = entries.find((e) => e.name === name && e.version === version);
    if (!found) {
      return null;
    }
    return found;
  }

  public async listEntriesForName(name: string): Promise<SecretRegistryEntry[]> {
    const entries = await this.readLocalEntries();
    return entries.filter((e) => e.name === name).sort((a, b) => b.version - a.version);
  }

  private async readLocalEntries(): Promise<SecretRegistryEntry[]> {
    try {
      const data = await fs.readFile(this.localRegistryFile, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          ...item,
          created_at: new Date(item.created_at)
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async close(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end();
      this.pgPool = null;
    }
  }
}
