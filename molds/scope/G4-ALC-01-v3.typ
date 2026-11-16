#import "mold.typ": mold

#let data = (
  title: "Determinación del Alcance del SGPI",
  code: "G4-ALC-01",
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
  purpose: [El presente documento define los límites del SGPI bajo la norma independiente *ISO/IEC 27701:2025 Cláusulas 4.3 y 4.4*, formalizando la incorporación territorial de las filiales regionales descentralizadas de la Universidad Nacional de San Agustín de Arequipa (UNSA).],
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
    (name: "Campus Área de Ingenierías", description: "Av. Independencia s/n (Centro de procesamiento de datos institucional DUTIC)."),
    (name: "Campus Área de Biomédicas", description: "Av. Alcides Carrión s/n (Oficinas de apoyo y laboratorios)."),
    (name: "Campus Área de Sociales", description: "Av. Virgen del Pilar s/n (Pabellones y centros de registro).")
  ),
  filiales: (
    (name: "Filial Camaná", description: "Sede Descentralizada Camaná (Av. Costanera s/n, Camaná), incorporada formalmente mediante Resolución Rectoral N° 0142-2025-UNSA."),
    (name: "Filial El Pedregal (Majes)", description: "Sede Descentralizada Majes (Calle 4 s/n, Distrito de Majes, Provincia de Caylloma), incorporada formalmente mediante Resolución Rectoral N° 0143-2025-UNSA.")
  ),
  tech_infrastructure: (
    "Enlaces VPN IPSec cifrados sitio a sitio conectando los nodos locales de Camaná y Majes con el centro de datos central de DUTIC en Arequipa.",
    "Terminales móviles administrados centralmente bajo directivas MDM (Microsoft Intune) con cifrado forzoso BitLocker XTS-AES 256.",
    "Nube privada híbrida institucional para sincronización y almacenamiento seguro de datos PII."
  ),
  exclusions: (
    "Se mantiene la exclusión justificada de los archivos físicos históricos pasivos cerrados al año 2020.",
    "Se excluyen proyectos de extensión cultural externos no vinculados a los padrones de admisión o nómina docente."
  )
)

#mold(data: data)
