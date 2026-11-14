# Evidencia RAFA: Registro de Incidentes de Privacidad (G4-REG-INC-01)

## 1. R — Rol
- **Agente / Especialista**: Custodio del Registro de Incidentes del SGPI y Especialista Forense en Privacidad de Datos de la UNSA.
- **Interlocutor Primario**: Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`) y Dirección Universitaria de TIC (`DUTIC`).

## 2. A — Alcance
- **Perímetro Organizacional**: Admisión (proceso misional de ingreso ordinario, CEPRUNSA y filiales) y Planilla de Remuneraciones (personal docente y administrativo).
- **Variantes Temporales**:
  - `v1.0 (2019)`: Sedes centrales Arequipa (Ingenierías, Biomédicas, Sociales), registros predominantemente físicos y de red local.
  - `v2.0 (2022)`: Post-pandemia, contracción física e incidentes web en plataforma `admision.unsa.edu.pe` y teletrabajo.
  - `v3.0 (2025)`: Expansión multisede a Filial Camaná y Filial El Pedregal (Majes), ataques dirigidos y sincronización remota.

## 3. F — Formato
- **Plantilla de Presentación**: Documento formal Typst 0.15 (`G4-REG-INC-01-v1.typ`, `G4-REG-INC-01-v2.typ`, `G4-REG-INC-01-v3.typ`) con tabla de registro, codificación de estados, cuadros RAG y firmas institucionales.
- **Artefacto de Exportación Operativa**: Script TypeScript para Bun (`generate.ts`) que emite la hoja de cálculo OpenXML `.xlsx` (`G4-REG-INC-01-registros.xlsx`) para importación masiva en el PIMS institucional.

## 4. A — Ámbito y Criterio Normativo
- **Norma Base**: ISO/IEC 27701:2025, Cláusula 8.1 (Planificación y control operacional), Cláusula 7.5.1 (Información documentada requerida), Control A.3.11, Control A.3.12 y Guía B.3.12 (Breach records and reporting).
- **Determinación Institucional de Notificación**: Los campos del registro y los umbrales de notificación hacia la autoridad reguladora (ANPDP Perú) o los titulares afectados se rigen estrictamente por los criterios de evaluación de impacto definidos por la UNSA bajo las Cláusulas 8.1 y 7.5.1.
- **Exclusión Expresa**: NO APLICA la regla arbitraria de notificación obligatoria de 72 horas (GDPR Art. 33); en este PIMS, los textos del GDPR constituyen exclusivamente datos de referencia documental informativa (Anexo D).
