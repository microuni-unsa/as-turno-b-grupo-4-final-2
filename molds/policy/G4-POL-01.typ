#set page(
  paper: "a4",
  margin: (top: 2.2cm, bottom: 2cm, left: 2.2cm, right: 2.2cm),
  header: [
    #grid(
      columns: (1fr, auto),
      align(left)[
        #text(weight: "bold", size: 8pt, fill: rgb("#0a2540"))[UNIVERSIDAD NACIONAL DE SAN AGUSTÍN DE AREQUIPA]\
        #text(fill: luma(80), size: 7pt)[SISTEMA DE GESTIÓN DE PRIVACIDAD DE LA INFORMACIÓN (SGPI - ISO/IEC 27701:2025)]
      ],
      align(right)[
        #text(weight: "bold", size: 8.5pt)[G4-POL-01 | v3.0]\
        #text(fill: rgb("#b30000"), size: 7pt, weight: "bold")[CONFIDENCIAL - USO INTERNO UNSA]
      ]
    )
    #v(1pt)
    #line(length: 100%, stroke: 0.5pt + luma(180))
  ],
  footer: context [
    #line(length: 100%, stroke: 0.5pt + luma(180))
    #v(1pt)
    #grid(
      columns: (1fr, auto),
      align(left)[
        #text(size: 7pt, fill: luma(100))[SGPI-UNSA Grupo 4 | Política Institucional Oficial | Aprobada por Resolución Rectoral]
      ],
      align(right)[
        #text(size: 7pt, fill: luma(100))[Página #counter(page).display("1 de 1", both: true)]
      ]
    )
  ]
)

#set text(font: "Liberation Sans", size: 8.8pt, lang: "es")
#set par(justify: true, leading: 0.55em)

#v(-0.2cm)
#align(center)[
  #text(size: 13pt, weight: "bold", fill: rgb("#0a2540"))[POLÍTICA DE PRIVACIDAD DE LA INFORMACIÓN]\
  #v(2pt)
  #text(size: 8.5pt, weight: "medium", fill: luma(90))[
    Código: #text(weight: "bold")[G4-POL-01] | Versión: #text(weight: "bold")[3.0] | Fecha de Aprobación: #text(weight: "bold")[2025-10-28]
  ]
]
#v(0.1cm)

= Declaración de Compromiso de la Alta Dirección (Cláusula 5.2)
La Alta Dirección de la *Universidad Nacional de San Agustín de Arequipa (UNSA)*, en su calidad de *Responsable del Tratamiento de Datos Personales (PII Controller - Cl. 4.1)*, asume el compromiso ineludible de garantizar la confidencialidad, integridad, disponibilidad y uso legítimo de los datos personales tratados en sus procesos misionales y de soporte, en estricto cumplimiento del marco legal peruano (*Ley N° 29733*) y el estándar internacional *ISO/IEC 27701:2025 (Segunda edición)*.

= Principios Rectores de Protección de Datos
1. *Legalidad y Legitimidad:* Todo tratamiento de datos de postulantes, estudiantes, docentes y trabajadores se sustenta en bases jurídicas legítimas determinadas por la Ley Universitaria 30220, la relación contractual o el consentimiento libre, previo, expreso e informado.
2. *Finalidad Determinada:* La recopilación de PII se restringe estrictamente a los propósitos explícitos y legítimos autorizados, prohibiéndose su comercialización o cesión no informada.
3. *Proporcionalidad y Minimización (Privacy by Default):* Se recaba la cantidad mínima de datos personales necesaria para satisfacer la finalidad perseguida, aplicando desidentificación y supresión oportuna.
4. *Seguridad Técnica y Organizativa:* Se adoptan medidas técnicas avanzadas (cifrado AES-256, autenticación multifactor, túneles IPSec, MDM institucional y auditoría continua) para prevenir accesos no autorizados, pérdidas o brechas de seguridad.
5. *Garantía de Derechos ARCO:* Se asegura a todos los titulares la disponibilidad de mecanismos expeditos, transparentes y gratuitos para el ejercicio de sus derechos de Acceso, Rectificación, Cancelación y Oposición.

= Compromisos de la Dirección Universitaria
- Proveer los recursos humanos, tecnológicos y financieros indispensables para la eficaz operación del SGPI en sedes centrales y filiales descentralizadas (Camaná y El Pedregal).
- Mantener activo y capacitado de forma permanente al Equipo de Respuesta a Incidentes (CSIRT-UNSA) bajo la Guía B.3.12.
- Impulsar la mejora continua del SGPI mediante auditorías periódicas bajo ISO 19011:2026 y revisiones semestrales por la Dirección.

#v(0.15cm)
#block(width: 100%, stroke: 0.5pt + luma(180), radius: 3pt, inset: 6pt)[
  #grid(
    columns: (1fr, 1fr, 1fr),
    gutter: 8pt,
    [
      #text(size: 7.5pt, weight: "bold")[Elaborado por:]\
      #text(size: 7.5pt)[Ing. Carlos M. Benítez]\
      #text(size: 6.5pt, fill: luma(90))[Oficial de Seguridad / DPO]\
      #text(size: 6.5pt, fill: luma(90))[Fecha: 2025-10-20]
    ],
    [
      #text(size: 7.5pt, weight: "bold")[Revisado por:]\
      #text(size: 7.5pt)[Mg. Lucía Valdivia Paredes]\
      #text(size: 6.5pt, fill: luma(90))[Directora DUTIC]\
      #text(size: 6.5pt, fill: luma(90))[Fecha: 2025-10-24]
    ],
    [
      #text(size: 7.5pt, weight: "bold")[Aprobado por:]\
      #text(size: 7.5pt)[Dr. Hugo José Sánchez]\
      #text(size: 6.5pt, fill: luma(90))[Rector - Presidente SGPI]\
      #text(size: 6.5pt, fill: luma(90))[Fecha: 2025-10-28]
    ]
  )
]
