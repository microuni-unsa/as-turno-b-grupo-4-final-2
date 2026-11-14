#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Determinación del Alcance del SGPI",
  code: "G4-ALC-01",
  version: "1.0",
  date: "2019-04-15",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Oficial de Seguridad de la Información (OSI / DPO)",
    date: "2019-04-10"
  ),
  reviewer: (
    name: "Mg. Lucía Valdivia Paredes",
    role: "Directora Universitaria de TIC (DUTIC)",
    date: "2019-04-12"
  ),
  approver: (
    name: "Dr. Rohel Sánchez Sánchez",
    role: "Rector - Presidente del Comité SGPI",
    date: "2019-04-15"
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial de la definición de alcance para la certificación ISO/IEC 27701:2019. Límites físicos: Sedes centrales Arequipa. Procesos: Admisión y Planillas."
    ),
  )
)

= Propósito y Fundamento Normativo
El presente documento formaliza los límites organizacionales, geográficos y tecnológicos del Sistema de Gestión de Privacidad de la Información (SGPI) de la Universidad Nacional de San Agustín de Arequipa (UNSA), en cumplimiento de las Cláusulas 4.3 y 4.4 de la norma ISO/IEC 27701:2025.

= Determinación del Rol Institucional (Cláusula 4.1)
En aplicación de la Cláusula 4.1, la UNSA determina su función exclusiva como *Responsable del Tratamiento de Datos Personales (PII Controller)* para la totalidad de las actividades comprendidas en este alcance.

= Par Mandatorio de Procesos en Alcance

== Proceso Misional: Admisión de Pregrado
Comprende la convocatoria, inscripción presencial, validación de requisitos académicos, captura biométrica en ventanilla, aplicación de exámenes ordinarios y publicación de listas de postulantes admitidos a los programas de pregrado de la UNSA.
- *Responsable del Proceso:* Dirección General de Admisión.
- *Categorías de Titulares:* Postulantes, padres o apoderados (en caso de menores de edad) y vocales evaluadores.
- *Datos Tratados:* Nombres, DNI, dirección, historial académico escolar, huella dactilar, fotografía y notas.

== Proceso de Soporte: Planilla de Remuneraciones
Comprende el cálculo, retención de tributos y aportes de ley, liquidación y pago mensual de sueldos y beneficios del personal docente y no docente de la Universidad.
- *Responsable del Proceso:* Subdirección de Personal y Remuneraciones (Dirección General de Administración).
- *Categorías de Titulares:* Docentes ordinarios, docentes contratados y servidores administrativos bajo regímenes DL 276, DL 1057 (CAS) y Ley 30220.
- *Datos Tratados:* Nombres, DNI, cuentas bancarias de abono, aportes a AFP/ONP, descuentos judiciales y evaluaciones de desempeño.

= Límites Geográficos e Infraestructura (Versión 1.0)
El perímetro físico se circunscribe estrictamente a las sedes urbanas de la ciudad de Arequipa:
1. *Campus Área de Ingenierías*: Av. Independencia s/n con Paucarpata (Data Center principal de DUTIC y servidores centrales).
2. *Campus Área de Biomédicas*: Av. Alcides Carrión s/n (Oficinas de apoyo de admisión).
3. *Campus Área de Sociales*: Av. Virgen del Pilar s/n (Pabellones de aplicación de exámenes).

= Exclusiones Justificadas
- Se excluyen los procesos de admisión de posgrado y convenios internacionales, por encontrarse en fase preliminar de diseño documental.
- Se excluyen los servicios tercerizados de comedor y transporte universitario, los cuales no acceden a las bases de datos de admisión ni planillas.
