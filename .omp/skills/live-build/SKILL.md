---
name: live-build
description: Build and deploy live connectors and sibling containers (e.g. Evolution API) in the background using internal-proxy + Traefik :444, distinguishing self-hosted keys from user-owned secrets-sidecar credentials.
---

# Skill: live-build

Construcción, despliegue en contenedor hermano y registro en caliente de conectores e integraciones externas en segundo plano (`connectors/_template/` + `docker-proxy:2375` + `internal-proxy` + Traefik `:444`), manteniendo la sesión principal 100% interactiva.

## 1. Trigger Patterns

- "Conecta el sistema con WhatsApp usando Evolution API."
- "Integra alertas de incidentes con `<servicio>` / crea un webhook en vivo."
- Solicitudes de integraciones nuevas o contenedores de soporte durante la sesión.

## 2. Step Protocol

1. **Reafirmación Inmediata y Ejecución No Bloqueante**:
   - Confirmar al usuario el objetivo y despachar un subagente en segundo plano mientras la sesión principal continúa atendiendo consultas del espejo PIMS.

2. **Modelo Correcto de Credenciales (Self-Hosted vs Externas)**:
   - **Servicios Auto-Alojados que Desplegamos Nosotros** (ej. **Evolution API** en `docker-proxy:2375` sobre red `internal-proxy`):
     - **NO** pedirle claves al usuario por `secrets-sidecar`.
     - Generar aleatoriamente una `AUTHENTICATION_API_KEY` segura al crear el contenedor hermano, inyectarla en sus variables de entorno (`-e AUTHENTICATION_API_KEY=...` junto con URL pública `:444`), crear la instancia vía HTTP y obtener el **código QR / pairing URL** para mostrárselo directamente al usuario (publicando imagen QR en `files-sidecar` `:444/p/<slug>` si aplica).
   - **Servicios Externos Propiedad del Usuario** (Slack workspace token, Jira cloud API token, webhook externo externo):
     - Solicitar la credencial mediante `POST http://pimsai-secrets-sidecar:3000/api/secrets/request`, iniciar el sondeo obligatorio con `async: true` sobre `/api/secrets/poll/<token>` **antes** de responder, y entregar `https://secrets.pimsai.mistercricro8.top:444/s/<token>`.

3. **Lectura Uniforme en Alertas y Watchers (Cero Filtro `G4-` en Lectura)**:
   - Los pollers o receptores de alertas que observan incidentes (`GET /api/incidents/`) o auditorías (`GET /api/audits/`) **NO deben filtrar ni descartar registros sin prefijo `G4-`**. La guardia `G4-` se aplica únicamente si se escriben registros hacia PIMS.

4. **Implementación Real del Conector y Despliegue en Contenedor Hermano**:
   - Partir de `connectors/_template/` creando `connectors/<name>/client.ts` (con llamadas `fetch()` reales, `AbortController`, cero stubs simulados) y `connectors/<name>/SKILL-FRAG.md`.
   - Para contenedores hermanos en `internal-proxy`: usar `docker create` + `docker cp` + `docker start` si requiere archivos de configuración (nunca bind-mount `-v /app/...`), sin usar slugs reservados (`demo`, `files`, `secrets`), con etiquetas Traefik completas y URL público con puerto `:444` obligatorio (`https://<slug>.pimsai.mistercricro8.top:444`).
   - Registrar el fragmento llamando a `registerConnector({ connectorDir: "connectors/<name>" })` (que añade frontmatter YAML en `.omp/skills/connectors/SKILL.md`).

5. **Sonda Real de Solo Lectura y Entrega**:
   - Ejecutar `healthCheck()` / sonda HTTP GET real (sin simular respuestas) y entregar URL/QR verificado al usuario cerrando con: `resultado aquí: https://<slug_or_files>.pimsai.mistercricro8.top:444...`.

## 3. Failure Branches

- **Timeout / Error de Red en Sonda**: Inspeccionar logs del contenedor hermano en `docker-proxy:2375` y reportar diagnóstico concreto sin bloquear consultas normales.
- **Error de Exposición Traefik**: Verificar que la red sea `internal-proxy` y el URL incluya `:444`.
