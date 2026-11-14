/**
 * Type definitions for agent-side secrets client.
 */

export interface RequestOptions {
  scope?: string;
  createdBy?: string;
  baseUrl?: string;
}

export interface RequestResult {
  /**
   * One-time paste URL: https://secrets.pimsai.mistercricro8.top/s/<token>
   */
  url: string;
  /**
   * Internal poll handle to query status.
   */
  pollHandle: string;
  /**
   * The one-time token.
   */
  token: string;
  /**
   * Timestamp when this request expires (5-minute TTL).
   */
  expiresAt: Date;
}

export interface PollOptions {
  /**
   * Total timeout waiting for submission in milliseconds.
   * Defaults to 300,000 ms (5 minutes).
   */
  timeoutMs?: number;
  /**
   * Interval between poll queries in milliseconds.
   * Defaults to 1,000 ms.
   */
  intervalMs?: number;
  baseUrl?: string;
}
