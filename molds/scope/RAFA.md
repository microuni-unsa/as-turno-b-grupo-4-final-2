# Evidencia RAFA: Determinación del Alcance del SGPI (G4-ALC-01)

## 1. R — Rol
- **Agente / Autor**: Coordinador del SGPI y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Rector / Comité de Gobierno Digital y Privacidad (`Dr. Rohel Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance
- **Par Mandatorio de Procesos (SPEC 6.3)**:
  - *Proceso Misional*: Admisión de Pregrado (convocatoria ordinaria, CEPRUNSA, modalidades descentralizadas).
  - *Proceso de Soporte*: Planilla de Remuneraciones (personal docente y administrativo).
- **Variantes de Evolución Territorial y Tecnológica**:
  - `v1.0 (2019-04-15)`: Sedes centrales Arequipa (Campus Ingenierías, Biomédicas y Sociales), soporte on-premise y procesos presenciales. Exclusión: archivos físicos pre-2018.
  - `v2.0 (2022-09-10)`: Contracción post-pandemia; exclusión formal de legajos físicos pasivos históricos anteriores a 2020 y concentración en admisiones virtuales (`admision.unsa.edu.pe`) y teletrabajo vía VPN SSL con MFA.
  - `v3.0 (2025-10-28)`: Expansión multisede incorporando Filial Camaná (RR 0142-2025) y Filial El Pedregal - Majes (RR 0143-2025) bajo ISO/IEC 27701:2025, enlaces VPN IPSec cifrados, MDM con BitLocker XTS-AES 256 y nube híbrida.

## 3. F — Formato
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Molde parametrizado puro: `mold.typ` con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocadores de versión delgados: `G4-ALC-01-v1.typ`, `G4-ALC-01-v2.typ`, `G4-ALC-01-v3.typ` (~30-50 líneas cada uno).
- **Estructura Documental (SPEC 6.1)**:
  - Encabezado y pie formal con numeración dinámica `#context counter(page).display("1 de 1", both: true)`.
  - Cuadro de control documental y cuadro de aprobación institucional tripartito.
  - Historial de cambios con justificación explicativa por versión.
  - Índice analítico (`outline`) y salto de página forzoso antes del cuerpo.
  - Delimitación de límites territoriales, tecnológicos y organizacionales, procesos incluidos y exclusiones justificadas.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 4.3: Determinación del alcance del sistema de gestión de privacidad de la información.
  - Cláusula 4.4: Sistema de gestión de privacidad de la información.
  - Cláusula 4.1: Determinación de la función (UNSA = PII Controller exclusivo).
- **Consistencia Institucional**: Trazabilidad con las Resoluciones Rectorales N° 0142-2025 y 0143-2025-UNSA archivadas en `university-facts/`.
