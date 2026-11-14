import * as childProcess from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { AgeEncryptionError } from './errors.js';
import { logAudit } from './logger.js';

export interface AgeKeyConfig {
  keysDir: string;
  recipientKey?: string;
}

export class AgeEncryptor {
  private recipientKey: string | null = null;
  private readonly keysDir: string;

  constructor(config: AgeKeyConfig) {
    this.keysDir = config.keysDir;
    if (config.recipientKey && config.recipientKey.trim().length > 0) {
      this.recipientKey = config.recipientKey.trim();
    }
  }

  /**
   * Initializes or verifies the age recipient public key.
   */
  public async initialize(): Promise<string> {
    if (this.recipientKey) {
      return this.recipientKey;
    }

    await fs.mkdir(this.keysDir, { recursive: true });
    const recipientPath = path.join(this.keysDir, 'recipient.txt');
    const identityPath = path.join(this.keysDir, 'identity.txt');

    let recipientExists = false;
    try {
      await fs.access(recipientPath);
      recipientExists = true;
    } catch {
      recipientExists = false;
    }

    if (recipientExists) {
      const recipientContent = await fs.readFile(recipientPath, 'utf8');
      const trimmed = recipientContent.trim();
      if (trimmed.length > 0) {
        this.recipientKey = trimmed;
        return this.recipientKey;
      }
    }

    let identityExists = false;
    try {
      await fs.access(identityPath);
      identityExists = true;
    } catch {
      identityExists = false;
    }

    if (!identityExists) {
      await this.generateIdentity(identityPath);
    }

    const recipient = await this.deriveRecipient(identityPath);
    await fs.writeFile(recipientPath, recipient + '\n', { mode: 0o644 });
    this.recipientKey = recipient;
    return this.recipientKey;
  }

  private async generateIdentity(identityPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      childProcess.execFile('age-keygen', ['-o', identityPath], (error) => {
        if (error) {
          reject(new AgeEncryptionError(`Failed to generate age identity key: ${error.message}`));
          return;
        }
        fs.chmod(identityPath, 0o600)
          .then(() => resolve())
          .catch((chmodErr) => {
            reject(new AgeEncryptionError(`Failed to set permissions on identity key: ${chmodErr.message}`));
          });
      });
    });
  }

  private async deriveRecipient(identityPath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      childProcess.execFile('age-keygen', ['-y', identityPath], (error, stdout) => {
        if (error) {
          reject(new AgeEncryptionError(`Failed to derive recipient from age identity: ${error.message}`));
          return;
        }
        const recipient = stdout.trim();
        if (recipient.length === 0) {
          reject(new AgeEncryptionError('age-keygen returned an empty recipient public key'));
          return;
        }
        resolve(recipient);
      });
    });
  }

  /**
   * Encrypts plaintext directly to an output file using age CLI.
   * Secret value is streamed via stdin and never touches command line arguments or logs.
   */
  public async encryptToFile(plaintext: string, outputPath: string): Promise<void> {
    const recipient = await this.initialize();
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    return new Promise<void>((resolve, reject) => {
      const child = childProcess.spawn('age', ['--recipient', recipient, '--output', outputPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stderrOutput = '';
      child.stderr.on('data', (chunk) => {
        stderrOutput += chunk.toString();
      });

      child.on('error', (err) => {
        reject(new AgeEncryptionError(`Failed to execute age encryption process: ${err.message}`));
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new AgeEncryptionError(`age encryption failed with exit code ${code}: ${stderrOutput}`));
        }
      });

      child.stdin.write(plaintext, 'utf8', (writeErr) => {
        if (writeErr) {
          child.kill();
          reject(new AgeEncryptionError(`Failed to pipe secret to age stdin: ${writeErr.message}`));
          return;
        }
        child.stdin.end();
      });
    });
  }
}
