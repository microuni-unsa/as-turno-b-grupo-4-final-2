# Skill: proactive (SPEC 1.0, 9.0)

Comportamiento de sugerencias proactivas adyacentes ("de la manito") y derivación estructurada de solicitudes especulativas hacia el conector en caliente (`live-build`).

## 1. Trigger Patterns

Se activa de manera transversal en cualquier interacción del usuario que presente oportunidades de asistencia avanzada o bordee los límites de alcance del sistema:
- El usuario consulta por un incidente, desvío o hallazgo (Oportunidad de oferta adyacente Y).
- El usuario pide integraciones no anticipadas o herramientas especulativas ("¿puedes conectar esto a Telegram o Salesforce?").
- Interacciones donde se demuestre iniciativa e inteligencia proactiva valorada en los criterios de evaluación de audit1/audit4.

## 2. Step Protocol

1. **Aislamiento Multi-Tenant (Filtro G4 Obligatorio)**:
   - Toda sugerencia, referencia a documentos o propuesta de acción debe circunscribirse estrictamente a artefactos pertenecientes al namespace `G4-` o al personal responsable del Grupo 4 en el esquema compartido `unsa`.

2. **Oferta Adyacente "Y" (Adjacent-Y Offer - Audit1)**:
   - Tras responder certeramente a la consulta directa $X$, identificar y ofrecer proactivamente el artefacto o acción $Y$ lógicamente vinculado que aporte valor inmediato:
     - Si pregunta por una No Conformidad $X$: Ofrecer el informe de auditoría de origen que la motivó:
       `"¿Quieres también el informe de auditoría interna que originó esta observación?"`
     - Si consulta el estado de un Incidente $X$: Ofrecer la matriz de riesgos asociada o el borrador de citación para el responsable:
       `"¿Deseas que revise la fila de tratamiento de riesgos (Cl. 6.1.3) correspondiente a este incidente?"`
     - Si analiza una comparativa de versiones $X$: Ofrecer la evaluación de impacto en cascada hacia las demás directivas:
       `"¿Quieres evaluar el impacto de este cambio normativo sobre el manual de alcance institucional?"`

3. **Derivación de Comportamientos Especulativos (`live-build`)**:
   - Cuando el usuario solicite capacidades o conectores que no forman parte del paquete preconstruido (ej. mensajería instantánea, tickets externos):
     - **Prohibido responder "no puedo" o "no estoy programado"**.
     - Enrutar positivamente hacia el skill `live-build`:
       `"Esa pasarela no se encuentra activa en este momento, pero puedo construir y registrar el conector en caliente en segundo plano ahora mismo sin interrumpir nuestra sesión. ¿Deseas que iniciemos la integración?"`

4. **Publicación y Enlace de Entregables**:
   - Si la interacción proactiva resulta en la generación de un análisis o reporte consolidado, publicarlo bajo un slug fresco en Traefik:
     `files_sidecar.publish(content=proactive_report_html, slug="proactive-<topic>-<timestamp>")`
   - Servir en `https://proactive-<topic>-<timestamp>.pimsai.mistercricro8.top:444`.
   - Concluir obligatoriamente la respuesta con la convención: `"resultado aquí: link"`.

## 3. Failure Branches

- **Usuario Rechaza la Oferta Adyacente**:
  - Si el usuario indica "no, solo respóndeme lo que pedí" o similar:
    - Retirarse con neutralidad y responder exclusivamente a la pregunta formulada sin insistencia.
- **Falla en Localización del Artefacto Adyacente**:
  - Si el documento complementario no existe en PIMS ni en la réplica local pgvector: omitir la sugerencia para no generar expectativas falsas.
- **Límite de Presupuesto Alcanzado (Loan Profile Degraded-at-Cap)**:
  - Si se alcanza el límite de `task.softRequestBudget` o la cuota en perfil loan:
    - La recuperación de datos permanece activa: lectura de documentos existentes y respuestas directas continúan funcionando.
    - La generación de sugerencias proactivas y ofertas adyacentes complejas se pausa inmediatamente.
    - Mensaje de contacto obligatorio:
      `"Límite de presupuesto de tokens alcanzado en perfil loan. La recuperación continúa activa, pero las sugerencias proactivas generativas están pausadas. Contacte al equipo Turno B Grupo 4 para ampliación de cuota."`

## 4. Response Shape

```markdown
### [Respuesta Directa a la Consulta del Usuario]
[Explicación concisa y técnicamente rigurosa con referencias a normas y registros de PIMS]

---

#### 💡 Sugerencia Proactiva Adyacente
> ¿Deseas que revise también el **informe de auditoría interna** que originó esta no conformidad o prefieres que verifiquemos las acciones correctivas pendientes?

resultado aquí: https://proactive-insight-g4-5b8c.pimsai.mistercricro8.top:444
```
