# Repositorio de Moldes Typst y Artefactos del SGPI — UNSA Grupo 4

Este directorio contiene los moldes de generación (`.typ`, Typst 0.15) y generadores scriptados para el Sistema de Gestión de Privacidad de la Información (SGPI) de la **Universidad Nacional de San Agustín de Arequipa (UNSA)**, bajo la norma **ISO/IEC 27701:2025** (Segunda edición, standalone PIMS).

> **Axioma de Fuente de Verdad**: Los archivos `.typ` y `.ts` en este repositorio son **moldes locales**, nunca el registro definitivo de auditoría. El registro de verdad absoluto reside en el PIMS institucional (GESTITEL en `https://unsa.27k.pe`), al cual se suben los documentos compilados (PDF/XLSX) vía la Documents API.

---

## 1. Contrato de Anatomía Documental de 15 Elementos (SPEC 6.1 Ampliado)

Todo documento generado a partir de estos moldes DEBE cumplir estrictamente con los 15 elementos normativos de anatomía obligatoria:

1. **Código institucional unívoco**: Prefijo obligatorio `G4-` seguido del tipo documental de tres letras y correlativo numérico (ej. `G4-PRC-DOC-01`, `G4-SOA-01`, `G4-ALC-01`).
2. **Número de versión visible**: Formato semántico `X.Y` (ej. `v1.0`, `v2.0`, `v3.0`).
3. **Fecha de vigencia / aprobación**: Formato ISO `YYYY-MM-DD` indicando la fecha de emisión formal.
4. **Paginación dinámica**: Formato `Página X de Y` en el pie de página institucional, renderizado automáticamente mediante `#context counter(page).display("1 de 1", both: true)`.
5. **Nivel de clasificación de seguridad**: Rotulado explícito en encabezado superior derecho (`CONFIDENCIAL - USO INTERNO UNSA`).
6. **Tabla de control documental en cabecera (`document-control table`)**: Tabla estructurada de 6 a 7 filas ubicada en la primera página que replica el estándar de los formatos del instructor:
   - *Código:* Código unívoco del documento (`G4-XXX-NN`).
   - *Versión:* Versión semántica (`vX.Y`).
   - *Fecha de la versión:* Fecha formal de emisión (`YYYY-MM-DD`).
   - *Elaborado por (Creado por):* Nombre y cargo del autor técnico (DPO / OSI).
   - *Revisado por:* Nombre y cargo del revisor (Directora DUTIC).
   - *Aprobado por:* Nombre y cargo de la máxima autoridad de aprobación (Rector UNSA).
   - *Nivel de confidencialidad:* Clasificación de la información.
7. **Cuadro de control de firmas institucional**: Cuadro de aprobación tripartito con roles, nombres y fechas:
   - *Elaborado por*: Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO).
   - *Revisado por*: Mg. Lucía Valdivia Paredes (Directora Universitaria de TIC - DUTIC).
   - *Aprobado por*: Rector / Presidente del Comité de Gobierno Digital y Privacidad (Dr. Rohel Sánchez en 2019 / Dr. Hugo José Sánchez en 2022 y 2025).
8. **Tabla de historial de revisiones**: Columnas `Versión`, `Fecha`, `Responsable / Rol`, `Resumen de Cambios y Justificación`.
9. **Índice analítico de contenidos**: Generado automáticamente vía `outline(title: "Índice de Contenidos", indent: 1.2em)`.
10. **Regla de índice y salto de página (`ToC rule`)**: El índice debe completarse antes de iniciar el cuerpo procedimental, seguido inmediatamente de un salto de página forzoso (`pagebreak()`) para separar la carátula/metadatos del contenido sustantivo.
11. **Sección de documentos de referencia (`reference-docs section`)**: Sección obligatoria (`= Documentos de referencia`) con el listado exhaustivo de normas internacionales, leyes nacionales y políticas institucionales aplicables. Puede pasarse mediante el parámetro `references` al template o declararse en la estructura del molde.
12. **Sección de validez y gestión de documentos (`validity/owner section`)**: Sección penúltima obligatoria (`= Validez y gestión de documentos`) que especifica la fecha límite o condición de vigencia del documento (`validity`), el cargo propietario responsable de su revisión anual (`owner-role`, DPO o DUTIC), y los criterios para evaluar su efectividad y adecuación.
13. **Bloque de firma institucional al cierre (`signature block`)**: Bloque formal de cierre al final del documento siguiendo exactamente el patrón del instructor:
    ```
    [cargo]
    [nombre]
    _____________________________
    [firma]
    ```
14. **Cero marcadores de posición sin resolver**: Prohibición terminante de marcadores o corchetes pendientes (`completar`, `TODO`, `insertar fecha`, `[cargo]`, `[nombre]`). Toda variable debe estar completamente poblada con datos institucionales sintéticos y coherentes de la UNSA.
15. **Regla de invocadores de versión desacoplados (`version-caller rule`)**: Desacoplamiento arquitectónico absoluto entre la prosa del procedimiento y los datos de instancia de cada versión: cada carpeta contiene un único `mold.typ` parametrizado y llamadas delgadas `G4-XXX-v1.typ`, `G4-XXX-v2.typ`, `G4-XXX-v3.typ` de aproximadamente 30 líneas.

---

## 2. Contrato de Autoría de Moldes (Mold Authoring Contract)

Todo desarrollador y trabajador de moldes (downstream mold worker) debe acatar las siguientes especificaciones técnicas y arquitectónicas:

### 2.1. Arquitectura de Carpeta Documental (`mold.typ` + Invocadores Delgados)
- Cada carpeta documental contiene obligatoriamente:
  - `mold.typ`: **UN SOLO** archivo y función Typst parametrizada que contiene **TODA la prosa, redacción técnica, tablas y diagramas**, con **CERO datos de instancia UNSA hardcodeados**. Recibe los datos mediante parámetros y diccionarios `#let`.
  - Invocadores de versión (`G4-XXX-v1.typ`, `G4-XXX-v2.typ`, `G4-XXX-v3.typ`): archivos ultraligeros de aproximadamente 30 líneas. Su única función es importar el molde (`#import "mold.typ": mold`), definir el diccionario de datos institucional correspondiente a esa versión (`v1.0`, `v2.0` o `v3.0`), pasar los datos y ejecutar el show-rule.
  - `RAFA.md`: Registro de ingeniería de prompts de la carpeta.

### 2.2. Importación Centralizada y Prohibición de Duplicados
- **Ruta de Importación Única**: Todos los moldes e invocadores deben importar el template centralizado mediante ruta relativa:
  ```typst
  #import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block
  ```
- **Prohibición de Copias Locales**: Queda terminantemente prohibido crear, mantener o copiar archivos `template.typ` dentro de las carpetas individuales (`molds/<carpeta>/template.typ`). Los mold workers que detecten copias locales deben eliminarlas y reconfigurar la importación hacia `"../common/template.typ"`.

### 2.3. Estándar de Documentación RAFA (`RAFA.md`)
Cada carpeta documental debe mantener actualizado su archivo `RAFA.md` detallando:
- **R (Rol)**: Rol asignado al modelo/agente (ej. Lead Implementer ISO/IEC 27701, Auditor Líder ISO 19011, DPO Institucional).
- **A (Alcance)**: Perímetro exacto de aplicación en la UNSA (Admisión de Pregrado, Planilla de Remuneraciones, Sedes Centrales Arequipa, Filiales Camaná y Majes, Infraestructura DUTIC).
- **F (Formato)**: Estructura técnica de entrega (código Typst 0.15 parametrizado, función pura `mold.typ`, callers de versión).
- **A (Ámbito / Contexto Normativo)**: Cláusulas aplicables de ISO/IEC 27701:2025 (Cláusulas 4 a 10), controles de las Tablas A.1 y A.3, directrices de Anexo B, y justificación de exclusión de la Tabla A.2.

### 2.4. Hitos Institucionales y Datos Canónicos de Versionado

Para garantizar coherencia y trazabilidad de auditoría entre todas las carpetas del SGPI, los datos de las tres versiones canónicas son:

| Parámetro | Versión 1.0 (v1.0) | Versión 2.0 (v2.0) | Versión 3.0 (v3.0) |
|---|---|---|---|
| **Fecha de Emisión** | `2019-04-15` | `2022-09-10` | `2025-10-28` |
| **Hito Institucional** | Certificación inicial SGPI (ISO/IEC 27701:2019) | Virtualización y adaptación post-pandemia | Recertificación ISO/IEC 27701:2025 y expansión territorial |
| **Alcance Territorial** | Sedes Centrales Arequipa (Ingenierías, Biomédicas, Sociales) | Sedes Centrales Arequipa (virtualización de inscripciones) | Sedes Centrales + Filial Camaná (RR 0142-2025) y Filial El Pedregal - Majes (RR 0143-2025) |
| **Procesos en Alcance** | Admisión y Planillas (presenciales) | Admisión (portal web) y Planillas (teletrabajo) | Admisión multisede híbrida y Planillas descentralizadas |
| **Exclusiones** | Archivos físicos anteriores a 2018 | Legajos pasivos físicos históricos anteriores a 2020 | Archivos físicos históricos pasivos cerrados al 2020 |
| **Rector / Presidente SGPI** | Dr. Rohel Sánchez Sánchez | Dr. Hugo José Sánchez Carrión | Dr. Hugo José Sánchez Carrión |
| **DPO / OSI Institucional** | Ing. Carlos M. Benítez | Ing. Carlos M. Benítez | Ing. Carlos M. Benítez |
| **Directora DUTIC** | Mg. Lucía Valdivia Paredes | Mg. Lucía Valdivia Paredes | Mg. Lucía Valdivia Paredes |

---

## 3. Regla de Versionado y Ciclo de Vida (1.x vs 2.x/3.x)

- **Versiones Menores (`1.x`, `2.x`)**:
  - Aplican ante correcciones tipográficas, precisiones de redacción, actualización de nombres de cargos sin cambio funcional, ajustes de referencias o notas aclaratorias.
  - No alteran los límites de los procesos ni las obligaciones de control.
- **Versiones Mayores (`2.0`, `3.0`)**:
  - Aplican obligatoriamente ante cambios estructurales en el sistema de gestión:
    - **v1.0 (2019-04-15)**: Certificación inicial del SGPI (ISO/IEC 27701:2019) en sedes centrales de Arequipa (Ingenierías, Biomédicas, Sociales), procesos presenciales de Admisión y Planilla.
    - **v2.0 (2022-09-10)**: Reducción y adaptación post-pandemia; virtualización total de inscripciones vía portal web (`admision.unsa.edu.pe`) y teletrabajo de nóminas; exclusión de legajos físicos pasivos.
    - **v3.0 (2025-10-28)**: Recertificación bajo la norma independiente **ISO/IEC 27701:2025** e incorporación territorial de las **Filiales Camaná y El Pedregal (Majes)**.
- **Inmutabilidad en PIMS**:
  - Las versiones anteriores **nunca se eliminan** en el PIMS. Pasan automáticamente al estado `obsoleto` (`O`), manteniéndose descargables para auditoría retrospectiva ("máquina del tiempo").
  - Solo se admiten eliminaciones físicas puras (`true deletes`) en casos excepcionales de erratas críticas o contaminación de datos entre clientes, debidamente registradas en bitácora de auditoría.

---

## 4. Convención de Resumen de Cambio (`change_summary`)

Al emitir una nueva versión mediante el endpoint `POST /api/documents/{id}/versions/`, el campo FormData `change_summary` debe seguir una estructura estandarizada de 3 partes:
```
TIPO_CAMBIO :: Razón normativa/organizacional :: Modificaciones específicas realizadas :: Impacto en controles SoA o procesos
```
*Ejemplo (v3.0 Alcance)*:
`MAYOR_ALCANCE :: Expansión territorial 2025 :: Incorporación de Filial Camaná y Filial El Pedregal según RR 0142/0143-2025 :: Actualización de controles A.3.11, A.3.12 y conectividad VPN cifrada.`

---

## 5. Orden de Construcción y Auditoría (Cláusulas 4 → 10)

Los auditores de certificación de Fase 1 interrogan el sistema de gestión siguiendo estrictamente la estructura de cláusulas de alto nivel de las normas ISO. Por ello, la arquitectura documental y el índice maestro (`G4-IDX-01`) se construyen en el siguiente orden:

| Cláusula ISO 27701:2025 | Título de la Cláusula | Documento(s) Asociado(s) UNSA | Código |
|---|---|---|---|
| **Cláusula 4** | Contexto de la Organización | Determinación del Alcance del SGPI (Admisión + Planillas) | `G4-ALC-01` |
| **Cláusula 5** | Liderazgo | Política de Privacidad de la Información (1-pager) | `G4-POL-01` |
| **Cláusula 6** | Planificación | Matriz de Riesgos de Incidentes y Plan de Tratamiento (6.1.2/6.1.3f) <br> Declaración de Aplicabilidad - SoA (6.1.3e) <br> Tabla de Objetivos de Privacidad (6.2) | `G4-RSK-INC-01` <br> `G4-SOA-01` <br> `G4-OBJ-01` |
| **Cláusula 7** | Apoyo | Procedimiento de Control de Información Documentada (7.5) <br> Módulo y Registro de Capacitación en Incidentes (7.2/7.3/A.3.17) | `G4-PRC-DOC-01` <br> `G4-CAP-INC-01` / `G4-REG-CAP-01` |
| **Cláusula 8** | Operación | Procedimiento de Respuesta a Incidentes de Privacidad (8.1/A.3.11/A.3.12) <br> Registro de Incidentes de Privacidad (8.1/B.3.12 XLSX) | `G4-PRC-INC-01` <br> `G4-REG-INC-01` (`generate.ts`) |
| **Cláusula 9** | Evaluación del Desempeño | Programa e Informe de Auditorías Internas (9.2 / ISO 19011) <br> Acta de Revisión por la Dirección (9.3) | `G4-PRG-AUD-01` / `G4-REP-AUD-01` <br> `G4-ACT-REV-01` |
| **Cláusula 10** | Mejora | Registro de Cadena Hallazgo → No Conformidad → Acción Correctiva (10.2) | `G4-REG-CAPA-01` |

---

## 6. Mapa de Directorios de Moldes

```
molds/
├── README.md                          # Este documento normativo, contrato de autoría y control
├── common/
│   └── template.typ                   # Motor y diseño institucional UNSA en Typst 0.15 (15 elementos)
├── university-facts -> ../university-facts # Enlace simbólico a la base de hechos institucionales
├── scope/                             # Cl. 4.3/4.4 Alcance (Admisión + Planilla) v1/v2/v3
├── policy/                            # Cl. 5.2 Política de Privacidad (1-pager)
├── incident-risks/                    # Cl. 6.1.2/6.1.3 Riesgos de Incidentes y Tratamiento v1/v2/v3
├── soa/                               # Cl. 6.1.3e Declaración de Aplicabilidad (SoA) v1/v2/v3
├── objectives/                        # Cl. 6.2 Objetivos de Privacidad y Métricas
├── document-control/                  # Cl. 7.5 Control de Información Documentada
├── incident-training/                 # Cl. 7.2/7.3/A.3.17 Capacitación y Evaluación v1/v2/v3
├── incident-response-procedure/       # Cl. 8.1/A.3.11/A.3.12 Procedimiento de Incidentes v1/v2/v3
├── incident-register/                 # Cl. 8.1/B.3.12 Registro y generador XLSX Bun (generate.ts)
├── audit-programme/                   # Cl. 9.2 Programa e Informe de Auditoría Interna
├── management-review/                 # Cl. 9.3 Acta de Revisión por la Dirección
├── nc-corrective-actions/             # Cl. 10.2 Cadena Hallazgo->NC->Acción Correctiva v1/v2/v3
└── document-index/                    # Auditor's Map (Índice Maestro de Auditoría Fase 1)
```
