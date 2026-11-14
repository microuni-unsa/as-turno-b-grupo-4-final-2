/**
 * @pims/pims-adapter
 *
 * Typed TypeScript client (bun-compatible, no build step required) for GESTITEL PIMS.
 */

export * from "./config.ts";
export * from "./types.ts";
export * from "./errors.ts";
export * from "./guards.ts";
export * from "./auth.ts";
export * from "./documents.ts";
export * from "./incidents.ts";
export * from "./reads.ts";
export * from "./client.ts";

export { PimsClient as default } from "./client.ts";
