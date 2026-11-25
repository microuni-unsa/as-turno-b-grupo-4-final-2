import * as http from 'node:http';
import * as url from 'node:url';
import { CONFIG } from './src/config.js';
import { SecretsStoreManager } from './src/store.js';
import { SecretRequestManager } from './src/request-manager.js';
import { renderPasteForm, renderSuccessPage, renderErrorPage } from './src/html.js';
import {
  SecretsSidecarError,
  SecretTokenInvalidOrExpiredError,
  SecretRequestExpiredError,
  SecretValidationError
} from './src/errors.js';
import { logAudit, logError } from './src/logger.js';

export class SecretsSidecarServer {
  private server: http.Server | null = null;
  private readonly storeManager: SecretsStoreManager;
  private readonly requestManager: SecretRequestManager;
  private readonly port: number;
  private readonly host: string;

  constructor(options?: { port?: number; host?: string; storeDir?: string; databaseUrl?: string | null }) {
    this.port = options?.port ?? CONFIG.PORT;
    this.host = options?.host ?? CONFIG.HOST;
    this.storeManager = new SecretsStoreManager({
      storeDir: options?.storeDir,
      databaseUrl: options?.databaseUrl
    });
    this.requestManager = new SecretRequestManager(this.storeManager);
  }

  public async initialize(): Promise<void> {
    await this.storeManager.initialize();
  }

  public getRequestManager(): SecretRequestManager {
    return this.requestManager;
  }

  public getStoreManager(): SecretsStoreManager {
    return this.storeManager;
  }

  public getPort(): number {
    const addr = this.server?.address();
    if (addr && typeof addr === 'object') {
      return addr.port;
    }
    return this.port;
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res).catch((err) => {
          logError('unhandled_request_error', err);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'INTERNAL_ERROR', message: 'Internal server error' }));
          }
        });
      });

      this.server.on('error', (err) => {
        logError('server_listen_error', err);
        reject(err);
      });

      this.server.listen(this.port, this.host, () => {
        logAudit({
          event: 'secrets_sidecar_started',
          message: `Secrets sidecar listening on ${this.host}:${this.port}`
        });
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          logAudit({ event: 'secrets_sidecar_stopped' });
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private async parseBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      let totalLength = 0;
      const MAX_BODY_BYTES = 1024 * 1024; // 1MB limit for secrets

      req.on('data', (chunk: Buffer) => {
        totalLength += chunk.length;
        if (totalLength > MAX_BODY_BYTES) {
          req.destroy(new Error('Request body exceeds maximum allowed size'));
          return;
        }
        chunks.push(chunk);
      });

      req.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf8'));
      });

      req.on('error', (err) => {
        reject(err);
      });
    });
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const parsedUrl = new url.URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method?.toUpperCase();

    // Healthcheck endpoint (GET & HEAD on /healthz and /health)
    if ((method === 'GET' || method === 'HEAD') && (pathname === '/healthz' || pathname === '/health')) {
      const body = JSON.stringify({ status: 'ok' });
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      });
      if (method === 'HEAD') {
        res.end();
      } else {
        res.end(body);
      }
      return;
    }

    // 1. Agent API: request a secret URL
    // POST /api/secrets/request or POST /api/request
    if (method === 'POST' && (pathname === '/api/secrets/request' || pathname === '/api/request')) {
      const rawBody = await this.parseBody(req);
      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(rawBody || '{}');
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'INVALID_JSON', message: 'Request body must be valid JSON' }));
        return;
      }

      const label = typeof payload.label === 'string' ? payload.label : '';
      const scope = typeof payload.scope === 'string' ? payload.scope : 'global';
      const createdBy = typeof payload.createdBy === 'string' ? payload.createdBy : 'agent';

      if (!label) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'MISSING_LABEL', message: 'Label is required' }));
        return;
      }

      try {
        const response = await this.requestManager.createRequest({
          label,
          scope,
          createdBy
        });
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (err) {
        const statusCode = err instanceof SecretsSidecarError ? err.statusCode : 400;
        const message = err instanceof Error ? err.message : 'Failed to create request';
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'CREATE_REQUEST_FAILED', message }));
      }
      return;
    }

    // 2. Web paste form: GET /s/:token
    if (method === 'GET' && pathname.startsWith('/s/')) {
      let token = '';
      try {
        token = decodeURIComponent(pathname.slice('/s/'.length));
      } catch {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderErrorPage('Invalid token encoding in URL path.'));
        return;
      }
      if (!token) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderErrorPage('Missing token in URL path.'));
        return;
      }

      try {
        const record = this.requestManager.getRequestForPaste(token);
        const html = renderPasteForm(token, record.label);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'The link is invalid or has expired.';
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderErrorPage(message));
      }
      return;
    }

    // 3. Form submit: POST /s/:token or POST /api/secrets/submit/:token
    if (
      method === 'POST' &&
      (pathname.startsWith('/s/') || pathname.startsWith('/api/secrets/submit/'))
    ) {
      const prefix = pathname.startsWith('/s/') ? '/s/' : '/api/secrets/submit/';
      const contentType = req.headers['content-type'] || '';
      const acceptHeader = req.headers.accept || '';
      const wantsJson =
        contentType.toLowerCase().includes('application/json') ||
        acceptHeader.toLowerCase().includes('application/json') ||
        pathname.startsWith('/api/');

      let token = '';
      try {
        token = decodeURIComponent(pathname.slice(prefix.length));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'INVALID_TOKEN', message: 'Invalid token encoding in URL path.' }));
        return;
      }

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'MISSING_TOKEN', message: 'Missing token in URL path.' }));
        return;
      }

      const rawBody = await this.parseBody(req);
      let secretValue = '';

      if (contentType.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(rawBody);
        secretValue = params.get('secretValue') || '';
      } else if (contentType.includes('application/json')) {
        try {
          const parsed = JSON.parse(rawBody);
          secretValue = typeof parsed.secretValue === 'string' ? parsed.secretValue : '';
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'INVALID_JSON', message: 'Invalid JSON payload' }));
          return;
        }
      } else {
        secretValue = rawBody.trim();
      }

      try {
        const handle = await this.requestManager.submitSecret(token, secretValue);

        if (wantsJson) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'submitted', handle }));
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(renderSuccessPage(handle));
        }
      } catch (err) {
        const statusCode = err instanceof SecretsSidecarError ? err.statusCode : 400;
        const message = err instanceof Error ? err.message : 'Submission failed.';

        if (wantsJson) {
          const code = err instanceof SecretsSidecarError ? err.code : 'SUBMIT_FAILED';
          res.writeHead(statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: code, message }));
        } else {
          res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(renderErrorPage(message));
        }
      }
      return;
    }

    // 4. Poll status: GET /api/secrets/poll/:handleOrToken (supports ?wait=true&timeout=<sec>)
    if (method === 'GET' && pathname.startsWith('/api/secrets/poll/')) {
      let pollHandleOrToken = '';
      try {
        pollHandleOrToken = decodeURIComponent(pathname.slice('/api/secrets/poll/'.length));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'INVALID_HANDLE', message: 'Invalid handle encoding in URL path' }));
        return;
      }

      if (!pollHandleOrToken) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'MISSING_HANDLE', message: 'Missing handle parameter' }));
        return;
      }

      const waitParam = parsedUrl.searchParams.get('wait');
      if (
        waitParam !== null &&
        waitParam !== 'true' &&
        waitParam !== 'false' &&
        waitParam !== '1' &&
        waitParam !== '0'
      ) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'VALIDATION_ERROR', message: "Query parameter 'wait' must be 'true' or 'false'" }));
        return;
      }
      const shouldWait = waitParam === 'true' || waitParam === '1';

      let waitTimeoutMs = CONFIG.DEFAULT_POLL_WAIT_SECONDS * 1000;
      const rawTimeout = parsedUrl.searchParams.get('timeout');
      if (rawTimeout !== null) {
        const parsedTimeoutSec = Number(rawTimeout);
        if (!Number.isFinite(parsedTimeoutSec) || parsedTimeoutSec <= 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'VALIDATION_ERROR', message: "Query parameter 'timeout' must be a positive number of seconds" }));
          return;
        }
        const cappedTimeoutSec = Math.min(parsedTimeoutSec, CONFIG.MAX_POLL_WAIT_SECONDS);
        waitTimeoutMs = Math.round(cappedTimeoutSec * 1000);
      }

      const abortController = shouldWait ? new AbortController() : undefined;
      const onClose = () => {
        if (abortController && !res.writableEnded) {
          abortController.abort();
        }
      };
      if (shouldWait) {
        req.on('close', onClose);
        res.on('close', onClose);
      }

      try {
        const result = shouldWait
          ? await this.requestManager.waitForStatus(pollHandleOrToken, waitTimeoutMs, abortController?.signal)
          : this.requestManager.pollStatus(pollHandleOrToken);

        if (abortController?.signal.aborted || res.writableEnded) {
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        if (abortController?.signal.aborted && err instanceof Error && err.name === 'AbortError') {
          return;
        }
        if (err instanceof SecretRequestExpiredError) {
          res.writeHead(err.statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'expired',
            handle: null,
            error: err.code,
            message: err.message
          }));
          return;
        }
        if (err instanceof SecretTokenInvalidOrExpiredError) {
          res.writeHead(err.statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.code, message: err.message }));
          return;
        }
        if (err instanceof SecretValidationError) {
          res.writeHead(err.statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.code, message: err.message }));
          return;
        }
        const statusCode = err instanceof SecretsSidecarError ? err.statusCode : 500;
        const message = err instanceof Error ? err.message : 'Poll error';
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'POLL_FAILED', message }));
      } finally {
        if (shouldWait) {
          req.off('close', onClose);
          res.off('close', onClose);
        }
      }
      return;
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'NOT_FOUND', message: 'Endpoint not found' }));
  }
}

// Auto-run if executed directly
const isDirectRun =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('server.ts') ||
  process.argv[1]?.endsWith('server.js');

if (isDirectRun) {
  const sidecar = new SecretsSidecarServer();
  sidecar
    .initialize()
    .then(() => sidecar.start())
    .catch((err) => {
      logError('fatal_startup_error', err);
      process.exit(1);
    });
}
