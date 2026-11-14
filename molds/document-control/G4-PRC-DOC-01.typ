#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Procedimiento de Control de Información Documentada",
  code: "G4-PRC-DOC-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Oficial de Seguridad de la Información (OSI / DPO)",
    date: "2025-10-20"
  ),
  reviewer: (
    name: "Mg. Lucía Valdivia Paredes",
    role: "Directora Universitaria de TIC (DUTIC)",
    date: "2025-10-24"
  ),
  approver: (
    name: "Dr. Hugo José Sánchez",
    role: "Rector - Presidente del Comité SGPI",
    date: "2025-10-28"
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial aprobada para la certificación ISO/IEC 27701:2019 del SGPI UNSA."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización para incorporar el repositorio documental electrónico y firma digital en Sisgedo."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición): Formalización de reglas de versionado de moldes Typst, convención change_summary y repositorio PIMS GESTITEL."
    ),
  )
)

= Propósito y Fundamento Normativo
Establecer las reglas institucionales para la creación, revisión, aprobación, codificación, versionado, distribución, almacenamiento, preservación y disposición final de la información documentada del SGPI de la UNSA, conforme a las Cláusulas 7.5.2 y 7.5.3 de la norma ISO/IEC 27701:2025.

= Taxonomía y Convención de Codificación Institucional
Todo documento del SGPI lleva el prefijo obligatorio de grupo `G4-`, seguido de tres letras del tipo documental y un correlativo numérico:
- `G4-POL-XX`: Políticas institucionales de privacidad.
- `G4-ALC-XX`: Definición de alcance y límites institucionales.
- `G4-PRC-XX`: Procedimientos operativos y directivas de control.
- `G4-REG-XX`: Registros de evidencia (incidentes, asistencia, no conformidades).
- `G4-SOA-XX`: Declaración de aplicabilidad de controles (SoA).
- `G4-PRG-XX`: Programas anuales (auditorías, capacitaciones).
- `G4-REP-XX`: Informes formales de auditoría y reportes técnicos.
- `G4-ACT-XX`: Actas y minutas de comités y revisión por la dirección.
- `G4-IDX-XX`: Índices maestros y mapas documentales de auditoría.

= Anatomía Documental Obligatoria (SPEC 6.1)
Todo documento o molde debe incorporar sin excepción:
1. Código con prefijo `G4-`.
2. Versión semántica visible (`vX.Y`).
3. Fecha de aprobación en formato ISO (`YYYY-MM-DD`).
4. Paginación correlativa continua (`Página X de Y`).
5. Nivel de clasificación de seguridad (`CONFIDENCIAL - USO INTERNO UNSA`).
6. Cuadro de firmas (Elaborado, Revisado, Aprobado) con nombres, cargos y fechas.
7. Tabla de historial de revisiones (quién, cuándo y justificación del cambio).
8. Índice de contenidos analítico generado automáticamente.
9. Cero corchetes o marcadores de posición sin resolver.

= Reglas de Versionado y Ciclo de Vida Documental

== Versiones Menores (`1.x`, `2.x`)
Se aplican ante correcciones ortográficas, precisiones de redacción, adecuación de citas normativas o cambios de nombres de responsables que no alteren el propósito, responsabilidades operativas ni controles del proceso.

== Versiones Mayores (`2.0`, `3.0`)
Se aprueban formalmente ante cambios estructurales en el sistema de gestión:
- Inclusión o eliminación de procesos dentro del alcance del SGPI.
- Modificaciones tecnológicas críticas (ej. migración digital post-pandemia 2022).
- Expansión territorial (incorporación de filiales Camaná y Majes en 2025).
- Transición de versión de la norma base (ISO/IEC 27701:2025).

== Inmutabilidad de Versiones Anteriores en PIMS
#callout(title: "POLÍTICA DE PRESERVACIÓN HISTÓRICA ('MÁQUINA DEL TIEMPO')", color: rgb("#0284c7"))[
  Las versiones precedentes de cualquier documento *NUNCA se eliminan* en el repositorio PIMS institucional. Al aprobarse una nueva versión, las anteriores cambian su estado automáticamente a `obsoleto` (`O`), manteniéndose íntegras y descargables con su respectivo identificador y suma de verificación SHA-256 para auditorías retrospectivas. Las eliminaciones físicas puras (`true deletes`) solo se admiten ante erratas críticas o contaminación de datos entre clientes, requiriendo registro expreso en bitácora.
]

== Convención de Resumen de Cambios (`change_summary`)
Al cargar una nueva versión al PIMS vía API (`POST /api/documents/{id}/versions/`), es obligatorio registrar el campo `change_summary` estructurado:
```
<TIPO_CAMBIO> :: Justificación institucional :: Principales modificaciones :: Impacto en controles SoA
Valores permitidos para <TIPO_CAMBIO>: MENOR (para 1.x correcciones menores) | MAYOR (para 2.x/3.x cambios estructurales)
```

= Control de Almacenamiento y Acceso (Cláusula 7.5.3)
- Los moldes originales residen en formato fuente Typst 0.15 (`.typ`) en el repositorio local controlado.
- La versión oficial vinculante para auditoría es el archivo renderizado (PDF o XLSX) subido, validado y aprobado en el PIMS institucional GESTITEL (`https://unsa.27k.pe`).
- Las copias impresas no controladas carecen de validez oficial y deben ser destruidas inmediatamente tras su uso temporal.
