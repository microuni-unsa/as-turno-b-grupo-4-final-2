# Presentación Técnica Integral del Sistema: Operador Agéntico UNSA PIMS (ISO/IEC 27701:2025)

> **Propósito del documento:** Presentación arquitectónica y técnica completa del sistema **UNSA PIMS — Operador Agéntico (Turno B Grupo 4)**, detallando su diseño en capas, los protocolos de comunicación, las tecnologías empleadas y los enfoques de ingeniería de IA agéntica implementados.
>
> **Tesis arquitectónica central:** El sistema adopta **`pi`** exclusivamente como un **harness agéntico minimalista** (abstracción de proveedores LLM, bucle básico de *tool-calling* con primitivas de archivo/shell y hooks mínimos de ciclo de vida). A partir de esa base austera, **toda la plataforma circundante fue diseñada e implementada a medida**: puente RPC con *framing* v2, consola web unificada en tiempo real, bóveda cifrada de credenciales con *Data Loss Prevention* (DLP), espejo RAG híbrido en `pgvector`, SDK tipado + CLI unificado sobre PIMS, motor determinista de síntesis documental (Typst + OOXML), orquestación autónoma de contenedores hermanos, *self-healing* de conectores, compuertas *Human-in-the-Loop* (HITL) y sistema de *Agent Skills*.

---

## 1. Filosofía Arquitectónica: *Minimal Harness + Bespoke Control Plane*

En ingeniería de sistemas agénticos existen dos paradigmas opuestos: adoptar un *framework* agéntico monolítico "baterías incluidas" (con memoria opaca, enrutamiento implícito, manejo acoplado de prompts y UI acoplada) o partir de un **harness minimalista** y construir el plano de control (*control plane*) alrededor de él.

Este sistema sigue el segundo paradigma usando **`pi`** como núcleo de ejecución:

### 1.1 Qué aporta `pi` (y únicamente `pi`)
`pi` actúa estrictamente como un *runtime* agéntico ligero (*bare-metal agent loop*) responsable de tres primitivas esenciales:
1. **Abstracción multi-proveedor de LLMs**: resolución de modelos mediante identificador `<provider>/<model-id>` (`--model`), gestión de niveles de razonamiento (*thinking levels*), conteo de tokens/costo y reintentos con *fallback* ante errores transitorios del proveedor.
2. **Bucle ReAct / *Tool-Use Loop* con herramientas primitivas**: lectura/escritura/edición de archivos, ejecución de subprocesos en shell (`bash`), gestión básica de listas de tareas (`todo`), delegación de subagentes (`task`) y soporte nativo de herramientas externas vía **Model Context Protocol (MCP)**.
3. **Bus mínimo de extensibilidad y modo *headless* RPC**: carga de extensiones por proyecto mediante *hooks* de ciclo de vida (`session_start`, `input`, `tool_result`, `context`, `pi.registerTool`, `pi.sendMessage`), descubrimiento de *Agent Skills* (`enablePiProject: true`) y exposición de entrada/salida estructurada en modo RPC.

### 1.2 Qué construimos nosotros alrededor de `pi`
Todo lo que convierte a `pi` en un operador autónomo empresarial para un Sistema de Gestión de Privacidad de la Información (SGPI) bajo **ISO/IEC 27701:2025** fue implementado por nuestro equipo en este repositorio:

| Capa construida a medida | Problema agéntico que resuelve | Implementación en el repositorio |
| :--- | :--- | :--- |
| **Plano de Control RPC + Web** | Desacoplar el *harness* de terminal hacia una consola web multi-usuario segura con *streaming* en vivo | `apps/web/server/omp/bridge.ts`, `rpc-framing.ts`, `index.ts`, `wire-adapter.ts` |
| **Consola React 19 + Trazabilidad** | Renderizar *Chain-of-Thought*, llamadas a herramientas, diálogos HITL, archivos y secretos en tiempo real | `apps/web/client/src/` (Zustand 5, Streamdown, Shiki, Radix UI) |
| **DLP en Hooks & Bóveda `age`** | Evitar exfiltración de credenciales hacia el historial de sesión o hacia las APIs de los proveedores LLM | `.omp/extensions/intro.ts`, `apps/web/server/secrets/`, `connectors/runtime/secrets.ts` |
| **Espejo RAG Híbrido (`pgvector`)** | *Grounding* documental verificable con citas línea a línea y resiliencia ante caídas del PIMS fuente | `packages/rag-mirror/` (`schema.sql`, `chunker.ts`, `embedder.ts`, `query.ts`, `diff.ts`) |
| **SDK Tipado + CLI Unificado** | Contratación estricta contra REST API real de GESTITEL, aislamiento *write-only* `G4-` y modo simulación | `packages/pims-adapter/`, `scripts/pims.ts` |
| **Síntesis Documental Determinista** | Generar PDFs y libros `.xlsx` conformes a anatomía institucional sin alucinaciones de formato | `molds/**/*.typ` (Typst 0.15), `molds/**/generate*.ts` (OOXML `zlib`) |
| **Conectores Dinámicos & *Self-Heal*** | Integrar servicios externos en caliente, reparar *drifts* de API en segundo plano sin bloquear el chat | `connectors/runtime/`, `connectors/mail/`, `connectors/_template/` |
| **Orquestación de Contenedores** | Desplegar integraciones hermanas con BD aislada y exposición TLS automática sobre `:444` | Protocolo `live-build` sobre `DOCKER_HOST=tcp://docker-proxy:2375` + Traefik |
| **Context Engineering & 12 Skills** | *Progressive disclosure*, memoria dual separada (procedimental vs conocimiento) y compuertas HITL | `AGENTS.md`, `RULES.md`, `.omp/skills/*/SKILL.md`, `.omp/memory-seed/` |

### 1.3 Arquitectura General en Capas

```mermaid
flowchart TB
    subgraph Edge["Borde TLS & Proxy Reverso"]
        CF["Cloudflare Edge (:443 -> :444)"] --> TR["Traefik (network: internal-proxy, TLS Let's Encrypt)"]
    end

    subgraph Web["Capa de Presentación & Control Plane (apps/web, Puerto 8082)"]
        SPA["React 19 SPA (Zustand + Streamdown + Shiki + Radix)"]
        HTTP["Hono HTTP + Auth RBAC (RW/RO HMAC-SHA256) + WebSocket (/ws)"]
        FILES["FilesService (Uploads <=50MB magic-bytes + Publish TTL)"]
        VAULT["SecretsService (age CLI stdin + secrets_registry)"]
        BRIDGE["Bridge RPC v2 (NDJSON 0x0A + rpc_chunk reassembly)"]
        SPA <-->|WSS / HTTPS| HTTP
        HTTP --> FILES
        HTTP --> VAULT
        HTTP <--> BRIDGE
    end

    subgraph Harness["Núcleo Agéntico Minimalista: pi (subproceso --mode rpc-ui)"]
        CORE["pi Core: LLM Providers + Tool Loop (read/write/edit/bash/todo/task)"]
        EXT["Extensión intro.ts: Hooks DLP (input/tool_result/context) + secrets_request/poll"]
        SKILLS["Context Engineering: AGENTS.md + RULES.md + 12 Skills + Memory Seed"]
        MCP["Playwright MCP (@playwright/mcp over stdio -> Chromium headless)"]
        CORE --- EXT
        CORE --- SKILLS
        CORE --- MCP
    end

    subgraph Domain["Capa de Dominio, Datos y Síntesis"]
        CLI["scripts/pims.ts (21 subcomandos) + @pims/pims-adapter"]
        RAG["@pims/rag-mirror (pdftotext/Tesseract + Chunker + mistral-embed 1024d)"]
        MOLDS["Typst 0.15 Molds + Generadores XLSX OOXML (Staging /tmp)"]
        CONN["Connectors Runtime (mail SMTP + conectores dinámicos + registerConnector)"]
        CORE -->|bash| CLI
        CORE -->|bash| MOLDS
        CORE -->|bash| CONN
        CLI --> RAG
    end

    subgraph Infra["Persistencia & Contenedores Hermanos"]
        PIMS["GESTITEL PIMS (https://unsa.27k.pe, schema: unsa)"]
        PG[("pimsai-db: PostgreSQL 16 + pgvector (HNSW)")]
        MIRROR[("CORPUS_MIRROR_DIR + age store (/app/secrets)")]
        DOCK["docker-proxy:2375 -> Contenedores Hermanos (*.pimsai.mistercricro8.top:444)"]
        CLI <-->|JWT REST| PIMS
        RAG <--> PG
        RAG <--> MIRROR
        VAULT --> PG
        CORE -->|docker CLI| DOCK
        DOCK --> TR
    end

    TR --> HTTP
```

---

## 2. Topología de Infraestructura, Contenerización y Despliegue

El sistema corre en un stack de **dos contenedores** definido en `docker-compose.yml` y compilado sobre `debian:bookworm-slim` (`Dockerfile`), diseñado para operar sin privilegios elevados (`USER agent`, UID/GID `1000`) y con inicialización limpia de procesos (`init: true`).

### 2.1 Imagen del Agente (`pimsai-agent`)
El `Dockerfile` consolida en una sola imagen determinista todas las herramientas binarias requeridas para que el agente jamás tenga que instalar dependencias en tiempo de ejecución:
- **Runtimes de ejecución:** `Bun 1.2.4`, `Node.js 22.14.0` (requerido por `@playwright/mcp`), `pnpm 12.9.0`, `Python 3` (`venv`/`pip`) y `uv`/`uvx`.
- **Compilación documental y procesamiento de PDFs/OCR:** `Typst 0.15.0`, `poppler-utils` (`pdftotext`, `pdfinfo`, `pdftoppm`), `mupdf-tools` (`mutool`), `ghostscript`, `tesseract-ocr` con paquetes `spa` y `eng`, y fuentes tipográficas (`fonts-crosextra-carlito`, `fonts-liberation`, `fonts-dejavu-core`, `fonts-noto-core`).
- **Seguridad, red y operaciones:** `age` / `age-keygen`, `docker.io` (CLI hacia `docker-proxy`), `postgresql-client` (`psql`), `chromium`, `ripgrep`, `jq`, `file`, `git`, `curl`.
- **Aislamiento de artefactos de build frente al bind-mount:**
  - Las dependencias backend (`package.json`, `bun.lock`) se instalan en `/node_modules` (fuera de `/app`).
  - El *frontend* React (`apps/web/client`) se compila en build-time con Vite hacia `/opt/pimsai-web/dist` (`WEB_DIST_DIR`), evitando que el montaje `.:/app` oculte los paquetes o el *bundle* compilado.

### 2.2 Base de Datos Vectorial (`pimsai-db`)
- Imagen `pgvector/pgvector:pg16` en una red puente interna dedicada (`agent-internal`), sin exposición hacia puertos públicos ni hacia `internal-proxy`.
- Inicialización automática mediante `packages/rag-mirror/schema.sql` montado en `/docker-entrypoint-initdb.d/01-schema.sql:ro`.
- *Healthcheck* nativo (`pg_isready`) que condiciona el arranque de `pimsai-agent` (`condition: service_healthy`).

### 2.3 Volúmenes Persistentes y Estrategia *Staging-Copy*
Los datos críticos de estado se separan del código de aplicación mediante cinco volúmenes nombrados:
- `agent_data` (`/home/agent`): sesiones `.jsonl` de `pi`, memoria procedimental y borradores SMTP (`/home/agent/.pims-mail-drafts.json`).
- `secrets_data` (`/app/secrets`): identidades `age` (`keys/identity.txt`, `keys/recipient.txt`) y secretos cifrados `.age`.
- `corpus_mirror_data` (`/var/lib/pimsai/corpus_mirror`): espejo local de PDFs, textos extraídos y manifiestos `manifest.json`.
- `pgvector_data` (`/var/lib/postgresql/data`): tablas `pims_registry`, `chunks` y `secrets_registry`.
- `uploads_data` (`/app/data/preserved_uploads`): archivos adjuntados por el usuario y entregables publicados temporalmente.

En producción (`scripts/deploy-sync.sh`), el repositorio prístino (`repo/`) se sincroniza vía `rsync --delete` hacia una copia desechable de *staging* (`app/`), excluyendo `.env`, `.enc.env`, `.sops.yaml`, `.git/`, `docs/`, `corpus_g4_src/` y `node_modules/`. Las credenciales se inyectan desde un `.env` externo en el host (`PIMSAI_ENV_FILE`) que nunca se monta dentro de `/app`.

### 2.4 Secuencia de Arranque (`entrypoint`) y Exposición TLS
Al iniciar `pimsai-agent`:
1. Inyecta dinámicamente `AGENT_API_KEY` en la variable esperada por el proveedor (`AGENT_ENV_VAR`).
2. Sincroniza la semilla de memoria procedimental (`.omp/memory-seed/memory_summary.md` → `~/.omp/agent/memories/--app--/memory_summary.md`) mediante comparación byte a byte (`cmp -s`).
3. Lanza en segundo plano el demonio de sincronización continua del espejo RAG:
   `bun scripts/pims.ts mirror sync --loop --interval 300 > /tmp/pims-mirror-sync.log 2>&1 &`
4. Reemplaza el proceso principal (`exec`) con el servidor web unificado `bun /app/apps/web/server/index.ts` en el puerto `8082`.
5. Traefik (conectado a la red externa `internal-proxy`) enruta `https://demo.pimsai.mistercricro8.top:444` hacia `pimsai-agent:8082` con certificado TLS emitido por Let's Encrypt (`certresolver=cloudflare`), mientras Cloudflare proxy reenvía tráfico externo `:443 → :444`.

---

## 3. El Núcleo Agéntico sobre `pi`: Protocolo RPC v2, Streaming y Gestión de Contexto

Para exponer el *harness* `pi` en una aplicación web multi-cliente sin recurrir a emulación frágil de terminal (PTY), implementamos un **puente RPC bidireccional asíncrono** (`apps/web/server/omp/bridge.ts`) que administra el ciclo de vida del subproceso `pi` (`--mode rpc-ui --model <AGENT_MODEL>`).

### 3.1 Protocolo de Framing NDJSON v2 y Reensamblaje de Chunks (`rpc-framing.ts`)
La comunicación entre el servidor Bun y el subproceso `pi` ocurre por `stdin`/`stdout` mediante líneas JSON delimitadas estrictamente por el byte `0x0A` (`\n`):
- **Segmentación segura a nivel de bytes (`RpcFrameDecoder`):** al operar sobre `Uint8Array` buscando `0x0A` (con limpieza opcional de `0x0D`), se evita que separadores Unicode como `U+2028` o `U+2029` dentro de strings JSON fragmenten tramas válidas.
- **Reensamblaje de cargas grandes (`rpc_chunk`):** cuando el agente emite un frame que excede el tamaño seguro de línea, el protocolo v2 lo divide en fragmentos `rpc_chunk` (`chunkId`, `index`, `count`, `byteLength`, `data` en Base64 estricto). El decodificador valida:
  - Formato Base64 estricto (`STRICT_BASE64_REGEX`).
  - Orden secuencial (`index === nextIndex`), ausencia de tramas intercaladas (`INTERLEAVED_CHUNK_SEQUENCE`) y consistencia de metadatos.
  - Límite máximo de reensamblaje configurable (`RPC_MAX_REASSEMBLED_BYTES = 64 MiB`).
  - Validación de cierre limpio (`assertCleanEnd()`) al terminar `stdout`.
- **Negociación inicial:** tras recibir `{ type: "ready" }` (timeout `15s`), el puente envía `negotiate_protocol` (`protocolVersion: 2`) y `set_subagent_subscription` (`level: "progress"`), e hidrata el estado completo (`get_state`, `get_session_stats` y paginación de historial `get_messages_page` con cursor de `100` mensajes).

### 3.2 Máquina de Estados de Razonamiento y *Streaming* Granular
El puente traduce los eventos crudos del ciclo agéntico de `pi` en una máquina de estados tipada (`AgentRunPhase`: `"idle" | "thinking" | "tool" | "responding" | "compacting" | "retrying"`):
- **Trazas cognitivas en tiempo real:** los eventos `message_update` desagregan bloques de razonamiento (`thinking_start/delta/end`), texto de respuesta (`text_start/delta/end`), argumentos parciales de herramientas (`toolcall_start/delta/end`) e imágenes (`image_end`).
- **Telemetría de ejecución de herramientas:** `tool_execution_start`, `tool_execution_update` / `tool_stream_update` (streaming de stdout en tiempo real hacia la UI) y `tool_execution_end` con duración exacta en milisegundos y estado (`streaming` → `running` → `completed` | `error`).
- **Reconciliación optimista de mensajes de usuario:** cuando el operador envía un *prompt* (con adjuntos o imágenes Base64), el puente lo proyecta optimísticamente en la UI (`local_user_*`) y lo reconcilia con el `messageId` canónico cuando el *harness* lo confirma en `message_start`/`message_end`.
- **Auto-recuperación del subproceso:** `ensureStarted()` reinicia el subproceso `pi` hasta `3` veces (`DEFAULT_MAX_RESTART_ATTEMPTS`) si muere inesperadamente, propagando cualquier fallo a la UI.

### 3.3 Enfoques Avanzados de Control de Flujo Agéntico
1. **Colas de Dirección en Vuelo (*Steering & Follow-Up Queues*):**
   Mientras el agente está ejecutando un turno multi-paso, el usuario puede enviar mensajes con `streamingBehavior: "steer"` (para corregir o redirigir el curso actual entre iteraciones de herramientas) o `"followUp"` (para encolar la siguiente instrucción al finalizar el turno). El puente sincroniza el estado de ambas colas vía eventos `queue_update`.
2. **Gestión Activa de Ventana de Contexto (*Context Compaction*):**
   Monitoreo continuo de `inputTokens`, `outputTokens`, `contextWindow`, `contextPercent` y `costUsd`. Soporta compactación automática (`auto_compaction_start/end`) cuando la ventana se aproxima a saturación, y compactación manual bajo demanda (`compact` con `customInstructions` opcionales, timeout `120s`).
3. **Resiliencia ante Fallos de Proveedor (*Auto-Retry & Model Fallback*):**
   Observabilidad completa de eventos `auto_retry_start/end`, `retry_fallback_applied` y `retry_fallback_succeeded`, notificando de forma transparente al operador si el *harness* conmutó temporalmente a un modelo alternativo.
4. **Control Presupuestario y Degradación Elegante (*Degraded-at-Cap*):**
   Configuración en `.omp/config.yml` de `task.softRequestBudget: 150` (con notificación proactiva `softRequestBudgetNotice: true` y detención dura en `1.5x`). En perfiles de evaluación acotada (*Solo Loan Profile*), al alcanzar el tope de presupuesto, la generación/compilación y escrituras se pausan con un aviso explícito, pero **el subsistema RAG (`pgvector`) y las consultas de lectura permanecen 100% operativos**.

---

## 4. Ingeniería de Contexto, Memoria Dual y *Agent Skills*

En lugar de sobrecargar un *system prompt* monolítico con miles de líneas de instrucciones irrelevantes para el turno actual, el sistema implementa **Context Engineering jerárquico** y **Progressive Disclosure**.

### 4.1 Jerarquía de Contexto en Tres Niveles
1. **Nivel 1 — Identidad y Restricciones Inmutables (Siempre Activos):**
   - `AGENTS.md`: define la identidad del operador, el tono formal en español ejecutivo para autoridades de la UNSA y auditores, la prohibición estricta de filtrar jerga de código (`Problem:`, `Next:`, flags de CLI o rutas internas) y el mapa arquitectónico.
   - `RULES.md` (cargado vía `contextFiles.extra`): contiene exclusivamente **restricciones duras (*sticky*)** —prefijo `G4-` obligatorio en escrituras, compuertas de confirmación humana en 2 turnos, higiene de credenciales, regla *Ask First* tras cargas de archivos— y **directivas de enrutamiento positivo** (cómo reaccionar ante fallos de PIMS o solicitudes de integración).
2. **Nivel 2 — *Agent Skills* bajo Demanda (`12` Skills en `.omp/skills/`):**
   El catálogo completo se declara con contratos concisos de una línea en `.omp/skills-registry.json` y `.omp/config.yml` (`skillsRegistry`). El agente carga las instrucciones detalladas (`SKILL.md`) solo cuando la intención del turno lo requiere, combinando múltiples *skills* de forma composicional:
   - **Core Skills (3):**
     - `pims-reader`: lecturas uniformes sobre la API REST de GESTITEL vía `bun scripts/pims.ts`, *fallback* al espejo y sanitización.
     - `connector-builder`: generación agnóstica de conectores tipados (`client.ts` + `SKILL-FRAG.md`) y bucle de *self-heal*.
     - `ingest`: descarga, extracción (`pdftotext` / OCR), *chunking*, *embedding* 1024-dim y sincronización con `pgvector`.
   - **Behavior Skills (9):**
     - `version-compare`: comparación estructural de versiones PDF + narrativa de cambios.
     - `incident-ops`: matriz semafórica de incidentes y auditorías con deduplicación y validación estricta de cierres.
     - `audit-chain`: trazabilidad completa *Hallazgo → No Conformidad → Acción Correctiva (CAPA)* con citas `pims:`.
     - `directed-version`: flujo *Copy-Then-Fill* sobre moldes Typst, adaptación *cross-team* vía `molds/generic`, previsualización y doble compuerta HITL.
     - `cascade`: registro de hechos institucionales en `university-facts/`, escaneo de impacto en PIMS + RAG y regeneración en lote.
     - `proactive`: sugerencias contextuales adyacentes (≤ 2 ofertas verificadas por respuesta, sin especulación).
     - `summons-dispatch`: redacción de citatorios de seguimiento desde correos vivos en PIMS + evidencia RAG, con disparo SMTP bloqueado hasta `"envíalo"`.
     - `live-build`: despliegue en subagente en segundo plano de contenedores hermanos y BD aisladas en Traefik `:444`.
     - `doc-necessity`: evaluación en 3 niveles de madurez documental contra `reference/iso-27701-2025.md` y el estado real del PIMS.
3. **Nivel 3 — Inyección Dinámica de Capacidades (`registerConnector`):**
   Cuando el agente construye un conector nuevo en tiempo de ejecución, `connectors/runtime/register.ts` valida su `SKILL-FRAG.md` (exigiendo tabla Markdown con verbos HTTP `GET|POST|PUT|PATCH|DELETE|CRUD`) y lo inserta de manera idempotente entre delimitadores `<!-- CONNECTOR: <name> START/END -->` en `.omp/skills/connectors/SKILL.md`. De inmediato, la capacidad recién construida queda descubrible en el contexto del agente.

### 4.2 Arquitectura de Memoria Dual (Separación Estricta)
Un anti-patrón clásico en agentes es mezclar el conocimiento documental del dominio con las lecciones de comportamiento del agente. El sistema separa físicamente ambos tipos de memoria:
- **Memoria Procedimental / Comportamental (`memory.backend: local`):** almacena reglas operativas aprendidas y correcciones de conducta (ej. no filtrar lecturas por `G4-`, flujo de *polling* asíncrono de secretos). Se siembra idempotentemente al arranque desde `.omp/memory-seed/memory_summary.md` y puede podarse determinísticamente con `scripts/prune-omp-state.ts` (que además verifica la ausencia de marcadores obsoletos).
- **Memoria Semántica de Dominio (`pgvector` + `CORPUS_MIRROR_DIR`):** almacena exclusivamente los documentos del SGPI y sus *embeddings* versionados. Nunca se contamina con instrucciones de sistema ni lecciones de *prompting*.

---

## 5. Extensibilidad de `pi`: Guardrails Deterministas, DLP y Herramientas Custom

La extensión de proyecto `.omp/extensions/intro.ts` demuestra cómo blindar un *harness* minimalista sin modificar su código fuente, usando únicamente su API de hooks (`export default function (pi: any)`):

### 5.1 Interceptación Determinista de Comandos (`input` Hook)
- Al disparar `session_start`, inyecta el *banner* institucional (`pi.sendMessage(..., { triggerTurn: false })`) sin consumir un turno de inferencia.
- Cuando el usuario escribe `mas ayuda`, el hook `input` intercepta el mensaje, lee `.omp/USAGE.md` y lo despliega directamente con `{ handled: true }`, evitando latencia y gasto de tokens LLM.

### 5.2 Pipeline *Defense-in-Depth* de Prevención de Fuga de Secretos (DLP)
Para garantizar **cero exposición de credenciales en texto plano** (`ZERO_EXPOSURE`), la extensión aplica recursivamente `redactSecrets()` y `redactDeep()` en **tres fronteras críticas**:
1. **`pi.on("input")`:** sanitiza cualquier secreto que el usuario pegue accidentalmente antes de que entre al historial de la sesión.
2. **`pi.on("tool_result")`:** limpia `event.content` y `event.details` de toda herramienta ejecutada (ej. salidas de `bash` o `read`) antes de persistirse en el archivo `.jsonl` de sesión.
3. **`pi.on("context")`:** barrera final sobre todo el arreglo `event.messages` (`text`, `thinking`, `arguments`, `details`) justo antes de serializarse hacia el proveedor LLM externo.

**Anatomía de `redactSecrets()`:**
- Protege mediante centinelas temporales los *handles* opacos legítimos (`secret:<name>@v?[0-9]+`) para nunca corromper referencias válidas.
- Enmascara los valores literales (`>= 6` caracteres) de variables críticas cargadas en entorno (`PIMS_PASSWORD`, `SMTP_PASSWORD`, `EMBEDDINGS_API_KEY`, `AGENT_API_KEY`, `POSTGRES_PASSWORD`, `AGE_SECRET_KEY`, `WEB_RW_TOKEN`, `WEB_RO_TOKEN`).
- Detecta y reemplaza por patrón: llaves privadas `AGE-SECRET-KEY-1...`, tokens JWT (`eyJ...`), cabeceras `Bearer`, URIs de bases de datos con credenciales embebidas (`postgresql://user:pass@host`) y asignaciones `password=...` / `api_key=...`.

### 5.3 Registro de Herramientas de Adquisición Segura de Secretos
La extensión registra con `loadMode: "essential"` dos herramientas nativas del protocolo de bóveda:
- **`secrets_request(label, scope?)`:** invoca `POST http://127.0.0.1:8082/internal/secrets/request`, disparando la tarjeta cifrada interactiva en la consola web.
- **`secrets_poll(handle, wait?, timeout?)`:** consulta `GET /internal/secrets/poll/<handle>?wait=true&timeout=<≤300>` para recibir el *handle* opaco `secret:<name>@v<n>` una vez cifrado.

---

## 6. Consola Web Unificada, Tiempo Real y Seguridad Zero-Trust

Construida como un servicio único en **Bun + Hono** (`apps/web/server/index.ts`, puerto `8082`) que sirve tanto la API REST/WebSocket como el *bundle* estático de la SPA React 19, retirando antiguos *sidecars* separados (`files` y `secrets`) para eliminar superficie de ataque y latencia entre contenedores.

### 6.1 Seguridad de Transporte, Autenticación RBAC y Aislamiento *Loopback*
- **Tokens con roles diferenciados (`apps/web/server/auth.ts`):**
  - `WEB_RW_TOKEN` (`role: "rw"`): acceso completo de operador (prompts, abortar, subir archivos, resolver diálogos HITL, cifrar secretos).
  - `WEB_RO_TOKEN` (`role: "ro"`): modo observador de solo lectura; las mutaciones REST y comandos WebSocket retornan `403 FORBIDDEN_READ_ONLY`.
- **Verificación resistente a *timing attacks* (`constantTimeTokenEqual`):** ambos tokens (candidato y esperado) se digieren con **SHA-256** (longitud fija de 32 bytes) antes de compararse con `crypto.timingSafeEqual`, eliminando oráculos de longitud.
- **Sesión por Cookie Firmada:** emite `pimsai_session` (`payloadBase64Url.hmacSha256Base64Url`, TTL `12h`, `HttpOnly`, `SameSite=Lax`, `Secure` dinámico según `x-forwarded-proto`).
- **Frontera `/internal/*`:** todas las rutas internas (`/internal/publish`, `/internal/secrets/request`, `/internal/secrets/poll/:handleOrToken`) validan mediante `isLoopbackAddress()` que la IP origen sea estrictamente `127.0.0.1`, `::1` o `::ffff:127.0.0.1` (`403 FORBIDDEN_INTERNAL` en caso contrario). Así, solo procesos locales dentro del contenedor `pimsai-agent` (como `pi` o `scripts/pims.ts`) pueden invocarlas.

### 6.2 Interfaz React 19 y Experiencia Agéntica (`apps/web/client/`)
- **Stack UI:** React 19.1, Vite 6.3, Tailwind CSS v4, Radix UI, Zustand 5 (`useAppStore.ts`), `use-stick-to-bottom`, `streamdown` (`@streamdown/code`, `@streamdown/math`, `@streamdown/mermaid`, `@streamdown/cjk`), `shiki` y `ansi-to-react`.
- **Protocolo WebSocket bidireccional (`/ws`):**
  - Al abrir, recibe `init_snapshot` con el estado completo (`messages`, `runState`, `todos`, `subagents`, `pendingUiRequests`, `pendingSecretRequests`, `queue`, `stats`).
  - Reconexión automática con *backoff* exponencial (`WS_RECONNECT_BASE_MS` → `WS_RECONNECT_MAX_MS`).
  - Traducción tipada estricta servidor ↔ cliente en `apps/web/server/wire-adapter.ts` mediante verificación exhaustiva (`never`).
- **Componentes especializados de IA agéntica:**
  - `AgentTraceView.tsx`: agrupa los pasos intermedios (*Chain-of-Thought* colapsable, llamadas a herramientas con consola ANSI, duración en ms, barra de progreso de `todos` por fase y tarjetas de estado de subagentes).
  - `ExtensionUiCard.tsx`: renderiza diálogos interactivos estructurados emitidos por extensiones (`confirm`, `select`, `input`, `editor`, `ask`, `form`).
  - `SecretPromptCard.tsx` y `SecretsDrawer.tsx`: tarjeta efímera en línea (con cuenta regresiva de `5 minutos`) y cajón lateral **Bóveda de Secretos** para alta/rotación directa.
  - `ArtifactPreviewSheet.tsx` y `FilesDrawer.tsx`: visor integrado de entregables publicados (PDF, HTML en `iframe` *sandboxed*, Markdown, CSV, JSON, XLSX) y cargas del operador.
  - Visualizador de citas `pims:`: al hacer clic en una cita `pims:<doc.code>:v<v>:<chunk>:<lines>`, consulta `/api/mirror/excerpt` y despliega el extracto exacto con números de línea y descarga del PDF original (`/api/mirror/download/:code`).

### 6.3 Subsistema de Archivos (`FilesService`)
- **Ingesta directa (`POST /api/uploads`, hasta `50 MB`):** valida extensión (`pdf`, `doc`, `docx`, `txt`, `xlsx`, `png`) y verifica **magic bytes** reales (`%PDF-`, cabecera PNG `89 50 4E 47`, contenedor ZIP OOXML con `word/document.xml` o `xl/workbook.xml`, cabecera OLE CFBF `D0 CF 11 E0` para `.doc`, UTF-8 para `.txt`). Persiste de forma atómica (archivo temporal + `renameSync`) con SHA-256 y metadatos en `_uploads_meta/`.
- **Publicación de entregables (`POST /internal/publish` → `GET /api/files/:slug`):** soporta `content`, `content_base64` o `file_path` (confinado estrictamente dentro de `uploadsDir`), asigna TTL por defecto de `3600s`, emite notificación WebSocket `file_published` (adjuntando una tarjeta inline *Vista previa / Descargar* al último mensaje del asistente), e inyecta cabecera `Content-Security-Policy: sandbox allow-scripts` si se sirve HTML en línea junto con `X-Content-Type-Options: nosniff`.

### 6.4 Bóveda de Secretos Cifrada con `age` (`SecretsService` + `AgeEncryptor`)
- **Cifrado asimétrico sin exposición en CLI:** `AgeEncryptor` gestiona el par de llaves (`identity.txt` con permisos `0o600` y `recipient.txt`) o deriva la llave pública desde `AGE_SECRET_KEY`. Al cifrar (`age --recipient <pub> --output <file>.age`), el secreto en texto plano se escribe **exclusivamente vía `stdin`** al proceso `age`, nunca en argumentos de línea de comandos ni en disco sin cifrar.
- **Flujo asíncrono no bloqueante (`Long-Poll`):**
  1. Agente llama `secrets_request(label)` → servidor genera un token efímero de `5 min` (almacenando únicamente su hash SHA-256 en memoria/mapa de pendientes) y emite `secret_request_created` por WebSocket.
  2. Para no bloquear la ejecución sincrónica ni usar *polling* con `sleep` o bucles activos, el agente lanza una única llamada `bash` con `async: true` hacia `GET /internal/secrets/poll/<token>?wait=true` (timeout máx. `300s`), donde el servidor mantiene un conjunto de *waiters* reactivos hasta que el usuario envía el secreto o vence el TTL.
  3. Al enviarse (`POST /api/secrets/submit/:token`), el servidor cifra en `/app/secrets/secrets/<name>/v<version>.age`, inserta la fila de auditoría (sin valor secreto) en `secrets_registry` (PostgreSQL), despierta al *waiter* y devuelve el *handle* opaco `secret:<name>@v<version>`.
- **Semántica de rotación:** cada actualización crea `@v2`, `@v3`, etc., manteniendo legibles las versiones previas para contenedores hermanos en ejecución hasta que se reinicien.

---

## 7. Capa de Conocimiento y *Grounding*: Espejo RAG Híbrido (`@pims/rag-mirror`)

El sistema resuelve el problema clásico de alucinación y obsolescencia en RAG mediante el contrato **Mirror-is-Cache-Not-Truth** implementado en `packages/rag-mirror/`.

### 7.1 Sincronización Continua y Manifiestos Inmutables
- El demonio de sincronización (`scripts/sync-pims-truth.ts`, ejecutado vía `bun scripts/pims.ts mirror sync --loop --interval 300`) consulta todos los documentos del PIMS, descarga sus binarios PDF, normaliza el texto y mantiene en `CORPUS_MIRROR_DIR/<doc.code>/` tanto el binario (`v<n>.pdf`), el texto plano normalizado (`v<n>.txt`) como `manifest.json` (con cadena `supersedes`, `sha256` del archivo completo y `chunk_sha256s`).
- En PIMS, las versiones son **inmutables (append-only)**: una nueva subida nunca sobrescribe la versión anterior; la versión previa pasa a estado `"O"` (*Obsoleto*) y sigue disponible para auditoría retrospectiva ("máquina del tiempo").

### 7.2 Extracción Agnóstica de Texto y OCR Determinista (`pdf.ts`)
Nunca se asume que los PDFs del PIMS fueron generados con Typst ni se leen bytes `%PDF-` crudos:
1. **Extracción primaria:** ejecuta `pdftotext -layout -nopgbrk - -` vía `stdin`/`stdout` para preservar columnas y tablas sin saltos de página artificiales.
2. **Rama OCR determinista:** si la capa de texto extraída resulta vacía (PDF escaneado), ejecuta automáticamente el *pipeline* `pdfinfo` (conteo de páginas) → `pdftoppm -png` (rasterización ordenada numéricamente) → `tesseract <page.png> stdout -l spa+eng` y normaliza espacios/saltos.

### 7.3 *Chunking* Consciente de Líneas, Embeddings e Índice HNSW
- **Chunker (`chunker.ts`):** divide el texto normalizado respetando límites de línea con:
  - Tamaño objetivo: `DEFAULT_CHUNK_SIZE = 1200` caracteres.
  - Solapamiento: `DEFAULT_CHUNK_OVERLAP = 2` líneas entre *chunks* consecutivos.
  - Fusión de cola: si el último fragmento tiene menos de `MIN_TRAILING_CHUNK_CHARS = 120` caracteres, se fusiona determinísticamente con el *chunk* anterior.
  - Cada *chunk* registra `chunk_id`, rango exacto `L<inicio>-L<fin>` y su `sha256`.
- **Embedder (`embedder.ts`):** cliente compatible OpenAI (`EMBEDDINGS_BASE_URL`, por defecto `https://api.mistral.ai/v1`, modelo `mistral-embed`), procesando lotes de `32` textos y validando estrictamente **1024 dimensiones** por vector (con un `createMockEmbedder` determinista para *smoke tests* sin red).
- **Esquema `pgvector` (`schema.sql`) y Consulta (`query.ts`):**
  - Índice **HNSW** (`CREATE INDEX idx_chunks_embedding_cosine ON chunks USING hnsw (embedding vector_cosine_ops)`) consultado mediante operador de distancia coseno (`embedding <=> $1`).
  - Por defecto filtra `status <> 'O'` para evitar citar documentos obsoletos salvo que se consulte explícitamente una versión histórica o `--include-obsolete`.
  - **Cita canónica:** cada resultado retorna el texto literal acompañado de `pims:<doc.code>:v<version>:<chunk_id>:<lines>` (ej. `pims:G4-SOA-01:v4.00:5:L114-L133`).
- **Re-vectorización sin re-descarga:** `revectorize()` permite recalcular *chunks* y *embeddings* directamente desde `CORPUS_MIRROR_DIR` si cambian los hiperparámetros o el modelo de *embedding*.

### 7.4 Motor de Diffing Estructural (`diff.ts`) y Protocolo de Fallo de Lectura
- **Comparación de versiones:** `compareVersions()` carga ambas versiones (desde el espejo local o vía *fetcher* PIMS), lanza un error tipado `MissingVersionError` si alguna no existe, y ejecuta:
  1. Diff estructural a nivel de *chunks* (`added`, `removed`, `modified`, `unchanged`) usando los hashes SHA-256 y contenido.
  2. Diff línea por línea con el algoritmo de **Myers** (`diffLines` de la librería `diff`) preservando números de línea exactos y contexto.
- **Read-Failure Protocol:** si la API de GESTITEL falla (timeout, 5xx, error de red), el sistema reporta explícitamente el *endpoint* y código HTTP fallido, responde desde el espejo `pgvector` y antepone la etiqueta obligatoria:
  `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.

---

## 8. Integración Empresarial con PIMS GESTITEL (`@pims/pims-adapter` y `scripts/pims.ts`)

El acceso al sistema fuente GESTITEL (`https://unsa.27k.pe`, esquema multi-tenant `unsa`) se consolidó en un SDK tipado en TypeScript (`packages/pims-adapter/`) y un CLI ergonómico (`scripts/pims.ts`) con **21 subcomandos** diseñados específicamente para consumo eficiente por el agente.

### 8.1 Arquitectura del SDK (`packages/pims-adapter/`)
- **Autenticación JWT (`auth.ts`):** obtiene y rota tokens (`/business/login/`, `/business/token/refresh/`) resolviendo credenciales desde entorno o *handles* de secretos, inyectando `Authorization: Bearer <access>` y `X-PIMS-Schema: unsa`, sin imprimir nunca credenciales en errores o salidas.
- **Normalización de Envelopes (`normalize.ts`):** unifica respuestas paginadas de Django REST Framework (`{ count, next, previous, results }`) y arreglos JSON planos (como `/versions/`, `/history/`, `/attachments/`).
- **Manejo tipado de RBAC esperado:**
  - `GET /api/trainings/` y `GET /api/system-catalogs/` retornan `HTTP 403` para la cuenta `grupob4`; el SDK lanza `PimsTrainingsForbiddenError`, instruyendo que las evidencias de capacitación residen como documentos PDF (`G4-REG-CAP-*`).
  - `POST /api/documents/{id}/approve/` retorna `HTTP 403` por política RBAC (`"aprobar": false`), lanzando `PimsApprovalForbiddenError` para escalar la aprobación formal a la UI de GESTITEL.

### 8.2 Guardrails de Aislamiento *Multi-Tenant* (`guards.ts`)
Dado que todos los grupos comparten el esquema `unsa` en GESTITEL, el SDK implementa un patrón asimétrico **Uniform-Read / Isolated-Write**:
- **Lecturas uniformes:** `docs`, `incidents`, `audits`, `risks`, `assets`, `dashboard` y `annex-a` leen todo el universo del PIMS sin filtrar por grupo (crucial para auditorías cruzadas e incidentes `INC-001`..`INC-012`).
- **Escrituras aisladas por prefijo (`G4-`):** `assertG4WriteCode()` y `assertG4IncidentOwnership()` validan en el cliente (antes de cualquier petición HTTP) que todo código o título mutado comience con `G4-`, abortando inmediatamente con `TenantGuardViolationError` en caso contrario. Asimismo, los *uploads* exigen un `--file-name` `.pdf` explícito (prohibido el fallback a nombres genéricos).

### 8.3 CLI Agéntico (`scripts/pims.ts`)
- Soporta `--compact` (tablas densas optimizadas para ahorrar tokens de ventana de contexto), `--json` (salida estructurada para procesamiento programático), `--dry-run` (comportamiento por defecto en mutaciones, código de salida `2`) y `--confirm`.
- **Deduplicación de auditorías (`--dedupe`):** ante hallazgos duplicados/clonados en datos reales de GESTITEL (ej. `AUD-2026-003`), agrupa determinísticamente por clave compuesta `(classification, description, action_plan, responsible)` reportando conteos separados de *Findings* y *Actions*.
- **Consistencia estricta de semáforo:** la clasificación `🟢 VERDE` exige conjuntamente `status === "C"`, `progress === 100`, `closed_at !== null`, evidencia verificable y cero CAPAs vinculadas abiertas.

---

## 9. Motor de Síntesis Documental Determinista (`molds/`) y Flujo *Copy-Then-Fill*

Para evitar que el LLM genere documentos PDF mal formateados o alucine cláusulas normativas, el sistema separa **prosa estructural** de **datos de instancia** mediante plantillas compiladas determinísticamente.

### 9.1 Plantillas Parametrizadas Typst 0.15 y Contrato de 15 Elementos
- Todos los moldes en `molds/<categoría>/mold*.typ` importan `molds/common/template.typ` y exponen funciones puras sin estado (`#let mold(...)`) sin datos institucionales *hardcodeados*.
- **Anatomía obligatoria de 15 elementos:** código `G4-`, versión semántica `X.Y`, fecha ISO, encabezado de confidencialidad y pie de página en 3 columnas `(1fr, 150pt, 100pt)` con `#context counter(page).display("1 de 1", both: true)` desde página 2, tipografía universal **Carlito 11pt** (prohibido cualquier tamaño `< 11pt`), interlineado `1.5x` (`leading: 0.7626em`), tabla de control documental en portada (con fila condicional `Revisado por`), historial de revisiones e índice (`outline`) en página 2, tablas anchas rotadas automáticamente con `#page(flipped: true)`, prohibición de *callouts*/*pills*, sección de documentos de referencia, sección de validez/propietario y bloque de firma institucional.
- **Molde Universal Cross-Team (`molds/generic/mold.typ`):** permite digerir cualquier PDF arbitrario (Word, Google Docs, LaTeX o de otros equipos `G1-`/`G2-`/`G3-`) extraído por `pdftotext`/OCR y reconstruirlo bajo la anatomía oficial de UNSA como un documento `G4-` trazable (`"Basado en <source> v<n>"`).

### 9.2 Flujo *Copy-Then-Fill* y Compuertas Human-in-the-Loop (HITL)
1. **Alineación numérica:** consulta `docs versions` en PIMS y alinea la versión del PDF al siguiente entero PIMS (`"3.00"` → PDF `"4.0"` → PIMS `"4.00"`).
2. **Staging aislado:** copia `molds/common/` y el molde elegido hacia `/tmp/pims-staging/<code>-v<n>/` (nunca se edita `molds/` en su lugar).
3. **Compilación y auditoría automatizada:** redacta un invocador mínimo (~30 líneas), escapa `@` como `\@` dentro de bloques `[...]`, puebla `reviewer` desde `university-facts/organigrama.md`, compila con `typst compile --root /tmp/pims-staging` y audita el texto resultante con `pdftotext` verificando **cero** marcadores sin resolver (`TODO`, `[POR ...]`) y **cero** fugas de términos internos (`Typst`, `Bun`, `RAFA`, `molds/`).
4. **Doble compuerta humana:**
   - **Compuerta 1:** compilar y publicar vista previa vía `bun scripts/pims.ts publish` (generando tarjeta interactiva en el chat).
   - **Compuerta 2:** detener la ejecución por completo hasta recibir confirmación nominal explícita del operador (ej. `"confirmo subida de G4-XXX v4.00"`). Un simple `"procede"` nunca autoriza escritura en PIMS.

### 9.3 Generadores Tabulares OOXML Nativos (`generate*.ts`)
Los registros de incidentes (`molds/incident-register/generate.ts`) y matrices de riesgo (`molds/incident-risks/generate-assessment.ts`, `generate-treatment.ts`) generan archivos **`.xlsx` OOXML nativos** directamente desde Bun utilizando únicamente `node:zlib` (compresión DEFLATE y empaquetado ZIP manual de `xl/workbook.xml`, `xl/worksheets/sheet1.xml`, `xl/styles.xml`, `[Content_Types].xml`), alineados a los 18 campos de la **Guía B.3.12** de ISO/IEC 27701:2025, sin dependencias externas pesadas.

---

## 10. Conectores Dinámicos, *Self-Healing*, Contenedores Hermanos y MCP

### 10.1 Contrato de Conectores (`connectors/`)
Cada integración externa vive en `connectors/<nombre>/` bajo un contrato mínimo de dos archivos:
- `client.ts`: cliente tipado con `fetch()` real, `AbortController` para timeouts y cero *stubs*.
- `SKILL-FRAG.md`: tabla de *endpoints*, requisitos de autenticación, límites y modos de fallo.

Las credenciales externas nunca se pasan al cliente como texto plano en el código del agente; `SecretsStore` (`connectors/runtime/secrets.ts`) descifra `secret:<name>@v<version>` en memoria dentro de clausuras acotadas (`executeWithSecret()`, `resolveAuthHeader()`) o genera banderas `--env` para contenedores (`resolveToDockerEnv()`).

### 10.2 Conector de Correo SMTP (`connectors/mail/client.ts`)
Implementa envíos reales por Gmail SMTP (`Nodemailer`, puerto `587`) con máquina de estados de doble fase para citatorios de auditoría/incidentes:
- **Fase A (`mail draft`):** persiste el borrador en `/home/agent/.pims-mail-drafts.json` (volumen `agent_data`) y muestra al usuario el **asunto y cuerpo literales**.
- **Fase B (`mail dispatch`):** valida `SUMMONS_DISPATCH_CONFIRMATION_PHRASE === "envíalo"`; cualquier otra respuesta arroja `SummonsApprovalRequiredError` manteniendo el registro en estado `"draft"`.

### 10.3 Bucle de *Self-Healing* No Bloqueante
Cuando un conector externo falla en vivo (cambio de ruta, deriva de esquema o error de autenticación):
1. El agente reporta el *endpoint* y código exacto al usuario.
2. En sesiones interactivas, despacha un **subagente en segundo plano (`task`)** que ejecuta sondas de solo lectura (`GET`/`HEAD`), diagnostica la deriva, parcha `connectors/<name>/client.ts` y `SKILL-FRAG.md`, verifica la sonda de salud y vuelve a ejecutar `registerConnector()`.
3. Mientras el subagente repara el conector, **la sesión principal nunca se bloquea** y continúa respondiendo consultas desde el espejo `pgvector`. Una vez reparado, registra la lección en la memoria procedimental local.

### 10.4 Orquestación Autónoma de Contenedores Hermanos (`live-build`)
El contenedor `pimsai-agent` accede al *daemon* Docker del host a través de `DOCKER_HOST=tcp://docker-proxy:2375`. Ante la solicitud de desplegar o conectar un servicio nuevo (ej. Evolution API/WhatsApp, Jira, webhook receiver, portal interactivo), aplica **7 principios deterministas**:
1. **Inspección *Preflight* de Imagen:** ejecuta `docker image inspect` o `docker run --rm --entrypoint sh <img > -c 'env'` antes de lanzar; nunca adivina esquemas de variables.
2. **Base de Datos Compañera Aislada:** crea red `<slug>-net` y volumen `<slug>-db-data` con contenedor `pimsai-<slug>-db`; **prohibido** compartir `pimsai-db`.
3. **Exposición Nativa en Traefik `:444`:** conecta a `internal-proxy` con etiquetas Traefik TLS (`Host(\`<slug>.pimsai.mistercricro8.top\`)`, nunca el slug reservado `demo`). Si el software posee UI nativa de administración/emparejamiento, la publica directamente en `:444` (solo construye un puente HTTP en Bun si carece de UI nativa).
4. **Regla *Copy-Never-Bind*:** prohibido `-v /app/...` hacia contenedores hermanos (la ruta interna `/app` del agente no existe en el host); usa exclusivamente volúmenes nombrados o `docker create` + `docker cp` + `docker start`.
5. **Diagnóstico *Fail-Fast* (5–10s):** verifica `State.Status`, `RestartCount`, `docker logs --tail 30`, `healthCheck()` interno y `curl` público en `:444` antes de anunciar la URL.
6. **Modelo Dual de Credenciales:** llaves aleatorias generadas (`openssl rand -hex`) por `--env` para servicios auto-alojados propios; `secrets_request` + `async: true` `?wait=true` para tokens SaaS propiedad del usuario.
7. **Modo de Ejecución:** subagente en segundo plano en sesiones interactivas; ejecución *inline* en modo print (`-p`).

### 10.5 Integración de Navegador via MCP (`.mcp.json`)
Para verificación visual E2E de entregables o flujos web complejos, `.mcp.json` expone `@playwright/mcp` sobre transporte `stdio` ejecutando `/usr/bin/chromium` en modo `--headless --no-sandbox` con salida aislada en `/tmp/playwright-mcp`.

---

## 11. Aterrizaje Normativo e Inteligencia Basada en Hechos

- **ISO/IEC 27701:2025 (2ª edición, PIMS independiente):** el texto limpio y catálogo de controles se despliega en runtime (`reference/iso-27701-2025.md`) para alimentar la *skill* `doc-necessity` (evaluación de brechas en 3 niveles: obligatorio Cl. 4–10, controles Anexo A aplicables a *PII Controller* Tablas A.1 y A.3, y exclusión justificada de Tabla A.2 en `G4-SOA-01`).
- **Frontera explícita con GDPR:** el texto en `docs/GDPR.txt` corresponde únicamente al mapeo informativo del Anexo D. Reglas como el reloj de 72 horas del Art. 33 **nunca** gobiernan cronjobs, alertas ni lógica autónoma del agente; los plazos los determina la organización bajo Cláusula 8.1 y Guía B.3.12.
- **Hechos Institucionales Versionados (`university-facts/`):** `facts.json`, `filiales.md`, `organigrama.md`, `rof-extracts.md` y `timeline.md` actúan como base factual fechada y referenciada para el motor de mutación en cascada (`cascade`), evitando que el agente invente autoridades, sedes (ej. *Filial Camaná*, *Filial El Pedregal - Majes*) o fechas históricas (`v1 2019` → `v2 2022` → `v3 2025`).
- **Gobernanza de IA (ISO/IEC 42001:2023) e ISO 19011:2026:** materializada técnicamente en la trazabilidad completa de pasos de razonamiento y herramientas, separación de memoria, compuertas HITL obligatorias, presupuesto acotado (`softRequestBudget`) y auditoría libre de credenciales en transcripts.

---

## 12. Matriz Consolidada del Stack Tecnológico

| Capa | Tecnologías y Versiones | Rol en el Sistema |
| :--- | :--- | :--- |
| **Harness Agéntico Base** | `pi` (modo `--mode rpc-ui`, *extension hooks*, *Agent Skills*, MCP) | Motor mínimo de bucle agéntico, abstracción de proveedores LLM y primitivas base |
| **Runtime & Lenguaje** | `Bun 1.2.4`, `TypeScript` (ESM, *zero build step* en backend), `Node.js 22.14.0` | Ejecución unificada de servidor web, SDK PIMS, CLI, conectores y generadores |
| **Backend Web & RPC** | `Hono 4.13`, `@hono/bun`, WebSockets nativos, NDJSON v2 (`rpc_chunk`) | API REST, autenticación RBAC HMAC-SHA256, *streaming* WS, puente hacia `pi` |
| **Frontend SPA** | `React 19.1`, `Vite 6.3`, `Tailwind CSS v4`, `Zustand 5`, `Radix UI`, `Streamdown 2.8`, `Shiki 4.6` | Consola operativa en tiempo real, trazas cognitivas, tarjetas HITL y visor de citas |
| **Base Vectorial & RAG** | `PostgreSQL 16`, `pgvector` (índice `HNSW`, `vector_cosine_ops`), `mistral-embed` (`1024` dims) | Memoria semántica indexada de documentos PIMS con citas `pims:` y distancia coseno |
| **Procesamiento PDF/OCR & Diff** | `Poppler` (`pdftotext`, `pdfinfo`, `pdftoppm`), `Tesseract OCR` (`spa+eng`), `MuPDF`, `diff` (Myers) | Extracción agnóstica de PDFs digitales/escaneados y diffing estructural por versión |
| **Síntesis Documental** | `Typst 0.15.0`, `node:zlib` (OOXML `.xlsx` nativo), fuentes `Carlito` | Generación determinista de PDFs normativos y hojas de cálculo B.3.12 |
| **Seguridad & Cifrado** | `age` / `age-keygen`, `crypto.timingSafeEqual`, `HMAC-SHA256`, `SHA-256`, DLP hooks | Bóveda asimétrica de secretos, redacción en 3 capas y cookies firmadas |
| **Integración & Mensajería** | `Nodemailer 7` (Gmail SMTP), `@playwright/mcp` + `Chromium` | Despacho SMTP con compuerta `"envíalo"` y automatización de navegador headless |
| **Infraestructura & Red** | `Docker` + `docker-proxy:2375`, `Traefik` (`internal-proxy`, `:444`), `Cloudflare` (`443→444`) | Contenerización sin privilegios, despliegue *staging-copy* y spawn de contenedores hermanos |
