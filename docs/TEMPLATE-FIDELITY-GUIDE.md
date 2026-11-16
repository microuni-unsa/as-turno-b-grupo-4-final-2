# Guía Maestra de Fidelidad Visual de Plantillas (Template Fidelity Guide)
## Sistema de Gestión de Privacidad de la Información (SGPI) — Universidad Nacional de San Agustín de Arequipa (UNSA)
### Norma de Referencia: ISO/IEC 27701:2025 (Segunda edición, 2025-10)

> **Documento Oficial de Fase R0 — Biblia de Fidelidad Visual para Desarrolladores y Agentes Downstream**  
> **Propósito**: Establecer las especificaciones visuales, estructurales, tipográficas y normativas obligatorias para la construcción de los moldes Typst (`molds/`).  
> **Regla de Oro**: Prohibición terminante de basar los moldes exclusivamente en texto plano extraído. Los moldes Typst deben ser un calco estructural idéntico de las plantillas oficiales del instructor, adaptadas rigurosamente al marco de ISO/IEC 27701:2025 y a la realidad institucional de la UNSA.

---

## Índice General

1. [HOW TO SEE — Protocolo Obligatorio de Inspección Visual](#1-how-to-see--protocolo-obligatorio-de-inspección-visual)
2. [Tabla Maestra Global de Conversión (ISO 27001:2013 → ISO 27701:2025)](#2-tabla-maestra-global-de-conversión-iso-270012013--iso-277012025)
   - [2.1 Sustitución Terminológica Fundamental](#21-sustitución-terminológica-fundamental)
   - [2.2 Mapeo de Cláusulas y Controles Normativos](#22-mapeo-de-cláusulas-y-controles-normativos)
   - [2.3 Expansión de la Tríada CIA a Consecuencias de Privacidad](#23-expansión-de-la-tríada-cia-a-consecuencias-de-privacidad)
   - [2.4 Transición del Historial de Versiones (Kosutic → Era UNSA)](#24-transición-del-historial-de-versiones-kosutic--era-unsa)
   - [2.5 Directrices Tipográficas y Sustitución de Fuentes (Calibri → Liberation Sans)](#25-directrices-tipográficas-y-sustitución-de-fuentes-calibri--liberation-sans)
   - [2.6 Invariantes Estructurales (Lo que NUNCA debe cambiar)](#26-invariantes-estructurales-lo-que-nunca-debe-cambiar)
3. [Inventario Exhaustivo por Plantilla (Las 9 Fuentes Oficiales)](#3-inventario-exhaustivo-por-plantilla-las-9-fuentes-oficiales)
   - [Plantilla 1: Procedimiento para Control de Documentos y Registros](#plantilla-1-procedimiento-para-control-de-documentos-y-registros-g4-prc-doc-01)
   - [Plantilla 2: Procedimiento para Medidas Correctivas](#plantilla-2-procedimiento-para-medidas-correctivas-g4-prc-capa-01)
   - [Plantilla 3: Apéndice — Formulario para Medidas Correctivas](#plantilla-3-apéndice--formulario-para-medidas-correctivas-g4-reg-capa-01)
   - [Plantilla 4: Metodología de Evaluación y Tratamiento de Riesgos](#plantilla-4-metodología-de-evaluación-y-tratamiento-de-riesgos-g4-met-rsk-01)
   - [Plantilla 5: Plan de Capacitación y Concienciación](#plantilla-5-plan-de-capacitación-y-concienciación-g4-cap-inc-01)
   - [Plantilla 6: Plan de Tratamiento del Riesgo](#plantilla-6-plan-de-tratamiento-del-riesgo-g4-pln-rsk-01)
   - [Plantilla 7: Apéndice 1 — Cuadro de Evaluación de Riesgos (Excel)](#plantilla-7-apéndice-1--cuadro-de-evaluación-de-riesgos-excel-g4-rsk-inc-01)
   - [Plantilla 8: Apéndice 2 — Cuadro de Tratamiento de Riesgos (Excel)](#plantilla-8-apéndice-2--cuadro-de-tratamiento-de-riesgos-excel-g4-pln-rsk-01)
   - [Plantilla 9: Apéndice 3 — Informe sobre Evaluación y Tratamiento de Riesgos](#plantilla-9-apéndice-3--informe-sobre-evaluación-y-tratamiento-de-riesgos-g4-rsk-inc-01--g4-pln-rsk-01)
4. [Catálogo Maestro de Roles y Datos Institucionales de la UNSA](#4-catálogo-maestro-de-roles-y-datos-institucionales-de-la-unsa)
5. [Lista de Verificación de Aceptación de Fidelidad Visual (Checklist de Control)](#5-lista-de-verificación-de-aceptación-de-fidelidad-visual-checklist-de-control)

---

## 1. HOW TO SEE — Protocolo Obligatorio de Inspección Visual

> [!CAUTION]
> **MANDATO DE INSPECCIÓN PREVIA VINCULANTE PARA TODOS LOS DOWNSTREAM WORKERS**  
> Antes de escribir una sola línea de código en cualquier molde Typst (`molds/`), el agente o desarrollador asignado **DEBE abrir e inspeccionar visualmente en su entorno gráfico o visualizador de imágenes los archivos PNG de referencia** generados en `docs/templates-render/<slug>/`.  
> **QUEDA ESTRICTAMENTE PROHIBIDO** basar el molde en una simple extracción de texto o inferencia de memoria. La fidelidad visual se juzga por la correspondencia exacta de márgenes, proporciones de celdas, jerarquías de títulos, cajas de notas, líneas de firma y encabezados/pies de página.

### Protocolo de Visualización de 3 Pasos

1. **Localizar el directorio del molde a implementar**:  
   Identifique el slug correspondiente en la tabla del [MANIFEST.md](templates-render/MANIFEST.md).
2. **Abrir todas las imágenes de página**:  
   Examine secuencialmente cada archivo `p01.png`, `p02.png`, etc., prestando especial atención a:
   - Disposición de la portada (logo, títulos centrados en mayúsculas, caja de metadatos de control).
   - Estilo de tablas (bordes delgados grises, filas de encabezado con sombreado tenue, alineación vertical y sangrías).
   - Bloques de firma al cierre (dos o tres columnas con raya de firma, nombre, cargo y fecha).
   - Bloque de validez y criterios de efectividad.
3. **Contrastar el render Typst contra el PNG original**:  
   Compile el molde Typst y genere imágenes PNG comparativas para asegurar que la geometría, interlineado y jerarquías no presenten discrepancias notables.

### Comandos de Reproducción Idéntica

Cualquier trabajador o auditor puede regenerar de forma determinista el 100% de los PDFs y PNGs de referencia con los siguientes comandos verificados en el entorno:

```bash
# A) Conversión de plantillas Microsoft Word (.docx) a PDF:
soffice --headless --convert-to pdf --outdir docs/templates-render/<slug>/ docs/templates/<nombre_archivo>.docx
mv docs/templates-render/<slug>/<nombre_archivo>.pdf docs/templates-render/<slug>/source.pdf

# B) Conversión de plantillas Microsoft Excel (.xlsx) a PDF (1 hoja completa = 1 página PDF):
soffice --headless --convert-to "pdf:calc_pdf_Export:{"SinglePageSheets":{"type":"boolean","value":"true"}}" --outdir docs/templates-render/<slug>/ docs/templates/<nombre_archivo>.xlsx
mv docs/templates-render/<slug>/<nombre_archivo>.pdf docs/templates-render/<slug>/source.pdf

# C) Renderizado de páginas PDF a PNG (150 DPI de alta fidelidad) vía PyMuPDF:
uv run --with pymupdf python -c "
import fitz
doc = fitz.open('docs/templates-render/<slug>/source.pdf')
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    pix.save(f'docs/templates-render/<slug>/p{i+1:02d}.png')
"

# D) Compilación de moldes Typst locales a PDF:
typst compile molds/<slug>/mold.typ docs/templates-render/<slug>/typst-preview.pdf
```

---

## 2. Tabla Maestra Global de Conversión (ISO 27001:2013 → ISO 27701:2025)

Las plantillas del instructor provienen del estándar ISO/IEC 27001:2013 (complementado en algunos encabezados con menciones a ISO 22301 y BS 25999-2). Al construir los moldes Typst del SGPI de la UNSA, se deben aplicar de forma unificada las siguientes conversiones obligatorias.

### 2.1 Sustitución Terminológica Fundamental

| # | Expresión Original (Instructor / ISO 27001) | Expresión Obligatoria SGPI UNSA (ISO 27701:2025) | Justificación Normativa y Regla de Reemplazo |
| :-: | :--- | :--- | :--- |
| 1 | **SGSI** (Sistema de Gestión de Seguridad de la Información) | **SGPI** (Sistema de Gestión de Privacidad de la Información) | ISO/IEC 27701:2025 Cl. 3.23. El sistema gestiona la privacidad de los datos personales (*PII*). |
| 2 | **Seguridad de la información** | **Seguridad de la información y protección de los datos personales (PII)** | Integra la confidencialidad, integridad y disponibilidad con la protección de los derechos de los titulares. |
| 3 | **Activos de información** | **Activos de información y Bancos de Datos Personales (PII)** | Los bancos de datos de la UNSA (estudiantes, docentes, egresados) son el núcleo de protección. |
| 4 | **Riesgo de seguridad de la información** | **Riesgo de privacidad y de seguridad de la información** | Cl. 6.1.2 d.1 obliga a evaluar el impacto potencial en la organización y en los **titulares de los datos (*PII principals*)**. |
| 5 | **Propietario del riesgo (*Risk owner*)** | **Propietario del riesgo de privacidad (*Privacy risk owner*)** | Cl. 6.1.2 c.2 y 6.1.3 g asignan formalmente la gestión de riesgos a dueños de procesos con datos personales. |
| 6 | **Partes interesadas** | **Partes interesadas (con inclusión explícita de los Titulares / *PII Principals*)** | Cl. 4.2: Mandato taxativo de considerar a alumnos, postulantes, docentes, personal y a la ANPD Perú. |
| 7 | **Incidente de seguridad** | **Incidente de seguridad de la información / Brecha de PII (*PII breach*)** | Distinción operativa conforme a Guía B.3.12 entre eventos generales y vulneración efectiva de datos personales. |
| 8 | **[nombre de la organización]** | **Universidad Nacional de San Agustín de Arequipa (UNSA)** | Remplazo determinista institucional en encabezados, portadas y cuerpo textual. |
| 9 | **[logo de la organización]** | Escudo institucional oficial de la UNSA (`assets/logo_unsa.png` o equivalente vectorial). | Posicionado en la parte superior izquierda o central de la portada. |
| 10 | **[nivel de confidencialidad]** | **Uso Interno / Confidencial SGPI** | Clasificación estándar de la información institucional según esquema de clasificación A.3.5. |

### 2.2 Mapeo de Cláusulas y Controles Normativos

| Cláusula ISO 27001 (Plantilla Instructor) | Cláusula ISO/IEC 27701:2025 Equivalente | Controles de Referencia ISO 27701:2025 (Anexo A) | Regla de Conversión en Moldes |
| :--- | :--- | :--- | :--- |
| **Capítulo 4 (Contexto)** | **Cláusula 4: Contexto de la Organización** | A.3.4 (Roles), Cl. 4.1 a 4.4 | Mapear alcance a Arequipa y Filiales (Camaná y Majes). |
| **Capítulo 5 (Liderazgo)** | **Cláusula 5: Liderazgo y Compromiso** | A.3.3 (Políticas), Cl. 5.1 a 5.3 | Liderado por Rectorado y Comité de Privacidad. |
| **Capítulo 6.1.2 (Evaluación de riesgos)** | **Cláusula 6.1.2: Evaluación del riesgo de privacidad** | A.1.2.6, A.3.11, A.3.13; ref. ISO/IEC 27557 e ISO 31000 | **Evaluar consecuencias en titulares (*PII principals*)**. |
| **Capítulo 6.1.3 (Tratamiento del riesgo)** | **Cláusula 6.1.3: Tratamiento del riesgo de privacidad** | **Tabla A.1** (31 controles Responsable) + **Tabla A.3** (29 controles seguridad). **Tabla A.2 EXCLUIDA**. | Citar Tablas A.1 y A.3; justificar exclusión de A.2 por no ser Encargado (*Processor*). |
| **Capítulo 7.2 / 7.3 (Competencia y Conciencia)**| **Cláusula 7.2 (Competencia) y 7.3 (Toma de conciencia)**| Control A.3.17 (Concientización y formación en PII) | Formación en deberes de confidencialidad y reporte de incidentes. |
| **Capítulo 7.5 (Información documentada)** | **Cláusula 7.5: Información documentada (7.5.1, 7.5.2, 7.5.3)**| Controles A.3.14 (Protección de registros), A.1.4.8, A.1.4.9 | Formato, versionado, retención y disposición segura. |
| **Capítulo 8.2 / 8.3 (Operación de riesgos)** | **Cláusulas 8.2 (Evaluación) y 8.3 (Tratamiento de riesgos)**| Anexo A Controles seleccionados | Ejecución formal y conservación de registros de evaluación. |
| **Capítulo 10.1 / 10.2 (No conformidad y CAPA)**| **Cláusula 10.1 (Mejora continua) y 10.2 (No conformidad y CAPA)**| Control A.3.16 (Revisión de cumplimiento) | Tratamiento de no conformidades derivadas de auditorías o brechas. |
| **Anexo A ISO 27001 (114 controles / A.5 a A.18)**| **Anexo A ISO 27701:2025: Tablas A.1 y A.3** | Tabla A.1 (A.1.2.2 a A.1.5.5) + Tabla A.3 (A.3.3 a A.3.31) | **Sustituir referencias viejas tipo A.5.1.1 o A.12.1.1 por códigos 27701**. |

### 2.3 Expansión de la Tríada CIA a Consecuencias de Privacidad

En ISO/IEC 27001:2013 tradicional, el análisis de impacto se basaba únicamente en la tríada **CIA**:
- **C**onfidencialidad (*Confidentiality*)
- **I**ntegridad (*Integrity*)
- **D**isponibilidad (*Availability*)

**Mandato obligatorio en ISO/IEC 27701:2025 (Cl. 6.1.2 d.1 y Guía B.3.12)**:
1. **Doble perspectiva de consecuencias**:
   - Impacto sobre la **organización** (sanciones regulatorias ANPD, daños reputacionales, parálisis académica).
   - Impacto directo sobre los **titulares de los datos personales (*PII principals*)** (discriminación, usurpación de identidad, pérdidas económicas, daño moral, vulneración de intimidad de estudiantes y docentes).
2. **Dimensiones de afectación en brechas de datos (B.3.12)**:
   - **Indisponibilidad** (*Unavailability*).
   - **Pérdida o destrucción** (*Loss / Destruction*).
   - **Divulgación no autorizada** (*Disclosure* / Exfiltración).
   - **Alteración no autorizada** (*Alteration* / Corrupción).
3. **Desmitificación de GDPR y la regla de 72 horas**:
   - El estándar ISO 27701:2025 reconoce la primacía de la legislación nacional. Para la UNSA, el marco legal vinculante es la **Ley N° 29733 (Ley de Protección de Datos Personales del Perú)** y su reglamento (D.S. 003-2013-JUS). No debe forzarse el reloj de 72 horas de GDPR en textos normativos salvo como buena práctica de comunicación oportuna ante la ANPD.

### 2.4 Transición del Historial de Versiones (Kosutic → Era UNSA)

En las plantillas comerciales del instructor, la tabla de historial incluye:
- `Fecha`: `DD-MM-AAAA`
- `Versión`: `0.1`
- `Creado por`: `Dejan Kosutic`
- `Descripción de la modificación`: `Descripción básica del documento`

**Regla de Transición en los Moldes UNSA**:
- Eliminar la fila de `Dejan Kosutic / 0.1 / 2015`.
- Reemplazar por la historia oficial del proyecto UNSA:
  - `Fecha`: `16-11-2026`
  - `Versión`: `1.0`
  - `Creado por`: `Oficial de Seguridad de la Información (OSI) / Equipo SGPI Grupo 4`
  - `Descripción de la modificación`: `Emisión inicial y formalización del documento para el Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA bajo ISO/IEC 27701:2025.`
- Dejar filas posteriores en blanco para futuras revisiones de auditoría.

### 2.5 Directrices Tipográficas y Sustitución de Fuentes (Calibri → Liberation Sans)

Las plantillas docx del instructor señalan expresamente en su texto: *"El texto del documento se escribe utilizando fuente Calibri, tamaño 11. Los títulos de capítulo se escriben con tamaño de fuente 14 y en negrita; mientras que para los títulos de capítulo nivel 2 se utiliza el tamaño de fuente 12 en negrita. Los títulos de capítulo nivel 3 se escriben con tamaño de fuente 11, en negrita y cursiva."*

**Regla Técnica para Moldes Typst en Linux**:
- **Fuente Principal**: Usar `#set text(font: "Liberation Sans", size: 11pt, lang: "es")` (sustituto métrico idéntico y estándar libre de Calibri en entornos Linux).
- **Heading 1 (Título Nivel 1)**: `size: 14pt, weight: "bold"`.
- **Heading 2 (Título Nivel 2)**: `size: 12pt, weight: "bold"`.
- **Heading 3 (Título Nivel 3)**: `size: 11pt, weight: "bold", style: "italic"`.
- **Párrafos normales**: `size: 11pt, leading: 0.65em, justify: true`.
- **Tablas**: Texto de celdas en `size: 9.5pt` o `10pt` para garantizar legibilidad y evitar saltos de línea antiestéticos. Cabecera en negrita con fondo tenue gris `#f0f2f5`.

### 2.6 Invariantes Estructurales (Lo que NUNCA debe cambiar)

1. **Secuencia de Capítulos**: No alterar el orden de los capítulos 1, 2, 3, etc. ni de los subcapítulos.
2. **Forma y Columnas de las Tablas**: La cantidad y el orden de las columnas en las tablas de metadatos, historial, inventarios y formularios deben ser exactamente los mismos del instructor.
3. **Sección de Documentos de Referencia**: Conservar la lista de políticas institucionales y normas vinculadas, sustituyendo únicamente los códigos normativos obsoletos.
4. **Criterios de Evaluación y Aceptación**: La escala matemática (0 a 2 para consecuencia/probabilidad; 0-2 aceptable, 3-4 no aceptable) debe preservarse idéntica a la plantilla del instructor.
5. **Bloques de Firma y Validez**: Mantener la estructura de cierre con propietario, criterios de efectividad, fecha de vigencia y raya para firma.

---

## 3. Inventario Exhaustivo por Plantilla (Las 9 Fuentes Oficiales)

A continuación se detalla la transcripción literal y el etiquetado exhaustivo de cada sección, tabla y campo para cada una de las 9 plantillas del instructor.  
**Etiquetas de Acción Obligatorias**:
- `[KEEP-AS-IS]`: Mantener texto, formato, escala o columna idéntico al original.
- `[CONVERT-27001→27701]`: Modificar referencia normativa, terminología SGSI→SGPI o cita de control según la regla especificada.
- `[FILL-UNSA-ROLE]`: Asignar el cargo oficial, unidad organizativa o dato institucional de la UNSA especificado.

---

### Plantilla 1: Procedimiento para Control de Documentos y Registros (`G4-PRC-DOC-01`)
- **Archivo fuente**: `docs/templates/Procedimiento_para_control_de_documentos_y_registros_ES.docx`
- **Slug de render**: `procedimiento-para-control-de-documentos-y-registros`
- **Páginas de referencia**: 8 páginas (`p01.png` a `p08.png`)

#### Elementos de Portada y Encabezados
- `[logo de la organización]` → Escudo oficial de la UNSA `[FILL-UNSA-ROLE]`
- `[nombre de la organización]` → `Universidad Nacional de San Agustín de Arequipa (UNSA)` `[FILL-UNSA-ROLE]`
- `PROCEDIMIENTO PARA CONTROL DE DOCUMENTOS Y REGISTROS` → Título centrado en mayúsculas `[KEEP-AS-IS]`
- **Tabla de Metadatos de Control (Tabla 1: 6 filas × 2 col)**:
  - Fila 1: `Código:` | `G4-PRC-DOC-01` `[FILL-UNSA-ROLE]`
  - Fila 2: `Versión:` | `1.0` `[FILL-UNSA-ROLE]`
  - Fila 3: `Fecha de la versión:` | `16-11-2026` `[FILL-UNSA-ROLE]`
  - Fila 4: `Creado por:` | `Oficial de Seguridad de la Información (OSI) / DPO` `[FILL-UNSA-ROLE]`
  - Fila 5: `Aprobado por:` | `Rectorado / Comité SGPI` `[FILL-UNSA-ROLE]`
  - Fila 6: `Nivel de confidencialidad:` | `Uso Interno / Confidencial SGPI` `[FILL-UNSA-ROLE]`

#### Historial de Modificaciones (Tabla 2: 8 filas × 4 col)
- Columnas: `Fecha` | `Versión` | `Creado por` | `Descripción de la modificación` `[KEEP-AS-IS]`
- Fila 1 (Instructor): `DD-MM-AAAA` | `0.1` | `Dejan Kosutic` | `Descripción básica del documento` → **CONVERTIR** a: `16-11-2026` | `1.0` | `Oficial de Seguridad (OSI/DPO)` | `Formalización inicial del procedimiento para el SGPI bajo ISO/IEC 27701:2025.` `[CONVERT-27001→27701]`
- Filas 2 a 8: Celdas vacías reservadas para futuras actualizaciones `[KEEP-AS-IS]`.

#### Tabla de Contenido
- `Tabla de contenido` `[KEEP-AS-IS]`
  - `1. Objetivo, alcance y usuarios`
  - `2. Documentos de referencia`
  - `3. Control de documentos internos`
    - `3.1. Formato de los documentos`
    - `3.2. Aprobación de documentos`
    - `3.3. Publicación y distribución de documentos; retiro de circulación`
      - `3.3.1. Documentos con el nivel de confidencialidad más bajo`
      - `3.3.2. Documentos con mayor nivel de confidencialidad`
    - `3.4. Actualizaciones de documentos`
    - `3.5. Control de registros`
  - `4. Documentos externos`
  - `5. Gestión de registros guardados en base a este documento`
  - `6. Validez y gestión de documentos`

#### Inventario Sección por Sección
- **1. Objetivo, alcance y usuarios** `[KEEP-AS-IS]`
  - Párrafo 1: Sustituir `Sistema de Gestión de Seguridad de la Información (SGSI) [Sistema de Gestión de Continuidad del Negocio – SGCN]` por `Sistema de Gestión de Privacidad de la Información (SGPI) de la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la norma ISO/IEC 27701:2025 y la Ley N° 29733 de Protección de Datos Personales del Perú`. `[CONVERT-27001→27701]`
  - Párrafo 2: Alcance a todos los documentos y registros del SGPI creados en la UNSA o de origen externo, almacenados en soporte físico o digital. `[FILL-UNSA-ROLE]`
  - Párrafo 3: Usuarios: Todos los colaboradores, autoridades, docentes, administrativos y personal técnico de la UNSA incluidos en el alcance del SGPI. `[FILL-UNSA-ROLE]`
- **2. Documentos de referencia** `[KEEP-AS-IS]`
  - `Norma ISO/IEC 27001, punto 7.5` → Sustituir por: `Norma ISO/IEC 27701:2025, subcláusulas 7.5.1, 7.5.2 y 7.5.3 (Información documentada)` `[CONVERT-27001→27701]`
  - `Norma ISO 22301, punto 7.5` → Eliminar o mantener como referencia accesoria de continuidad operativa. `[KEEP-AS-IS]`
  - `Norma BS 25999-2, puntos 3.4.2 y 3.4.3` → Eliminar (norma obsoleta superada por ISO 22301). `[CONVERT-27001→27701]`
  - `Política de seguridad de la información` → `Política de Privacidad de la Información de la UNSA (G4-POL-01)` `[CONVERT-27001→27701]`
  - `Política para manejo de información clasificada` → `Política de Clasificación y Manejo de Información y Datos Personales de la UNSA` `[FILL-UNSA-ROLE]`
- **3. Control de documentos internos** `[KEEP-AS-IS]`
  - **3.1 Formato de los documentos**: Mantener especificación de fuentes y jerarquías (14pt Heading 1, 12pt Heading 2, 11pt Heading 3). Citar sustitución de Calibri por `Liberation Sans`. `[CONVERT-27001→27701]`
  - **3.2 Aprobación de documentos**: `[cargo]` → `Rectorado / Dirección General de Administración (DGA)` previa conformidad técnica del `Oficial de Seguridad / DPO`. `[FILL-UNSA-ROLE]`
  - **3.3 Publicación y distribución de documentos; retiro de circulación**:
    - *3.3.1 Documentos con el nivel de confidencialidad más bajo*: Publicación en portal web/intranet UNSA por la `Secretaría Técnica SGPI / DUTIC`. `[FILL-UNSA-ROLE]`
    - *3.3.2 Documentos con mayor nivel de confidencialidad*: Restringidos a listas de distribución autorizadas. `[KEEP-AS-IS]`
  - **3.4 Actualizaciones de documentos**: Responsabilidad del propietario del documento; revisión mínima anual; uso de control de cambios e historial de modificaciones. `[KEEP-AS-IS]`
  - **3.5 Control de registros**: Definición de los 5 campos obligatorios: (1) título, (2) ubicación, (3) responsable, (4) controles de protección, (5) tiempo de retención. `[KEEP-AS-IS]`
- **4. Documentos externos** `[KEEP-AS-IS]`
  - Registro en mesa de partes / registro de correo entrante con los 5 campos prescritos. `[cargo]` → `Jefe de Mesa de Partes / Secretaría General`. `[FILL-UNSA-ROLE]`
- **5. Gestión de registros guardados en base a este documento (Tabla 3: 2 filas × 5 col)** `[KEEP-AS-IS]`
  - Columnas: `Nombre del registro` | `Ubicación de archivo` | `Persona responsable del archivo` | `Controles para la protección del registro` | `Tiempo de retención` `[KEEP-AS-IS]`
  - Fila 2: `Registro de correo entrante (Mesa de Partes Digital UNSA)` | `Servidor DUTIC / Carpeta SGPI-Documentos` | `Jefe de Mesa de Partes / Secretaría General` | `Control de acceso por roles (RBAC), logs inmutables` | `5 años conforme a ley peruana` `[FILL-UNSA-ROLE]`
- **6. Validez y gestión de documentos** `[KEEP-AS-IS]`
  - `Este documento es válido hasta el [fecha].` → `31-12-2027` `[FILL-UNSA-ROLE]`
  - Propietario del documento: `Oficial de Seguridad de la Información (OSI) / DPO` `[FILL-UNSA-ROLE]`
  - Criterios de efectividad: (1) documentos obsoletos, (2) documentos no distribuidos, (3) registros no archivados adecuadamente. `[KEEP-AS-IS]`
  - Bloque de firma: `Oficial de Seguridad de la Información (OSI) / DPO` | `Ing. Carlos Alberto Gomez` | `_____________________________` | `[firma]` `[FILL-UNSA-ROLE]`

---

### Plantilla 2: Procedimiento para Medidas Correctivas (`G4-PRC-CAPA-01`)
- **Archivo fuente**: `docs/templates/Procedimiento_para_medidas_correctivas_ES.docx`
- **Slug de render**: `procedimiento-para-medidas-correctivas`
- **Páginas de referencia**: 6 páginas (`p01.png` a `p06.png`)

#### Elementos de Portada y Encabezados
- Portada con escudo UNSA, título `PROCEDIMIENTO PARA MEDIDAS CORRECTIVAS` y Tabla 1 de Metadatos de Control (`Código: G4-PRC-CAPA-01`, `Versión: 1.0`, `Fecha: 16-11-2026`). `[FILL-UNSA-ROLE]`
- Tabla 2: Historial de modificaciones con fila UNSA Grupo 4 en reemplazo de Kosutic. `[CONVERT-27001→27701]`

#### Inventario Sección por Sección
- **1. Objetivo, alcance y usuarios** `[KEEP-AS-IS]`
  - Descripción de iniciación, implementación y registro de correcciones y medidas correctivas (CAPA). Reemplazar `SGSI` por `SGPI de la UNSA`. `[CONVERT-27001→27701]`
- **2. Documentos de referencia** `[KEEP-AS-IS]`
  - `Norma ISO/IEC 27001, punto 10,1` → Sustituir por: `Norma ISO/IEC 27701:2025, Cláusula 10.1 (Mejora continua) y 10.2 (No conformidad y acción correctiva)` `[CONVERT-27001→27701]`
  - `Norma ISO 22301, punto 10.1` y `BS 25999-2, punto 6.1` → Eliminar referencia obsoleta a BS; referenciar norma de auditoría `ISO 19011:2026`. `[CONVERT-27001→27701]`
  - `Procedimiento para auditoría interna` → `Programa e Informe de Auditoría Interna del SGPI (G4-PRG-AUD-01 / G4-REP-AUD-01)` `[CONVERT-27001→27701]`
  - `Procedimiento para gestión de incidentes` → `Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01)` `[CONVERT-27001→27701]`
- **3. Correcciones y medidas correctivas** `[KEEP-AS-IS]`
  - **3.1 No conformidades y correcciones**: Definición y contención inmediata. Incluir no conformidades derivadas de brechas de PII y observaciones de la ANPD. `[CONVERT-27001→27701]`
  - **3.2 Medidas correctivas**: Eliminación de la causa raíz para evitar recurrencia. Distinción explícita frente a la simple corrección inmediata. `[KEEP-AS-IS]`
  - **3.3 Implementación de medidas correctivas (Tabla 3: 10 filas × 2 col)**:
    - Columna 1: `Paso` | Columna 2: `Persona responsable de la implementación` `[KEEP-AS-IS]`
    - Paso 1: `Revisión de la no conformidad` → `Cualquiera con una función dentro del SGPI / Personal UNSA` `[CONVERT-27001→27701]`
    - Paso 2: `Determinación de la causa de la no-conformidad` → `Persona responsable del área donde se ha identificado la no-conformidad` `[KEEP-AS-IS]`
    - Paso 3: `Identificar si la no conformidad ya existía` → `Persona responsable del área` `[KEEP-AS-IS]`
    - Paso 4: `Evaluación de la necesidad de tomar acciones` → `Persona responsable del área` `[KEEP-AS-IS]`
    - Paso 5: `Determinación de las acciones necesarias` → `Persona responsable del área` `[KEEP-AS-IS]`
    - Paso 6: `Implementación de las acciones planificadas` → `Persona a cargo de la implementación designada` `[KEEP-AS-IS]`
    - Paso 7: `Revisión de efectividad de la medida tomada` → `Oficial de Seguridad de la Información (OSI) / DPO` `[FILL-UNSA-ROLE]`
    - Paso 8: `Modificación de la documentación si es aplicable` → `Propietario del documento / Secretaría Técnica SGPI` `[FILL-UNSA-ROLE]`
    - Paso 9: `Cierre formal de la medida correctiva` → `Oficial de Seguridad / DPO` `[FILL-UNSA-ROLE]`
- **4. Gestión de registros guardados en base a este documento (Tabla 4: 2 filas × 5 col)** `[KEEP-AS-IS]`
  - `Formulario para medidas correctivas` | `Repositorio Digital SGPI / PIMS Cloud` | `Oficial de Seguridad / DPO` | `Firma digital y bloqueo contra edición posterior` | `5 años` `[FILL-UNSA-ROLE]`
- **5. Validez y gestión de documentos** `[KEEP-AS-IS]`
  - Válido hasta: `31-12-2027`. Propietario: `Oficial de Seguridad de la Información (OSI) / DPO`. `[FILL-UNSA-ROLE]`
  - Criterios de efectividad: (1) medidas iniciadas, (2) medidas incompletas, (3) medidas no registradas en formulario oficial. `[KEEP-AS-IS]`
- **6. Apéndices** `[KEEP-AS-IS]`
  - Lista: `Apéndice: Formulario para medidas correctivas (G4-REG-CAPA-01)`. `[CONVERT-27001→27701]`
- **Bloque de firma**: `Oficial de Seguridad de la Información (OSI) / DPO` | `Ing. Carlos Alberto Gomez`. `[FILL-UNSA-ROLE]`

---

### Plantilla 3: Apéndice — Formulario para Medidas Correctivas (`G4-REG-CAPA-01`)
- **Archivo fuente**: `docs/templates/Apendice_Formulario_para_medidas_correctivas_ES.docx`
- **Slug de render**: `apendice-formulario-para-medidas-correctivas`
- **Páginas de referencia**: 2 páginas (`p01.png` y `p02.png`)

#### Elementos de Encabezado de Página
- Encabezado: `Universidad Nacional de San Agustín de Arequipa (UNSA) | Confidencial SGPI | G4-REG-CAPA-01 | Página X de Y` `[FILL-UNSA-ROLE]`
- Título: `Apéndice: Formulario para medidas correctivas` `[KEEP-AS-IS]`

#### Inventario Exhaustivo de Filas del Formulario (Tabla 1: 12 filas)
- **Fila 1**: `Medida correctiva nro.____` → Celda de ancho completo para código correlativo (ej. `CAPA-2026-001`). `[KEEP-AS-IS]`
- **Fila 2**: `Descripción de la no-conformidad:` → Área de texto para detalle del hallazgo o brecha. `[KEEP-AS-IS]`
- **Fila 3 (3 columnas)**:
  - Col 1: `No-conformidad identificada en:` (Área/Proceso UNSA) `[FILL-UNSA-ROLE]`
  - Col 2: `Nombre de la persona que identificó la no-conformidad:` `[KEEP-AS-IS]`
  - Col 3: `Firma:` `[KEEP-AS-IS]`
- **Fila 4**: `Causa de la no-conformidad:` → Análisis de causa raíz (árbol de causas / 5 Porqués). `[KEEP-AS-IS]`
- **Fila 5**: `Si ya existe una no conformidad similar, indique aquí su Medida correctiva Nro.:` `[KEEP-AS-IS]`
- **Fila 6**: `¿Es necesario tomar medidas correctivas? SÍ - NO (marcar con un círculo)` `[KEEP-AS-IS]`
- **Fila 7**: `Medida correctiva a implementar:` → Descripción detallada de las acciones de fondo. `[KEEP-AS-IS]`
- **Fila 8**: `¿Quién debe estar informado sobre la medida implementada?:` → Lista de partes informadas (DPO, Decanos, Jefes de Unidad). `[FILL-UNSA-ROLE]`
- **Fila 9 (3 columnas)**:
  - Col 1: `Aprobado por:` (Nombre y cargo del responsable del área / DPO) `[FILL-UNSA-ROLE]`
  - Col 2: `Fecha límite para la implementación:` `[KEEP-AS-IS]`
  - Col 3: `Persona responsable de la implementación:` `[KEEP-AS-IS]`
- **Fila 10 (2 columnas)**:
  - Col 1: `Medida correctiva implementada el:` (Fecha) `[KEEP-AS-IS]`
  - Col 2: `Firma:` (Del implementador) `[KEEP-AS-IS]`
- **Fila 11 (2 columnas)**:
  - Col 1: `Efectividad de la medida implementada revisada el:` (Fecha de revisión) `[KEEP-AS-IS]`
  - Col 2: `Firma:` (Del auditor / DPO evaluador) `[FILL-UNSA-ROLE]`
- **Fila 12 (2 columnas)**:
  - Col 1: `Si es necesario realizar cambios al documento, especifíquelos aquí:` (Identificar documentos del SGPI a actualizar) `[CONVERT-27001→27701]`
  - Col 2: `Firma:` (Del custodio documental) `[KEEP-AS-IS]`

---

### Plantilla 4: Metodología de Evaluación y Tratamiento de Riesgos (`G4-MET-RSK-01`)
- **Archivo fuente**: `docs/templates/Metodologia_de_evaluacion_y_tratamiento_de_riesgos_ES.docx`
- **Slug de render**: `metodologia-de-evaluacion-y-tratamiento-de-riesgos`
- **Páginas de referencia**: 9 páginas (`p01.png` a `p09.png`)

#### Elementos de Portada y Encabezados
- Portada con escudo UNSA, título `METODOLOGÍA DE EVALUACIÓN Y TRATAMIENTO DE RIESGOS` y Tabla 1 de Metadatos (`Código: G4-MET-RSK-01`, `Versión: 1.0`, `Fecha: 16-11-2026`). `[FILL-UNSA-ROLE]`
- Tabla 2: Historial de modificaciones con fila institucional UNSA. `[CONVERT-27001→27701]`

#### Inventario Sección por Sección
- **1. Objetivo, alcance y usuarios** `[KEEP-AS-IS]`
  - Párrafo 1: Sustituir `norma ISO/IEC 27001` por `norma ISO/IEC 27701:2025 y referencias ISO/IEC 27557 e ISO 31000`. `[CONVERT-27001→27701]`
  - Párrafo 2: Alcance a todos los activos de información y tratamientos de datos personales (PII) en Arequipa y filiales. `[FILL-UNSA-ROLE]`
  - Párrafo 3: Usuarios: Propietarios de activos, dueños de riesgos de privacidad, líderes de proceso y equipo de seguridad. `[FILL-UNSA-ROLE]`
- **2. Documentos de referencia** `[KEEP-AS-IS]`
  - `Norma ISO/IEC 27001, capítulos 6.1.2, 6.1.3, 8.2, y 8.3` → Sustituir por: `Norma ISO/IEC 27701:2025, capítulos 6.1.2, 6.1.3, 8.2 y 8.3; ISO/IEC 27557:2022 (Gestión de riesgos de privacidad organizacional); ISO 31000:2018`. `[CONVERT-27001→27701]`
  - `Política de seguridad de la información` → `Política de Privacidad de la Información (G4-POL-01)` `[CONVERT-27001→27701]`
  - `Lista de requisitos legales, normativos y contractuales` → `Matriz de Requisitos Legales y Regulatorios ANPD` `[FILL-UNSA-ROLE]`
  - `Política de seguridad para proveedores` → `Política de Seguridad y Privacidad en la Relación con Proveedores y Terceros` `[CONVERT-27001→27701]`
  - `Declaración de aplicabilidad` → `Declaración de Aplicabilidad del SGPI (G4-SOA-01)` `[CONVERT-27001→27701]`
- **3. Metodología de evaluación y tratamiento de riesgos** `[KEEP-AS-IS]`
  - **3.1 Evaluación de riesgos**:
    - *3.1.1 El proceso*: Coordinado por el `Oficial de Seguridad de la Información (OSI) / DPO`. `[FILL-UNSA-ROLE]`
    - *3.1.2 Activos, vulnerabilidades y amenazas*: Incluir bancos de datos personales (estudiantes, docentes, postulantes, egresados). `[CONVERT-27001→27701]`
    - *3.1.3 Identificación de los propietarios de riesgos*: Propietarios de riesgos de privacidad designados por unidad. `[CONVERT-27001→27701]`
    - *3.1.4 Consecuencias y probabilidad*:
      - **Tabla 3 (Escala de Consecuencia: 3 filas × 3 col)**:
        - `Baja consecuencia` | `0` | `La afectación a la confidencialidad, integridad o disponibilidad no genera impacto adverso significativo sobre los titulares de datos ni sobre la UNSA.` `[CONVERT-27001→27701]`
        - `Consecuencia moderada` | `1` | `Existe afectación leve o moderada a los derechos de los titulares de datos (molestias, reclamaciones) o gastos menores y repercusión administrativa para la UNSA.` `[CONVERT-27001→27701]`
        - `Alta consecuencia` | `2` | `Impacto grave e irreversible sobre los titulares (suplantación, discriminación, daño moral grave) o multas severas de la ANPD, daño reputacional mayúsculo o parálisis operativa.` `[CONVERT-27001→27701]`
      - **Tabla 4 (Escala de Probabilidad: 3 filas × 3 col)**:
        - `Baja probabilidad` | `0` | `Controles de seguridad robustos implementados; no se esperan incidentes nuevos.` `[KEEP-AS-IS]`
        - `Probabilidad moderada` | `1` | `Controles moderados; ocurrencia posible pero poco probable.` `[KEEP-AS-IS]`
        - `Alta probabilidad` | `2` | `Controles deficientes o inexistentes; alta probabilidad de ocurrencia.` `[KEEP-AS-IS]`
      - Fórmula: `Nivel de Riesgo = Consecuencia + Probabilidad` (Escala 0 a 4). `[KEEP-AS-IS]`
  - **3.2 Criterios para la aceptación de riesgos**:
    - `0, 1 y 2`: Riesgos aceptables. `[KEEP-AS-IS]`
    - `3 y 4`: Riesgos no aceptables (requieren tratamiento obligatorio). `[KEEP-AS-IS]`
  - **3.3 Tratamiento del riesgo**:
    - Opciones: (1) Elección de controles de las **Tablas A.1 y A.3 de ISO/IEC 27701:2025** `[CONVERT-27001→27701]`, (2) Transferencia, (3) Evitar el riesgo, (4) Aceptación formal por Rectorado/Comité. `[KEEP-AS-IS]`
  - **3.4 Revisiones periódicas**: Al menos una vez al año o tras incidentes graves de privacidad. `[KEEP-AS-IS]`
  - **3.5 Declaración de aplicabilidad y Plan de tratamiento**: Preparados por el OSI/DPO y aprobados por la Alta Dirección. `[FILL-UNSA-ROLE]`
  - **3.6 Informes**: Informe sobre evaluación y tratamiento emitido a la Alta Dirección. `[FILL-UNSA-ROLE]`
- **4. Gestión de registros guardados en base a este documento (Tabla 5: 6 filas × 5 col)** `[KEEP-AS-IS]`
  - Registros listados: (1) Cuadro de evaluación de riesgos, (2) Cuadro de tratamiento de riesgos, (3) Informe de evaluación y tratamiento, (4) Declaración de aplicabilidad (SoA), (5) Plan de tratamiento de riesgos. Todos bajo custodia del OSI/DPO en repositorio seguro con retención permanente o mínima de 3 a 5 años. `[FILL-UNSA-ROLE]`
- **5. Validez y gestión de documentos**: Válido hasta `31-12-2027`. Criterios de efectividad basados en incidentes no contemplados y riesgos no tratados. `[FILL-UNSA-ROLE]`
- **6. Apéndices**: Apéndice 1 (Cuadro evaluación), Apéndice 2 (Cuadro tratamiento), Apéndice 3 (Informe). `[KEEP-AS-IS]`
- **Bloque de firma**: `Oficial de Seguridad de la Información (OSI) / DPO` | `Ing. Carlos Alberto Gomez`. `[FILL-UNSA-ROLE]`

---

### Plantilla 5: Plan de Capacitación y Concienciación (`G4-CAP-INC-01`)
- **Archivo fuente**: `docs/templates/Plan_de_capacitacion_y_concienciacion_ES.docx`
- **Slug de render**: `plan-de-capacitacion-y-concienciacion`
- **Páginas de referencia**: 3 páginas (`p01.png` a `p03.png`)

#### Elementos de Encabezado y Texto Inicial
- Encabezado: `Universidad Nacional de San Agustín de Arequipa (UNSA) | Confidencial SGPI | G4-CAP-INC-01 | Página X de Y` `[FILL-UNSA-ROLE]`
- Título: `Plan de capacitación y concienciación` `[KEEP-AS-IS]`
- Párrafo 1: Objetivo de capacitar al personal para que cumpla sus responsabilidades en la seguridad de la información y la protección de datos personales. `[CONVERT-27001→27701]`
- Párrafo 2: Concienciación sobre el valor de la privacidad, los derechos de los titulares de datos y las consecuencias de infringir la normativa (sanciones disciplinarias y multas ANPD). Métodos: inducción, talleres interactivos, campañas por correo institucional, infografías y e-learning. `[CONVERT-27001→27701]`
- Párrafo 3: Cronograma de implementación programado de enero a diciembre. `[KEEP-AS-IS]`

#### Inventario de Tablas
- **Tabla 1: Matriz de Necesidades de Capacitación (23 filas × 6 col)** `[KEEP-AS-IS]`
  - Columna 1: `Cargo o nombre` (Ej. Oficial de Seguridad, Administradores de BD, Personal de Mesa de Partes, Docentes) `[FILL-UNSA-ROLE]`
  - Columna 2: `Conocimientos y habilidades necesarias para la privacidad y protección de PII` `[CONVERT-27001→27701]`
  - Columna 3: `Qué capacitación es necesaria` (Curso ISO 27701, Gestión de Brechas, Atención de Derechos ARCO) `[CONVERT-27001→27701]`
  - Columna 4: `Registro de implementación de capacitación necesaria` (Código de Registro de Asistencia G4-REG-CAP-01) `[FILL-UNSA-ROLE]`
  - Columna 5: `¿Se han logrado los objetivos de la capacitación?` (SÍ / NO / Evaluación de efectividad) `[KEEP-AS-IS]`
  - Columna 6: `Conocimientos, habilidades y experiencia logrados` `[KEEP-AS-IS]`
- **Tabla 2: Cronograma Anual de Concienciación (11 filas × 13 col)** `[KEEP-AS-IS]`
  - Columna 1: `Método de concienciación` | Columnas 2 a 13: `Enero`, `Febrero`, `Marzo`, `Abril`, `Mayo`, `Junio`, `Julio`, `Agosto`, `Septiembre`, `Octubre`, `Noviembre`, `Diciembre` `[KEEP-AS-IS]`
  - Filas de métodos: `Día informativo de la Privacidad`, `Capacitación inicial a nuevos colaboradores`, `Capacitación periódica de empleados`, `Artículos en Intranet / Portal Web`, `Boletín electrónico mensual`, `Simulacro de reporte de brechas de datos`, `Píldoras formativas de ciberseguridad`. `[CONVERT-27001→27701]`

#### Sección de Responsabilidades y Cierre
- Párrafo 7: `Responsabilidades:` `[KEEP-AS-IS]`
- Párrafo 8: `El [cargo] es responsable de coordinar toda la capacitación...` → `Oficial de Seguridad / DPO` en coordinación con la `Subdirección de Personal / RRHH`. `[FILL-UNSA-ROLE]`
- Párrafo 9: `El [cargo] es el responsable de llevar los registros...` → `Subdirección de Personal / RRHH`. `[FILL-UNSA-ROLE]`
- Párrafo 10: `El [cargo] es el responsable de evaluar el logro de los objetivos...` → `Oficial de Seguridad / DPO`. `[FILL-UNSA-ROLE]`
- Párrafo 11: Archivo y retención: Custodiado por `Subdirección de Personal` y `DPO` en archivo digital SGPI; retención mínima por `5 años`. `[FILL-UNSA-ROLE]`

---

### Plantilla 6: Plan de Tratamiento del Riesgo (`G4-PLN-RSK-01`)
- **Archivo fuente**: `docs/templates/Plan_de_tratamiento_del_riesgo_ES.docx`
- **Slug de render**: `plan-de-tratamiento-del-riesgo`
- **Páginas de referencia**: 2 páginas (`p01.png` y `p02.png`)

#### Elementos de Encabezado y Texto Inicial
- Encabezado: `Universidad Nacional de San Agustín de Arequipa (UNSA) | Confidencial SGPI | G4-PLN-RSK-01 | Página X de Y` `[FILL-UNSA-ROLE]`
- Título: `Plan de tratamiento del riesgo` `[KEEP-AS-IS]`
- Párrafo inicial: Reemplazar `Para cumplir los objetivos del SGSI...` por `Para cumplir los objetivos del Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA y reducir los riesgos sobre los titulares de datos a niveles aceptables, es necesario realizar las siguientes actividades:` `[CONVERT-27001→27701]`

#### Inventario de Tablas
- **Tabla 1: Matriz Operativa de Actividades de Tratamiento (25 filas × 7 col)** `[KEEP-AS-IS]`
  - Columna 1: `Descripción de actividades` (Implementación de controles técnicos de la Tabla A.3 o controles de privacidad de la Tabla A.1 de ISO/IEC 27701:2025) `[CONVERT-27001→27701]`
  - Columna 2: `Recursos generales y financieros necesarios` (Presupuesto asignado UNSA, licenciamiento, infraestructura) `[FILL-UNSA-ROLE]`
  - Columna 3: `Persona responsable` (Jefe de Seguridad, Administrador de Redes, Administrador de BD, etc.) `[FILL-UNSA-ROLE]`
  - Columna 4: `Plazos de inicio y finalización` (Fechas DD/MM/AAAA) `[KEEP-AS-IS]`
  - Columna 5: `Programas de capacitación y concienciación` (Vinculación con G4-CAP-INC-01) `[CONVERT-27001→27701]`
  - Columna 6: `Método para evaluación de resultados` (Auditoría de efectividad, métricas de control) `[KEEP-AS-IS]`
  - Columna 7: `Estado` (Planificado / En progreso / Completado / Demorado) `[KEEP-AS-IS]`

#### Bloque de Firma y Aprobación
- Bloque de cierre formal:
  - Cargo: `Rector de la Universidad Nacional de San Agustín de Arequipa / Presidente del Comité SGPI` `[FILL-UNSA-ROLE]`
  - Nombre: `Dr. Hugo Jose Rojas Flores` `[FILL-UNSA-ROLE]`
  - Línea de firma: `_________________________` | `[firma]` `[KEEP-AS-IS]`

---

### Plantilla 7: Apéndice 1 — Cuadro de Evaluación de Riesgos (Excel) (`G4-RSK-INC-01`)
- **Archivo fuente**: `docs/templates/Apendice_1_Cuadro_de_evaluacion_de_riesgos_ES.xlsx`
- **Slug de render**: `apendice-1-cuadro-de-evaluacion-de-riesgos`
- **Hojas y páginas de referencia**: 4 hojas completas (`p01.png` a `p04.png`) vía `SinglePageSheets`

#### Hoja 1: `Cuadro de evaluación de riesgos` (`p01.png`)
- Encabezado institucional: `Universidad Nacional de San Agustín de Arequipa (UNSA)` | `Confidencial SGPI` `[FILL-UNSA-ROLE]`
- Título de hoja: `Cuadro de evaluación de riesgos` `[KEEP-AS-IS]`
- Período: `Implementado desde el [fecha] hasta el [fecha]` → `Implementado desde el 01/11/2026 hasta el 31/12/2027` `[FILL-UNSA-ROLE]`
- **Columnas de la Matriz (Fila 3, 10 columnas obligatorias)**:
  1. `No` (Número correlativo) `[KEEP-AS-IS]`
  2. `Nombre del activo` (Incluir bases de datos de PII: SISACAD, ERP UNSA, etc.) `[CONVERT-27001→27701]`
  3. `Propietario del activo` (Dirección de Escuela, DGA, etc.) `[FILL-UNSA-ROLE]`
  4. `Amenaza` (Seleccionada del catálogo de amenazas) `[KEEP-AS-IS]`
  5. `Vulnerabilidad` (Seleccionada del catálogo de vulnerabilidades) `[KEEP-AS-IS]`
  6. `Propietario del riesgo` (Designado institucionalmente) `[FILL-UNSA-ROLE]`
  7. `Consecuencia` (Valores 0, 1 o 2 considerando impacto en titulares de datos) `[CONVERT-27001→27701]`
  8. `Probabilidad` (Valores 0, 1 o 2) `[KEEP-AS-IS]`
  9. `Riesgo` (Fórmula automática: `Consecuencia + Probabilidad`; valores 0-4) `[KEEP-AS-IS]`
  10. `Controles existentes` (Salvaguardas actualmente operativas en la UNSA) `[FILL-UNSA-ROLE]`

#### Hoja 2: `Categorías` (`p02.png`)
- Título: `Categorías de activos` `[KEEP-AS-IS]`
- Nota preliminar de alcance institucional `[KEEP-AS-IS]`
- Categorías extraídas:
  - `Personas`: Alta dirección, mandos intermedios, especialistas, personal administrativo, estudiantes, terceros. `[FILL-UNSA-ROLE]`
  - `Aplicaciones y bases de datos`: Sistemas académicos, portales de admisión, nóminas, servidores SQL, bases de datos de investigación. `[FILL-UNSA-ROLE]`
  - `Equipos y hardware`: Servidores en Centro de Datos DUTIC, laptops, terminales de oficina. `[FILL-UNSA-ROLE]`
  - `Infraestructura y redes`: Enlaces de campus, fibra óptica, gabinetes, filiales Camaná y Majes. `[FILL-UNSA-ROLE]`
  - `Soportes físicos y papel`: Expedientes académicos de grado, registros físicos de matrícula. `[FILL-UNSA-ROLE]`

#### Hoja 3: `Amenazas` (`p03.png`)
- Título: `Catálogo de amenazas` `[KEEP-AS-IS]`
- Catálogo de 51 amenazas del instructor (desde *Modificación accidental de datos* hasta *Vandalismo*) `[KEEP-AS-IS]`.
- Enriquecimiento obligatorio para ISO 27701: Incorporar amenazas de privacidad específicas: *Exfiltración masiva de datos personales*, *Tratamiento para fines incompatibles*, *Acceso no autorizado de operadores*, *Pérdida de trazabilidad de consentimientos*. `[CONVERT-27001→27701]`

#### Hoja 4: `Vulnerabilidades` (`p04.png`)
- Título: `Catálogo de vulnerabilidades` `[KEEP-AS-IS]`
- Catálogo de 55 vulnerabilidades del instructor (desde *Sesiones activas fuera de horario* hasta *Contraseñas inseguras*) `[KEEP-AS-IS]`.
- Enriquecimiento obligatorio para ISO 27701: Incorporar vulnerabilidades de privacidad: *Ausencia de mecanismos para revocación de consentimiento*, *Retención indefinida de logs de usuarios*, *Carencia de seudonimización en entornos de desarrollo/pruebas*. `[CONVERT-27001→27701]`

---

### Plantilla 8: Apéndice 2 — Cuadro de Tratamiento de Riesgos (Excel) (`G4-PLN-RSK-01`)
- **Archivo fuente**: `docs/templates/Apendice_2_Cuadro_de_tratamiento_de_riesgos_ES.xlsx`
- **Slug de render**: `apendice-2-cuadro-de-tratamiento-de-riesgos`
- **Hojas y páginas de referencia**: 3 hojas completas (`p01.png` a `p03.png`) vía `SinglePageSheets`

#### Hoja 1: `Cuadro tratamiento riesgos` (`p01.png`)
- Encabezado: `Universidad Nacional de San Agustín de Arequipa (UNSA)` | `Confidencial SGPI` `[FILL-UNSA-ROLE]`
- Título: `Cuadro de tratamiento de riesgos` `[KEEP-AS-IS]`
- **Estructura de Cabecera de 2 Niveles (Filas 3 y 4, 14 columnas)**:
  - Nivel Superior (Fila 3):
    - Columnas 1 a 6: `Activos / amenazas / vulnerabilidades`
    - Columnas 7 a 9: `Valores antes del tratamiento`
    - Columnas 10 y 11: `Tratamiento del riesgo`
    - Columnas 12 a 14: `Valores después del tratamiento`
  - Nivel Detallado (Fila 4):
    1. `Cantidad` (Índice o correlativo) `[KEEP-AS-IS]`
    2. `Nombre del activo` (Banco de datos / activo) `[CONVERT-27001→27701]`
    3. `Propietario del activo` `[FILL-UNSA-ROLE]`
    4. `Amenaza` `[KEEP-AS-IS]`
    5. `Vulnerabilidad` `[KEEP-AS-IS]`
    6. `Propietario del riesgo` `[FILL-UNSA-ROLE]`
    7. `Consecuencia` (Pre-tratamiento, 0-2) `[KEEP-AS-IS]`
    8. `Probabilidad` (Pre-tratamiento, 0-2) `[KEEP-AS-IS]`
    9. `Riesgo` (Pre-tratamiento, 3 o 4) `[KEEP-AS-IS]`
    10. `Elección de opciones` (Opciones 1 a 4) `[KEEP-AS-IS]`
    11. `Medios de implementación` (Controles ISO 27701 Tablas A.1 y A.3 seleccionados) `[CONVERT-27001→27701]`
    12. `Consecuencia` (Residual post-tratamiento, 0-1) `[KEEP-AS-IS]`
    13. `Probabilidad` (Residual post-tratamiento, 0-1) `[KEEP-AS-IS]`
    14. `Riesgo` (Riesgo residual aceptable, 0-2) `[KEEP-AS-IS]`

#### Hoja 2: `Opciones` (`p02.png`)
- Título: `Opciones para el tratamiento de riesgos` `[KEEP-AS-IS]`
- Lista de 4 opciones estándar:
  1. `1. Elección de controles` (Controles Tablas A.1 y A.3 de ISO/IEC 27701:2025) `[CONVERT-27001→27701]`
  2. `2. Transferencia de riesgos a terceros` (Pólizas, contratos con cláusulas DPA) `[KEEP-AS-IS]`
  3. `3. Evitar el riesgo` (Cese de tratamientos desproporcionados) `[KEEP-AS-IS]`
  4. `4. Aceptación del riesgo` (Aprobación formal de riesgos residuales por Rectorado) `[FILL-UNSA-ROLE]`

#### Hoja 3: `Controles` (`p03.png`)
- Título original: `Controles de acuerdo al Anexo A de la norma ISO/IEC 27001` → **CONVERTIR OBLIGATORIAMENTE** a: `Catálogo de Controles de ISO/IEC 27701:2025 (Tablas A.1 y A.3)` `[CONVERT-27001→27701]`
- Reemplazar la lista obsoleta de 114 controles de 27001 (A.5 a A.18) por:
  - **Tabla A.1 (31 controles para PII Controllers)**: A.1.2.2 a A.1.5.5 (Gobernanza, obligaciones hacia titulares, privacidad por diseño y transferencias). `[CONVERT-27001→27701]`
  - **Tabla A.3 (29 controles de seguridad de la información con enfoque de privacidad)**: A.3.3 a A.3.31 (Criptografía, autenticación, control de accesos, gestión de incidentes y bitácoras forenses). `[CONVERT-27001→27701]`
  - Declarar formalmente la exclusión de la Tabla A.2 (18 controles para Processors) con la justificación institucional UNSA. `[CONVERT-27001→27701]`

---

### Plantilla 9: Apéndice 3 — Informe sobre Evaluación y Tratamiento de Riesgos (`G4-RSK-INC-01` / `G4-PLN-RSK-01`)
- **Archivo fuente**: `docs/templates/Apendice_3_Informe_sobre_evaluacion_y_tratamiento_ES.docx`
- **Slug de render**: `apendice-3-informe-sobre-evaluacion-y-tratamiento`
- **Páginas de referencia**: 5 páginas (`p01.png` a `p05.png`)

#### Elementos de Encabezado y Portada
- Título: `Apéndice 3: Formulario - Informe sobre evaluación y tratamiento de riesgos` `[KEEP-AS-IS]`
- Tabla 1: Historial de modificaciones con fila UNSA Grupo 4 en sustitución de Kosutic. `[CONVERT-27001→27701]`
- Tabla de Contenido completa (Secciones 1 a 5). `[KEEP-AS-IS]`

#### Inventario Sección por Sección
- **1. Objetivo, alcance y usuarios** `[KEEP-AS-IS]`
  - Párrafo 1: Resumen ejecutivo de los resultados de la evaluación y tratamiento de riesgos del SGPI. `[CONVERT-27001→27701]`
  - Párrafo 2: Dirigido a la Alta Dirección (Rectorado), al Oficial de Seguridad de la Información (OSI) / DPO, a los decanos, directores de escuela y custodios de bancos de datos. `[FILL-UNSA-ROLE]`
- **2. Documentos de referencia** `[KEEP-AS-IS]`
  - `Norma ISO/IEC 27001, capítulos 8.2 y 8.3` → Sustituir por: `Norma ISO/IEC 27701:2025, capítulos 8.2 y 8.3` `[CONVERT-27001→27701]`
  - `Documento sobre el alcance del SGSI` → `Determinación del Alcance del SGPI (G4-ALC-01)` `[CONVERT-27001→27701]`
  - `Política de seguridad de la información` → `Política de Privacidad de la Información (G4-POL-01)` `[CONVERT-27001→27701]`
  - `Metodología de evaluación y tratamiento de riesgos` → `Metodología de Gestión del Riesgo de Privacidad (G4-MET-RSK-01)` `[CONVERT-27001→27701]`
- **3. Proceso de evaluación y tratamiento de riesgos de la información** `[KEEP-AS-IS]`
  - **3.1 Objetivo de la gestión de riesgos**: Identificación de activos y vulnerabilidades, evaluación de impacto en los titulares de datos y determinación de controles de reducción sistemática. `[CONVERT-27001→27701]`
  - **3.2 Alcance**: Campus Arequipa y Filiales Camaná y Majes. `[FILL-UNSA-ROLE]`
  - **3.3 Período de tiempo**: Evaluación del 01/11/2026 al 15/11/2026; Tratamiento del 16/11/2026 al 30/11/2026. `[FILL-UNSA-ROLE]`
  - **3.4 Participantes en el proceso y recolección de información**: Dirigido por el OSI/DPO con asistencia técnica del Equipo SGPI Grupo 4 y entrevistas a directores de unidad. `[FILL-UNSA-ROLE]`
  - **3.5 Breve resumen de la metodología aplicada**:
    - Pasos numerados: (1) Identificación de activos y bancos de datos, (2) Identificación de amenazas y vulnerabilidades, (3) Propietarios de riesgos, (4) Consecuencias (0-2) evaluando afectación a titulares, (5) Probabilidad (0-2), (6) Suma de consecuencias y probabilidad, (7) Riesgos valorados en 3 y 4 calificados como no aceptables, (8) Selección de controles de las Tablas A.1 y A.3 de ISO/IEC 27701:2025, (9) Evaluación de riesgos residuales post-tratamiento. `[CONVERT-27001→27701]`
  - **3.6 Resumen de los documentos utilizados**: Citar Apéndice 1 (Cuadro de evaluación) y Apéndice 2 (Cuadro de tratamiento). `[KEEP-AS-IS]`
- **4. Validez y gestión de documentos**: Válido hasta `31-12-2027`. Propietario: `Oficial de Seguridad de la Información (OSI) / DPO`. `[FILL-UNSA-ROLE]`
- **5. Apéndices**: Apéndice 1 y Apéndice 2. `[KEEP-AS-IS]`
- **Bloque de firma**: `Oficial de Seguridad de la Información (OSI) / DPO` | `Ing. Carlos Alberto Gomez`. `[FILL-UNSA-ROLE]`

---

## 4. Catálogo Maestro de Roles y Datos Institucionales de la UNSA

Para garantizar que ningún downstream worker invente nombres, siglas o puestos arbitrarios, todos los campos marcados como `[FILL-UNSA-ROLE]` deben extraerse estrictamente de la siguiente tabla institucional:

| Sigla / Clave de Rol | Denominación Oficial en la UNSA | Titular / Responsable Oficial | Rol Operativo en el SGPI (ISO 27701:2025) |
| :--- | :--- | :--- | :--- |
| **UNSA** | Universidad Nacional de San Agustín de Arequipa | Entidad Pública Universitaria (Ley 30220) | Responsable del Tratamiento de Datos (*PII Controller*, Cl. 4.1) |
| **RECTORADO** | Alta Dirección / Rectorado | **Dr. Hugo Jose Rojas Flores** (Rector) | Liderazgo y compromiso (Cl. 5.1), aprobación de políticas y riesgos residuales |
| **VRAC** | Vicerrectorado Académico | **Dr. Luis Enrique Cuadros Paz** | Supervisión del tratamiento de datos de estudiantes y docentes |
| **VRIN** | Vicerrectorado de Investigación | **Dr. Henry Gustavo Polanco Cornejo** | Custodia y privacidad de proyectos de investigación y patentes |
| **OSI / DPO** | Oficial de Seguridad de la Información / Delegado de Protección de Datos | **Ing. Carlos Alberto Gomez** | Coordinación ejecutiva del SGPI, evaluación de riesgos y respuesta a incidentes |
| **DUTIC** | Dirección Universitaria de Tecnologías de la Información y Comunicación | Dirección Universitaria | Infraestructura tecnológica, controles de red, copias de seguridad y logs |
| **CSIRT-UNSA** | Equipo de Respuesta a Incidentes de Ciberseguridad y Privacidad | Coordinador CSIRT / Analistas de Seguridad | Detección, contención, análisis forense y registro oficial de brechas (B.3.12) |
| **DGA** | Dirección General de Administración | Dirección General | Gestión de proveedores, contratos y asignación presupuestal |
| **RRHH / PERSONAL**| Subdirección de Personal / Recursos Humanos | Subdirección | Capacitación periódica, cláusulas de confidencialidad y competencia |
| **SEC-GEN** | Secretaría General / Mesa de Partes | Secretaría General | Control de documentos externos y ejercicio de derechos ARCO |
| **ANPD** | Autoridad Nacional de Protección de Datos Personales | Ministerio de Justicia y Derechos Humanos (Perú) | Autoridad de supervisión competente conforme a Ley N° 29733 |

---

## 5. Lista de Verificación de Aceptación de Fidelidad Visual (Checklist de Control)

Cada downstream worker DEBE autoverificar su molde Typst (`molds/<slug>/mold.typ`) contra la siguiente lista de chequeo antes de emitir su reporte de entrega:

- [ ] **1. Verificación Visual de Imagen (HOW TO SEE)**: ¿Se abrieron e inspeccionaron todos los archivos `.png` en `docs/templates-render/<slug>/` antes de redactar el molde?
- [ ] **2. Títulos de Capítulo Verbatim**: ¿Cada Heading 1, Heading 2 y Heading 3 coincide palabra por palabra con el título de la plantilla original?
- [ ] **3. Tabla de Metadatos de Control Completa**: ¿Se incluyó la tabla de 6 filas con Código, Versión, Fecha, Creado por, Aprobado por y Confidencialidad en la portada?
- [ ] **4. Historial de Modificaciones Transicionado**: ¿Se eliminó a "Dejan Kosutic" y se consignó la versión inicial 1.0 de la era UNSA (noviembre 2026)?
- [ ] **5. Sustitución Terminológica Exhaustiva**: ¿Se reemplazó SGSI por SGPI, seguridad de información por privacidad/PII, y se actualizaron las cláusulas a ISO 27701:2025?
- [ ] **6. Invarianza de Tablas**: ¿Todas las tablas conservan exactamente el mismo número y orden de columnas que el documento fuente?
- [ ] **7. Escala de Riesgos Preservada**: ¿La fórmula `Riesgo = Consecuencia + Probabilidad` y los umbrales de aceptación (0-2 aceptable, 3-4 no aceptable) se mantienen intactos?
- [ ] **8. Catálogo de Controles Actualizado**: ¿Se reemplazaron los 114 controles viejos de 27001 por las Tablas A.1 (31 controles) y A.3 (29 controles) de ISO 27701:2025, declarando excluida la Tabla A.2?
- [ ] **9. Tipografía Liberation Sans**: ¿Se configuró `Liberation Sans` respetando los tamaños 14pt (H1), 12pt (H2), 11pt (H3 y cuerpo) y 10pt (tablas)?
- [ ] **10. Bloques de Firma y Cierre**: ¿El documento concluye con la sección de validez, criterios de efectividad y las líneas de firma formal con roles oficiales de la UNSA?
