/**
 * Safe HTML templates for secrets web paste form.
 * Ensures zero secret echo and zero script injection.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderPasteForm(token: string, label: string): string {
  const safeToken = escapeHtml(token);
  const safeLabel = escapeHtml(label);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PIMS AI — Secure Secret Input</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-muted: #8b949e;
      --primary: #238636;
      --primary-hover: #2ea043;
      --danger: #f85149;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      max-width: 540px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    h1 {
      font-size: 1.35rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: #f0f6fc;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge {
      display: inline-block;
      background: #21262d;
      border: 1px solid var(--border);
      color: #58a6ff;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    p {
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1.25rem;
    }
    .security-notice {
      background: rgba(56, 139, 253, 0.1);
      border-left: 3px solid #388bfd;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.825rem;
      color: #79c0ff;
    }
    label {
      display: block;
      font-weight: 500;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    textarea {
      width: 100%;
      height: 140px;
      background: #0d1117;
      border: 1px solid var(--border);
      border-radius: 6px;
      color: #f0f6fc;
      padding: 0.75rem;
      font-family: monospace;
      font-size: 0.95rem;
      resize: vertical;
      margin-bottom: 1.25rem;
    }
    textarea:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
    }
    button {
      width: 100%;
      background: var(--primary);
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: var(--primary-hover); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Secure Secret Input</h1>
    <div class="badge">Target: ${safeLabel}</div>
    <div class="security-notice">
      <strong>Zero-Knowledge Guarantee:</strong> This one-time link expires in 5 minutes. On submission, the secret is age-encrypted directly to the agent volume store. Values NEVER touch chat transcripts, logs, or repository files.
    </div>
    <form action="/s/${safeToken}" method="POST">
      <label for="secretValue">Paste Secret / Credential</label>
      <textarea id="secretValue" name="secretValue" placeholder="Paste credential, API key, password, or token here..." required autofocus></textarea>
      <button type="submit">Encrypt &amp; Store in Agent Store</button>
    </form>
  </div>
</body>
</html>`;
}

export function renderSuccessPage(handle: string): string {
  const safeHandle = escapeHtml(handle);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Secret Saved — PIMS AI</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      max-width: 500px;
      width: 100%;
      padding: 2rem;
      text-align: center;
    }
    .icon {
      font-size: 3rem;
      color: #3fb950;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.35rem;
      margin-bottom: 0.75rem;
      color: #f0f6fc;
    }
    p {
      color: #8b949e;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1.25rem;
    }
    .handle-box {
      background: #0d1117;
      border: 1px solid var(--border);
      padding: 0.75rem;
      border-radius: 6px;
      font-family: monospace;
      color: #58a6ff;
      font-size: 1rem;
      margin-bottom: 1.25rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">&#x2714;</div>
    <h1>Secret Successfully Encrypted</h1>
    <p>The secret has been encrypted using age and stored to the agent volume. The one-time token has been destroyed.</p>
    <div class="handle-box">${safeHandle}</div>
    <p>You may now safely close this browser tab.</p>
  </div>
</body>
</html>`;
}

export function renderErrorPage(message: string): string {
  const safeMessage = escapeHtml(message);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token Error — PIMS AI</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      max-width: 500px;
      width: 100%;
      padding: 2rem;
      text-align: center;
    }
    .icon {
      font-size: 3rem;
      color: #f85149;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.35rem;
      margin-bottom: 0.75rem;
      color: #f0f6fc;
    }
    p {
      color: #8b949e;
      font-size: 0.9rem;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">&#x26A0;</div>
    <h1>Link Invalid or Expired</h1>
    <p>${safeMessage}</p>
    <p style="margin-top: 1rem;">One-time tokens expire after 5 minutes and can only be used once.</p>
  </div>
</body>
</html>`;
}
