---
name: live-build
description: Service-agnostic live deployment of sibling containers, isolated companion databases, native :444 admin UIs, and typed connectors with preflight image inspection, copy-never-bind, fast boot diagnostics, and uniform PIMS reads.
---

# Skill: live-build

Construcción, despliegue en contenedor hermano y registro en caliente de cualquier servicio, integración externa, aplicación con base de datos, bot, receptor de webhooks o tablero interactivo (`connectors/_template/` + `docker-proxy:2375` + `internal-proxy` + Traefik `:444`), manteniendo la sesión principal 100% responsiva.

## 1. Trigger Patterns

- "Conecta el sistema de incidentes con `<servicio o plataforma>`."
- "Integra alertas / webhooks en vivo con `<herramienta>`."
- "Despliega un servicio / portal / panel de soporte en vivo para `<objetivo>`."
- Cualquier solicitud de integración no preinstalada o contenedor de soporte durante la sesión.

## 2. Siete Principios Generales (Protocolo Obligatorio)

### 1. Inspección Preflight de Imagen y Runtime (Antes de Lanzar)
- Antes de crear o arrancar cualquier contenedor vía `DOCKER_HOST=tcp://docker-proxy:2375`, **inspeccionar primero la imagen**:
  - `docker images`, `docker image inspect <imagen>` o `docker run --rm --entrypoint sh <imagen> -c 'env; ls -la ...'`.
  - Descubrir el `Entrypoint`/`Cmd` real, variables de entorno obligatorias, puertos expuestos, dependencias de base de datos o caché, y rutas de su interfaz web nativa (admin/setup/dashboard).
  - **Prohibición**: Jamás adivinar esquemas de variables de entorno ni rutas de arranque a ciegas.

### 2. Bases de Datos y Cachés Compañeras Aisladas por Stack
- Siempre que un servicio requiera base de datos o caché (PostgreSQL, Redis, MySQL, MongoDB, etc.):
  - Crear una red puente dedicada por stack: `docker network create <slug>-net`.
  - Crear un volumen nombrado dedicado: `docker volume create <slug>-db-data`.
  - Lanzar un contenedor compañero dedicado (`pimsai-<slug>-db`) conectado a `<slug>-net` con `--volume <slug>-db-data:<data_dir>`.
  - **Regla estricta**: **NUNCA** compartir `pimsai-db` con servicios desplegados dinámicamente; cada stack mantiene su propia instancia y almacenamiento aislado.

### 3. Exponer UI Nativa Directamente en Traefik `:444` (Custom Bun Bridge Solo Si Falta UI)
- Conectar el contenedor del servicio a `internal-proxy` (y a `<slug>-net` si usa BD compañera) con etiquetas Traefik TLS completas (sin reclamar los slugs reservados `demo`, `files` o `secrets`):
  - `traefik.enable=true`
  - `traefik.docker.network=internal-proxy`
  - `traefik.http.routers.pimsai-<slug>.rule=Host(\`<slug>.pimsai.mistercricro8.top\`)`
  - `traefik.http.routers.pimsai-<slug>.entrypoints=https`
  - `traefik.http.routers.pimsai-<slug>.tls=true`
  - `traefik.http.routers.pimsai-<slug>.tls.certresolver=cloudflare`
  - `traefik.http.services.pimsai-<slug>.loadbalancer.server.port=<puerto>`
- **Prioridad UI Nativa**: Cuando el software incluya su propia interfaz web nativa de administración, configuración, emparejamiento, OAuth, flujos o dashboard, publicar esa UI nativa directamente en `https://<slug>.pimsai.mistercricro8.top:444` y entregar al usuario:
  1. La URL verificada con `:444` (`https://<slug>.pimsai.mistercricro8.top:444`).
  2. El código/clave de acceso administrativo generado para ese servicio al iniciarlo (sin exponer jamás `/app/.env` ni secretos del PIMS).
  3. Instrucciones breves paso a paso para operar en el navegador.
- Construir un servidor HTTP/puente propio en Bun **ÚNICAMENTE** cuando el servicio destino carezca de interfaz web nativa o requiera un receptor de webhooks o visualizador personalizado.

### 4. Regla Copy-Never-Bind (`docker cp` o Volúmenes Nombrados)
- **NUNCA** montar `-v /app/...` sobre contenedores hermanos (la ruta del host difiere de `/app` dentro de `pimsai-agent`).
- Utilizar exclusivamente volúmenes nombrados de Docker (`docker volume create ...`) o el patrón `docker create` + `docker cp` + `docker start`.

### 5. Diagnóstico Rápido Fail-Fast (5–10s) y Registro
- Dentro de los **5 a 10 segundos** posteriores a `docker start`, inspeccionar estado y logs reales en lugar de dormir a ciegas:
  - `docker inspect --format '{{.State.Status}} {{.RestartCount}}' pimsai-<slug>`
  - `docker logs --tail 30 pimsai-<slug>`
- Si hay reinicios o errores de arranque, diagnosticar y corregir de inmediato antes de continuar.
- Clonar `connectors/_template/` hacia `connectors/<nombre>/` (`client.ts` con `fetch()` real + `AbortController`, cero stubs, y `SKILL-FRAG.md`), verificar salud HTTP interna (`healthCheck()`) y pública en `:444` (`curl`), y registrar mediante `registerConnector({ connectorDir: "connectors/<nombre>" })`.
- **Nunca anunciar entrega al despachar**: solo reportar URL y resultado tras pasar verificación HTTP real.

### 6. Modelo de Credenciales (Auto-Alojado vs SaaS Externo)
- **Servicios Auto-Alojados que Desplegamos Nosotros**:
  - Generar llaves y contraseñas aleatorias al lanzar (`openssl rand -hex 24`) e inyectarlas vía variables de entorno (`--env`). No solicitar estas claves generadas por `secrets-sidecar`.
- **Tokens Externos Propiedad del Usuario (SaaS / APIs externas)**:
  - Invocar la herramienta `secrets_request` (o `POST http://pimsai-secrets-sidecar:3000/api/secrets/request`).
  - Iniciar el sondeo obligatorio con `async: true` **ANTES** de responder al usuario:
    `curl -sS -m 310 "http://pimsai-secrets-sidecar:3000/api/secrets/poll/<token>?wait=true"` (observando estado `"submitted"|"expired"|"failed"`).
  - Entregar `https://secrets.pimsai.mistercricro8.top:444/s/<token>` al usuario.

### 7. Modo de Ejecución y Lectura Uniforme del PIMS
- **Sesión interactiva**: Confirmar brevemente el objetivo y despachar subagente en segundo plano (`task`) mientras la sesión principal sigue atendiendo consultas del PIMS y espejo RAG sin bloquearse.
- **Modo no interactivo / print (`omp -p`)**: No despachar subagente en segundo plano; ejecutar la construcción **INLINE** (primer plano) en la sesión principal.
- **Lectura uniforme sin filtro `G4-`**: Todo watcher, poller o receptor de incidentes/auditorías lee el sistema completo sin descartar códigos ajenos a `G4-`, y consulta `bun scripts/pims.ts incidents get <CODE> --json` antes de afirmar estado de contención o evidencia. (`G4-` aplica únicamente a escrituras hacia PIMS.)

## 3. Failure Branches

- **Contenedor hermano en crash-loop o error de arranque**: Capturar `docker inspect` y `docker logs --tail 30` en los primeros 5–10s, corregir variables de entorno/red/BD y re-verificar salud antes de responder.
- **Error de Exposición Traefik**: Confirmar conexión a `internal-proxy`, etiquetas `traefik.*` completas, slug no reservado (`demo`/`files`/`secrets`) y URL pública con `:444`.
- **Credencial Externa No Entregada / Expirada**: Reportar estado `"expired"` o `"failed"` del sondeo `?wait=true` sin bloquear el resto de capacidades PIMS.
