# Notas de Extracción y Fidelidad Visual: `apendice-1-cuadro-de-evaluacion-de-riesgos`

## 1. Identificación y Metadatos del Artefacto
- **Título Oficial de la Plantilla**: Apéndice 1: Cuadro de evaluación de riesgos
- **Archivo Fuente Instructor**: `docs/templates/Apendice_1_Cuadro_de_evaluacion_de_riesgos_ES.xlsx`
- **Tipo de Documento**: `XLSX`
- **Código Relacionado G4**: `G4-RSK-INC-01 (Herramienta de Evaluación)`
- **Referencias ISO/IEC 27701:2025**: ISO/IEC 27701:2025 Cl. 6.1.2, 8.2; Controles A.3.11, A.3.12, A.3.25
- **PDF de Referencia Visual**: [`source.pdf`](source.pdf) (4 páginas/hojas)

## 2. Inventario de Renders PNG Generados (150 DPI)
| Archivo PNG | Dimensiones (ancho × alto) | Descripción del Contenido |
| :--- | :---: | :--- |
| [`p01.png`](p01.png) | 810 × 11544 px | Hoja de cálculo completa: `Cuadro de evaluación de riesgos` (SinglePageSheets LO export) |
| [`p02.png`](p02.png) | 111 × 1304 px | Hoja de cálculo completa: `Categorías` (SinglePageSheets LO export) |
| [`p03.png`](p03.png) | 115 × 835 px | Hoja de cálculo completa: `Amenazas` (SinglePageSheets LO export) |
| [`p04.png`](p04.png) | 115 × 900 px | Hoja de cálculo completa: `Vulnerabilidades` (SinglePageSheets LO export) |

## 3. Características Estructurales y Tipográficas Extraídas
- **Número de Hojas de Trabajo**: 4
- **Lista de Hojas**: `Cuadro de evaluación de riesgos, Categorías, Amenazas, Vulnerabilidades`

### 3.1 Hoja: `Cuadro de evaluación de riesgos`
- **Rango Máximo**: 701 filas × 10 columnas
- **Primeras Filas con Contenido**:
  - Fila 1: `Cuadro de evaluación de riesgos | Implementado desde el [fecha] hasta el [fecha]`
  - Fila 3: `No | Nombre del activo | Propietario del activo | Amenaza | Vulnerabilidad | Propietario del riesgo | Consecuencia | Probabilidad`

### 3.1 Hoja: `Categorías`
- **Rango Máximo**: 82 filas × 3 columnas
- **Primeras Filas con Contenido**:
  - Fila 1: `Categorías de activos`
  - Fila 3: `Los siguientes son ejemplos de activos de información que se pueden encontrar en la organización.`
  - Fila 4: `Esta no es una lista definitiva. Cada organización debe especificar sus propios activos que sean importantes para la seguridad de la información.`
  - Fila 6: `Personas`
  - Fila 7: `Alta dirección (miembros del directorio, de la junta fiscalizadora, gerentes de unidades de negocio)`
  - Fila 8: `Mandos intermedios`
  - Fila 9: `Empleados, expertos (por ej., administradores de sistemas, diseñadores, expertos en seguridad, etc.)`

### 3.1 Hoja: `Amenazas`
- **Rango Máximo**: 51 filas × 2 columnas
- **Primeras Filas con Contenido**:
  - Fila 1: `Catálogo de amenazas`
  - Fila 3: `La siguiente es una lista de amenazas. Esta no es una lista definitiva. Cada organización puede agregar amenazas por situaciones específicas.`
  - Fila 5: `Modificación accidental de datos del sistema de información`
  - Fila 6: `Errores de aplicaciones`
  - Fila 7: `Explosión de bomba`
  - Fila 8: `Amenaza de bomba`
  - Fila 9: `Incumplimiento de relaciones contractuales`

### 3.1 Hoja: `Vulnerabilidades`
- **Rango Máximo**: 55 filas × 2 columnas
- **Primeras Filas con Contenido**:
  - Fila 1: `Catálogo de vulnerabilidades`
  - Fila 3: `La siguiente es una lista de vulnerabilidades.`
  - Fila 4: `Esta no es una lista definitiva. Cada organización puede agregar vulnerabilidades por situaciones específicas.`
  - Fila 6: `Sesiones activas después del horario laboral`
  - Fila 7: `Colocación de cables`
  - Fila 8: `Interfaz de usuario complicada`
  - Fila 9: `Claves criptográficas accesibles a personas no autorizadas`

## 4. Guía de Observación Visual para Downstream Workers
1. **Fidelidad Estricta de Orden y Estructura**: Mantener la secuencia exacta de campos y filas sin alterar el flujo procedimental.
2. **Sustitución de Tipografía**: Reemplazar Calibri por `Liberation Sans` en Typst manteniendo tamaños proporcionales (11pt cuerpo, 14pt Heading 1, 12pt Heading 2).
3. **Preservación de Metadatos y Encabezados**: El bloque superior derecho con versión y código, y el pie de página con paginación formal deben coincidir visualmente.
