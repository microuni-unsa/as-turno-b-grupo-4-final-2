# Evidencia RAFA y Nota de Fidelidad: Plan y Registros de Capacitación y Concienciación (G4-CAP-INC-01 / G4-REG-CAP-01)

## 1. R — Rol
- **Agente / Autor**: Coordinador de Capacitación y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia Paredes`), Subdirectora de Personal / Recursos Humanos (`Lic. Martha Elena Córdova`) y Rector / Presidente del Comité SGPI (`Dr. Rohel Sánchez Sánchez` en v1; `Dr. Hugo José Sánchez` en v2 y v3).

## 2. A — Alcance
- **Población Objetivo**: Personal clave involucrado en el tratamiento de datos personales en Admisión y Planillas (operadores, analistas de sistemas, administradores de base de datos, vocales de pabellón y coordinadores de filiales descentralizadas).
- **Variantes de Evolución Territorial y Modalidades**:
  - `v1.0 (2019-04-15)`: Sedes centrales Arequipa (Ingenierías, Biomédicas, Sociales); capacitación presencial en aula sobre manejo de padrones impresos y reporte físico de desvíos.
  - `v2.0 (2022-09-10)`: Sedes centrales; capacitación virtual vía Aula Virtual Moodle UNSA y Google Meet, enfocada en seguridad web, autenticación MFA y teletrabajo.
  - `v3.0 (2025-10-28)`: Sedes centrales + Filiales Camaná (RR N° 0142-2025) y El Pedregal - Majes (RR N° 0143-2025); recertificación bajo ISO/IEC 27701:2025 (Segunda edición); formación híbrida sobre terminales móviles corporativos (MDM/BitLocker), respuesta coordinada multisede y prevención de spear-phishing.

## 3. F — Formato
- **Arquitectura de Doble Molde Parametrizado (Zero Instance Data)**:
  1. `mold-cap.typ`: Molde parametrizado para el Plan de Capacitación y Concienciación. Replica de forma exacta las secciones y tablas del estándar del instructor (`Plan_de_capacitacion_y_concienciacion_ES.docx`):
     - Párrafo 1 introductorio verbatim de capacitación para la seguridad y privacidad.
     - Tabla 1: Matriz de necesidades de capacitación de 6 columnas (Cargo o nombre, Conocimientos y habilidades necesarias, Qué capacitación es necesaria, Registro de implementación, ¿Se han logrado los objetivos?, Conocimientos y habilidades logrados).
     - Párrafo 2 y 3 sobre métodos de concienciación y programación.
     - Tabla 2: Cronograma anual de concienciación de 13 columnas (Método + 12 meses Ene a Dic).
     - Sección de Responsabilidades (las 4 responsabilidades institucionales verbatim: coordinación, registro de asistencia, evaluación de eficacia y custodia/retención documental por 3 años).
  2. `mold-reg-cap.typ`: Molde parametrizado para el Registro de Asistencia y Calificaciones. Estructura la ficha general del curso, matriz individualizada de participantes con notas de pre-test (diagnóstico) vs. post-test (suficiencia) y resumen estadístico.
- **Invocadores Delgados de Versión (6 callers en total)**:
  - Planes: `G4-CAP-INC-01-v1.typ`, `G4-CAP-INC-01-v2.typ` y `G4-CAP-INC-01-v3.typ`.
  - Registros de Evaluación: `G4-REG-CAP-01-v1.typ`, `G4-REG-CAP-01-v2.typ` y `G4-REG-CAP-01-v3.typ`.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 7.2: Competencia (determinar la competencia necesaria de las personas bajo control institucional, asegurar formación y conservar información documentada apropiada).
  - Cláusula 7.3: Toma de conciencia (asegurar conocimiento de la política, contribución a la eficacia del SGPI e implicancias del incumplimiento).
  - Control A.3.17 y Guía B.3.17: Educación, formación y toma de conciencia en seguridad de la información y privacidad.
  - Guía B.3.11: Planificación y preparación para la gestión de incidentes relacionados con PII.

## 5. Nota de Fidelidad Visual (Fidelity Note)
- Eliminadas todas las secciones inventadas previas: "Objetivo, alcance y fundamentación normativa", "Arquitectura Curricular de la Academia de Privacidad", "Estructura Curricular del Módulo de Incidentes (8 horas pedagógicas)", "Mecanismo de Evaluación y Medición de Eficacia (Cláusula 7.2)".
- El molde `mold-cap.typ` coincide 1:1 en estructura, textos y tablas con `Plan_de_capacitacion_y_concienciacion_ES.docx` (`docs/templates-render/plan-de-capacitacion-y-concienciacion/p01.png`-`p03.png`).
- El registro `mold-reg-cap.typ` sigue la misma gramática visual e institucional.
