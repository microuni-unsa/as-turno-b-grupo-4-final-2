#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Determinación del Alcance del SGPI")
  let code = data.at("code", default: "G4-ALC-01")
  let version = data.at("version", default: "")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: ())
  let validity = data.at("validity", default: none)
  let owner-role = data.at("owner-role", default: none)

  doc-template(
    title: title,
    code: code,
    version: version,
    date: date,
    confidentiality: confidentiality,
    author: author,
    reviewer: reviewer,
    approver: approver,
    history: history,
    references: references,
    validity: validity,
    owner-role: owner-role,
  )[
    = Propósito y Fundamento Normativo
    #data.at("purpose", default: "")

    = Determinación del Rol Institucional (Cláusula 4.1)
    #data.at("role_determination", default: "")

    = Par Mandatorio de Procesos en Alcance

    == Proceso Misional: #data.admission_process.at("title", default: "Admisión de Pregrado")
    #data.admission_process.at("description", default: "")
    - *Responsable del Proceso:* #data.admission_process.at("responsible", default: "")
    #if "categories" in data.admission_process [
      - *Categorías de Titulares:* #data.admission_process.at("categories")
    ]
    #if "population" in data.admission_process [
      - *Población Impactada:* #data.admission_process.at("population")
    ]
    - *Datos Tratados:* #data.admission_process.at("data_treated", default: "")
    #if "key_assets" in data.admission_process [
      - *Activos Clave:* #data.admission_process.at("key_assets")
    ]

    == Proceso de Soporte: #data.payroll_process.at("title", default: "Planilla de Remuneraciones")
    #data.payroll_process.at("description", default: "")
    - *Responsable del Proceso:* #data.payroll_process.at("responsible", default: "")
    #if "categories" in data.payroll_process [
      - *Categorías de Titulares:* #data.payroll_process.at("categories")
    ]
    #if "population" in data.payroll_process [
      - *Población Impactada:* #data.payroll_process.at("population")
    ]
    - *Datos Tratados:* #data.payroll_process.at("data_treated", default: "")
    #if "key_assets" in data.payroll_process [
      - *Activos Clave:* #data.payroll_process.at("key_assets")
    ]

    = Perímetro Geográfico e Infraestructura Tecnológica

    #if "main_campuses" in data [
      == Sedes Centrales
      #for campus in data.main_campuses [
        - *#campus.at("name")*: #campus.at("description")
      ]
    ]

    #if "filiales" in data and data.filiales.len() > 0 [
      == Filiales Descentralizadas Regionales
      #for filial in data.filiales [
        - *#filial.at("name")*: #filial.at("description")
      ]
    ]

    #if "tech_infrastructure" in data [
      == Infraestructura Tecnológica
      #for item in data.tech_infrastructure [
        - #item
      ]
    ]

    = Exclusiones Justificadas
    #for excl in data.at("exclusions", default: ()) [
      - #excl
    ]

    #if body != none { body }
  ]
}
