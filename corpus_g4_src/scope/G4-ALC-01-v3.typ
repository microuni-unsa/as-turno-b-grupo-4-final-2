#import "../../molds/scope/mold.typ": mold

#let data = (
  title: "Determinación del Alcance del SGPI",
  short-title: "Alcance del SGPI",
  code: "G4-ALC-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "Confidencial",
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
  validity: "2026-10-28",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  references: (
    "Norma ISO/IEC 27701:2025, Cláusulas 4.1, 4.3 y 4.4 (Segunda edición, standalone PIMS).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Ley Universitaria N° 30220.",
    "Resoluciones Rectorales N° 0142-2025 y N° 0143-2025-UNSA (Incorporación de Filiales Camaná y El Pedregal).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Procedimiento de Control de Información Documentada (G4-PRC-DOC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial de la definición de alcance para la certificación ISO/IEC 27701:2019. Límites físicos: Sedes centrales Arequipa. Procesos: Admisión y Planillas."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Reducción del perímetro físico activo, migración digital a portal web (admision.unsa.edu.pe), teletrabajo y exclusión de archivos físicos históricos."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición, standalone PIMS): Expansión territorial a Filial Camaná y Filial El Pedregal (Majes), integración de nube híbrida y gestión descentralizada."
    ),
  ),
  objective_text: [El presente documento define los límites del SGPI bajo la norma independiente *ISO/IEC 27701:2025 Cláusulas 4.3 y 4.4*, formalizando la incorporación territorial de las filiales regionales descentralizadas de la Universidad Nacional de San Agustín de Arequipa (UNSA) y garantizando el cumplimiento de la Ley N° 29733.],
  scope_summary_text: [El alcance abarca los procesos de Admisión de Pregrado Integral y Planilla de Remuneraciones Multisede en las Sedes Centrales de Arequipa y en las Filiales Descentralizadas de Camaná y El Pedregal (Majes), cubriendo tanto plataformas web como enlaces VPN dedicados y nube híbrida.],
  users_text: [Aplicable al Consejo Universitario, Comité SGPI, Direcciones de Admisión y Personal, Coordinaciones de Filiales Camaná y Majes, Dirección Universitaria de TIC (DUTIC) y todos los operadores de datos personales institucionales.],
  role_determination: [La UNSA ejerce la función unívoca y exclusiva de *Responsable del Tratamiento de Datos Personales (PII Controller)* en la totalidad de sus campus urbanos y sedes regionales descentralizadas.],
  admission_process: (
    title: "Admisión de Pregrado Integral",
    description: [Abarca el ciclo completo de incorporación de estudiantes: inscripción virtual centralizada, verificación biométrica facial y dactilar presencial en sedes descentralizadas, rendición de evaluaciones ordinarias y filiales, y asignación de vacantes.],
    responsible: "Dirección General de Admisión y Coordinaciones de Filial (Camaná y Majes).",
    population: "Más de 25,000 postulantes anuales en Arequipa y filiales.",
    data_treated: "Nombres, DNI, datos de contacto, registros biométricos, antecedentes académicos y declaraciones juradas de salud."
  ),
  payroll_process: (
    title: "Planilla de Remuneraciones Multisede",
    description: [Abarca el procesamiento unificado de haberes, incentivos, retenciones tributarias (Sunat), aportes a la seguridad social (Essalud/AFP) y dispersión bancaria para el personal docente y no docente de todas las sedes universitarias.],
    responsible: "Subdirección de Personal y Remuneraciones.",
    population: "Más de 3,200 trabajadores universitarios.",
    data_treated: "Información de cuentas de ahorros, montos remunerativos, descuentos judiciales y declaraciones juradas patrimoniales."
  ),
  main_campuses: (
    (name: "Campus Área de Ingenierías", description: "Av. Independencia s/n (Centro de Procesamiento de Datos principal y servidores de administración)."),
    (name: "Campus Área de Biomédicas", description: "Av. Alcides Carrión s/n (Facultades de Medicina, Enfermería y laboratorios de investigación)."),
    (name: "Campus Área de Sociales", description: "Av. Virgen del Pilar s/n (Facultades de Derecho, Educación y Ciencias de la Comunicación).")
  ),
  filiales: (
    (name: "Filial Camaná", description: "Av. Costanera s/n, Camaná. Incorporada por Resolución Rectoral N° 0142-2025-UNSA (Programas de Administración y Contabilidad). Enlace seguro VPN IPSec y estación móvil de enrolamiento biométrico."),
    (name: "Filial El Pedregal (Majes)", description: "Calle 4 s/n, El Pedregal - Caylloma. Incorporada por Resolución Rectoral N° 0143-2025-UNSA (Programas de Agronomía e Ingeniería Pesquera). Enlace seguro VPN IPSec y estación móvil de enrolamiento biométrico.")
  ),
  tech_infrastructure: (
    "Plataforma institucional web `admision.unsa.edu.pe` con balanceo y cortafuegos web (WAF).",
    "Servidores centrales en DUTIC y micro-servidores de respaldo local en filiales.",
    "Túneles VPN IPSec sitio-a-sitio con cifrado AES-256 entre sedes centrales y filiales.",
    "Equipos portátiles de enrolamiento con cifrado de disco completo BitLocker (XTS-AES 256) administrados vía MDM institucional.",
    "Bases de datos relacionales centralizadas con replicación transaccional segura."
  ),
  exclusions: (
    "Archivos Físicos Históricos Pasivos: Se mantienen excluidos los expedientes y legajos en papel cerrados con anterioridad al año 2020 resguardados en el Archivo General pasivo de la Universidad.",
    "Servicios Externos de Salud Universitaria Tercerizados que no acceden ni procesan datos del banco de datos de admisión ni de planillas."
  )
)

#mold(data: data)
