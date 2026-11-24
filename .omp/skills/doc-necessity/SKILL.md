---
name: doc-necessity
description: Classify ISO/IEC 27701:2025 PIMS documents across 3 tiers (Mandatory / Context-Dependent / Optional) using live PIMS state and reference/iso-27701-2025.md without G4- read filtering or circular static mappings.
---

# Skill: doc-necessity

Evaluación dinámica y en tiempo real de la necesidad documental en ISO/IEC 27701:2025 (rol UNSA: PII Controller), fundamentada **únicamente** en la norma (`reference/iso-27701-2025.md`), el contexto institucional (`university-facts/`, `G4-ALC-01`, `G4-SOA-01`), y el estado vivo completo del PIMS (`https://unsa.27k.pe`), sin depender de tablas pre-asignadas (`ISO-27701-NORMATIVE-MAP.md` ni archivos en `docs/` excluidos en despliegue).

## 1. Trigger Patterns

- "¿El documento `<código o tema>` es obligatorio u opcional?"
- "¿Qué documentos exige obligatoriamente la ISO/IEC 27701:2025?"
- "Evalúa si nuestra documentación actual en PIMS cubre todo lo mandatorio."
- "¿Por qué necesitamos o no necesitamos `<procedimiento/registro>` según ISO 27701?"

## 2. Step Protocol

1. **Lectura Normativa Directa (`reference/iso-27701-2025.md`)**:
   - **Prohibición absoluta**: Nunca usar `docs/ISO-27701-NORMATIVE-MAP.md` ni listas fijas pre-armadas de códigos `G4-*`.
   - Toda verificación del texto normativo (`"shall be available as documented information"`, `"retain documented information"`, `"shall document"`, `"shall have a written contract"`, etc.) debe citar exactamente cláusula o control en `reference/iso-27701-2025.md`:
     - **En alcance para UNSA (PII Controller, Cl. 4.1)**: Cláusulas 4–10 + Anexo A Tabla A.1 (`A.1.2.2`–`A.1.5.5`) + Anexo A Tabla A.3 (`A.3.3`–`A.3.31`).
     - **Excluido con justificación (Cl. 6.1.3 e)**: Anexo A Tabla A.2 (PII Processors, `A.2.*`), verificable en vivo contra `G4-SOA-01`.

2. **Clasificación en 3 Niveles (3-Tier Evaluation)**:
   Evaluar cada documento o requisito en 3 categorías rigurosas:
   - **Nivel 1 — OBLIGATORIO INCONDICIONAL (*Unconditional `shall`*)**:
     - Mandatos explícitos que no dependen de tamaño o complejidad:
       - Cl. 4.3: Alcance del SGPI (*"shall be available as documented information"*)
       - Cl. 5.2 a): Política de privacidad (*"shall be available as documented information"*)
       - Cl. 6.1.2: Criterios/proceso y resultados de evaluación de riesgos (*"shall retain documented information..."*)
       - Cl. 6.1.3: Proceso de tratamiento de riesgos y Declaración de Aplicabilidad (SoA)
       - Cl. 6.2: Objetivos de privacidad (*"shall retain documented information on the privacy objectives"*)
       - Cl. 7.2: Evidencia de competencia (*"shall retain appropriate documented information as evidence of competence"*)
       - Cl. 8.2 & 8.3: Resultados de evaluación y tratamiento de riesgos
       - Cl. 9.1: Evidencia de seguimiento, medición, análisis y evaluación
       - Cl. 9.2.2: Implementación del programa de auditoría interna y resultados
       - Cl. 9.3.3: Resultados de revisión por la dirección
       - Cl. 10.2: Naturaleza de no conformidades, acciones tomadas y resultados de acciones correctivas
       - Anexo A (controles aplicables A.1 / A.3 con `"shall document"` / `"policies and procedures"`, p. ej. `A.1.2.2`, `A.1.2.3`, `A.1.2.4`, `A.1.2.9`, `A.1.3.2`, `A.1.3.3`, `A.1.3.10`, `A.3.11`, `A.3.12`, `A.3.13`, `A.3.14`, `A.3.18`).
   - **Nivel 2 — OBLIGATORIO CONDICIONAL AL CONTEXTO (*Context-/Scope-/Risk-/Legal-/State-Dependent*)**:
     - Documentos cuyo carácter mandatorio depende del **contexto real** (Cl. 7.5.1 b: necesario para la eficacia; Cl. 8.1: control operacional según riesgo/alcance; hechos en `university-facts/`, `G4-ALC-01`, `G4-SOA-01` y registros vivos en PIMS):
       - ¿UNSA usa encargados de tratamiento (subcontratistas/proveedores TIC)? → Si sí, `A.1.2.7` exige contrato escrito con requisitos Tabla A.2.
       - ¿Hay transferencias internacionales o nuevos tratamientos de PII? → Exige evaluación de impacto (`A.1.2.6`) y registros de transferencia (`A.1.5.2`–`A.1.5.5`).
       - ¿Hay incidentes abiertos (`incidents list`), riesgos registrados (`risks list`), o hallazgos en auditorías (`audits list`)? → Determina si procedimientos operacionales o registros específicos son necesarios bajo Cl. 7.5.1 b) / Cl. 8.1.
       - ¿Preguntas normativas generales (sin documento concreto)? → Evaluar de forma pura frente a `reference/iso-27701-2025.md`, distinguiendo claramente mandatos generales de condiciones contextuales UNSA.
   - **Nivel 3 — OPCIONAL / ADICIONAL (*Discretionary Operational Artifact*)**:
     - Documentos sin mandato expreso *shall* en Cl. 4–10 ni Tabla A.1/A.3 y no requeridos por riesgo/ley aplicable en el contexto actual (aunque si ya existen en PIMS con estado `R` o `V`, constituyen adopción voluntaria institucional sujeta al control documental Cl. 7.5.3).

3. **Lectura Uniforme del Estado Vivo en PIMS**:
   - Consultar en vivo mediante el CLI unificado (`bun scripts/pims.ts`) sin filtrar por `G4-`:
     - `bun scripts/pims.ts docs list --compact`
     - `bun scripts/pims.ts incidents list --compact`
     - `bun scripts/pims.ts audits list --compact`
     - `bun scripts/pims.ts risks list --compact`
     - `bun scripts/pims.ts assets list --compact`
   - Extraer `id`, `code`, `status` (`B`/`R`/`V`/`O`; tanto `R` como `V` son activos válidos según estado operativo actual), y `current_version` (string opaco `"3.00"`, nunca inferir veredicto desde `category`).
   - Inspeccionar el texto real en `G4-ALC-01`, `G4-SOA-01` o del documento evaluado vía `bun scripts/pims.ts mirror read <doc.code>` (o búsqueda semántica con `bun scripts/rag-query.ts "<consulta>"`) y `university-facts/facts.json`.

4. **Veredicto Dinámico y Citas Verificables**:
   - Formato de tabla obligatoria:
     `Documento / Artefacto | Clasificación (3 Niveles) | Cláusula / Control ISO 27701:2025 (`reference/iso-27701-2025.md`) | Evidencia Contextual y Estado en PIMS`

## 3. Failure Branches

- **PIMS No Disponible**:
  - Si la lectura en vivo falla, usar el espejo local vía `bun scripts/pims.ts mirror read <doc.code>` o búsqueda semántica con `bun scripts/rag-query.ts "<consulta>"` y anteponer obligatoriamente `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`. Contrastar normalmente contra `reference/iso-27701-2025.md`.
- **Artefacto Inexistente**:
  - Si no figura en PIMS ni aplica a ningún mandato *shall*/contextual de `reference/iso-27701-2025.md`, reportar ausente y clasificar en Nivel 2 o Nivel 3 según análisis factual; jamás inventar cláusulas.
