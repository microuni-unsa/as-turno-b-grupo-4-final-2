# Línea de Tiempo del Sistema de Gestión de Privacidad de la Información (SGPI)

## Versión 1.0 (2019-04-15) — Certificación Inicial
- **Estándar**: Adopción de ISO/IEC 27701:2019 (extensión sobre ISO/IEC 27001:2013).
- **Alcance Institucional**:
  - Proceso misional: Admisión Ordinaria presencial (recepción de expedientes físicos y padrones de huella dactilar en papel).
  - Proceso de soporte: Gestión de Planillas de Remuneraciones en la Subdirección de Personal (Sede Central Arequipa).
  - Sedes físicas: Campus Área de Ingenierías, Biomédicas y Sociales en la ciudad de Arequipa.
- **Topología Tecnológica**: Servidores on-premise en el centro de datos de DUTIC (Campus Ingenierías), redes LAN cableadas, base de datos Oracle local.

## Versión 2.0 (2022-09-10) — Reestructuración Post-Pandemia y Contracción de Alcance
- **Estándar**: ISO/IEC 27701:2019.
- **Razón del Cambio**: Aceleración digital forzada por la emergencia sanitaria COVID-19 y teletrabajo.
- **Modificaciones de Alcance**:
  - Migración completa de la inscripción de postulantes a la plataforma web `admision.unsa.edu.pe` y firma digital.
  - Cese del procesamiento de legajos físicos manuales (archivo pasivo sellado y excluido del alcance activo).
  - Teletrabajo seguro para el personal de planillas vía VPN SSL con autenticación multifactor (MFA).
  - Reducción del perímetro físico activo en sedes centrales, focalizando los controles en la capa lógica y de red.

## Versión 3.0 (2025-10-28) — Recertificación ISO/IEC 27701:2025 y Expansión Regional
- **Estándar**: ISO/IEC 27701:2025 (Segunda edición, standalone PIMS, 72 pp).
- **Razón del Cambio**: Publicación de la norma independiente en octubre de 2025 y descentralización académica universitaria mediante las filiales regionales.
- **Modificaciones de Alcance**:
  - Expansión territorial: Incorporación de la Filial Camaná y la Filial El Pedregal (Majes).
  - Integración multi-sede: Protocolos de respuesta a incidentes en filiales, inventario de datos PII sincronizados en la nube privada híbrida UNSA.
  - Reestructuración de la Declaración de Aplicabilidad (SoA): Mapeo completo a las tablas A.1 (Responsable), exclusión documentada de la tabla A.2 (Encargado) y adopción plena de la tabla A.3 (Controles comunes).
