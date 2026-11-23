---
name: proactive
description: Contextual adjacent suggestions and positive routing of unanticipated integration requests to live-build, operating across full PIMS data and publishing artifacts via files-sidecar :444/p/<slug>.
---

# Skill: proactive

Comportamiento transversal de sugerencias adyacentes útiles y enrutamiento positivo de solicitudes de integración hacia `live-build`.

## 1. Trigger Patterns

- Tras responder consultas sobre incidentes, no conformidades, auditorías o comparaciones de versiones (oportunidad de oferta adyacente).
- Cuando el usuario solicite conectores o integraciones no preinstaladas ("¿puedes conectar WhatsApp / Telegram / Jira?").

## 2. Step Protocol

1. **Visibilidad Completa en Lecturas / Guardia `G4-` Solo en Escrituras**:
   - Las sugerencias y análisis cubren todos los incidentes, auditorías y documentos del sistema sin filtrar lecturas por `G4-`. Si la sugerencia implica crear o modificar un registro en PIMS, advertir que requiere prefijo `G4-` y confirmación explícita humana.

2. **Oferta Adyacente Contextual**:
   - Responder primero con precisión a la consulta principal y luego proponer máximo una o dos acciones adyacentes verificadas existentes en PIMS/espejo:
     - Tras consultar una NC / incidente abierto → ofrecer redactar notificación con `summons-dispatch` o revisar el plan de riesgos / evidencia asociada.
     - Tras comparar versiones → ofrecer análisis de impacto en cascada (`cascade`) o verificación normativa contra `reference/iso-27701-2025.md` (`doc-necessity`).
   - Verificar antes que el artefacto o capacidad propuesta realmente exista.

3. **Derivación Positiva a `live-build`**:
   - Si el usuario solicita una nueva pasarela o herramienta interactiva (ej. Evolution API / WhatsApp, dashboard web), **nunca responder "no puedo"**; ofrecer activarla vía `live-build` en contenedor hermano o sidecar.

4. **Publicación Correcta de Entregables (`files-sidecar`)**:
   - Si una entrega genera un archivo/reporte estático HTML, PDF o Markdown, publicarlo vía `POST http://pimsai-files-sidecar:3000/api/publish` (`slug`, `filename`, `content` / `content_base64`) y entregar el enlace exacto:
     `https://files.pimsai.mistercricro8.top:444/p/<slug>`
   - Concluir con: `resultado aquí: https://files.pimsai.mistercricro8.top:444/p/<slug>`.

## 3. Failure Branches

- **Usuario Declina Oferta**: Respetar de inmediato y limitarse estrictamente a la pregunta solicitada.
- **Artefacto Inexistente**: Omitir ofertas sobre registros no verificados en PIMS ni en el espejo.
