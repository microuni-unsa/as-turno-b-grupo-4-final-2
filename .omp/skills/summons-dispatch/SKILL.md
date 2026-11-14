# Skill: summons-dispatch (SPEC 9.2)

Generación de borradores y despacho controlado de citaciones formales a responsables de acciones correctivas basadas en el estado semafórico (Rojo/Ámbar/Verde), con compuerta estricta de autorización humana ("envíalo").

## 1. Trigger Patterns

Se activa ante solicitudes para convocar o notificar a responsables según su cumplimiento operativo, o ante el comando explícito de confirmación de envío:
- "Prepara las citaciones para los responsables en rojo."
- "Convoca a reunión de 5 minutos a los que tienen acciones vencidas."
- "Manda invitación de seguimiento a las 10h para las acciones en ámbar."
- "Prepara la invitación al almuerzo de reconocimiento para los que cumplieron."
- "Cita a todos los responsables según el semáforo de incidentes."
- "envíalo" / "procede con el envío" (Comando de despacho definitivo).

## 2. Step Protocol

1. **Aislamiento Multi-Tenant (Filtro G4 Obligatorio)**:
   - Validar que los incidentes y responsables pertenezcan estrictamente al Grupo 4 (`G4-` prefix en códigos y pertenencia a catálogo G4):
     `pims_adapter.incidents.get_corrective_actions(code_prefix="G4-")`
   - Excluir cualquier responsable o registro ajeno al espacio del Grupo 4 en el esquema compartido `unsa`.

2. **Generación del Borrador de Citaciones (NUNCA auto-enviar)**:
   - Construir el borrador de citaciones adaptando el tono y agenda según la fila semafórica evaluada:
     - **Fila Roja (Crítico / Vencido)**: Asunto: `URGENTE: Convocatoria a reunión de 5 minutos - Desvío en [Código NC]`. Agenda: Explicación de desvío y apercibimiento formal por escrito.
     - **Fila Ámbar (Seguimiento / En curso)**: Asunto: `Seguimiento de Plan de Acción - Reunión 10:00 h [Código NC]`. Agenda: Evaluación de obstáculos, requerimientos presupuestales y proveedores antes de auditoría.
     - **Fila Verde (Conforme / Cerrado)**: Asunto: `Reconocimiento por Cumplimiento PIMS - Invitación a Almuerzo Institucional`. Agenda: Socialización de logro y agradecimiento.
   - Detallar en una tabla visible: Destinatario, Correo, Rol institucional, Clasificación, Asunto y Texto preliminar.

3. **Compuerta Estricta de Despacho (Human-in-the-Loop)**:
   - **Regla inquebrantable**: QUEDA ESTRICTAMENTE PROHIBIDO el envío automático de correos.
   - El sistema debe presentar el borrador completo y detenerse en espera de la orden explícita.
   - Únicamente si el usuario ingresa exactamente `"envíalo"` o una instrucción afirmativa inequívoca y directa de envío, se procede al paso 4.

4. **Despacho Mediante Conector de Correo**:
   - Una vez recibida la confirmación `"envíalo"`, invocar el runtime del conector:
     `connectors.mail.send(to="<email>", subject="<subject>", body="<body>", tracking_id="G4-SUMMONS-<timestamp>")`
   - Registrar el estado de despacho y la marca de tiempo de envío.

5. **Publicación del Registro de Despacho**:
   - Generar la bitácora de citaciones despachadas en HTML/PDF.
   - Desplegar el servicio temporal en contenedor Traefik bajo un slug único:
     `files_sidecar.publish(content=dispatch_log_html, slug="summons-<timestamp>")`
   - Servir en `https://summons-<timestamp>.pimsai.mistercricro8.top`.
   - Concluir la respuesta obligatoriamente con la convención: `"resultado aquí: link"`.

## 3. Failure Branches

- **Ausencia de Confirmación Explícita ("envíalo")**:
  - Si el usuario responde con comentarios generales (ej. "me parece bien", "¿cuántos son?"), no despachar.
  - Mantener el estado en borrador y recordar: `"Borrador conservado. Para ejecutar el envío formal por correo, debes escribir explícitamente 'envíalo'."`
- **Falla en el Conector de Correo (SMTP / Gateway Error)**:
  - Capturar y reportar el error técnico exacto: `"connectors.mail.send falló para destinatario <email>: 504 Gateway Timeout"`.
  - No reintentar en bucle ciego; marcar los correos pendientes y permitir reintento granular.
- **Correo o Responsable No Encontrado**:
  - Si el responsable asignado en PIMS carece de correo institucional en el directorio, reportar: `"El responsable <Nombre> (G4-NC-xxx) no posee correo registrado en el catálogo. Excluido del lote."`
- **Límite de Presupuesto Alcanzado (Loan Profile Degraded-at-Cap)**:
  - Si se alcanza el límite de `task.softRequestBudget` o la cuota en perfil loan:
    - La recuperación de datos permanece activa: lectura de estados semafóricos y visualización de plantillas de citación continúa funcionando.
    - La generación de nuevos textos y la ejecución del despacho por correo se pausan de inmediato.
    - Mensaje de contacto obligatorio:
      `"Límite de presupuesto de tokens alcanzado en perfil loan. La recuperación continúa activa, pero la generación y el despacho están pausados. Contacte al equipo Turno B Grupo 4 para ampliación de cuota."`

## 4. Response Shape

### Fase A: Presentación de Borrador (Esperando confirmación)
```markdown
### Borrador de Citaciones Formales (G4 - UNSA)
**Tenant**: GESTITEL `unsa` (Filtrado estricto Grupo 4)  
**Estado**: ⚠️ PENDIENTE DE AUTORIZACIÓN (No se ha enviado ningún correo)

| Destinatario | Rol / Área | Estado | Asunto | Convocatoria / Agenda |
|---|---|---|---|---|
| Carlos Mamani (`cmamani@unsa.edu.pe`) | Jefe Admisión | 🔴 Rojo | URGENTE: Convocatoria a reunión de 5 min (G4-NC-001) | Hoy 11:30 - Sala Vicerrectorado (Apercibimiento por escrito) |
| Lucía Flores (`lflores@unsa.edu.pe`) | Coord. Filiales | 🟡 Ámbar | Seguimiento Plan Acción: Reunión 10:00 h (G4-NC-002) | Mañana 10:00 - Revisión de recursos y presupuesto filiales |
| Jorge Ramos (`jramos@unsa.edu.pe`) | Capacitación | 🟢 Verde | Reconocimiento PIMS: Almuerzo Institucional | Viernes 13:00 - Club Universitario (Reconocimiento oficial) |

> ⚠️ **Compuerta de Despacho Activa**:
> Ningún correo ha sido enviado. Para proceder con el despacho a través del conector institucional, confirma escribiendo **`envíalo`**.
```

### Fase B: Post-Despacho (Tras recibir "envíalo")
```markdown
### Despacho de Citaciones Completado
Se ha ejecutado el envío de 3 comunicaciones mediante `connectors.mail.send`:
- ✅ `cmamani@unsa.edu.pe` [Tracking: G4-SUMMONS-20261113-01]
- ✅ `lflores@unsa.edu.pe` [Tracking: G4-SUMMONS-20261113-02]
- ✅ `jramos@unsa.edu.pe` [Tracking: G4-SUMMONS-20261113-03]

resultado aquí: https://summons-g4-dispatch-3f91.pimsai.mistercricro8.top
```
