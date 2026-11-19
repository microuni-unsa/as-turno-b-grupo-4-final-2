# Repositorio de Moldes Typst y Artefactos del SGPI — UNSA Grupo 4

Este directorio contiene los moldes de generación (`.typ`, Typst 0.15) y generadores scriptados para el Sistema de Gestión de Privacidad de la Información (SGPI) de la **Universidad Nacional de San Agustín de Arequipa (UNSA)**, bajo la norma **ISO/IEC 27701:2025** (Segunda edición, standalone PIMS).

> **Axioma de Fuente de Verdad**: Los archivos `.typ` y `.ts` en este repositorio son **moldes locales**, nunca el registro definitivo de auditoría. El registro de verdad absoluto reside en el PIMS institucional (GESTITEL en `https://unsa.27k.pe`), al cual se suben los documentos compilados (PDF/XLSX) vía la Documents API.

---

## 1. Contrato de Anatomía Documental de 15 Elementos (SPEC 6.1 Ampliado — Actualizado Phase P2)

Todo documento generado a partir de estos moldes DEBE cumplir estrictamente con los 15 elementos normativos de anatomía obligatoria:

1. **Código institucional unívoco**: Prefijo obligatorio `G4-` seguido del tipo documental de tres letras y correlativo numérico (ej. `G4-PRC-DOC-01`, `G4-SOA-01`, `G4-ALC-01`).
2. **Número de versión visible**: Formato semántico `X.Y` (ej. `v1.0`, `v2.0`, `v3.0`).
3. **Fecha de vigencia / aprobación**: Formato ISO `YYYY-MM-DD` indicando la fecha de emisión formal.
4. **Paginación dinámica y Pie de página institucional (Páginas 2+)**: Suprimido en página 1 (carátula). A partir de la página 2, pie de página estructurado en 3 celdas con anchos fijos `columns: (1fr, 150pt, 100pt)` a 11pt: nombre del documento a la izquierda en `#box(width: 100%, clip: true)[#doc-display-name]` (evita colapso horizontal mediante `short-title`), `ver. <version> del <date>` al centro (150pt), y `Página X de Y` a la derecha (100pt) mediante `#context counter(page).display("1 de 1", both: true)`. Se elimina el antiguo tagline inferior.
5. **Nivel de clasificación de seguridad**: Rotulado explícito en encabezado superior derecho a partir de página 2 (`Confidencial` por defecto para todo el SGPI). Suprimido en página 1. Encabezado a 11pt simétrico con el pie.
6. **Tabla de control documental en carátula (`document-control table`)**: Tabla estructurada de exactamente 6 filas ubicada en la página 1 (carátula exclusiva bajo logo UNSA centrado de ~3.5cm, nombre de la entidad y título del documento):
   - *Código:* Código unívoco del documento (`G4-XXX-NN`).
   - *Versión:* Versión semántica (`X.Y`).
   - *Fecha de la versión:* Fecha formal de emisión (`YYYY-MM-DD`).
   - *Creado por:* Nombre y cargo del autor técnico (DPO / OSI).
   - *Aprobado por:* Nombre y cargo de la máxima autoridad de aprobación (Rector UNSA).
   - *Nivel de confidencialidad:* Clasificación (`Confidencial`).
   Todos los textos y celdas heredan Carlito 11pt.
7. **Simplificación de carátula institucional**: Se eliminó el antiguo "Cuadro de Aprobación Institucional" de 3 columnas y el subtítulo redundante de emisión en el título. La página 1 contiene exclusivamente logo, nombre de la entidad, título y tabla de control.
8. **Tabla de historial de revisiones**: Desplazada a la página 2. Columnas renombradas exactamente a: `Fecha | Versión | Creado por | Descripción de los cambios`. Tipografía Carlito 11pt estricta en cabecera y celdas.
9. **Índice analítico de contenidos**: Ubicado en página 2 tras el historial, generado automáticamente vía `outline(title: "Índice de Contenidos", indent: 1.2em)`.
10. **Regla de carátula, historial e índice (`Cover & ToC rule`)**: La carátula ocupa exclusivamente la página 1 seguida de `pagebreak()`. El historial de revisiones y el índice analítico ocupan la página 2, seguidos inmediatamente de un salto forzoso (`pagebreak()`) antes de iniciar el cuerpo procedimental.
11. **Sección de documentos de referencia (`reference-docs section`)**: Sección obligatoria (`= Documentos de referencia`) con el listado exhaustivo de normas internacionales, leyes nacionales y políticas institucionales aplicables. Puede pasarse mediante el parámetro `references` al template o declararse en la estructura del molde.
12. **Sección de validez y gestión de documentos (`validity/owner section`)**: Sección penúltima obligatoria (`= Validez y gestión de documentos`) que especifica la fecha límite o condición de vigencia del documento (`validity`), el cargo propietario responsable de su revisión anual (`owner-role`, DPO o DUTIC), y los criterios para evaluar su efectividad y adecuación.
13. **Bloque de firma institucional al cierre (`signature block`)**: Bloque formal de cierre al final del documento con espacio libre de firma incrementado a 1.2–1.5cm (~1.4cm) sobre la línea, tipografía Carlito 11pt para cargo y nombre, y remoción total del texto inferior "Firma":
    ```
    [cargo] (11pt negrita)
    [nombre] (11pt regular)
    (espacio en blanco ~1.4cm)
    _____________________________
    ```
14. **Cero marcadores de posición sin resolver**: Prohibición terminante de marcadores o corchetes pendientes (`completar`, `TODO`, `insertar fecha`, `[cargo]`, `[nombre]`). Toda variable debe estar completamente poblada con datos institucionales sintéticos y coherentes de la UNSA.
15. **Regla de invocadores de versión desacoplados (`version-caller rule`)**: Desacoplamiento arquitectónico absoluto entre la prosa del procedimiento y los datos de instancia de cada versión: `molds/` contiene ÚNICAMENTE plantillas parametrizadas (`mold*.typ`), mientras que cada invocador de versión con datos de instancia de la UNSA (`G4-XXX-v1.typ`, `G4-XXX-v2.typ`, `G4-XXX-v3.typ`, ~30 líneas) reside en `corpus_g4_src/<carpeta>/` e importa el molde vía `#import "../../molds/<carpeta>/mold*.typ"`. Cada invocador define obligatoriamente `short-title: "..."` (≤ 45 caracteres).

---

### Tipografía y Formato Transversal (Phase P2 Estándar)

1. **Regla de 11pt Universal (Carlito 11pt)**:
   - Carlito 11pt es el **ÚNICO** tamaño de cuerpo (`set text(font: "Carlito", size: 11pt, lang: "es")`).
   - Se prohíbe terminantemente cualquier tamaño $N < 11\text{pt}$ (`size: Npt` o `text(size: Npt)` con $N < 11$).
   - Tablas (cabeceras Y celdas de datos, sin excepción), encabezados de página, pies de página, bloques de firma, tabla de historial y tabla de carátula heredan 11pt.
   - Solo los tamaños $\ge 11\text{pt}$ (título de portada 16pt, nombre de entidad 13pt, encabezados de sección) se conservan.

2. **Espaciado Vertical Escalado 1.5×**:
   - `set par(leading: 0.7626em)`: Produce un salto basal (line pitch) de $\approx 19.4\text{pt}$ a 11pt ($1.5 \times$ interlineado base).
   - `set par(spacing: 1.8em)`: Espaciado entre párrafos ($1.5 \times$ valor por defecto de 1.2em en Typst).
   - `set list(spacing: 0.975em)` y `set enum(spacing: 0.975em)`: Espaciado vertical entre ítems de listas ($1.5 \times 0.65\text{em}$).
   - `show heading: set block(above: 1.8em, below: 1.05em)`: Separación armónica de títulos ($1.5 \times 1.2\text{em} / 0.7\text{em}$).
   - Márgenes de página simétricos y compactos: `margin: (top: 2.2cm, bottom: 2.2cm, left: 2.5cm, right: 2.5cm)`. Reducción de margen superior de 3cm a 2.2cm y de inferior de 2.5cm a 2.2cm para eliminar espacios muertos entre reglas de encabezado/pie y cuerpo.

3. **Regla de Tablas en Paisaje (Landscape Table Rule)**:
   - Tras el barrido de 11pt, cualquier tabla cuyo contenido supere el ancho imprimible en orientación vertical DEBE colocarse en página(s) horizontal(es) mediante `#page(flipped: true)[ #table(...) ]`.
   - Cero columnas eliminadas, cero datos omitidos, ninguna celda por debajo de 11pt, orden y nombres de columnas originales preservados.
   - Tablas estrechas permanecen en orientación vertical.

4. **Prohibición de Cajas de Llamado (Callouts Ban)**:
   - Se prohíben las cajas decorativas `#callout(title: ..., ...)[body]`.
   - Cada llamada se convierte en un párrafo formal de cuerpo: `*ENCABEZADO:* texto del cuerpo` (mismas palabras, encabezado en negrita con capitalización normal, sin bordes, sin fondos, sin cajas).

5. **Prohibición de Pastillas y Badges (Pills Ban)**:
   - Se prohíbe el uso de pastillas redondeadas `box(radius: ...)`: `status-tag(...)`, `rag-tag(...)` y variantes locales (`status-badge`, `tag-badge`, `sev-badge`).
   - Se reemplazan por texto plano en **NEGRITA 11pt** con la misma etiqueta (ej. `*VIGENTE*`, `*IMPLEMENTADO*`, `*ROJO*`).
   - Fondos de celda completa (`fill:`) se reservan exclusivamente para matrices donde el código cromático RAG sea normativamente indispensable.

6. **Regla de Título Corto en Invocadores (Short-Title Rule)**:
   - Para evitar desbordamientos y colapsos en el pie de página de 3 columnas fijas `(1fr, 150pt, 100pt)`, cada invocador en `corpus_g4_src/` debe declarar `short-title: "..."` con una abreviación significativa de $\le 45$ caracteres.

---

## 2. Contrato de Autoría de Moldes (Mold Authoring Contract)

Todo desarrollador y trabajador de moldes (downstream mold worker) debe acatar las siguientes especificaciones técnicas y arquitectónicas:

### 2.1. Arquitectura Desacoplada (`molds/` Plantillas vs `corpus_g4_src/` Invocadores)
- **`molds/<carpeta>/` (Plantillas Parametrizadas — Molds Only)**:
  - Contiene obligatoriamente `mold.typ` (o `mold-*.typ`): **UN SOLO** archivo y función Typst parametrizada que contiene **TODA la prosa, redacción técnica, tablas y diagramas**, con **CERO datos de instancia UNSA hardcodeados**. Recibe los datos mediante parámetros y diccionarios `#let`.
  - `RAFA.md`: Registro de ingeniería de prompts de la carpeta.
  - Scripts generadores (ej. `generate*.ts` en `incident-register/` e `incident-risks/`).
  - **`molds/` mantiene ÚNICAMENTE plantillas parametrizadas sin datos de instancia**.
- **`corpus_g4_src/<carpeta>/` (Fuentes Rellenadas / Invocadores de Versión)**:
  - Invocadores de versión (`G4-XXX-v1.typ`, `G4-XXX-v2.typ`, `G4-XXX-v3.typ`): archivos ultraligeros de aproximadamente 30 líneas. Su única función es importar el molde relativo (`#import "../../molds/<carpeta>/mold.typ": mold`), definir el diccionario de datos institucional correspondiente a esa versión (`v1.0`, `v2.0` o `v3.0`), pasar los datos y ejecutar el show-rule.

### 2.2. Importación Centralizada y Prohibición de Duplicados
- **Ruta de Importación Única**: Todos los moldes e invocadores deben importar el template centralizado mediante ruta relativa:
  ```typst
  #import "../common/template.typ": doc-template, reference-docs, signature-block
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

## 6. Mapa de Directorios (Distribución Arquitectónica)

### 6.1. `molds/` — Plantillas Parametrizadas (Templates Only)
`molds/` alberga exclusivamente plantillas parametrizadas sin datos institucionales hardcodeados, fichas RAFA y scripts generadores:

```
molds/
├── README.md                          # Este documento normativo, contrato de autoría y control
├── common/
│   └── template.typ                   # Motor y diseño institucional UNSA en Typst 0.15 (15 elementos)
├── university-facts -> ../university-facts # Enlace simbólico a la base de hechos institucionales
├── scope/                             # mold.typ, RAFA.md
├── policy/                            # mold.typ, RAFA.md
├── incident-risks/                    # mold.typ, RAFA.md, generate-assessment.ts, generate-treatment.ts
├── soa/                               # mold.typ, RAFA.md
├── objectives/                        # mold.typ, RAFA.md
├── document-control/                  # mold.typ, RAFA.md
├── incident-training/                 # mold-cap.typ, mold-reg-cap.typ, RAFA.md
├── incident-response-procedure/       # mold.typ, RAFA.md
├── incident-register/                 # mold.typ, RAFA.md, generate.ts
├── audit-programme/                   # mold-prg.typ, mold-rep.typ, RAFA.md
├── management-review/                 # mold.typ, RAFA.md
├── nc-corrective-actions/             # mold-prc-capa.typ, mold-reg-capa.typ, RAFA.md
└── document-index/                    # mold.typ, RAFA.md
```

### 6.2. `corpus_g4_src/` — Fuentes Rellenadas (Filled Typst Sources)
`corpus_g4_src/` contiene los 54 invocadores de versión delgados que portan los datos institucionales concretos de la UNSA (v1.0, v2.0, v3.0) e importan sus moldes correspondientes desde `../../molds/<carpeta>/`:

```
corpus_g4_src/
├── scope/                             # G4-ALC-01-v1.typ, v2.typ, v3.typ
├── policy/                            # G4-POL-01-v1.typ, v2.typ, v3.typ
├── incident-risks/                    # G4-RSK-INC-01-v1..v3, G4-MET-RSK-01-v1..v3, G4-PLN-RSK-01-v1..v3
├── soa/                               # G4-SOA-01-v1.typ, v2.typ, v3.typ
├── objectives/                        # G4-OBJ-01-v1.typ, v2.typ, v3.typ
├── document-control/                  # G4-PRC-DOC-01-v1.typ, v2.typ, v3.typ
├── incident-training/                 # G4-CAP-INC-01-v1..v3, G4-REG-CAP-01-v1..v3
├── incident-response-procedure/       # G4-PRC-INC-01-v1.typ, v2.typ, v3.typ
├── incident-register/                 # G4-REG-INC-01-v1.typ, v2.typ, v3.typ
├── audit-programme/                   # G4-PRG-AUD-01-v1..v3, G4-REP-AUD-01-v1..v3
├── management-review/                 # G4-ACT-REV-01-v1.typ, v2.typ, v3.typ
├── nc-corrective-actions/             # G4-PRC-CAPA-01-v1..v3, G4-REG-CAPA-01-v1..v3
└── document-index/                    # G4-IDX-01-v1.typ, v2.typ, v3.typ
```
