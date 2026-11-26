import * as fs from "node:fs/promises";
import * as path from "node:path";

export class AgeEncryptionError extends Error {
  public readonly code = "AGE_ENCRYPTION_ERROR";
  public readonly statusCode = 500;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface AgeKeyConfig {
  keysDir: string;
  recipientKey?: string;
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readStreamText(
  stream: ReadableStream<Uint8Array> | number | undefined,
): Promise<string> {
  if (!stream || typeof stream === "number") {
    return "";
  }
  return new Response(stream).text();
}

/**
 * Wraps the `age` and `age-keygen` CLI binaries to manage identity/recipient keys
 * and encrypt secret plaintexts strictly via stdin.
 */
export class AgeEncryptor {
  private recipientKey: string | null = null;
  private readonly keysDir: string;

  constructor(config: AgeKeyConfig) {
    if (!config.keysDir || config.keysDir.trim().length === 0) {
      throw new AgeEncryptionError("AgeEncryptor requires a non-empty keysDir");
    }
    this.keysDir = config.keysDir;
    if (config.recipientKey && config.recipientKey.trim().length > 0) {
      this.recipientKey = config.recipientKey.trim();
    }
  }

  /**
   * Initializes or resolves the age recipient public key.
   */
  public async initialize(): Promise<string> {
    if (this.recipientKey) {
      return this.recipientKey;
    }

    await fs.mkdir(this.keysDir, { recursive: true });
    const recipientPath = path.join(this.keysDir, "recipient.txt");
    const identityPath = path.join(this.keysDir, "identity.txt");

    if (await fileExists(recipientPath)) {
      const recipientContent = await fs.readFile(recipientPath, "utf8");
      const trimmed = recipientContent.trim();
      if (trimmed.length > 0) {
        this.recipientKey = trimmed;
        return this.recipientKey;
      }
    }

    if (await fileExists(identityPath)) {
      const recipient = await this.deriveRecipientFromFile(identityPath);
      await fs.writeFile(recipientPath, `${recipient}\n`, { mode: 0o644 });
      this.recipientKey = recipient;
      return this.recipientKey;
    }

    const envSecretKey = process.env.AGE_SECRET_KEY?.trim();
    if (envSecretKey && envSecretKey.length > 0) {
      const recipient = await this.deriveRecipientFromStdin(envSecretKey);
      await fs.writeFile(identityPath, `${envSecretKey}\n`, { mode: 0o600 });
      await fs.chmod(identityPath, 0o600);
      await fs.writeFile(recipientPath, `${recipient}\n`, { mode: 0o644 });
      this.recipientKey = recipient;
      return this.recipientKey;
    }

    await this.generateIdentity(identityPath);
    const recipient = await this.deriveRecipientFromFile(identityPath);
    await fs.writeFile(recipientPath, `${recipient}\n`, { mode: 0o644 });
    this.recipientKey = recipient;
    return this.recipientKey;
  }

  /**
   * Encrypts plaintext directly to an output file using age CLI.
   * Secret value is streamed via stdin and never touches command line arguments or logs.
   */
  public async encryptToFile(plaintext: string, outputPath: string): Promise<void> {
    const recipient = await this.initialize();
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    let proc: ReturnType<typeof Bun.spawn>;
    try {
      proc = Bun.spawn(["age", "--recipient", recipient, "--output", outputPath], {
        stdin: new TextEncoder().encode(plaintext),
        stdout: "pipe",
        stderr: "pipe",
        env: process.env,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new AgeEncryptionError(`Failed to execute age encryption process: ${msg}`);
    }

    const [exitCode, stderrText] = await Promise.all([
      proc.exited,
      readStreamText(proc.stderr),
    ]);

    if (exitCode !== 0) {
      throw new AgeEncryptionError(
        `age encryption failed with exit code ${exitCode}: ${stderrText.trim()}`,
      );
    }
  }

  private async generateIdentity(identityPath: string): Promise<void> {
    let proc: ReturnType<typeof Bun.spawn>;
    try {
      proc = Bun.spawn(["age-keygen", "-o", identityPath], {
        stdout: "pipe",
        stderr: "pipe",
        env: process.env,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new AgeEncryptionError(`Failed to generate age identity key: ${msg}`);
    }

    const [exitCode, stderrText] = await Promise.all([
      proc.exited,
      readStreamText(proc.stderr),
    ]);

    if (exitCode !== 0) {
      throw new AgeEncryptionError(
        `age-keygen failed with exit code ${exitCode}: ${stderrText.trim()}`,
      );
    }

    try {
      await fs.chmod(identityPath, 0o600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new AgeEncryptionError(`Failed to set permissions on identity key: ${msg}`);
    }
  }

  private async deriveRecipientFromFile(identityPath: string): Promise<string> {
    let proc: ReturnType<typeof Bun.spawn>;
    try {
      proc = Bun.spawn(["age-keygen", "-y", identityPath], {
        stdout: "pipe",
        stderr: "pipe",
        env: process.env,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new AgeEncryptionError(`Failed to derive recipient from age identity: ${msg}`);
    }

    const [exitCode, stdoutText, stderrText] = await Promise.all([
      proc.exited,
      readStreamText(proc.stdout),
      readStreamText(proc.stderr),
    ]);

    if (exitCode !== 0) {
      throw new AgeEncryptionError(
        `Failed to derive recipient from age identity (exit ${exitCode}): ${stderrText.trim()}`,
      );
    }

    const recipient = stdoutText.trim();
    if (recipient.length === 0) {
      throw new AgeEncryptionError("age-keygen returned an empty recipient public key");
    }
    return recipient;
  }

  private async deriveRecipientFromStdin(secretKey: string): Promise<string> {
    let proc: ReturnType<typeof Bun.spawn>;
    try {
      proc = Bun.spawn(["age-keygen", "-y"], {
        stdin: new TextEncoder().encode(`${secretKey}\n`),
        stdout: "pipe",
        stderr: "pipe",
        env: process.env,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new AgeEncryptionError(`Failed to derive recipient from AGE_SECRET_KEY: ${msg}`);
    }

    const [exitCode, stdoutText, stderrText] = await Promise.all([
      proc.exited,
      readStreamText(proc.stdout),
      readStreamText(proc.stderr),
    ]);

    if (exitCode !== 0) {
      throw new AgeEncryptionError(
        `Failed to derive recipient from AGE_SECRET_KEY (exit ${exitCode}): ${stderrText.trim()}`,
      );
    }

    const recipient = stdoutText.trim();
    if (recipient.length === 0) {
      throw new AgeEncryptionError("age-keygen returned an empty recipient public key from AGE_SECRET_KEY");
    }
    return recipient;
  }
}
