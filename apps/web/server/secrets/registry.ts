import { SQL } from "bun";
import { randomBytes } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export interface SecretRegistryEntry {
  name: string;
  version: number;
  created_at: Date;
  created_by: string;
  scope: string;
}

export interface RegistryConfig {
  storeDir: string;
  databaseUrl?: string | null;
}

/**
 * Persists secret version metadata to <storeDir>/registry.json (atomic write)
 * and optionally to PostgreSQL `secrets_registry` via Bun's native SQL driver.
 */
export class SecretsRegistryRepository {
  private readonly storeDir: string;
  private readonly localRegistryFile: string;
  private sql: SQL | null = null;

  constructor(config: RegistryConfig) {
    if (!config.storeDir || config.storeDir.trim().length === 0) {
      throw new Error("SecretsRegistryRepository requires a non-empty storeDir");
    }
    this.storeDir = config.storeDir;
    this.localRegistryFile = path.join(this.storeDir, "registry.json");

    if (typeof config.databaseUrl === "string" && config.databaseUrl.trim().length > 0) {
      this.sql = new SQL(config.databaseUrl.trim());
    }
  }

  public async initialize(): Promise<void> {
    await fs.mkdir(this.storeDir, { recursive: true });
    try {
      await fs.access(this.localRegistryFile);
    } catch {
      const tempFile = `${this.localRegistryFile}.tmp.${process.pid}.${randomBytes(4).toString("hex")}`;
      await fs.writeFile(tempFile, JSON.stringify([], null, 2), { mode: 0o644 });
      await fs.rename(tempFile, this.localRegistryFile);
    }
  }

  public async getNextVersion(name: string): Promise<number> {
    const entries = await this.readLocalEntries();
    const matching = entries.filter((entry) => entry.name === name);
    if (matching.length === 0) {
      return 1;
    }
    const maxVersion = Math.max(...matching.map((entry) => entry.version));
    return maxVersion + 1;
  }

  public async insertEntry(entry: SecretRegistryEntry): Promise<void> {
    const entries = await this.readLocalEntries();
    entries.push(entry);

    const tempFile = `${this.localRegistryFile}.tmp.${process.pid}.${randomBytes(4).toString("hex")}`;
    await fs.writeFile(tempFile, JSON.stringify(entries, null, 2), { mode: 0o644 });
    await fs.rename(tempFile, this.localRegistryFile);

    if (this.sql) {
      await this.sql.unsafe(
        "INSERT INTO secrets_registry (name, version, created_at, created_by, scope) VALUES ($1, $2, $3, $4, $5)",
        [entry.name, entry.version, entry.created_at, entry.created_by, entry.scope],
      );
    }
  }

  public async getEntry(name: string, version: number): Promise<SecretRegistryEntry | null> {
    const entries = await this.readLocalEntries();
    return entries.find((entry) => entry.name === name && entry.version === version) ?? null;
  }

  public async listEntriesForName(name: string): Promise<SecretRegistryEntry[]> {
    const entries = await this.readLocalEntries();
    return entries
      .filter((entry) => entry.name === name)
      .sort((a, b) => b.version - a.version);
  }

  /**
   * Returns all secret metadata entries sorted newest first (never plaintext).
   */
  public async listAllEntries(): Promise<SecretRegistryEntry[]> {
    const entries = await this.readLocalEntries();
    return entries.sort((a, b) => {
      const timeDiff = b.created_at.getTime() - a.created_at.getTime();
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return b.version - a.version;
    });
  }

  public async close(): Promise<void> {
    if (this.sql) {
      await this.sql.close();
      this.sql = null;
    }
  }

  private async readLocalEntries(): Promise<SecretRegistryEntry[]> {
    try {
      const data = await fs.readFile(this.localRegistryFile, "utf8");
      const parsed: unknown = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        throw new Error(`Invalid registry format in ${this.localRegistryFile}: expected JSON array`);
      }
      return parsed.map((item) => {
        const record = item as Record<string, unknown>;
        return {
          name: String(record.name),
          version: Number(record.version),
          created_at: new Date(String(record.created_at)),
          created_by: String(record.created_by),
          scope: String(record.scope),
        };
      });
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw err;
    }
  }
}
