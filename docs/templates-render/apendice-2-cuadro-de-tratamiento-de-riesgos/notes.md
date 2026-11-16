# Notas de Extracción y Fidelidad Visual: `apendice-2-cuadro-de-tratamiento-de-riesgos`

## 1. Identificación y Metadatos del Artefacto
- **Título Oficial de la Plantilla**: Apéndice 2: Cuadro de tratamiento de riesgos
- **Archivo Fuente Instructor**: `docs/templates/Apendice_2_Cuadro_de_tratamiento_de_riesgos_ES.xlsx`
- **Tipo de Documento**: `XLSX`
- **Código Relacionado G4**: `G4-PLN-RSK-01 (Herramienta de Tratamiento)`
- **Referencias ISO/IEC 27701:2025**: ISO/IEC 27701:2025 Cl. 6.1.3, 8.3; Tablas A.1 y A.3
- **PDF de Referencia Visual**: [`source.pdf`](source.pdf) (3 páginas/hojas)

## 2. Inventario de Renders PNG Generados (150 DPI)
| Archivo PNG | Dimensiones (ancho × alto) | Descripción del Contenido |
| :--- | :---: | :--- |
| [`p01.png`](p01.png) | 1296 × 7520 px | Hoja de cálculo completa: `Cuadro tratamiento riesgos` (SinglePageSheets LO export) |
| [`p02.png`](p02.png) | 56 × 98 px | Hoja de cálculo completa: `Opciones` (SinglePageSheets LO export) |
| [`p03.png`](p03.png) | 56 × 1902 px | Hoja de cálculo completa: `Controles` (SinglePageSheets LO export) |

## 3. Características Estructurales y Tipográficas Extraídas
- **Número de Hojas de Trabajo**: 3
- **Lista de Hojas**: `Cuadro tratamiento riesgos, Opciones, Controles`

### 3.1 Hoja: `Cuadro tratamiento riesgos`
- **Rango Máximo**: 499 filas × 14 columnas
- **Primeras Filas con Contenido**:
  - Fila 1: `Cuadro de tratamiento de riesgos | Implementado desde el [fecha] hasta el [fecha]`
  - Fila 3: `Activos / amenazas / vulnerabilidades | Valores antes del tratamiento | Tratamiento del riesgo | Valores después del tratamiento`
  - Fila 4: `Cantidad | Nombre del activo | Propietario del activo | Amenaza | Vulnerabilidad | Propietario del riesgo | Consecuencia | Probabilidad`

### 3.1 Hoja: `Opciones`
- **Rango Máximo**: 11 filas × 1 columnas
- **Primeras Filas con Contenido**:
  - Fila 1: `Opciones para el tratamiento de riesgos`
  - Fila 3: `1. Elección de controles`
  - Fila 4: `2. Transferencia de riesgos a terceros`
  - Fila 5: `3. Evitar el riesgo`
  - Fila 6: `4. Aceptación del riesgo`

### 3.1 Hoja: `Controles`
- **Rango Máximo**: 152 filas × 5 columnas
- **Primeras Filas con Contenido**:
  - Fila 1: `Controles de acuerdo al Anexo A de la norma ISO/IEC 27001`
  - Fila 3: `A.5.1.1 Políticas para seguridad de la información`
  - Fila 4: `A.5.1.2 Revisión de las políticas para seguridad de la información`
  - Fila 5: `A.6.1.1 Funciones y responsabilidades de seguridad de la información`
  - Fila 6: `A.6.1.2 Segregación de deberes`
  - Fila 7: `A.6.1.3 Contacto con autoridades`
  - Fila 8: `A.6.1.4 Contacto con grupos de interés especiales`
  - Fila 9: `A.6.1.5 Seguridad de la información en gestión de proyectos`

## 4. Guía de Observación Visual para Downstream Workers
1. **Fidelidad Estricta de Orden y Estructura**: Mantener la secuencia exacta de campos y filas sin alterar el flujo procedimental.
2. **Sustitución de Tipografía**: Reemplazar Calibri por `Liberation Sans` en Typst manteniendo tamaños proporcionales (11pt cuerpo, 14pt Heading 1, 12pt Heading 2).
3. **Preservación de Metadatos y Encabezados**: El bloque superior derecho con versión y código, y el pie de página con paginación formal deben coincidir visualmente.
