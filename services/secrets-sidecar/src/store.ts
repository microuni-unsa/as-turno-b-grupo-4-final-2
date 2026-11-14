import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { CONFIG } from './config.js';
import { AgeEncryptor } from './age.js';
import { SecretsRegistryRepository } from './registry.js';
import { SecretValidationError } from './errors.js';
import { logAudit } from './logger.js';

export interface SecretStoreConfig {
  storeDir?: string;
  databaseUrl?: string;
  recipientKey?: string;
}

export class SecretsStoreManager {
  public readonly storeDir: string;
  private readonly ageEncryptor: AgeEncryptor;
  private readonly registryRepo: SecretsRegistryRepository;

  constructor(config: SecretStoreConfig = {}) {
    this.storeDir = config.storeDir || CONFIG.STORE_DIR;
    const keysDir = path.join(this.storeDir, 'keys');

    this.ageEncryptor = new AgeEncryptor({
      keysDir,
      recipientKey: config.recipientKey
    });

    this.registryRepo = new SecretsRegistryRepository({
      storeDir: this.storeDir,
      databaseUrl: config.databaseUrl || process.env.DATABASE_URL
    });
  }

  public async initialize(): Promise<void> {
    await fs.mkdir(this.storeDir, { recursive: true });
    await this.ageEncryptor.initialize();
    await this.registryRepo.initialize();
  }

  /**
   * Sanitizes label ensuring it is safe for filesystem naming.
   */
  public sanitizeLabel(label: string): string {
    const trimmed = label.trim();
    if (!trimmed || !/^[a-zA-Z0-9_\-\.]+$/.test(trimmed)) {
      throw new SecretValidationError(
        `Invalid secret label: "${label}". Only alphanumeric characters, dashes, dots, and underscores are allowed.`
      );
    }
    return trimmed;
  }

  /**
   * Stores a secret value:
   * 1. Sanitizes label.
   * 2. Finds next version number.
   * 3. Age-encrypts secret value directly to file at <storeDir>/secrets/<label>/v<version>.age.
   * 4. Inserts row into secrets_registry.
   * 5. Returns handle: secret:<label>@<version>.
   */
  public async storeSecret(
    rawLabel: string,
    secretValue: string,
    createdBy: string = 'instructor',
    scope: string = 'global'
  ): Promise<string> {
    if (!secretValue || secretValue.length === 0) {
      throw new SecretValidationError('Secret value cannot be empty.');
    }

    const label = this.sanitizeLabel(rawLabel);
    const version = await this.registryRepo.getNextVersion(label);

    const secretDir = path.join(this.storeDir, 'secrets', label);
    await fs.mkdir(secretDir, { recursive: true });
    const targetFilePath = path.join(secretDir, `v${version}.age`);

    // Encrypt secret value directly to disk via age
    await this.ageEncryptor.encryptToFile(secretValue, targetFilePath);

    // Record in registry
    await this.registryRepo.insertEntry({
      name: label,
      version,
      created_at: new Date(),
      created_by: createdBy,
      scope
    });

    const handle = `${CONFIG.HANDLE_PREFIX}${label}@${version}`;

    logAudit({
      event: 'secret_stored_and_encrypted',
      label,
      version,
      scope
    });

    return handle;
  }

  public getSecretFilePath(label: string, version: number): string {
    const cleanLabel = this.sanitizeLabel(label);
    return path.join(this.storeDir, 'secrets', cleanLabel, `v${version}.age`);
  }

  public getRegistry(): SecretsRegistryRepository {
    return this.registryRepo;
  }
}
