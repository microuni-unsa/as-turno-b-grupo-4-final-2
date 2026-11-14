#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Matriz y Plan de Tratamiento de Riesgos de Incidentes",
  code: "G4-RSK-INC-01",
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
      summary: "Evaluación inicial de riesgos de privacidad para la certificación ISO/IEC 27701:2019. Escenarios de incidentes en sedes centrales Arequipa (Admisión y Planillas presenciales)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Incorporación de riesgos cibernéticos en portal web de admisiones, teletrabajo con VPN y copias de seguridad remotas."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición, standalone PIMS): Matriz multisede integrando Filial Camaná y Filial El Pedregal (Majes), riesgos en terminales móviles (MDM) y spear-phishing bancario."
    ),
  )
)

= Metodología de Evaluación Multisede (Cláusula 6.1.2)
Bajo la norma independiente ISO/IEC 27701:2025 Cláusula 6.1.2, la apreciación de riesgos analiza las amenazas concurrentes sobre las sedes de Arequipa y las filiales regionales descentralizadas, ponderando la probabilidad de ocurrencia y la gravedad de las consecuencias sobre los titulares de datos personales (postulantes y personal universitario).

= Matriz de Evaluación de Riesgos de Incidentes Multisede (Periodo 2025)

#table(
  columns: (45pt, 1fr, 80pt, 30pt, 30pt, 45pt, 50pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center, center, center, center),
  table.header([*ID*], [*Escenario de Riesgo de Incidente*], [*Activo / Sede*], [*P*], [*IT*], [*R. Inh.*], [*Nivel*]),
  
  [R-07],
  [Sustracción física de laptop de registro biométrico con datos de postulantes durante admisiones.],
  [Laptops móviles\ (Filial Camaná)],
  [3], [5], [15],
  rag-tag("ROJO"),

  [R-08],
  [Colisión o alteración de cuentas bancarias en la sincronización de nómina regional con la sede central.],
  [Túnel VPN IPSec\ (Filial El Pedregal)],
  [3], [4], [12],
  rag-tag("AMARILLO"),

  [R-09],
  [Ataque de spear-phishing suplantando entidades bancarias dirigido a operadores de planillas en filiales.],
  [Bandejas de correo\ (Filiales y Central)],
  [4], [4], [16],
  rag-tag("ROJO")
)

= Plan de Tratamiento de Riesgos Multisede (Cláusula 6.1.3f)

#table(
  columns: (40pt, 1fr, 80pt, 85pt, 55pt, 45pt, 45pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, left, center, center, center),
  table.header([*Ref.*], [*Controles Aplicables (Anexo A)*], [*Dueño del Riesgo*], [*Recursos Requeridos*], [*Plazo*], [*R. Res.*], [*Estado*]),
  
  [R-07],
  [
    *A.3.22:* Seguridad de dispositivos de usuario.\
    *A.3.26:* Cifrado BitLocker XTS-AES 256 forzoso por TPM 2.0 y enrolamiento en MDM Microsoft Intune con borrado remoto.
  ],
  [Dr. Marcos Cárdenas\ (Coord. Camaná)],
  [Licencias MDM institucionales y perfiles de directiva de grupo (GPO).],
  [2025-05-30],
  [3],
  rag-tag("VERDE"),

  [R-08],
  [
    *A.3.7/A.3.14:* Transferencia de información y protección de registros.\
    *A.3.23:* Validación de doble firma digital de lote bancario reconciliado con Sisgedo antes del abono.
  ],
  [Lic. Martha Córdova\ (Subdir. Personal)],
  [Certificados digitales tokenizados para coordinadores de sede y módulo de firma.],
  [2025-06-30],
  [4],
  rag-tag("VERDE"),

  [R-09],
  [
    *A.3.17:* Educación y concienciación en privacidad.\
    *A.3.28:* Filtrado de correo entrante con políticas DMARC reject, DKIM y SPF estricto en DUTIC.
  ],
  [Ing. Carlos M. Benítez\ (OSI / DPO)],
  [Plataforma de simulación de ciberataques y taller obligatorio en la Academia UNSA.],
  [2025-07-31],
  [4],
  rag-tag("VERDE")
)

= Aprobación Formal de los Dueños de Riesgo (Cláusula 6.1.3g)
En sesión extraordinaria del Comité de Gobierno Digital y Privacidad del 28 de octubre de 2025, los dueños de riesgo de los procesos de Admisión y Planillas aprobaron unánimemente el Plan de Tratamiento y formalizaron la aceptación de los niveles de riesgo residual, certificando su alineamiento pleno con la norma ISO/IEC 27701:2025.
