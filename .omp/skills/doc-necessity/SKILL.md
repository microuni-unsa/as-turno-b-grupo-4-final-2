# Skill: doc-necessity

Evaluación dinámica y en tiempo real de la necesidad documental (Obligatorio vs Opcional) para registros del PIMS bajo el marco ISO/IEC 27701:2025 (rol PII-Controller en UNSA). Los veredictos se computan en vivo por cada consulta combinando la prueba normativa *shall* de ISO 27701 frente al estado actual del PIMS (contenido real en vivo), sin depender jamás de tablas fijas o mapeos estáticos *hardcoded* por documento.

## 1. Trigger Patterns

Se activa ante consultas que solicitan evaluar la necesidad, exigibilidad o justificación de inclusión de uno o varios documentos en el PIMS:
- "¿El documento G4-POL-001 es obligatorio u opcional?"
- "Evalúa la necesidad documental de las políticas y procedimientos en PIMS."
- "¿Por qué este documento es obligatorio según ISO 27701?"
- "¿Cuáles documentos de nuestro alcance son opcionales y cuáles son mandatorios?"
- "Verifica si el procedimiento de gestión de incidentes es exigido por la norma."

## 2. Step Protocol

1. **Aislamiento Multi-Tenant (Filtro G4 Obligatorio)**:
   - Toda lectura en el PIMS (`https://unsa.27k.pe`, tenant compartido `unsa`) debe aplicar estrictamente el filtro de prefijo de código `G4-` y responsable `Turno B Grupo 4` / `grupob4`:
     - Al listar documentos: `GET /api/documents/?code_prefix=G4-`
     - Al obtener detalle: validar que `code` inicie con `G4-` y `responsible` corresponda a `"Turno B Grupo 4"`.
   - Excluir silenciosamente cualquier registro o documento que pertenezca a otros grupos de trabajo para evitar fugas y contaminación cruzada entre tenants.

2. **Resolución del Estado Organizacional en Vivo (PIMS Org State)**:
   - Consultar el documento a través de los endpoints de lectura estandarizados de la skill `pims-reader` (`GET /api/documents/`, `GET /api/documents/{id}/` y `GET /api/documents/{id}/versions/`).
   - Extraer y registrar los atributos en vivo:
     - Código del registro (`code`, ej. `G4-POL-001`).
     - Identificador PIMS (`id`).
     - Estado del ciclo de vida (`status`): tanto `R` (Revisión) como `V` (Vigente) son aceptados por igual conforme a la política 2026-11-19 (los documentos activos y operativos en vivo residen habitualmente en estado `R`).
     - Versión actual (`current_version`): tratar siempre como una cadena opaca (opaque string, ej. `"1.0"`, `"2"`, `"v2.1"`).
     - O registrar formalmente la **ausencia** del registro en caso de no existir en PIMS.
   - **Regla estricta de códigos de categoría**: Tratar los códigos de categoría en PIMS (`PO`, `PR`, `IN`, `FO`, `RE` u otros) estrictamente como códigos opacos de catálogo; **NUNCA** inferir la necesidad o el veredicto documental a partir de la categoría.

3. **Prueba Normativa ISO 27701 (ISO Shall-Test)**:
   - Contrastar los requisitos documentales contra el mapa normativo oficial en `docs/ISO-27701-NORMATIVE-MAP.md`.
   - Localizar si existe un mandato expreso de información documentada (*"retain documented information"* / *"shall be available as documented information"*) aplicable al alcance de la UNSA como **PII-controller** (Responsable del Tratamiento de Datos Personales):
     - **En alcance**: Tablas A.1 (Controles para Responsables / PII Controllers) y A.3 (Controles de Seguridad de la Información para Ambos Roles), además de las cláusulas base 4 a 10 aplicables a PII-controllers.
     - **Fuera de alcance**: Tabla A.2 (Controles para Encargados / PII Processors — formalmente excluida con justificación técnica).

4. **Computación Dinámica del Veredicto (Live Verdict Computation)**:
   - Evaluar en vivo cada vez; **PROHIBIDO** predefinir o tener listas *hardcoded* de veredictos por documento:
     - **OBLIGATORIO (MANDATORY)**: Si un mandato normativo *shall* dentro del alcance de ISO 27701 (Cl. 4-10, Tabla A.1, Tabla A.3) lo exige de forma explícita. Se debe citar textualmente la cláusula o control correspondiente.
     - **OPCIONAL (OPTIONAL)**: Si no existe un mandato normativo expreso en ISO 27701 que obligue a mantenerlo como información documentada. La adopción se determina a partir del estado actual de la organización:
       - Si está presente y adoptado en el PIMS en vivo (con estado `R` o `V`), cuenta como adoptado institucionalmente por la organización.
       - Si está ausente en el PIMS en vivo, se clasifica como opcional no adoptado, salvo que el escenario planteado por el instructor demande explícitamente su incorporación.

5. **Evidencia y Ficha de Respuesta**:
   - Generar la tabla de veredicto con las columnas requeridas:
     `Documento | Veredicto | Base Normativa | Estado en PIMS`
   - Acompañar cada fila con la cita formal de la cláusula ISO 27701 y los datos del registro en PIMS (código, id, estado `R`/`V`, versión actual opaca) o la constancia explícita de su ausencia.

## 3. Failure Branches

- **PIMS No Disponible (Caída de Red / Falla de Conexión)**:
  - Si la API de PIMS GESTITEL no responde o genera un error de red:
    - Resolver la consulta utilizando la réplica local en `pgvector mirror` (corpus sincronizado).
    - Rotular obligatoriamente al inicio de la respuesta con la etiqueta:
      `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`
- **Código de Documento Desconocido / No Registrado**:
  - Si un código o documento no existe en PIMS y no se encuentra en el mapeo normativo:
    - Emitir el veredicto `desconocido`.
    - **NUNCA** inventar requisitos, cláusulas ni registros simulados.
- **Límite de Presupuesto Alcanzado (Loan Profile Degraded-at-Cap)**:
  - Si se alcanza el límite de `task.softRequestBudget` o la cuota en perfil loan:
    - La recuperación de datos permanece activa: verificación de existencia en PIMS, consultas de estado y contrastes contra `docs/ISO-27701-NORMATIVE-MAP.md` continúan operando.
    - La generación de explicaciones extensas y análisis narrativos se pausa inmediatamente.
    - Mensaje de contacto obligatorio:
      `"Límite de presupuesto de tokens alcanzado en perfil loan. La recuperación continúa activa, pero la generación analítica está pausada. Contacte al equipo Turno B Grupo 4 para ampliación de cuota."`

## 4. Response Shape

```markdown
### Evaluación de Necesidad Documental (ISO/IEC 27701:2025 / PIMS en Vivo)

| Documento | Veredicto | Base Normativa | Estado en PIMS |
| :--- | :--- | :--- | :--- |
| `G4-POL-001` | **OBLIGATORIO** | ISO/IEC 27701:2025 Cl. 5.2 ("The privacy policy shall be available as documented information") | Presente (ID: 101, Estado: R, Versión: "1.0") |
| `G4-PRC-INC-001` | **OBLIGATORIO** | ISO/IEC 27701:2025 Cl. 8.1 / Control A.3.11 ("The organization shall define and document privacy incident management procedures") | Presente (ID: 102, Estado: V, Versión: "2.0") |
| `G4-GUI-INT-001` | **OPCIONAL** | No mandatorio por ISO 27701 (Guía de apoyo operativo seleccionada por el estado de la organización) | Presente (ID: 108, Estado: R, Versión: "1") |
| `G4-REG-EXT-001` | **OPCIONAL** | Sin mandato expreso en Tablas A.1/A.3 de ISO 27701 | Ausente en PIMS |

**Justificación y Trazabilidad**:
- **Criterio de Evaluación**: Veredictos calculados dinámicamente según el estado actual de PIMS y el mapa normativo en `docs/ISO-27701-NORMATIVE-MAP.md`.
- **Lector de PIMS**: Integración operativa mediante la skill `pims-reader` con filtro estricto de tenant `G4-` / `Turno B Grupo 4`.
```
