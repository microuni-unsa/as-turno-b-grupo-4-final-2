# files-sidecar: Servicio Sidecar de Subida para UNSA PIMS

El servicio `files-sidecar` es un componente de subida de archivos seguro, efímero y desacoplado, diseñado para integrarse con la arquitectura de agentes inteligentes de **UNSA PIMS (Agentic Incidents-PIMS)**. Expone una interfaz web protegida para que el instructor o evaluador suba archivos directamente a la infraestructura sin exponer credenciales ni depender de canales no confiables.

El servicio corre bajo el dominio de Traefik:
`https://files.pimsai.mistercricro8.top`

---

## 1. Diagrama de Flujo en Prosa

El ciclo de vida completo de una subida se ejecuta a través de los siguientes pasos coordinados entre el Agente, el Instructor y el Sidecar:

1. **Solicitud e Inicio del Flujo**:
   - El instructor pregunta al agente en el chat de Zellij: *"¿cómo te subo un archivo?"*.
   - El agente invoca internamente el endpoint de acuñado `POST https://files.pimsai.mistercricro8.top/api/mint` especificando el propósito o flujo (`upload-and-read`, `directed-version` o `cascade-evidence`).
   - El sidecar genera un token criptográfico único de un solo uso (ejemplo `tok_a1b2...`), calcula una vigencia estricta de **5 minutos** (`DEFAULT_TOKEN_EXPIRY_MS = 5 * 60 * 1000`) y registra la sesión en estado `minted`.
   - El agente recibe la URL pública de subida (`https://files.pimsai.mistercricro8.top/upload/<token>`) y anuncia al instructor:
     > *"Sube tu archivo a través del siguiente enlace web seguro: https://files.pimsai.mistercricro8.top/upload/<token> (Enlace de un solo uso, expira en 5 minutos)."*

2. **Acceso a la Interfaz Web**:
   - El instructor abre la URL en su navegador.
   - El sidecar valida el token: si está expirado o ya fue utilizado, responde inmediatamente con error `410 Gone` o `409 Conflict`.
   - Si es válido, sirve una interfaz web moderna, responsiva y en modo oscuro, con:
     - Un cronómetro descendente sincronizado con el límite de 5 minutos.
     - Zona interactiva de arrastrar y soltar (drag & drop) y selector de archivos.
     - Indicador del flujo actual y especificación clara de formatos permitidos (`PDF`, `DOC`, `DOCX`, `TXT`, `XLSX`, `PNG`) y límite de ~10 MB.

3. **Subida y Recepción del Archivo**:
   - El instructor selecciona el archivo y pulsa *"Subir Archivo a PIMS"*.
   - El navegador envía una petición `POST https://files.pimsai.mistercricro8.top/upload/<token>` con `multipart/form-data`.
   - El sidecar realiza una comprobación atómica:
     - Si la subida llega después del vencimiento del token (o después de un timeout del agente), el sidecar rechaza la subida inmediatamente con `TOKEN_EXPIRED` (código 410) para evitar ingestas incompletas o tardías (cero half-ingest silencioso).
     - Si el tamaño excede los 10 MB, se interrumpe y falla en la etapa `upload`.
     - Si es válido, la sesión transiciona a `uploading` y el archivo en bruto se guarda de inmediato en el disco de preservación (`data/preserved_uploads/<token>_<nombre>`), garantizando su aislamiento para reintentos.

4. **Etapa de Parseo (`parse`)**:
   - El motor de parseo analiza los bytes mágicos y la estructura interna según la extensión:
     - `.txt`: Valida codificación UTF-8 y calcula métricas de líneas y caracteres.
     - `.pdf`: Comprueba cabecera `%PDF-` y estima número de páginas.
     - `.doc`: Valida cabecera binaria OLE CFBF (`\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1`).
     - `.docx`: Comprueba contenedor OOXML/ZIP y existencia de `word/document.xml`.
     - `.xlsx`: Comprueba contenedor OOXML/ZIP y estructura de `xl/workbook.xml`.
     - `.png`: Valida cabecera PNG de 8 bytes y bloque de dimensiones IHDR.
   - **Manejo de fallo de parseo**: Si el archivo está corrupto o no coincide con su tipo, la sesión pasa a `failed` con `stage: "parse"`, registrando el motivo exacto y manteniendo el archivo preservado en disco.

5. **Etapa de Subida a PIMS (`pims_upload`)**:
   - Una vez parseado exitosamente, el sidecar invoca la interfaz `PimsAdapterDocumentsInterface`:
     - En flujo estándar (`upload-and-read` o `cascade-evidence`): llama a `createDocument(...)` en el endpoint `/api/documents/` de GESTITEL con código `G4-DOC-...`, categoría y estado `B` (borrador) o `V` (vigente).
     - En flujo dirigido (`directed-version`): llama a `createVersion(...)` en `/api/documents/{id}/versions/` adjuntando el `change_summary`.
   - **Manejo de fallo en PIMS**: Si la API de GESTITEL rechaza la petición o falla la red, la sesión pasa a `failed` con `stage: "pims_upload"`, conservando la ruta del archivo preservado para reintento manual o automático.

6. **Sondeo del Agente (Polling) y Confirmación (Ack)**:
   - Simultáneamente, el agente consulta periódicamente `GET https://files.pimsai.mistercricro8.top/poll/<token>`.
   - Al completarse el proceso, el sondeo devuelve el acuse de recibo tipado:
     ```json
     {
       "status": "completed",
       "pims_doc_id": "G4-DOC-K8F2B",
       "version": "1.0",
       "placement": "unsa/documents/G4-DOC-K8F2B",
       "file_name": "politica_sgsi.pdf",
       "size_bytes": 145820,
       "sha256": "3a5b6c...",
       "flow": "upload-and-read"
     }
     ```
   - El agente lee el acuse, agradece al instructor y activa la herramienta de ingesta vectorial (`ingest`) para RAG sobre el nuevo documento.

---

## 2. Semántica de Sondeo y Tiempos de Expiración

- **Constantes Nombradas**:
  - `DEFAULT_TOKEN_EXPIRY_MS`: `300000` (5 minutos / 300 segundos).
  - `DEFAULT_POLL_TIMEOUT_MS`: `300000` (5 minutos / 300 segundos).
- **Ciclo de Vida de Token (Single-Use, Sin Listado)**:
  - Cada token nace en estado `minted` y tiene un tiempo de expiración fijado en su creación (`expiresAt = createdAt + 5 min`).
  - No existe ningún endpoint de listado (`GET /tokens`, `GET /files`, etc. retornan 404/403). La única vía de acceso es conociendo el token secreto.
  - El token es estrictamente de un solo uso: una vez que el archivo es recibido, no puede ser reutilizado para otra carga.
- **Sondeo Expirado con Formato Tipado**:
  - Si transcurren los 5 minutos sin que se haya completado la subida, cualquier sondeo del agente retorna un error tipado indicando el tiempo transcurrido versus el límite permitido:
    ```json
    {
      "status": "timeout",
      "error": "POLL_TIMEOUT",
      "stage": "poll",
      "message": "El token de subida ha expirado tras 302s (límite: 300s).",
      "elapsed_seconds": 302,
      "limit_seconds": 300,
      "elapsed_ms": 302140,
      "limit_ms": 300000
    }
    ```
- **Condición de Carrera (Timeout vs Llegada Tardía)**:
  - Si un usuario envía un archivo cuando el token ya expiró o el agente ya reportó timeout, la petición de subida es abortada inmediatamente con código `410 Gone` (`TOKEN_EXPIRED`). Nunca se procesa ni se guarda a medias (zero silent half-ingest).

---

## 3. Formatos Soportados y Capacidad

| Formato | Extensión | MIME Type | Mecanismo de Validación |
|---|---|---|---|
| PDF | `.pdf` | `application/pdf` | Cabecera `%PDF-` y conteo de páginas `/Type /Page` |
| Microsoft Word | `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Contenedor ZIP y existencia de `word/document.xml` |
| Microsoft Word Legacy | `.doc` | `application/msword` | Estructura binaria OLE Compound File (`\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1`) |
| Excel | `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Contenedor ZIP y existencia de `xl/workbook.xml` |
| Texto Plano | `.txt` | `text/plain` | Validación de codificación UTF-8 e integridad de líneas |
| Imagen PNG | `.png` | `image/png` | Cabecera estándar de 8 bytes y bloque de dimensiones IHDR |

**Límite de Tamaño**:
- Capacidad máxima de subida fijada en **~10 MB** (`MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024`).
- Peticiones que excedan el límite son rechazadas tempranamente con `HTTP 413 Payload Too Large`.

---

## 4. Reutilización del Mismo Camino para Re-Ingesta y Flujos

El sidecar unifica la entrada de archivos para múltiples flujos normativos del sistema UNSA PIMS:

1. **Flujo #3: `upload-and-read`**:
   - Subida libre de cualquier documento nuevo.
   - Crea un nuevo registro en PIMS bajo `G4-DOC-...`.
2. **Flujo #7: `directed-version`**:
   - Subida de un borrador o documento corregido para crear una versión superior de un documento existente.
   - Parámetros en el acuñado: `flow: "directed-version"`, `target_doc_id: 123`, `change_summary: "Actualización de alcance ISO 27701 filiales"`.
   - Llama a `createVersion` en PIMS e incrementa la versión (ej. 1.0 -> 2.0).
3. **Flujo #8: `cascade-evidence`**:
   - Subida de evidencias de cambios universitarios (resolución rectoral, nuevo organigrama, creación de filiales).
   - Ingesta etiquetada en PIMS como evidencia de soporte para el proceso de cascada.
4. **Endpoint de Reintento (`POST /api/retry/:token`)**:
   - Si una subida falló en la etapa `parse` o `pims_upload`, el archivo se mantiene a salvo en `data/preserved_uploads/`.
   - Se puede solicitar el reintento del procesamiento sin requerir que el instructor vuelva a cargar el archivo.

---

## 5. Etiquetas de Traefik para Despliegue en Docker

El contenedor se despliega en la red interna `internal-proxy` y expone las siguientes etiquetas de Traefik (utilizando exactamente el host `files.pimsai.mistercricro8.top`):

```yaml
services:
  files-sidecar:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: files-sidecar
    restart: unless-stopped
    networks:
      - internal-proxy
    environment:
      - PORT=3000
      - PIMS_BASE_URL=https://unsa.27k.pe
      - PIMS_TENANT_SCHEMA=unsa
      - PIMS_JWT_TOKEN=${PIMS_JWT_TOKEN}
      # O alternativamente credenciales de login:
      # - PIMS_USERNAME=${PIMS_USERNAME}
      # - PIMS_PASSWORD=${PIMS_PASSWORD}
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=internal-proxy"
      - "traefik.http.routers.pimsai-files.rule=Host(`files.pimsai.mistercricro8.top`)"
      - "traefik.http.routers.pimsai-files.entrypoints=https"
      - "traefik.http.routers.pimsai-files.tls=true"
      - "traefik.http.routers.pimsai-files.tls.certresolver=cloudflare"
      - "traefik.http.services.pimsai-files.loadbalancer.server.port=3000"

networks:
  internal-proxy:
    external: true
```

---

## 6. Política de Cero Secretos en Código

- Ninguna contraseña, token JWT o credencial institucional se encuentra hardcodeada en el código fuente.
- Todas las credenciales se leen directamente desde variables de entorno (`PIMS_JWT_TOKEN`, `PIMS_USERNAME`, `PIMS_PASSWORD`).
- Si faltan las credenciales al momento de comunicar con PIMS, el sistema falla de manera explícita y controlada en la etapa `pims_upload`, reportando el error sin exponer datos sensibles.
