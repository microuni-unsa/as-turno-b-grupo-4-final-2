# Evidencia RAFA: Plan, Módulo Formativo y Registros de Evaluación en Privacidad (G4-CAP-INC-01 / G4-REG-CAP-01)

## 1. R — Rol
- **Agente / Autor**: Coordinador de la Academia de Privacidad y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia Paredes`), Subdirectora de Personal / Recursos Humanos (`Lic. Martha Elena Córdova`) y Rector / Presidente del Comité SGPI (`Dr. Hugo José Sánchez`).

## 2. A — Alcance
- **Población Objetivo**: Personal clave involucrado en el tratamiento de datos personales en Admisión y Planillas (operadores, analistas de sistemas, administradores de base de datos, vocales de pabellón y coordinadores de filiales descentralizadas).
- **Variantes de Evolución Territorial y Modalidades**:
  - `v1.0 (2019)`: Sedes centrales Arequipa; capacitación presencial en aula sobre manejo de padrones impresos y reporte físico de desvíos.
  - `v2.0 (2022)`: Sedes centrales; capacitación virtual vía Aula Virtual Moodle UNSA y Google Meet, enfocada en seguridad web, autenticación MFA y teletrabajo.
  - `v3.0 (2025)`: Sedes centrales + Filiales Camaná (RR N° 0142-2025) y El Pedregal - Majes (RR N° 0143-2025); formación híbrida sobre terminales móviles corporativos (MDM/BitLocker), respuesta coordinada multisede y prevención de spear-phishing.

## 3. F — Formato
- **Arquitectura de Doble Molde Parametrizado**:
  1. `mold-cap.typ`: Molde parametrizado para el Plan y Sílabo Formativo. Replica de forma exacta las secciones y tablas del estándar del instructor (`Plan_de_capacitacion_y_concienciacion_ES.docx`):
     - Mención concisa de las 4 pistas formativas de la Academia UNSA (Sensibilización, Interpretación de la Norma, Implementadores/Formatos con módulo profundo de incidentes de 8 horas, y Formación de Auditores Internos ISO 19011).
     - Matriz de competencias de 6 columnas (Cargo, Conocimientos requeridos, Capacitación necesaria, Registro de evidencia, Objetivos logrados, Habilidades adquiridas).
     - Calendario anual de concienciación (10 métodos estandarizados y programación mensual de Ene a Dic).
     - Bloque formal de las 4 responsabilidades institucionales (coordinación, registro de asistencia, evaluación de eficacia y custodia documental).
     - Estructura temática de 4 sesiones (8 horas pedagógicas).
  2. `mold-reg-cap.typ`: Molde parametrizado para el Registro de Asistencia y Calificaciones. Estructura la ficha general del curso, matriz individualizada de participantes con notas de pre-test (diagnóstico) vs. post-test (suficiencia), cálculo de delta cuantitativo de mejora y porcentaje de aprobación.
- **Invocadores Delgados de Versión (~30 líneas)**:
  - Planes Curriculares: `G4-CAP-INC-01-v1.typ`, `G4-CAP-INC-01-v2.typ` y `G4-CAP-INC-01-v3.typ`.
  - Registros de Evaluación: `G4-REG-CAP-01-v1.typ`, `G4-REG-CAP-01-v2.typ` y `G4-REG-CAP-01-v3.typ`.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 7.2: Competencia (determinar la competencia necesaria de las personas bajo control institucional, asegurar que sean competentes sobre la base de educación, formación o experiencia, tomar acciones aplicables para adquirir la competencia y conservar información documentada apropiada como evidencia auditable).
  - Cláusula 7.3: Toma de conciencia (asegurar conocimiento de la política, contribución a la eficacia del SGPI e implicancias del incumplimiento).
  - Control A.3.17 y Guía B.3.17: Educación, formación y toma de conciencia en seguridad de la información y privacidad.
  - Guía B.3.11: Planificación y preparación para la gestión de incidentes relacionados con PII.
- **Evidencia Empírica de Eficacia Formativa**: Acreditación objetiva del incremento de competencia (+10.4 a +11.0 puntos) mediante evaluación diagnóstica de entrada vs. evaluación final de suficiencia con umbral mínimo de aprobación de 14.0/20.
