/**
 * QR relay template (Bun, zero deps): token-gated live QR page for one Evolution instance.
 *
 * Why: static QR publishes rot faster than files-sidecar TTL, and raw manager login
 * is high-friction (API key handling). The relay keeps the Evolution key server-side
 * and hands the user ONE link with auto-refreshing QR + live link state.
 *
 * Deploy: scripts/deploy-qr-relay.sh --slug <slug> --instance <name> (sibling container,
 * internal-proxy + Traefik :444). Env: EVO_BASE, EVO_KEY, EVO_INSTANCE, RELAY_TOKEN, PORT.
 * Handoff: announce ONLY the relay URL + 3-step scan instructions (see live-build skill).
 */
import { timingSafeEqual } from "node:crypto";

function must(k: string): string {
  const v = process.env[k];
  if (!v) {
    console.error(`missing env ${k}`);
    process.exit(1);
  }
  return v;
}

const EVO_BASE = must("EVO_BASE");
const EVO_KEY = must("EVO_KEY");
const INSTANCE = must("EVO_INSTANCE");
const TOKEN = must("RELAY_TOKEN");
const PORT = Number(process.env.PORT ?? "8787");

function authed(url: URL): boolean {
  const t = url.searchParams.get("t") ?? "";
  const a = Buffer.from(t);
  const b = Buffer.from(TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function evo(path: string): Promise<unknown> {
  const r = await fetch(`${EVO_BASE}${path}`, {
    headers: { apikey: EVO_KEY, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error(`evolution ${r.status} on ${path}`);
  return (await r.json()) as unknown;
}

const PAGE = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vincular WhatsApp — UNSA PIMS</title>
<style>
body{font-family:system-ui,sans-serif;background:#0d1117;color:#e6edf3;display:flex;justify-content:center;margin:0;padding:2rem}
main{max-width:430px;text-align:center}
img{width:100%;border-radius:12px;background:#fff;padding:10px;box-sizing:border-box;min-height:200px}
#st{font-weight:700;padding:.35rem 1rem;border-radius:999px;background:#6e7681;font-size:.9rem}
#st.open{background:#238636}
#done{display:none;margin-top:1rem;padding:1rem;border-radius:8px;background:#12261c;border:1px solid #238636}
ol{text-align:left;line-height:1.7}
code{background:#161b22;padding:.1rem .4rem;border-radius:4px}
</style></head><body><main>
<h1>Vincular WhatsApp</h1>
<p>Instancia <code>${INSTANCE}</code> · UNSA PIMS</p>
<ol>
<li>Abre <b>WhatsApp</b> en tu teléfono.</li>
<li>Ve a <b>Ajustes</b> → <b>Dispositivos vinculados</b> → <b>Vincular dispositivo</b>.</li>
<li>Escanea el código. <b>Se renueva solo</b>, no hay prisa.</li>
</ol>
<img id="qr" alt="QR de vinculación (cargando…)">
<p>Estado: <span id="st">…</span></p>
<div id="done">✅ <b>Vinculado.</b> Puedes cerrar esta pestaña.</div>
<script>
var T=new URLSearchParams(location.search).get('t');
var qrTimer=null,stTimer=null;
function qr(){fetch('api/qr?t='+encodeURIComponent(T)).then(function(r){return r.json()}).then(function(j){if(j.base64){document.getElementById('qr').src=j.base64}}).catch(function(){})}
function st(){fetch('api/state?t='+encodeURIComponent(T)).then(function(r){return r.json()}).then(function(j){var s=j.state||'?';var el=document.getElementById('st');el.textContent=s;if(s==='open'){el.className='open';document.getElementById('done').style.display='block';clearInterval(qrTimer);clearInterval(stTimer)}}).catch(function(){})}
qr();st();qrTimer=setInterval(qr,15000);stTimer=setInterval(st,4000);
</script>
</main></body></html>`;

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/healthz") return Response.json({ ok: true });
    if (!authed(url)) return new Response("forbidden", { status: 403 });
    if (url.pathname === "/") {
      return new Response(PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/api/qr") {
      try {
        const j = (await evo(`/instance/connect/${encodeURIComponent(INSTANCE)}`)) as {
          base64?: string;
          pairingCode?: string | null;
        };
        return Response.json({ base64: j.base64 ?? null, pairingCode: j.pairingCode ?? null });
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 502 });
      }
    }
    if (url.pathname === "/api/state") {
      try {
        const j = (await evo(`/instance/connectionState/${encodeURIComponent(INSTANCE)}`)) as {
          instance?: { state?: string };
        };
        return Response.json({ state: j.instance?.state ?? "unknown" });
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 502 });
      }
    }
    return new Response("not found", { status: 404 });
  },
});
console.log(`qr-relay up on :${PORT} for ${INSTANCE}`);
