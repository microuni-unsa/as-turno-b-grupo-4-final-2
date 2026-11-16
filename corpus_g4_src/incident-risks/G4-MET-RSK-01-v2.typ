#import "../../molds/incident-risks/mold.typ": mold

#let data = (
  code: "G4-MET-RSK-01",
  version: "2.0",
  date: "2022-09-10",
  title: "Metodología de evaluación y tratamiento de riesgos",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  organization-name: "la Universidad Nacional de San Agustín de Arequipa (UNSA)",
  scope-desc: "la totalidad de los procesos de Admisión digitalizada vía portal web (admision.unsa.edu.pe) y Planillas de Remuneraciones en modalidad de teletrabajo seguro con VPN SSL en las Sedes Centrales de Arequipa (Áreas de Ingenierías, Biomédicas y Sociales)",
  users-desc: "todos los empleados, directores de unidad académica y administrativa, operadores de admisiones web y nóminas, y personal de seguridad de la información",
  norm-ref: "la norma ISO/IEC 27701:2019 sobre la base de ISO/IEC 27001:2013 e ISO/IEC 27557",
  norm-controls: "ISO/IEC 27701:2019 (Tablas A.1 y A.3)",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  validity: "2023-09-10",
  references: (
    "ISO/IEC 27001:2013 — Cláusulas 6.1.2, 6.1.3, 8.2 y 8.3",
    "ISO/IEC 27701:2019 — Cláusulas 6.1.2, 6.1.3, 8.2 y 8.3",
    "ISO/IEC 27557:2022 — Gestión de riesgos de privacidad en organizaciones",
    "ISO 31000:2018 — Gestión del riesgo — Directrices",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS)",
    "Ley N° 30220 — Ley Universitaria del Perú",
    "G4-POL-01 — Política de Privacidad de la Información de la UNSA",
    "G4-SOA-01 — Declaración de Aplicabilidad del SGPI",
    "G4-PRC-INC-01 — Procedimiento de Respuesta a Incidentes de Privacidad",
  ),
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Oficial de Seguridad de la Información (OSI / DPO)",
    date: "2022-09-02"
  ),
  reviewer: (
    name: "Mg. Lucía Valdivia Paredes",
    role: "Directora Universitaria de TIC (DUTIC)",
    date: "2022-09-06"
  ),
  approver: (
    name: "Dr. Hugo José Sánchez",
    role: "Rector de la Universidad Nacional de San Agustín de Arequipa / Presidente del Comité SGPI",
    date: "2022-09-10"
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial de la metodología de evaluación y tratamiento de riesgos para la certificación inicial bajo ISO/IEC 27701:2019 en sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Reestructuración post-pandemia COVID-19: adaptación a la virtualización integral de inscripciones de admisión y teletrabajo con VPN SSL en nóminas."
    ),
  ),
  records-table: (
    (
      name: "Cuadro de evaluación de riesgos (formulario electrónico, documento en Excel)",
      location: "Repositorio PIMS / Servidor DUTIC",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Solamente el Oficial de Seguridad de la Información (OSI / DPO) tiene derecho a crear entradas y a realizar modificaciones en el Cuadro de evaluación de riesgos",
      retention: "Los datos son archivados de forma permanente"
    ),
    (
      name: "Cuadro de tratamiento de riesgos (formulario electrónico, documento en Excel)",
      location: "Repositorio PIMS / Servidor DUTIC",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Solamente el Oficial de Seguridad de la Información (OSI / DPO) tiene derecho a crear entradas y a realizar modificaciones en el Cuadro de tratamiento de riesgos",
      retention: "Los datos son archivados de forma permanente"
    ),
    (
      name: "Informe sobre evaluación y tratamiento de riesgos (formulario electrónico, en formato PDF)",
      location: "Repositorio PIMS / Sisgedo",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "El Informe se prepara en formato PDF de sólo lectura firmado digitalmente",
      retention: "El informe es almacenado por el plazo de 5 años"
    ),
    (
      name: "Declaración de aplicabilidad (formulario electrónico, en formato PDF)",
      location: "Repositorio PIMS / Sisgedo",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Solamente el Oficial de Seguridad de la Información (OSI / DPO) tiene derecho a crear entradas y a realizar modificaciones en la Declaración de aplicabilidad",
      retention: "Las versiones no vigentes de la DdA son almacenadas por un plazo de 5 años"
    ),
    (
      name: "Plan de tratamiento de riesgos (formulario electrónico, documento de Word / Typst)",
      location: "Repositorio PIMS / Sisgedo",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Solamente el Oficial de Seguridad de la Información (OSI / DPO) tiene derecho a crear entradas y a realizar modificaciones en el Plan de tratamiento de riesgos",
      retention: "Las versiones no vigentes del Plan de tratamiento de riesgos son almacenadas por un plazo de 5 años"
    ),
  )
)

#mold(data)
