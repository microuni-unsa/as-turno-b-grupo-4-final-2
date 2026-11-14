#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Determinación del Alcance del SGPI",
  code: "G4-ALC-01",
  version: "2.0",
  date: "2022-09-10",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Oficial de Seguridad de la Información (OSI / DPO)",
    date: "2022-09-02"
  ),
  reviewer: (
    name: "Mg. Lucía Valdivia Paredes",
    role: "Directora Universitaria de TIC (DUTIC)",
    date: "2022-09-05"
  ),
  approver: (
    name: "Dr. Hugo José Sánchez",
    role: "Rector - Presidente del Comité SGPI",
    date: "2022-09-10"
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
  )
)

= Propósito y Justificación de la Evolución de Alcance
Conforme a las Cláusulas 4.3 y 4.4 de la norma ISO/IEC 27701:2025, el presente documento actualiza los límites operativos del SGPI de la UNSA tras la aceleración digital post-pandemia, concentrando los esfuerzos de control en los flujos telemáticos y reduciendo la exposición de activos físicos.

= Determinación del Rol Institucional (Cláusula 4.1)
La UNSA ratifica su función como *Responsable del Tratamiento de Datos Personales (PII Controller)*, determinando la finalidad y condiciones del tratamiento en sus canales digitales.

= Procesos en Alcance (Adaptación Post-Pandemia)

== Proceso Misional: Admisión Virtual de Pregrado
Comprende la inscripción en línea mediante la plataforma institucional `admision.unsa.edu.pe`, la recepción de documentos académicos digitalizados en formato PDF, la autenticación remota del postulante y la publicación digital de cuadros de méritos.
- *Responsable:* Dirección General de Admisión.
- *Activos Clave:* Servidores web en clúster virtualizado DUTIC, base de datos PostgreSQL institucional y pasarela de pago digital con el Banco de la Nación.

== Proceso de Soporte: Planilla de Remuneraciones en Teletrabajo
Comprende el procesamiento de haberes, cálculo previsional y emisión de boletas de pago electrónicas firmado digitalmente mediante trámites en Sisgedo, ejecutado por analistas bajo modalidad mixta y teletrabajo.
- *Responsable:* Subdirección de Personal y Remuneraciones.
- *Activos Clave:* Túneles VPN SSL institucionales con MFA y servidor de archivos con cifrado en reposo.

= Delimitación Territorial y Tecnológica
- *Sedes Físicas:* Campus Ingenierías (infraestructura tecnológica central DUTIC), Campus Biomédicas y Sociales en Arequipa.
- *Entorno Lógico:* Redes lógicas corporativas, servicios de nube privada híbrida y estaciones portátiles institucionales autorizadas.

= Exclusiones Justificadas
1. *Archivos Físicos Históricos:* Se formaliza la *exclusión de los legajos de papel pasivos* anteriores al año 2020 resguardados en el Archivo Central, por encontrarse en custodia estática sin tratamiento activo y con acceso restringido bajo inventario notarial.
2. *Procesos de Admisión Extraordinaria Presencial Excepcional:* Procesos no sistematizados fuera de la plataforma web.
