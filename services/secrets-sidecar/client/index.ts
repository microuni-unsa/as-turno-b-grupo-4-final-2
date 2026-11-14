import { RequestOptions, RequestResult, PollOptions } from './types.js';
import {
  SecretsClientError,
  SecretRequestExpiredError,
  SecretPollTimeoutError,
  SecretTokenInvalidOrExpiredError
} from './errors.js';

export * from './types.js';
export * from './errors.js';

const DEFAULT_BASE_URL = process.env.SECRETS_SIDECAR_URL || 'https://secrets.pimsai.mistercricro8.top';
const DEFAULT_POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_POLL_INTERVAL_MS = 1000; // 1 second

export class SecretsClient {
  private readonly defaultBaseUrl: string;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.defaultBaseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Requests a one-time secret input link for the given label.
   * Returns a 5-minute single-use URL and a poll handle.
   */
  public async request(label: string, options: RequestOptions = {}): Promise<RequestResult> {
    const baseUrl = (options.baseUrl || this.defaultBaseUrl).replace(/\/+$/, '');
    const requestUrl = `${baseUrl}/api/secrets/request`;

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        label,
        scope: options.scope || 'global',
        createdBy: options.createdBy || 'agent'
      })
    });

    if (!response.ok) {
      let errorMessage = `Failed to create secret request: HTTP ${response.status}`;
      try {
        const errorJson = (await response.json()) as { message?: string };
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // use default message
      }
      throw new SecretsClientError(errorMessage, 'REQUEST_FAILED', response.status);
    }

    const data = (await response.json()) as {
      token: string;
      url: string;
      expiresAt: string;
      pollHandle: string;
    };

    return {
      url: data.url,
      pollHandle: data.pollHandle,
      token: data.token,
      expiresAt: new Date(data.expiresAt)
    };
  }

  /**
   * Polls sidecar until the secret is submitted or expires.
   * Returns opaque handle `secret:<name>@<v>`.
   * NEVER returns the underlying secret value.
   *
   * @throws {SecretRequestExpiredError} if the request expires without submission
   * @throws {SecretPollTimeoutError} if poll timeout is exceeded
   * @throws {SecretTokenInvalidOrExpiredError} if token replay or invalid
   */
  public async poll(pollHandle: string, options: PollOptions = {}): Promise<string> {
    const baseUrl = (options.baseUrl || this.defaultBaseUrl).replace(/\/+$/, '');
    const timeoutMs = options.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS;
    const intervalMs = options.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    const startTime = Date.now();

    const pollUrl = `${baseUrl}/api/secrets/poll/${encodeURIComponent(pollHandle)}`;

    while (Date.now() - startTime < timeoutMs) {
      const response = await fetch(pollUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.status === 410) {
        throw new SecretRequestExpiredError();
      }

      if (response.status === 400 || response.status === 404) {
        throw new SecretTokenInvalidOrExpiredError();
      }

      if (!response.ok) {
        throw new SecretsClientError(
          `Unexpected response during poll: HTTP ${response.status}`,
          'POLL_FAILED',
          response.status
        );
      }

      const data = (await response.json()) as {
        status: 'pending' | 'submitted' | 'expired';
        handle: string | null;
      };

      if (data.status === 'submitted' && data.handle) {
        return data.handle;
      }

      if (data.status === 'expired') {
        throw new SecretRequestExpiredError();
      }

      // If pending, sleep and continue
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new SecretPollTimeoutError(`Secret polling timed out after ${timeoutMs}ms.`);
  }
}

/**
 * Default singleton instance matching agent usage:
 * `secrets.request(label)` + `secrets.poll(handle)`
 */
export const secrets = new SecretsClient();
export default secrets;
