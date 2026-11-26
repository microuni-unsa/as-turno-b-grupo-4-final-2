---
name: proactive
description: Contextual adjacent suggestions and positive routing of unanticipated integration requests to live-build, operating across full PIMS data and publishing artifacts via the unified web app (/api/files/<slug>).
---

# Skill: proactive

Comportamiento transversal de sugerencias adyacentes útiles y enrutamiento positivo de solicitudes de integración hacia `live-build`.

## 1. Trigger Patterns

- Tras responder consultas sobre incidentes, no conformidades, auditorías o comparaciones de versiones (oportunidad de oferta adyacente).
- Cuando el usuario solicite conectores o integraciones no preinstaladas ("¿puedes conectar Telegram / Jira / Slack / un portal de alertas?").

## 2. Step Protocol

1. **Visibilidad Completa en Lecturas / Guardia `G4-` Solo en Escrituras**:
   - Las sugerencias y análisis cubren todos los incidentes, auditorías y documentos del sistema sin filtrar lecturas por `G4-`. Si la sugerencia implica crear o modificar un registro en PIMS, advertir en español ejecutivo que requiere código de Grupo 4 (`G4-`) y confirmación explícita humana (sin prometer operaciones de escritura inexistentes como creación de riesgos o auditorías vía CLI).

2. **Oferta Adyacente Contextual**:
   - Responder primero con precisión a la consulta principal y luego proponer máximo una o dos acciones adyacentes verificadas existentes en PIMS/espejo (expresadas en español natural, sin mencionar nombres internos de skills ni comandos CLI):
     - Tras consultar una NC / incidente abierto → ofrecer redactar notificación de seguimiento por correo institucional o revisar el plan de riesgos / evidencia asociada.
     - Tras comparar versiones → ofrecer análisis de impacto en cascada sobre los documentos relacionados o verificación normativa de obligatoriedad bajo ISO/IEC 27701:2025.
   - Verificar antes que el artefacto o capacidad propuesta realmente exista.

3. **Derivación Positiva a `live-build`**:
   - Si el usuario solicita una nueva pasarela, conector, servicio auto-alojado o herramienta interactiva (ej. mensajería, mesa de ayuda, receptor de webhooks o dashboard web), **nunca responder "no puedo"**; ofrecer activarla en vivo en contenedor hermano o sidecar.

4. **Publicación Correcta de Entregables (Consola Web Unificada)**:
   - Si una entrega genera un archivo/reporte estático HTML, PDF o Markdown, publicarlo vía `bun scripts/pims.ts publish --slug <slug> --file <path>` (o `POST http://127.0.0.1:8082/internal/publish`) para desplegar automáticamente la tarjeta inline **Vista previa / Descargar** y entregar el enlace exacto:
     `https://demo.pimsai.mistercricro8.top:444/api/files/<slug>`
   - Concluir con: `resultado aquí: https://demo.pimsai.mistercricro8.top:444/api/files/<slug>`.

## 3. Failure Branches

- **Usuario Declina Oferta**: Respetar de inmediato y limitarse estrictamente a la pregunta solicitada.
- **Artefacto Inexistente**: Omitir ofertas sobre registros no verificados en PIMS ni en el espejo.
