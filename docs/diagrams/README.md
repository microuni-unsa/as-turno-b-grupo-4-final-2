# Diagrama del Proceso de Implementación — ISO/IEC 27701:2025 (PIMS UNSA)
## Sistema de Gestión de Privacidad de la Información (SGPI) | Rol: Responsable del Tratamiento (*PII Controller*, Cl. 4.1)
### Universidad Nacional de San Agustín de Arequipa (UNSA) — Turno B Grupo 4

Este directorio contiene el diseño formal, código fuente declarativo y artefactos compilados del **Diagrama del Proceso de Implementación de ISO/IEC 27701:2025** para la UNSA, estructurado y adaptado a partir del reconocido modelo metodológico de implementación de ISO 27001 (diseñado por *EPOS Services / ISO27001standard.com* por Dejan Kosutic).

---

## 1. Arquitectura y Justificación Metodológica

El evaluador del curso subrayó en la auditoría técnica (`docs/audit4.txt`) que la carencia crítica en los sistemas de gestión estudiantiles radicaba en no articular una secuencia de implementación auditable que vinculara las cláusulas normativas con la realidad operativa de la universidad.

A diferencia de ISO/IEC 27001:2013 (orientado exclusivamente a la tríada CIA sobre activos de información organizacionales), la implementación de **ISO/IEC 27701:2025 (Segunda edición, 2025-10, norma independiente)** para la UNSA introduce tres transformaciones estructurales fundamentales:

1. **Determinación del Rol Institucional (Cl. 4.1)**:
   - La UNSA actúa exclusivamente como **Responsable del Tratamiento de Datos Personales (*PII Controller*)** sobre los procesos de Admisión (postulantes y estudiantes) y Planilla/Nómina (personal docente y administrativo).
   - En consecuencia, la **Declaración de Aplicabilidad (`G4-SOA-01`)** evalúa los 78 controles de ISO 27701:2025: **Tabla A.1** (31 controles de Controller) y **Tabla A.3** (29 controles de seguridad específicos de privacidad) aplican directamente, mientras que la **Tabla A.2** (18 controles de Processor) se excluye justificadamente.
2. **Evaluación de Riesgo de Privacidad Dual (Cl. 6.1.2 y 8.2)**:
   - A diferencia del análisis de riesgos tradicional enfocado en pérdidas patrimoniales de la entidad, el SGPI evalúa obligatoriamente el impacto potencial sobre los **Titulares de los Datos Personales (*PII Principals*)** (discriminación, usurpación de identidad, perjuicio económico o moral).
3. **Eje Nuclear de Respuesta a Incidentes y Brechas de PII (Cl. 8.1, A.3.11, A.3.12, B.3.12)**:
   - El corazón operativo del Grupo 4 reside en la capacidad de detección, contención, registro y notificación de brechas de PII a través del CSIRT-UNSA, manteniendo la bitácora con los 9 campos obligatorios exigidos por la directriz B.3.12.

---

## 2. Correspondencia entre Fases y los 18 Artefactos Institucionales (Códigos G4)

El diagrama se organiza en **16 fases secuenciales** enmarcadas por **2 rieles laterales de gobernanza transversal**:

| # | Fase Metodológica | Cláusula ISO 27701 | Entregable Documental Institucional (Código G4) |
| :-: | :--- | :--- | :--- |
| **0L** | **Riel Izquierdo Transversal** | Cl. 5.1, 5.3, 7.4, 10.1 | **Mejora Continua, Liderazgo y Comunicación Institucional** |
| **0R** | **Riel Derecho Transversal** | Cl. 7.5, 9.1 | **Control de Información Documentada y Evaluación del Desempeño** |
| **1** | Obtener Respaldo de Alta Dirección | Cl. 5.1, 7.1 | • Acta de Compromiso del Rectorado<br>• Plan de Asignación de Recursos y Presupuesto SGPI |
| **2** | Establecer el Proyecto de Implementación | Cl. 6.1.1, 5.3 | • Plan de Proyecto SGPI-UNSA<br>• Matriz de Roles y Responsabilidades PIMS (OSI/DPO, DUTIC, Admisión, Planillas) |
| **3** | Identificar Contexto, Requisitos y Titulares | Cl. 4.1, 4.2 | • Registro de Partes Interesadas y Titulares (*PII Principals*)<br>• Matriz Legal de Privacidad (Ley 29733, D.S. 003-2013-JUS, Ley 30220) |
| **4** | Definir Alcance, Política y Objetivos | Cl. 4.3, 4.4, 5.2, 6.2 | • **`G4-ALC-01`**: Alcance del SGPI (PII Controller; Sedes Arequipa y Filiales Camaná / Majes)<br>• **`G4-POL-01`**: Política de Privacidad de la Información (1-Pager Ejecutivo)<br>• **`G4-OBJ-01`**: Objetivos de Privacidad del SGPI y Plan de Medición |
| **5** | Implementar Soporte y Control Documental | Cl. 7.5 | • **`G4-PRC-DOC-01`**: Procedimiento de Control de Información Documentada y Versionado<br>• **`G4-IDX-01`**: Mapa e Índice Maestro de Documentos del SGPI (*Auditor's Map*) |
| **6** | Metodología de Evaluación y Tratamiento de Riesgos | Cl. 6.1.2 (ISO 27557/31000) | • **`G4-MET-RSK-01`**: Metodología de Gestión del Riesgo de Privacidad<br>• Criterios de Aceptación de Riesgo Dual (Impacto en UNSA y en Titulares) |
| **7** | Ejecutar Evaluación de Riesgos de Privacidad | Cl. 6.1.2, 8.2 | • **`G4-RSK-INC-01`**: Matriz de Evaluación de Riesgos de Incidentes de Privacidad (XLSX/Typst)<br>• Informe de Resultados de Evaluación de Riesgos |
| **8** | Declaración de Aplicabilidad (SoA) | Cl. 6.1.3 e, Anexo A | • **`G4-SOA-01`**: Declaración de Aplicabilidad del SGPI (Tablas A.1 y A.3; Tabla A.2 excluida justificada) |
| **9** | Plan de Tratamiento y Aceptar Riesgos Residuales | Cl. 6.1.3 f, g, 8.3 | • **`G4-PLN-RSK-01`**: Plan de Tratamiento de Riesgos de Privacidad (XLSX/Typst)<br>• Acta de Aprobación Formal de Riesgos Residuales por Dueños de Riesgos |
| **10** | Implementar Controles y Salvaguardas Técnicas | Cl. 8.1, Anexo A | • Registros de Implementación de Controles Técnicos y Organizacionales (A.1 y A.3)<br>• Evaluaciones de Impacto en Privacidad (EIPD / DPIA - Cl. A.1.2.5 / A.1.2.6) |
| **11** | Capacitación y Toma de Conciencia | Cl. 7.2, 7.3, A.3.17 | • **`G4-CAP-INC-01`**: Módulo Formativo: Respuesta a Incidentes de Privacidad (Syllabus)<br>• **`G4-REG-CAP-01`**: Registro de Asistencia y Evaluación de Competencias (Pre/Post-Test) |
| **12** | Operar el SGPI y Responder ante Brechas de PII | Cl. 8.1, A.3.11, B.3.12 | • **`G4-PRC-INC-01`**: Procedimiento de Respuesta a Incidentes de Privacidad (CSIRT-UNSA)<br>• **`G4-REG-INC-01`**: Bitácora y Registro Oficial de Incidentes y Brechas de PII (9 campos B.3.12)<br>• Registros de Ejercicio de Derechos ARCO de Titulares (Cl. A.1.5) |
| **13** | Ejecutar Auditoría Interna del SGPI | Cl. 9.2 (ISO 19011:2026) | • **`G4-PRG-AUD-01`**: Programa Anual de Auditorías Internas del SGPI<br>• **`G4-REP-AUD-01`**: Informe de Auditoría Interna (Hallazgos Multisede Arequipa y Filiales)<br>• **`G4-REG-CAPA-01`**: Registro de Acciones Correctivas (No Conformidades) |
| **14** | Revisión por la Dirección y Mejora Continua | Cl. 9.3, 10.1, 10.2 | • **`G4-ACT-REV-01`**: Acta de Revisión por la Dirección (Entradas Cl. 9.3.2 y Salidas Cl. 9.3.3)<br>• **`G4-PRC-CAPA-01`**: Procedimiento de No Conformidades y Acciones Correctivas<br>*(Bucle cerrado de retroalimentación hacia el Riel de Gobernanza y Mejora Continua Cl. 10)* |
| **15** | Auditoría Externa de Certificación — Fase 1 | Esquema de Certificación | • Informe de Auditoría Fase 1 de la Entidad Certificadora (Revisión de Arquitectura Documental)<br>• Acciones Correctivas ante Observaciones Documentales (`G4-REG-CAPA-01`) |
| **16** | Auditoría Externa de Certificación — Fase 2 | Esquema de Certificación | • Informe de Auditoría Fase 2 (Evaluación de Eficacia Operativa en Sitio y Filiales)<br>• Recomendación Formal de Emisión del Certificado ISO/IEC 27701:2025 |

---

## 3. Artefactos y Formatos Disponibles

Todos los artefactos se generan de forma reproducible a partir del archivo fuente declarativo:

- **Código Fuente**: [`iso-27701-implementation-process.d2`](iso-27701-implementation-process.d2)
- **Vectorial Escalable (SVG)**: [`iso-27701-implementation-process.svg`](iso-27701-implementation-process.svg) (ideal para incrustación web interactiva con soporte de texto nítido).
- **Imagen de Alta Resolución (PNG)**: [`iso-27701-implementation-process.png`](iso-27701-implementation-process.png) (renderizado ultra nítido a gran resolución para presentaciones ejecutivas y diapositivas).
- **Documento Listo para Impresión (PDF)**: [`iso-27701-implementation-process.pdf`](iso-27701-implementation-process.pdf) (documento vectorial de página completa para auditorías presenciales).

---

## 4. Instrucciones de Compilación y Reproducción

Para compilar o regenerar los diagramas tras cualquier modificación del código fuente `.d2`, ejecute el script automatizado:

```bash
# Compilación completa de los 3 formatos (SVG, PNG, PDF):
./scripts/render-diagram.sh
```

O directamente mediante Nix en una sola línea:

```bash
# Validación de sintaxis:
nix run nixpkgs#d2 -- validate docs/diagrams/iso-27701-implementation-process.d2

# Compilación individual:
nix run nixpkgs#d2 -- --layout=elk docs/diagrams/iso-27701-implementation-process.d2 docs/diagrams/iso-27701-implementation-process.svg
nix run nixpkgs#d2 -- --layout=elk docs/diagrams/iso-27701-implementation-process.d2 docs/diagrams/iso-27701-implementation-process.png
nix run nixpkgs#d2 -- --layout=elk docs/diagrams/iso-27701-implementation-process.d2 docs/diagrams/iso-27701-implementation-process.pdf
```
