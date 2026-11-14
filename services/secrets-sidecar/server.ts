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

  constructor(options?: { port?: number; host?: string; storeDir?: string }) {
    this.port = options?.port ?? CONFIG.PORT;
    this.host = options?.host ?? CONFIG.HOST;
    this.storeManager = new SecretsStoreManager({ storeDir: options?.storeDir });
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

    // Healthcheck endpoint
    if (method === 'GET' && (pathname === '/healthz' || pathname === '/health')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
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
      const token = pathname.slice('/s/'.length);
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
      const token = pathname.slice(prefix.length);

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'MISSING_TOKEN', message: 'Missing token in URL path.' }));
        return;
      }

      const rawBody = await this.parseBody(req);
      const contentType = req.headers['content-type'] || '';
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

        const acceptsJson = (req.headers.accept || '').includes('application/json');
        if (acceptsJson || pathname.startsWith('/api/')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'submitted', handle }));
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(renderSuccessPage(handle));
        }
      } catch (err) {
        const isClientJson =
          (req.headers.accept || '').includes('application/json') || pathname.startsWith('/api/');
        const statusCode = err instanceof SecretsSidecarError ? err.statusCode : 400;
        const message = err instanceof Error ? err.message : 'Submission failed.';

        if (isClientJson) {
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

    // 4. Poll status: GET /api/secrets/poll/:handleOrToken
    if (method === 'GET' && pathname.startsWith('/api/secrets/poll/')) {
      const pollHandleOrToken = pathname.slice('/api/secrets/poll/'.length);
      if (!pollHandleOrToken) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'MISSING_HANDLE', message: 'Missing handle parameter' }));
        return;
      }

      try {
        const result = this.requestManager.pollStatus(pollHandleOrToken);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        if (err instanceof SecretRequestExpiredError) {
          res.writeHead(err.statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.code, message: err.message }));
          return;
        }
        if (err instanceof SecretTokenInvalidOrExpiredError) {
          res.writeHead(err.statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.code, message: err.message }));
          return;
        }
        const statusCode = err instanceof SecretsSidecarError ? err.statusCode : 500;
        const message = err instanceof Error ? err.message : 'Poll error';
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'POLL_FAILED', message }));
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
