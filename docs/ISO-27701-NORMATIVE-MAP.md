# Mapa Normativo Integral de ISO/IEC 27701:2025
## Sistema de Gestión de Privacidad de la Información (SGPI) — Universidad Nacional de San Agustín de Arequipa (UNSA)

> **Documento Normativo Guía de Fase 0**  
> **Estándar de Referencia**: ISO/IEC 27701:2025 (*Information security, cybersecurity and privacy protection — Privacy information management systems — Requirements and guidance*, Segunda edición, 2025-10, 72 páginas).  
> **Archivo Fuente Oficial**: `docs/ISO 27701-2025_ocr.pdf`.  
> **Rol Institucional Determinado**: Responsable del Tratamiento de Datos Personales (*PII Controller*, Cl. 4.1).  
> **Propósito**: Proveer a los desarrolladores de moldes Typst (`molds/`, `corpus_g4_src/`), redactores técnicos y auditores del SGPI de la UNSA la base normativa exhaustiva, validada y con citas textuales página a página del estándar independiente ISO/IEC 27701:2025.

---

## Índice General

1. [Sección (a): Inventario Exhaustivo de Cláusulas 4 a 10 y Mandatos de Información Documentada](#1-sección-a-inventario-exhaustivo-de-cláusulas-4-a-10-y-mandatos-de-información-documentada)
   - [4. Contexto de la Organización](#cláusula-4-contexto-de-la-organización)
   - [5. Liderazgo](#cláusula-5-liderazgo)
   - [6. Planificación](#cláusula-6-planificación)
   - [7. Apoyo](#cláusula-7-apoyo)
   - [8. Operación](#cláusula-8-operación)
   - [9. Evaluación del Desempeño](#cláusula-9-evaluación-del-desempeño)
   - [10. Mejora](#cláusula-10-mejora)
   - [Tabla Maestra de Mandatos de Información Documentada](#tabla-maestra-de-mandatos-de-información-documentada-cl-410)
2. [Sección (b): Anexo A — Listas Completas de Controles y Criterios de Aplicabilidad](#2-sección-b-anexo-a--listas-completas-de-controles-y-criterios-de-aplicabilidad)
   - [Fundamento y Criterios del Anexo A (Cl. 6.1.3e)](#fundamento-y-criterios-del-anexo-a-cl-613e)
   - [Tabla A.1: Controles para Responsables del Tratamiento (PII Controllers)](#tabla-a1--controles-para-responsables-del-tratamiento-pii-controllers-31-controles)
   - [Tabla A.2: Controles para Encargados (PII Processors) — Exclusión y Texto Reutilizable](#tabla-a2--controles-para-encargados-pii-processors-18-controles--excluidos)
   - [Tabla A.3: Controles de Seguridad de la Información para Ambos Roles](#tabla-a3--controles-de-seguridad-de-la-información-para-responsables-y-encargados-29-controles)
   - [Matriz de Controles Relevantes para la Gestión de Incidentes de Privacidad](#matriz-de-controles-relevantes-para-la-gestión-de-incidentes-de-privacidad)
3. [Sección (c): Anexo B — Guías B.3.11, B.3.12 y Campos Exigidos para Registros de Brechas](#3-sección-c-anexo-b--guías-b311-b312-y-campos-exigidos-para-registros-de-brechas)
   - [Guía B.3.11: Planificación y Preparación ante Incidentes de Privacidad](#guía-b311-planificación-y-preparación-para-la-gestión-de-incidentes-de-seguridad-relacionados-con-pii)
   - [Guía B.3.12: Respuesta a Incidentes y Criterios Forenses/Regulatorios](#guía-b312-respuesta-a-incidentes-de-seguridad-de-la-información-relacionados-con-pii)
   - [Campos Obligatorios del Registro de Brechas de PII (B.3.12)](#campos-obligatorios-del-registro-de-brechas-de-pii-guía-b312-pág-pdf-49-50)
   - [Estructura de Contenido de Notificaciones (B.3.12 Nota 2)](#estructura-de-contenido-de-notificaciones-de-brecha-b312-nota-2-pág-pdf-49)
   - [Otras Guías del Anexo B Relevantes para Registros e Incidentes](#otras-guías-del-anexo-b-relevantes-para-registros-e-incidentes)
4. [Sección (d): Tabla Maestra de Mapeo Cláusula-Documento por Código G4 (18 Códigos)](#4-sección-d-tabla-maestra-de-mapeo-cláusula-documento-por-código-g4-18-códigos)
5. [Sección (e): Notas de Conversión ISO 27001 → ISO 27701 (Transición Normativa)](#5-sección-e-notas-de-conversión-iso-27001--iso-27701-transición-normativa)
   - [5.1 Sustitución Terminológica: SGSI → SGPI](#51-sustitución-terminológica-sgsi--sgpi)
   - [5.2 Referencias Cruzadas de Controles: ISO 27001 Anexo A → ISO 27701 Tablas A.1 / A.3](#52-referencias-cruzadas-de-controles-iso-27001-anexo-a--iso-27701-tablas-a1--a3)
   - [5.3 Tríada CIA → Tríada CIA + Propiedades de Privacidad (ISO/IEC 29100)](#53-tríada-cia--tríada-cia--propiedades-de-privacidad-isoiec-29100)
   - [5.4 Lo que GDPR y B.3.12 NO Exigen: Desmitificación del Reloj de 72 Horas](#54-lo-que-gdpr-y-b312-no-exigen-desmitificación-del-reloj-de-72-horas)

---

## 1. Sección (a): Inventario Exhaustivo de Cláusulas 4 a 10 y Mandatos de Información Documentada

ISO/IEC 27701:2025 se estructuró en su segunda edición como una norma de requisitos de sistema de gestión independiente (*stand-alone management system standard*, véase Prólogo, pág. PDF 5). A diferencia de la edición 2019 (que funcionaba como un anexo aditivo sobre la estructura de ISO/IEC 27001:2013), la edición 2025 contiene cláusulas 4 a 10 completas y auto-contenidas.

### Cláusula 4: Contexto de la Organización

#### 4.1 Comprensión de la organización y de su contexto (*Understanding the organization and its context*)
- **Ubicación en PDF**: Páginas 10-11 (pág. oficial de norma 4-5).
- **Requisitos normativos**:
  - La organización debe determinar los factores internos y externos pertinentes a su propósito y que afecten su capacidad para lograr los resultados previstos de su SGPI (*privacy information management system*).
  - La organización debe determinar si el cambio climático (*climate change*) es un asunto relevante.
  - La organización debe determinar explícitamente si actúa como **Responsable del Tratamiento de PII** (*PII controller*, incluyendo corresponsable / *joint PII controller*) o como **Encargado del Tratamiento de PII** (*PII processor*).
  - Si la organización actúa en ambos roles, deben determinarse roles separados, cada uno de los cuales estará sujeto a un conjunto separado de controles normativos.
  - Factores a considerar: legislación sobre privacidad aplicable, reglamentos, decisiones judiciales, contexto organizacional, gobernanza, políticas, procedimientos, decisiones administrativas y compromisos contractuales.
- **Mandato de información documentada**: No contiene la frase literal "retain documented information", pero la determinación del rol y el contexto sustentan el documento formal del alcance (Cl. 4.3).

#### 4.2 Comprensión de las necesidades y expectativas de las partes interesadas (*Understanding the needs and expectations of interested parties*)
- **Ubicación en PDF**: Página 11 (pág. oficial de norma 4-5).
- **Requisitos normativos**:
  - Determinar las partes interesadas pertinentes para el SGPI, sus requisitos aplicables y cuáles de estos requisitos serán abordados a través del SGPI.
  - La organización debe incluir obligatoriamente entre sus partes interesadas a aquellas que tienen intereses o responsabilidades vinculadas al tratamiento de datos personales, **incluyendo explícitamente a los titulares de los datos (*PII principals*)**.
  - Otras partes interesadas: clientes, autoridades de supervisión (ANPD en Perú), otros responsables, encargados y subcontratistas.

#### 4.3 Determinación del alcance del sistema de gestión de privacidad de la información (*Determining the scope of the privacy information management system*)
- **Ubicación en PDF**: Páginas 11-12 (pág. oficial de norma 5).
- **Requisitos normativos**:
  - Determinar los límites y la aplicabilidad del SGPI para establecer su alcance formal.
  - Considerar los factores de 4.1 y los requisitos de 4.2.
  - Al determinar el alcance, la organización debe incluir obligatoriamente el tratamiento de datos personales (*processing of PII*).
- **Mandato explícito de información documentada**:
  > *"The scope shall be available as documented information."* (Pág. PDF 12 / Pág. de norma 5).  
  > **Traducción**: "El alcance debe estar disponible como información documentada."

#### 4.4 Sistema de gestión de privacidad de la información (*Privacy information management system*)
- **Ubicación en PDF**: Página 12 (pág. oficial de norma 5).
- **Requisitos normativos**:
  - Establecer, implementar, mantener y mejorar continuamente un SGPI, incluidos los procesos necesarios y sus interacciones, de conformidad con los requisitos de este documento.

---

### Cláusula 5: Liderazgo

#### 5.1 Liderazgo y compromiso (*Leadership and commitment*)
- **Ubicación en PDF**: Página 12 (pág. oficial de norma 5).
- **Requisitos normativos**:
  - La alta dirección debe demostrar liderazgo y compromiso asegurando que se establezcan la política de privacidad y los objetivos de privacidad; asegurando la integración de los requisitos del SGPI en los procesos de negocio de la organización; asegurando los recursos necesarios; comunicando la importancia de la gestión eficaz de la privacidad; logrando los resultados previstos; y promoviendo la mejora continua.

#### 5.2 Política de privacidad (*Privacy policy*)
- **Ubicación en PDF**: Páginas 12-13 (pág. oficial de norma 5-6).
- **Requisitos normativos**:
  - La alta dirección debe establecer una política de privacidad que: sea apropiada para el propósito de la organización; proporcione un marco para el establecimiento de objetivos de privacidad; incluya un compromiso de cumplir con los requisitos aplicables; e incluya un compromiso con la mejora continua del SGPI.
  - La política debe ser comunicada dentro de la organización y estar disponible para las partes interesadas pertinentes.
- **Mandato explícito de información documentada**:
  > *"The privacy policy shall: a) be available as documented information;"* (Pág. PDF 12 / Pág. de norma 5).  
  > **Traducción**: "La política de privacidad debe: a) estar disponible como información documentada."

#### 5.3 Roles, responsabilidades y autoridades en la organización (*Roles, responsibilities and authorities*)
- **Ubicación en PDF**: Página 13 (pág. oficial de norma 6).
- **Requisitos normativos**:
  - Asignar y comunicar responsabilidades y autoridades para: a) asegurar que el SGPI sea conforme con los requisitos de este documento; b) informar a la alta dirección sobre el desempeño del SGPI.

---

### Cláusula 6: Planificación

#### 6.1 Acciones para abordar riesgos y oportunidades (*Actions to address risks and opportunities*)
##### 6.1.1 Generalidades (*General*)
- **Ubicación en PDF**: Página 13 (pág. oficial de norma 6).
- **Requisitos normativos**:
  - Al planificar el SGPI, considerar las cuestiones de 4.1 y los requisitos de 4.2 para determinar riesgos y oportunidades que aseguren que el SGPI logre sus resultados previstos, prevenga o reduzca efectos indeseados y logre la mejora continua.

##### 6.1.2 Evaluación de riesgos de privacidad (*Privacy risk assessment*)
- **Ubicación en PDF**: Páginas 13-14 (pág. oficial de norma 6-7).
- **Requisitos normativos**:
  - Definir y aplicar un proceso de evaluación de riesgos de privacidad que:
    a) Establezca y mantenga criterios de riesgo de privacidad (criterios de aceptación y de realización).
    b) Asegure que las evaluaciones repetidas produzcan resultados consistentes, válidos y comparables.
    c) Identifique los riesgos de privacidad asociados a la protección de la privacidad y riesgos de seguridad de la información dentro del alcance, identificando a los dueños del riesgo (*risk owners*).
    d) Analice los riesgos de privacidad: **1) evaluando las consecuencias potenciales tanto para la organización como para los titulares de datos (*PII principals*)** si los riesgos se materializan; 2) evaluando la probabilidad realista de ocurrencia; 3) determinando el nivel de riesgo.
    e) Evalúe los riesgos comparando los resultados con los criterios y priorizándolos para el tratamiento.
- **Mandato explícito de información documentada**:
  > *"The organization shall retain documented information about the privacy risk assessment process."* (Pág. PDF 14 / Pág. de norma 7).  
  > **Traducción**: "La organización debe conservar información documentada sobre el proceso de evaluación de riesgos de privacidad."

##### 6.1.3 Tratamiento de riesgos de privacidad (*Privacy risk treatment*)
- **Ubicación en PDF**: Páginas 14-15 (pág. oficial de norma 7-8).
- **Requisitos normativos**:
  - Definir y aplicar un proceso de tratamiento de riesgos para tratar riesgos de tratamiento de PII, incluyendo riesgos a titulares de datos y la seguridad de la PII, mediante:
    a) Selección de opciones apropiadas de tratamiento de riesgos.
    b) Determinación de todos los controles necesarios.
    c) **Identificación y documentación del programa de seguridad de la información implementado por la organización** (debe abordar al menos: gestión de riesgos, políticas, organización, seguridad en RRHH, activos, control de acceso, operaciones, redes, desarrollo, proveedores, incidentes, continuidad, revisiones, criptografía y seguridad física).
    d) Comparación de controles con el Anexo A verificando que no se haya omitido ningún control necesario.
    e) **Elaboración de una Declaración de Aplicabilidad (*Statement of Applicability - SoA*)** que contenga: controles necesarios; justificación de inclusión; si están implementados o no; y la **justificación para excluir cualquiera de los controles del Anexo A**.
    f) Formulación de un plan de tratamiento de riesgos de privacidad.
    g) Obtención de aprobación de los dueños del riesgo para el plan de tratamiento y aceptación de riesgos residuales.
    h) Consideración de las guías del Anexo B.
- **Mandatos explícitos de información documentada**:
  > *"The organization shall produce a statement of applicability that includes: the necessary controls... justification for their inclusion; whether the necessary controls are implemented or not; and the justification for excluding any of the controls from Annex A."* (Pág. PDF 15 / Pág. de norma 8).  
  > *"The organization shall retain documented information about the privacy risk treatment process."* (Pág. PDF 15 / Pág. de norma 8).  
  > **Traducción**: "La organización debe elaborar una declaración de aplicabilidad... La organización debe conservar información documentada sobre el proceso de tratamiento de riesgos de privacidad."

#### 6.2 Objetivos de privacidad y planificación para lograrlos (*Privacy objectives and planning to achieve them*)
- **Ubicación en PDF**: Páginas 15-16 (pág. oficial de norma 8-9).
- **Requisitos normativos**:
  - Establecer objetivos de privacidad en las funciones y niveles pertinentes.
  - Los objetivos deben ser coherentes con la política de privacidad, medibles (si es practicable), tener en cuenta requisitos aplicables, ser monitoreados, comunicados y actualizados.
  - Planificar qué se hará, qué recursos se requerirán, quién será responsable, cuándo se finalizará y cómo se evaluarán los resultados.
- **Mandato explícito de información documentada**:
  > *"The privacy objectives shall: ... g) be available as documented information."* (Pág. PDF 15 / Pág. de norma 8).  
  > **Traducción**: "Los objetivos de privacidad deben: ... g) estar disponibles como información documentada."

#### 6.3 Planificación de los cambios (*Planning of changes*)
- **Ubicación en PDF**: Página 16 (pág. oficial de norma 9).
- **Requisitos normativos**:
  - Cuando la organización determine la necesidad de cambios en el SGPI, estos cambios se llevarán a cabo de manera planificada.

---

### Cláusula 7: Apoyo

#### 7.1 Recursos (*Resources*)
- **Ubicación en PDF**: Página 16 (pág. oficial de norma 9).
- **Requisitos normativos**:
  - Determinar y proporcionar los recursos necesarios para el establecimiento, implementación, mantenimiento y mejora continua del SGPI.

#### 7.2 Competencia (*Competence*)
- **Ubicación en PDF**: Página 16 (pág. oficial de norma 9).
- **Requisitos normativos**:
  - Determinar la competencia necesaria de las personas bajo su control que afecten el desempeño de la privacidad; asegurar que sean competentes sobre la base de educación, formación o experiencia; y tomar acciones aplicables para adquirir la competencia necesaria.
- **Mandato explícito de información documentada**:
  > *"Appropriate documented information shall be available as evidence of competence."* (Pág. PDF 16 / Pág. de norma 9).  
  > **Traducción**: "Debe estar disponible información documentada apropiada como evidencia de la competencia."

#### 7.3 Toma de conciencia (*Awareness*)
- **Ubicación en PDF**: Página 16 (pág. oficial de norma 9).
- **Requisitos normativos**:
  - Asegurar que el personal sea consciente de: la política de privacidad; su contribución a la eficacia del SGPI (incluidos los beneficios de un mejor desempeño de la privacidad); y las implicaciones del incumplimiento de los requisitos del SGPI.

#### 7.4 Comunicación (*Communication*)
- **Ubicación en PDF**: Páginas 16-17 (pág. oficial de norma 9-10).
- **Requisitos normativos**:
  - Determinar la necesidad de comunicaciones internas y externas pertinentes al SGPI (qué, cuándo, con quién y cómo comunicar).

#### 7.5 Información documentada (*Documented information*)
##### 7.5.1 Generalidades (*General*)
- **Ubicación en PDF**: Página 17 (pág. oficial de norma 10).
- **Requisitos normativos**:
  - El SGPI debe incluir: a) información documentada requerida por este documento; b) información documentada determinada por la organización como necesaria para la eficacia del SGPI.

##### 7.5.2 Creación y actualización (*Creating and updating documented information*)
- **Ubicación en PDF**: Página 17 (pág. oficial de norma 10).
- **Requisitos normativos**:
  - Asegurar la apropiada: a) identificación y descripción (título, fecha, autor, número de referencia); b) formato (idioma, versión del software, gráficos) y medio (electrónico, papel); c) revisión y aprobación con respecto a su idoneidad y adecuación.

##### 7.5.3 Control de la información documentada (*Control of documented information*)
- **Ubicación en PDF**: Página 17 (pág. oficial de norma 10).
- **Requisitos normativos**:
  - Controlar la información documentada para asegurar que: a) esté disponible y sea idónea para su uso; b) esté protegida adecuadamente (pérdida de confidencialidad, uso indebido o pérdida de integridad).
  - Tratar las siguientes actividades: distribución, acceso, recuperación, uso, almacenamiento y preservación (incluida la legibilidad), control de cambios (versiones), conservación y disposición final.
  - Controlar y proteger la información documentada de origen externo.

---

### Cláusula 8: Operación

#### 8.1 Planificación y control operacional (*Operational planning and control*)
- **Ubicación en PDF**: Página 18 (pág. oficial de norma 11).
- **Requisitos normativos**:
  - Planificar, implementar y controlar los procesos necesarios para cumplir con los requisitos y para implementar las acciones determinadas en la Cláusula 6.
  - Mantener bajo control los cambios planificados y revisar las consecuencias de cambios imprevistos.
  - Asegurar que los procesos subcontratados estén determinados y controlados.
- **Mandato explícito de información documentada**:
  > *"Documented information shall be available to the extent necessary to have confidence that the processes have been carried out as planned."* (Pág. PDF 18 / Pág. de norma 11).  
  > **Traducción**: "La información documentada debe estar disponible en la medida necesaria para tener confianza en que los procesos se han llevado a cabo según lo planificado."

#### 8.2 Evaluación de riesgos de privacidad (*Privacy risk assessment*)
- **Ubicación en PDF**: Página 18 (pág. oficial de norma 11).
- **Requisitos normativos**:
  - Realizar evaluaciones del riesgo de privacidad a intervalos planificados o cuando se propongan o se produzcan cambios significativos.
- **Mandato explícito de información documentada**:
  > *"The organization shall retain documented information of the results of the privacy risk assessments."* (Pág. PDF 18 / Pág. de norma 11).  
  > **Traducción**: "La organización debe conservar información documentada de los resultados de las evaluaciones del riesgo de privacidad."

#### 8.3 Tratamiento de riesgos de privacidad (*Privacy risk treatment*)
- **Ubicación en PDF**: Página 18 (pág. oficial de norma 11).
- **Requisitos normativos**:
  - Implementar el plan de tratamiento de riesgos de privacidad.
- **Mandato explícito de información documentada**:
  > *"The organization shall retain documented information of the results of the privacy risk treatment."* (Pág. PDF 18 / Pág. de norma 11).  
  > **Traducción**: "La organización debe conservar información documentada de los resultados del tratamiento del riesgo de privacidad."

---

### Cláusula 9: Evaluación del Desempeño

#### 9.1 Seguimiento, medición, análisis y evaluación (*Monitoring, measurement, analysis and evaluation*)
- **Ubicación en PDF**: Página 18 (pág. oficial de norma 11).
- **Requisitos normativos**:
  - Determinar: qué necesita seguimiento y medición; métodos aplicables; cuándo se realizará; cuándo se analizarán los resultados; y evaluar el desempeño de la privacidad y la eficacia del SGPI.
- **Mandato explícito de información documentada**:
  > *"Documented information shall be available as evidence of the results."* (Pág. PDF 18 / Pág. de norma 11).  
  > **Traducción**: "La información documentada debe estar disponible como evidencia de los resultados."

#### 9.2 Auditoría interna (*Internal audit*)
##### 9.2.1 Generalidades (*General*)
- **Ubicación en PDF**: Página 19 (pág. oficial de norma 12).
- **Requisitos normativos**:
  - Llevar a cabo auditorías internas a intervalos planificados para proporcionar información sobre si el SGPI cumple con los requisitos propios y de esta norma, y si está implementado y mantenido eficazmente.

##### 9.2.2 Programa de auditoría interna (*Internal audit programme*)
- **Ubicación en PDF**: Página 19 (pág. oficial de norma 12).
- **Requisitos normativos**:
  - Planificar, establecer, implementar y mantener programas de auditoría (frecuencia, métodos, responsabilidades, planificación, informes). Considerar la importancia de los procesos y resultados previos.
  - Definir objetivos, criterios y alcance de cada auditoría; seleccionar auditores independientes; asegurar que los resultados se informen a la dirección pertinente.
- **Mandato explícito de información documentada**:
  > *"Documented information shall be available as evidence of the implementation of the audit programme(s) and the audit results."* (Pág. PDF 19 / Pág. de norma 12).  
  > **Traducción**: "La información documentada debe estar disponible como evidencia de la implementación del programa o programas de auditoría y de los resultados de la auditoría."

#### 9.3 Revisión por la dirección (*Management review*)
##### 9.3.1 Generalidades (*General*) y 9.3.2 Entradas (*Inputs*)
- **Ubicación en PDF**: Página 19 (pág. oficial de norma 12).
- **Requisitos normativos**:
  - La alta dirección debe revisar el SGPI a intervalos planificados.
  - Entradas obligatorias: a) estado de acciones de revisiones previas; b) cambios en cuestiones externas e internas; c) cambios en necesidades de partes interesadas; d) desempeño del SGPI (no conformidades y acciones correctivas, seguimiento y medición, resultados de auditorías); e) oportunidades de mejora continua.

##### 9.3.3 Resultados de la revisión por la dirección (*Management review results*)
- **Ubicación en PDF**: Página 20 (pág. oficial de norma 13).
- **Requisitos normativos**:
  - Las decisiones deben incluir oportunidades de mejora continua y cualquier necesidad de cambio en el SGPI.
- **Mandato explícito de información documentada**:
  > *"Documented information shall be available as evidence of the results of management reviews."* (Pág. PDF 20 / Pág. de norma 13).  
  > **Traducción**: "La información documentada debe estar disponible como evidencia de los resultados de las revisiones por la dirección."

---

### Cláusula 10: Mejora

#### 10.1 Mejora continua (*Continual improvement*)
- **Ubicación en PDF**: Página 20 (pág. oficial de norma 13).
- **Requisitos normativos**:
  - Mejorar continuamente la idoneidad, adecuación y eficacia del SGPI.

#### 10.2 No conformidad y acción correctiva (*Nonconformity and corrective action*)
- **Ubicación en PDF**: Página 20 (pág. oficial de norma 13).
- **Requisitos normativos**:
  - Ante una no conformidad: a) reaccionar, controlarla, corregirla y hacer frente a las consecuencias; b) evaluar la necesidad de acciones para eliminar sus causas (revisión, causas, no conformidades similares); c) implementar acciones; d) revisar la eficacia; e) realizar cambios en el SGPI si es necesario.
- **Mandato explícito de información documentada**:
  > *"Documented information shall be available as evidence of: — the nature of the nonconformities and any subsequent actions taken; — the results of any corrective action."* (Pág. PDF 20 / Pág. de norma 13).  
  > **Traducción**: "La información documentada debe estar disponible como evidencia de: — la naturaleza de las no conformidades y cualquier acción posterior tomada; — los resultados de cualquier acción correctiva."

---

### Tabla Maestra de Mandatos de Información Documentada (Cl. 4→10)

| Cláusula | Requisito / Tipo de Registro Mandatorio | Cita Textual de la Norma ISO/IEC 27701:2025 | Pág. PDF | Pág. Norma | Artefacto G4 UNSA |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **4.3** | Alcance formal del SGPI | *"The scope shall be available as documented information."* | **12** | 5 | `G4-ALC-01` |
| **5.2** | Política de privacidad aprobada | *"The privacy policy shall: a) be available as documented information;"* | **12** | 5 | `G4-POL-01` |
| **6.1.2** | Proceso y metodología de evaluación de riesgos de privacidad | *"The organization shall retain documented information about the privacy risk assessment process."* | **14** | 7 | `G4-MET-RSK-01` |
| **6.1.3 e** | Declaración de Aplicabilidad (*Statement of Applicability*) | *"The organization shall produce a statement of applicability that includes: the necessary controls... justification for their inclusion... whether implemented or not; and the justification for excluding any controls from Annex A."* | **15** | 8 | `G4-SOA-01` |
| **6.1.3** | Proceso y formulación del tratamiento de riesgos de privacidad | *"The organization shall retain documented information about the privacy risk treatment process."* | **15** | 8 | `G4-PLN-RSK-01` |
| **6.2 g** | Objetivos de privacidad y plan de consecución | *"The privacy objectives shall: ... g) be available as documented information."* | **15** | 8 | `G4-OBJ-01` |
| **7.2** | Evidencia de competencias del personal | *"Appropriate documented information shall be available as evidence of competence."* | **16** | 9 | `G4-REG-CAP-01` |
| **7.5.1 / 7.5.3** | Procedimiento de control de información documentada | *"The organization's PIMS shall include documented information required by this document and determined as necessary... controlled for availability, suitability and protection."* | **17** | 10 | `G4-PRC-DOC-01` / `G4-IDX-01` |
| **8.1** | Evidencia de ejecución de la operación planificada | *"Documented information shall be available to the extent necessary to have confidence that the processes have been carried out as planned."* | **18** | 11 | `G4-PRC-INC-01` / `G4-REG-INC-01` |
| **8.2** | Resultados de las evaluaciones de riesgos de privacidad | *"The organization shall retain documented information of the results of the privacy risk assessments."* | **18** | 11 | `G4-RSK-INC-01` |
| **8.3** | Resultados del tratamiento del riesgo de privacidad | *"The organization shall retain documented information of the results of the privacy risk treatment."* | **18** | 11 | `G4-RSK-INC-01` / `G4-PLN-RSK-01` |
| **9.1** | Resultados de seguimiento, medición, análisis y evaluación | *"Documented information shall be available as evidence of the results."* | **18** | 11 | `G4-OBJ-01` (Dashboard) |
| **9.2.2** | Programa de auditoría y resultados/informes de auditoría interna | *"Documented information shall be available as evidence of the implementation of the audit programme(s) and the audit results."* | **19** | 12 | `G4-PRG-AUD-01` / `G4-REP-AUD-01` |
| **9.3.3** | Resultados y actas de revisión por la dirección | *"Documented information shall be available as evidence of the results of management reviews."* | **20** | 13 | `G4-ACT-REV-01` |
| **10.2** | Naturaleza de no conformidades, acciones y resultados correctivos | *"Documented information shall be available as evidence of: — the nature of the nonconformities and any subsequent actions taken; — the results of any corrective action."* | **20** | 13 | `G4-PRC-CAPA-01` / `G4-REG-CAPA-01` |

---

## 2. Sección (b): Anexo A — Listas Completas de Controles y Criterios de Aplicabilidad

### Fundamento y Criterios del Anexo A (Cl. 6.1.3e)
El Anexo A (*PIMS reference control objectives and controls for PII controllers and PII processors*, normativo, págs. PDF 21 a 26) establece el catálogo oficial de controles de referencia de ISO/IEC 27701:2025.

La norma indica taxativamente en la introducción de este anexo (pág. PDF 21 / pág. de norma 14):
> *"This annex is intended to be used by organizations acting as PII controllers or PII processors, or both. It is not necessary to include all control objectives and controls listed in this annex in the PIMS implementation. A justification for excluding any control objectives shall be included in the statement of applicability [see 6.1.3 e)]. Justification for exclusion can include where the controls are not deemed necessary by the risk assessment, and where they are not required by (or are subject to exceptions under) the applicable legal requirements. Table A.1 applies to PII controllers, Table A.2 applies to PII processors and Table A.3 relates to information security controls for both PII controllers and PII processors."*

Por consiguiente:
1. **UNSA como Responsable (*PII Controller*)**: Aplican en su totalidad los 31 controles de la **Tabla A.1** y los 29 controles de la **Tabla A.3**.
2. **Exclusión de la Tabla A.2**: Los 18 controles de la **Tabla A.2** quedan excluidos con justificación fundada en el SoA (`G4-SOA-01`), al no actuar la UNSA como encargado del tratamiento.

---

### Tabla A.1 — Controles para Responsables del Tratamiento (PII Controllers) [31 Controles]

#### Categoría A.1.2: Condiciones para la recolección y tratamiento (*Conditions for collection and processing*)
*Objetivo A.1.2*: Demostrar que el tratamiento es lícito, con base legal según las jurisdicciones aplicables y con finalidades legítimas y claramente definidas.

| Ref. Control | Título Oficial del Control | Texto Normativo del Control (*Shall*) | Pág. PDF | Pág. Norma | Relevante a Incidentes |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **A.1.2.2** | Identify and document purpose | La organización debe identificar y documentar las finalidades específicas para las cuales se tratarán los datos personales (PII). | **21** | 14 | No |
| **A.1.2.3** | Identify lawful basis | La organización debe determinar, documentar y ser capaz de demostrar el cumplimiento de la base legal pertinente para el tratamiento de PII. | **21** | 14 | No |
| **A.1.2.4** | Determine when and how consent is to be obtained | La organización debe determinar y documentar un proceso mediante el cual pueda demostrar si, cuándo y cómo se obtuvo el consentimiento de los titulares de datos. | **21** | 14 | No |
| **A.1.2.5** | Obtain and record consent | La organización debe obtener y registrar el consentimiento de los titulares de datos según los procesos documentados. | **21** | 14 | No |
| **A.1.2.6** | Privacy impact assessment | La organización debe evaluar la necesidad de realizar e implementar, cuando corresponda, una evaluación de impacto en la privacidad (EIP / PIA) ante tratamientos nuevos o modificados. | **21** | 14 | **Sí** (evalúa riesgos previos y escenarios de brecha) |
| **A.1.2.7** | Contracts with PII processors | La organización debe suscribir contratos por escrito con los encargados del tratamiento que utilice, asegurando que aborden los controles pertinentes del Anexo A (Tabla A.2). | **21** | 14 | **Sí** (cláusulas de notificación de brechas de proveedores) |
| **A.1.2.8** | Joint PII controller | La organización debe determinar roles y responsabilidades respectivos para el tratamiento de PII (incluidos requisitos de protección y seguridad) con cualquier corresponsable. | **21** | 14 | **Sí** (coordinación de respuesta ante incidentes compartidos) |
| **A.1.2.9** | Records related to processing PII | La organización debe determinar y mantener de forma segura los registros necesarios en apoyo de sus obligaciones para el tratamiento de PII (*Records of Processing Activities / RoPA*). | **21** | 14 | **Sí** (identificación inmediata de datos afectados en brechas) |

#### Categoría A.1.3: Obligaciones hacia los titulares de datos (*Obligations to PII principals*)
*Objetivo A.1.3*: Garantizar que los titulares de datos reciban información adecuada sobre el tratamiento de sus datos personales y satisfacer cualquier otra obligación aplicable.

| Ref. Control | Título Oficial del Control | Texto Normativo del Control (*Shall*) | Pág. PDF | Pág. Norma | Relevante a Incidentes |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **A.1.3.2** | Determining and fulfilling obligations to PII principals | La organización debe determinar y documentar sus obligaciones legales, regulatorias y de negocio respecto a los titulares y brindar los medios para satisfacerlas. | **22** | 15 | No |
| **A.1.3.3** | Determining information for PII principals | La organización debe determinar y documentar la información que debe proporcionarse a los titulares de datos sobre el tratamiento y el momento de su entrega. | **22** | 15 | No |
| **A.1.3.4** | Providing information to PII principals | La organización debe brindar a los titulares de datos información clara y de fácil acceso que identifique al responsable y describa el tratamiento. | **22** | 15 | **Sí** (comunicación directa ante brechas de alto impacto) |
| **A.1.3.5** | Providing mechanism to modify or withdraw consent | La organización debe brindar un mecanismo para que los titulares modifiquen o revoquen su consentimiento. | **22** | 15 | No |
| **A.1.3.6** | Providing mechanism to object to PII processing | La organización debe brindar un mecanismo para que los titulares de datos se opongan al tratamiento de sus datos personales. | **22** | 15 | No |
| **A.1.3.7** | Access, correction or erasure | La organización debe implementar políticas, procedimientos o mecanismos para atender las solicitudes de acceso, rectificación o cancelación (derechos ARCO). | **22** | 15 | No |
| **A.1.3.8** | PII controllers' obligations to inform third parties | La organización debe informar a los terceros con quienes compartió PII sobre modificaciones, revocaciones u oposiciones, implementando procedimientos para ello. | **22** | 15 | **Sí** (notificación a terceros ante datos vulnerados o alterados) |
| **A.1.3.9** | Providing copy of PII processed | La organización debe proporcionar a los titulares de datos una copia de la PII tratada cuando así se solicite de forma legítima. | **22** | 15 | No |
| **A.1.3.10** | Handling requests | La organización debe establecer y documentar procedimientos para tramitar y responder a solicitudes legítimas de los titulares de datos. | **22** | 15 | No |
| **A.1.3.11** | Automated decision making | La organización debe identificar y documentar las decisiones automatizadas y garantizar los derechos del titular respecto a dichas decisiones. | **22** | 15 | No |

#### Categoría A.1.4: Privacidad por diseño y por defecto (*Privacy by design and privacy by default*)
*Objetivo A.1.4*: Asegurar que los procesos y sistemas se diseñen de forma tal que la recolección y tratamiento de PII se limiten a lo necesario y cuenten con salvaguardas técnicas.

| Ref. Control | Título Oficial del Control | Texto Normativo del Control (*Shall*) | Pág. PDF | Pág. Norma | Relevante a Incidentes |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **A.1.4.2** | Limit collection | La organización debe limitar la recolección de PII a lo estrictamente necesario para las finalidades identificadas. | **22** | 15 | No |
| **A.1.4.3** | Limit processing | La organización debe limitar el tratamiento de PII a lo necesario para las finalidades identificadas. | **22** | 15 | No |
| **A.1.4.4** | Accuracy and quality | La organización debe asegurar que la PII tratada sea exacta, completa y se mantenga actualizada según las finalidades. | **22** | 15 | **Sí** (detección de corrupción o alteración no autorizada de datos) |
| **A.1.4.5** | PII minimization objectives | La organización debe definir y documentar objetivos de minimización de datos y mecanismos para su cumplimiento. | **22** | 15 | No |
| **A.1.4.6** | PII de-identification and deletion at end of processing | La organización debe anonimizar, seudonimizar o eliminar la PII una vez culminadas las finalidades de tratamiento. | **22** | 15 | **Sí** (mitigación del impacto en caso de exfiltración) |
| **A.1.4.7** | Temporary files | La organización debe asegurar que los archivos temporales creados por el tratamiento de PII se eliminen de acuerdo a procedimientos y plazos documentados. | **22-23** | 15-16 | **Sí** (prevención de fugas en cachés temporales) |
| **A.1.4.8** | Retention | La organización no debe conservar PII por más tiempo del necesario para las finalidades del tratamiento. | **23** | 16 | No |
| **A.1.4.9** | Disposal | La organización debe contar con políticas, procedimientos y mecanismos documentados para la disposición y destrucción segura de PII. | **23** | 16 | **Sí** (prevención de brechas por descarte negligente de soportes) |
| **A.1.4.10** | PII transmission controls | La organización debe someter la PII transmitida a través de redes a controles apropiados para garantizar que llegue a su destino previsto de forma segura. | **23** | 16 | **Sí** (prevención e interceptación en tránsito / Man-in-the-Middle) |

#### Categoría A.1.5: Compartición, transferencia y divulgación de PII (*PII sharing, transfer and disclosure*)
*Objetivo A.1.5*: Determinar y documentar cuándo y cómo se comparte o transfiere PII a terceros u otras jurisdicciones conforme a las obligaciones aplicables.

| Ref. Control | Título Oficial del Control | Texto Normativo del Control (*Shall*) | Pág. PDF | Pág. Norma | Relevante a Incidentes |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **A.1.5.2** | Identify basis for PII transfer between jurisdictions | La organización debe identificar y documentar la base legal aplicable para transferencias internacionales de PII. | **23** | 16 | No |
| **A.1.5.3** | Countries and international organizations for transfer | La organización debe especificar y documentar los países y organismos internacionales a los que se puede transferir PII. | **23** | 16 | No |
| **A.1.5.4** | Records of transfer of PII | La organización debe registrar las transferencias de PII hacia o desde terceros, incluyendo destinatario, país y justificación. | **23** | 16 | **Sí** (trazabilidad forense de exfiltración o transferencias ilícitas) |
| **A.1.5.5** | Records of PII disclosure to third parties | La organización debe registrar las divulgaciones de PII a terceros, incluyendo solicitudes judiciales o administrativas recibidas. | **23** | 16 | **Sí** (distinción entre divulgaciones lícitas y brechas de información) |

---

### Tabla A.2 — Controles para Encargados (PII Processors) [18 Controles] — EXCLUIDOS

#### Justificación Institucional Reutilizable de Exclusión (Cl. 6.1.3e + Introducción Anexo A)
> **Texto Oficial Reutilizable para la Declaración de Aplicabilidad (`G4-SOA-01`) y Auditorías**:  
> *"La Universidad Nacional de San Agustín de Arequipa (UNSA) actúa de manera exclusiva y privativa bajo el rol institucional de Responsable del Tratamiento de Datos Personales (PII Controller, Cláusula 4.1 de ISO/IEC 27701:2025). La universidad determina de forma autónoma las finalidades y medios del tratamiento de la información de postulantes, estudiantes, docentes, graduados y colaboradores en el marco de la Ley Universitaria N° 30220 y la Ley N° 29733 de Protección de Datos Personales del Perú. En estricta aplicación de la Cláusula 6.1.3 e) y la Introducción normativa del Anexo A de ISO/IEC 27701:2025, la totalidad de los dieciocho (18) controles contenidos en la Tabla A.2 (A.2.2.2 a A.2.5.9) quedan formalmente declarados como EXCLUIDOS de la Declaración de Aplicabilidad (SoA), en razón de que la UNSA no opera como Encargada del Tratamiento (PII Processor) bajo mandato o subcontratación de terceros para los procesos incluidos en el alcance del SGPI."*

#### Inventario Completo de Controles de la Tabla A.2 (para archivo normativo y auditoría)

| Ref. Control | Título Oficial del Control | Texto Normativo del Control (*Shall*) | Pág. PDF | Pág. Norma | Estado SoA UNSA |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **A.2.2.2** | Customer agreement | El encargado debe tratar PII únicamente según las instrucciones documentadas del cliente (responsable). | **23** | 16 | **EXCLUIDO** |
| **A.2.2.3** | Organization's purposes | El encargado no debe tratar PII para sus propios fines sin autorización expresa. | **23** | 16 | **EXCLUIDO** |
| **A.2.2.4** | Marketing and advertising use | El encargado no debe utilizar la PII para fines publicitarios sin autorización previa del cliente. | **23** | 16 | **EXCLUIDO** |
| **A.2.2.5** | Infringing instruction | El encargado debe notificar al cliente si considera que una instrucción infringe la legislación aplicable. | **23** | 16 | **EXCLUIDO** |
| **A.2.2.6** | Customer obligations | El encargado debe proporcionar al cliente la información necesaria para demostrar el cumplimiento de obligaciones. | **23-24** | 16-17 | **EXCLUIDO** |
| **A.2.2.7** | Records related to processing PII | El encargado debe mantener registros de las actividades de tratamiento realizadas por cuenta del cliente. | **24** | 17 | **EXCLUIDO** |
| **A.2.3.2** | Comply with obligations to PII principals | El encargado debe asistir al cliente en el cumplimiento de sus obligaciones hacia los titulares de datos. | **24** | 17 | **EXCLUIDO** |
| **A.2.4.2** | Temporary files | El encargado debe asegurar la eliminación segura de archivos temporales según plazos documentados. | **24** | 17 | **EXCLUIDO** |
| **A.2.4.3** | Return, transfer or disposal of PII | El encargado debe devolver, transferir o destruir de forma segura la PII al finalizar los servicios. | **24** | 17 | **EXCLUIDO** |
| **A.2.4.4** | PII transmission controls | El encargado debe aplicar controles de red para asegurar que la PII transmitida llegue a su destino previsto. | **24** | 17 | **EXCLUIDO** |
| **A.2.5.2** | Basis for PII transfer between jurisdictions | El encargado debe informar al cliente oportunamente sobre bases de transferencia internacional de datos. | **24** | 17 | **EXCLUIDO** |
| **A.2.5.3** | Countries and international orgs for transfer | El encargado debe documentar los países y organismos a los que puede transferirse PII y notificar cambios. | **24** | 17 | **EXCLUIDO** |
| **A.2.5.4** | Records of PII disclosures to third parties | El encargado debe registrar todas las divulgaciones de PII a terceros realizadas en cumplimiento de sus servicios. | **24** | 17 | **EXCLUIDO** |
| **A.2.5.5** | Notification of PII disclosure requests | El encargado debe notificar al cliente cualquier solicitud legal de divulgación antes de responder, salvo prohibición legal. | **24** | 17 | **EXCLUIDO** |
| **A.2.5.6** | Legally binding PII disclosures | El encargado debe rechazar solicitudes legalmente vinculantes que no cumplan con el debido proceso legal. | **24** | 17 | **EXCLUIDO** |
| **A.2.5.7** | Disclosure of subcontractors used to process PII | El encargado debe informar al cliente sobre cualquier subcontratista utilizado para el tratamiento de PII. | **24** | 17 | **EXCLUIDO** |
| **A.2.5.8** | Engagement of a subcontractor to process PII | El encargado debe requerir autorización previa del cliente y suscribir contratos con subcontratistas. | **24** | 17 | **EXCLUIDO** |
| **A.2.5.9** | Change of subcontractor to process PII | El encargado debe notificar cambios en la cadena de subcontratistas permitiendo al cliente objetar. | **24** | 17 | **EXCLUIDO** |

---

### Tabla A.3 — Controles de Seguridad de la Información para Responsables y Encargados [29 Controles]
*Objetivo A.3*: Implementar controles técnicos, organizacionales y físicos para salvaguardar la confidencialidad, integridad y disponibilidad de la PII y mitigar riesgos sobre los derechos de los titulares.

| Ref. Control | Título Oficial del Control | Texto Normativo del Control (*Shall*) | Pág. PDF | Pág. Norma | Relevante a Incidentes |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **A.3.3** | Policies for information security | Las políticas de seguridad de la información y políticas específicas del tema deben definirse, aprobarse y comunicarse teniendo en consideración la protección de PII. | **24** | 17 | **Sí** (marco directivo de respuesta a incidentes) |
| **A.3.4** | Information security roles and responsibilities | Los roles y responsabilidades de seguridad relacionados con el tratamiento de PII deben definirse y asignarse conforme a las necesidades organizacionales. | **24** | 17 | **Sí** (designación de roles CSIRT, DPO y custodios) |
| **A.3.5** | Classification of information | La información debe clasificarse según las necesidades de seguridad y la presencia de PII, basándose en confidencialidad, integridad, disponibilidad y requisitos legales. | **25** | 18 | **Sí** (triaje y priorización del impacto de la brecha) |
| **A.3.6** | Labelling of information | Desarrollar e implementar procedimientos de etiquetado de información que consideren la presencia de PII según el esquema de clasificación. | **25** | 18 | No |
| **A.3.7** | Information transfer | Establecer reglas, procedimientos o acuerdos para la transferencia de información relacionada con PII en todas las instalaciones y medios de transferencia. | **25** | 18 | **Sí** (fugas y transferencias anómalas) |
| **A.3.8** | Identity management | Gestionar el ciclo de vida completo de las identidades involucradas en el tratamiento de PII. | **25** | 18 | **Sí** (gestión de accesos comprometidos) |
| **A.3.9** | Access rights | Provisionar, revisar, modificar y revocar los derechos de acceso a PII según la política y reglas de control de acceso. | **25** | 18 | **Sí** (escalamiento de privilegios y accesos no autorizados) |
| **A.3.10** | Addressing info security within supplier agreements | Establecer y acordar con cada proveedor requisitos pertinentes de seguridad de la información relacionados con el tratamiento de PII. | **25** | 18 | **Sí** (cláusulas de notificación expedita de brechas) |
| **A.3.11** | Information security incident management planning and preparation | La organización debe planificar y prepararse para gestionar incidentes de seguridad relacionados con el tratamiento de PII definiendo, estableciendo y comunicando procesos, roles y responsabilidades. | **25** | 18 | **CRÍTICO** (pilar de planificación de incidentes) |
| **A.3.12** | Response to information security incidents | Las respuestas a incidentes de seguridad de la información relacionados con el tratamiento de PII deben ejecutarse de conformidad con los procedimientos documentados. | **25** | 18 | **CRÍTICO** (pilar operativo de respuesta y registro) |
| **A.3.13** | Legal, statutory, regulatory and contractual requirements | Los requisitos legales, regulatorios y contractuales de seguridad relacionados con PII y el enfoque organizacional para cumplirlos deben documentarse y mantenerse actualizados. | **25** | 18 | **Sí** (plazos legales y régimen sancionador ANPD) |
| **A.3.14** | Protection of records | Los registros vinculados al tratamiento de PII deben protegerse contra pérdida, destrucción, falsificación, acceso no autorizado y divulgación no autorizada. | **25** | 18 | **CRÍTICO** (integridad de la bitácora de incidentes) |
| **A.3.15** | Independent review of information security | El enfoque y la implementación de la seguridad vinculada a PII deben revisarse de forma independiente a intervalos planificados o ante cambios significativos. | **25** | 18 | No |
| **A.3.16** | Compliance with policies and standards | El cumplimiento de las políticas, normas y estándares de seguridad relacionados con PII debe revisarse de manera periódica. | **25** | 18 | **Sí** (evaluación de causas de no conformidad) |
| **A.3.17** | Information security awareness, education and training | El personal y partes interesadas pertinentes deben recibir concientización, educación y formación periódica adecuada sobre seguridad y PII. | **25** | 18 | **CRÍTICO** (capacitación en detección y reporte rápido) |
| **A.3.18** | Confidentiality or non-disclosure agreements | Identificar, documentar, revisar y firmar acuerdos de confidencialidad o no divulgación que reflejen las necesidades de protección de PII. | **25** | 18 | **Sí** (reserva durante la investigación del incidente) |
| **A.3.19** | Clear desk and clear screen | Definir y aplicar reglas de escritorio limpio para documentos/soportes y pantalla limpia para instalaciones de procesamiento. | **25** | 18 | **Sí** (prevención de incidentes físicos/visuales) |
| **A.3.20** | Storage media | Gestionar los soportes de almacenamiento con PII a lo largo de su ciclo de vida (adquisición, uso, traslado y disposición) según su clasificación. | **25** | 18 | **Sí** (extravío o robo de memorias y discos) |
| **A.3.21** | Secure disposal or re-use of equipment | Verificar que los equipos con soportes que contengan PII hayan sido despojados de datos sensibles o sobreescritos de forma segura antes de su descarte o reutilización. | **26** | 19 | **Sí** (prevención de fugas por reciclaje negligente) |
| **A.3.22** | User endpoint devices | Proteger la PII almacenada, procesada o accesible mediante dispositivos de punto final de los usuarios (*laptops, smartphones, terminales*). | **26** | 19 | **CRÍTICO** (cifrado BitLocker/MDM ante pérdidas) |
| **A.3.23** | Secure authentication | Implementar tecnologías y procedimientos de autenticación segura relacionados con el tratamiento de PII según las restricciones de acceso. | **26** | 19 | **CRÍTICO** (prevención de ataques de credenciales/MFA) |
| **A.3.24** | Information backup | Mantener y probar periódicamente copias de seguridad de la PII, así como del software y sistemas vinculados al tratamiento. | **26** | 19 | **CRÍTICO** (restauración ante ransomware o indisponibilidad) |
| **A.3.25** | Logging | Producir, almacenar, proteger y analizar registros de eventos (*logs*) que registren actividades, excepciones, fallas y eventos relevantes vinculados a PII. | **26** | 19 | **CRÍTICO** (detección, análisis forense y auditoría) |
| **A.3.26** | Use of cryptography | Definir e implementar reglas para el uso eficaz de la criptografía relacionada con PII, incluida la gestión de claves criptográficas. | **26** | 19 | **Sí** (cifrado en reposo y mitigación de brechas) |
| **A.3.27** | Secure development life cycle | Establecer y aplicar reglas para el desarrollo seguro de software y sistemas vinculados al tratamiento de PII. | **26** | 19 | **Sí** (prevención de vulnerabilidades explotables) |
| **A.3.28** | Application security requirements | Identificar, especificar y aprobar requisitos de seguridad relacionados con PII al desarrollar o adquirir aplicaciones. | **26** | 19 | **Sí** (mitigación de fallas en portales de admisión/planilla) |
| **A.3.29** | Secure system architecture and engineering | Establecer, documentar, mantener y aplicar principios de ingeniería de sistemas seguros para el tratamiento de PII. | **26** | 19 | No |
| **A.3.30** | Outsourced development | Dirigir, supervisar y revisar las actividades de desarrollo de sistemas de tratamiento de PII subcontratadas. | **26** | 19 | **Sí** (vulnerabilidades introducidas por terceros) |
| **A.3.31** | Test information | Seleccionar, proteger y gestionar adecuadamente la información de prueba vinculada al tratamiento de PII (prohibición de PII real en pruebas). | **26** | 19 | **Sí** (prevención de exposición de datos en testing) |

---

### Matriz de Controles Relevantes para la Gestión de Incidentes de Privacidad

La siguiente matriz resalta los controles de ISO/IEC 27701:2025 que interactúan de forma directa o indirecta con la prevención, detección, respuesta, mitigación y registro de incidentes de seguridad y brechas de datos personales:

```
+---------------------------------------------------------------------------------------------------------+
|                               CONTROLES DE GESTIÓN DE INCIDENTES DE PRIVACIDAD                          |
+-------------------+---------------------------------------------+---------------------------------------+
| FASE DE GESTIÓN   | CONTROLES CLAVE ISO/IEC 27701:2025          | ROL ESPECÍFICO EN EL PROCEDIMIENTO    |
+-------------------+---------------------------------------------+---------------------------------------+
| 1. PLANIFICACIÓN  | A.3.11 (Planificación de incidentes)        | Proceso documentado, roles CSIRT/DPO. |
|    Y PREVENCIÓN   | A.3.4  (Roles y responsabilidades)          | Asignación formal de autoridades.     |
|                   | A.3.17 (Concientización y formación)        | Detección temprana y reporte veloz.   |
|                   | A.3.26 (Criptografía)                       | Cifrado de datos en tránsito/reposo.  |
|                   | A.3.22 (Dispositivos punto final)           | Protección de laptops/móviles (MDM).  |
|                   | A.1.2.6 (Evaluación de impacto PIA)         | Mapeo previo de riesgos de fuga.      |
|                   | A.1.2.7 / A.3.10 (Contratos proveedores)    | Cláusulas contractuales de reporte.   |
+-------------------+---------------------------------------------+---------------------------------------+
| 2. DETECCIÓN Y    | A.3.25 (Logging / Bitácoras)                | Evidencia técnica y detección SIEM.   |
|    TRIAGE         | A.3.5  (Clasificación de información)       | Identificación de sensibilidad PII.   |
|                   | A.1.2.9 (Registros de actividades RoPA)     | Identificación de titulares y flujo.  |
|                   | A.3.8 / A.3.9 (Identidad y accesos)         | Detección de cuentas comprometidas.   |
+-------------------+---------------------------------------------+---------------------------------------+
| 3. RESPUESTA,     | A.3.12 (Respuesta a incidentes)             | Ejecución de contención y erradicación|
|    CONTENCIÓN Y   | A.3.24 (Copias de seguridad / Backups)      | Restauración de datos y sistemas.     |
|    ERRADICACIÓN   | A.3.18 (Acuerdos de confidencialidad)       | Secreto técnico durante investigación |
+-------------------+---------------------------------------------+---------------------------------------+
| 4. NOTIFICACIÓN Y | A.3.12 / B.3.12 (Notificaciones de brecha)  | Envío formal a titulares y regulador. |
|    COMUNICACIÓN   | A.1.3.4 (Información a titulares)           | Lenguaje claro y canales oficiales.   |
|                   | A.1.3.8 (Información a terceros)            | Notificación a corresponsables.       |
|                   | A.3.13 (Requisitos legales y regulatorios)  | Cumplimiento de plazos de la ANPD.    |
+-------------------+---------------------------------------------+---------------------------------------+
| 5. REGISTRO Y     | A.3.14 (Protección de registros)            | Inmutabilidad de bitácora y evidencias|
|    CIERRE CAPA    | A.3.16 (Revisión de cumplimiento)           | Acciones correctivas post-incidente.  |
|                   | Cl. 10.2 (No conformidades y acciones)      | Procedimiento formal CAPA institucional|
+-------------------+---------------------------------------------+---------------------------------------+
```

---

## 3. Sección (c): Anexo B — Guías B.3.11, B.3.12 y Campos Exigidos para Registros de Brechas

El Anexo B (*Implementation guidance for PII controllers and PII processors*, normativo, págs. PDF 27 a 56) suministra las directrices prácticas para la implementación de cada control de las Tablas A.1, A.2 y A.3. Las secciones B.3.11 y B.3.12 establecen el estándar internacional para el ciclo de vida del incidente de privacidad y los requisitos obligatorios de información documental forense y regulatoria.

### Guía B.3.11: Planificación y preparación para la gestión de incidentes de seguridad relacionados con PII
- **Ubicación en PDF**: Página 49 (pág. oficial de norma 42).
- **Directrices de implementación**:
  1. *Procedimientos y responsabilidades*: Como parte del proceso general de gestión de incidentes de seguridad de la información, la organización debe establecer responsabilidades y procedimientos específicos para identificar y registrar brechas de PII (*identifying and recording breaches of PII*).
  2. *Notificaciones a partes interesadas y autoridades*: Establecer responsabilidades y procedimientos para notificar a las partes pertinentes sobre brechas de PII (incluidos los plazos y tiempos oportunos de tales notificaciones) y la divulgación obligatoria ante las autoridades competentes, tomando en consideración los requisitos legales aplicables.
  3. *Regulaciones jurisdiccionales*: Ciertas jurisdicciones imponen normativas específicas sobre respuestas a brechas y notificaciones. Las organizaciones que operen en dichas jurisdicciones deben asegurar que conocen y documentan cómo cumplen con tales exigencias legales.

---

### Guía B.3.12: Respuesta a incidentes de seguridad de la información relacionados con PII
- **Ubicación en PDF**: Páginas 49-50 (pág. oficial de norma 42-43).
- **Distinción esencial entre Evento de Seguridad e Incidente/Brecha de PII**:
  - *Disparador de revisión*: Todo incidente que involucre datos personales (PII) debe activar una revisión interna inmediata como parte del proceso de gestión de incidentes para determinar si se ha producido una brecha de PII que requiera respuesta y notificación.
  - *Eventos inocuos*: La norma aclara en la Nota 1 que un mero evento de seguridad no desencadena necesariamente dicha revisión, definiendo como eventos que típicamente no conllevan probabilidad significativa de acceso no autorizado a PII:
    > *"An information security event does not necessarily result in actual, or the significant probability of, unauthorized access to PII or to any of the organization's equipment or facilities storing PII. These can include, but are not limited to, pings and other broadcast attacks on firewalls or edge servers, port scans, unsuccessful log-on attempts, denial of service attacks and packet sniffing."* (Pág. PDF 49 / Pág. de norma 42).

---

### Campos Obligatorios del Registro de Brechas de PII (Guía B.3.12, Pág. PDF 49-50)

La norma estipula que cuando ocurra una brecha que involucre PII, **debe mantenerse un registro documentado con información suficiente para proveer un informe con fines regulatorios o forenses** (*"a record should be maintained with sufficient information to provide a report for regulatory or forensic purposes"*).

La enumeración taxativa de campos que debe contener este registro incluye:

1. **Descripción del incidente** (*a description of the incident*):
   - Detalle pormenorizado del vector de ataque, causa raíz o fallo operacional que originó la brecha.
2. **Período de tiempo** (*the time period*):
   - Cronograma exacto: fecha y hora de inicio de la brecha, fecha y hora de detección, fecha y hora de contención y fecha de cierre.
3. **Consecuencias del incidente** (*the consequences of the incident*):
   - Efectos e impactos potenciales o consumados tanto sobre la organización como sobre los titulares de los datos (PII principals).
4. **Nombre del informante / reportante** (*the name of the reporter*):
   - Identificación de la persona, sistema o entidad externa que detectó y notificó inicialmente el evento.
5. **A quién se informó el incidente** (*to whom the incident was reported*):
   - Registro de autoridades internas notificadas (CSIRT, DPO, DUTIC, Rectorado) y canales de reporte empleados.
6. **Medidas adoptadas para resolver el incidente** (*the steps taken to resolve the incident*):
   - Acciones de contención, erradicación y recuperación, **incluyendo la persona a cargo (*person in charge*) y los datos recuperados (*data recovered*)**.
7. **Afectación específica sobre la PII** (*the fact that the incident resulted in unavailability, loss, disclosure or alteration of PII*):
   - Constatación explícita de si el incidente resultó en:
     - **Indisponibilidad** (*unavailability*).
     - **Pérdida** (*loss*).
     - **Divulgación no autorizada** (*disclosure*).
     - **Alteración no autorizada** (*alteration*) de los datos personales.
8. **Descripción de la PII comprometida** (*a description of the PII compromised, if known*):
   - Categorías y tipos de datos personales afectados (datos identificatorios, de contacto, académicos, laborales, financieros, o datos sensibles/biométricos), así como el número estimado de titulares afectados y volumen de registros.
9. **Medidas de notificación ejecutadas** (*the steps taken to notify PII principals, regulatory agencies or customers*):
   - En caso de haberse utilizado notificaciones, registrar detalladamente las medidas adoptadas para notificar a los titulares de datos, a las agencias regulatorias (ANPD) o a los clientes/socios.

---

### Estructura de Contenido de Notificaciones de Brecha (B.3.12 Nota 2, Pág. PDF 49)

Cuando se requiera emitir una notificación formal a las autoridades de control o a los titulares de los datos, la Nota 2 de la guía B.3.12 establece que la comunicación debe ser clara y contener como mínimo:

1. **Punto de contacto institucional** (*a contact point where more information can be obtained*):
   - Canales oficiales del Oficial de Seguridad de la Información / Delegado de Protección de Datos (OSI/DPO) para absolver consultas.
2. **Descripción de la brecha y sus probables consecuencias** (*a description of and the likely consequences of the breach*):
   - Explicación comprensible para el titular sobre lo ocurrido y los riesgos potenciales derivados.
3. **Alcance y magnitud de la brecha** (*a description of the breach including the number of individuals concerned as well as the number of records concerned*):
   - Número aproximado de personas afectadas y cantidad de registros comprometidos.
4. **Medidas adoptadas o planificadas** (*measures taken or planned to be taken*):
   - Acciones implementadas para mitigar los posibles efectos adversos y recomendaciones prácticas a los afectados (ej. cambio de contraseñas, monitoreo de cuentas).

---

### Otras Guías del Anexo B Relevantes para Registros e Incidentes

- **B.3.14 Protección de registros (*Protection of records*, pág. PDF 51)**:
  - Los registros deben protegerse de pérdida, destrucción, falsificación y accesos no autorizados.
  - La organización debe retener copias de sus políticas y procedimientos de privacidad durante el período fijado en su calendario de retención (véase B.1.4.8), **incluyendo la conservación obligatoria de versiones históricas previas** cuando sean actualizadas (principio de trazabilidad retrospectiva y máquina del tiempo).
- **B.3.25 Registro de eventos / Logging (*Logging*, págs. PDF 54-55)**:
  - Generar registros que permitan la reconstrucción forense de accesos a bases de datos de PII, intentos fallidos, modificaciones de privilegios y exportaciones masivas de datos.
  - Proteger los logs contra manipulaciones, garantizando su inmutabilidad mediante sincronización horaria y almacenamiento en servidores dedicados.
- **B.3.17 Toma de conciencia y capacitación (*Information security awareness, education and training*, págs. PDF 51-52)**:
  - Capacitar al personal para que comprenda las consecuencias de infringir las normas de privacidad (sanciones disciplinarias internas, multas regulatorias a la institución y daños materiales/morales a los titulares de datos).
- **B.1.2.9 Registros de tratamiento (*Records related to processing PII*, pág. PDF 30)**:
  - Base documental para verificar si los datos comprometidos en una brecha contaban con una base legal válida, finalidades legítimas y contratos de transferencia vigentes.
- **B.1.5.4 y B.1.5.5 Registros de transferencias y divulgaciones (págs. PDF 38-39)**:
  - Registros obligatorios que permiten determinar si una salida de datos correspondió a una transferencia autorizada o a una fuga o brecha de seguridad.

---

## 4. Sección (d): Tabla Maestra de Mapeo Cláusula-Documento por Código G4 (18 Códigos)

A continuación se presenta el mapeo exhaustivo de los 18 artefactos documentales institucionales del Grupo 4 (UNSA) contra las cláusulas normativas, los controles del Anexo A y las directrices de implementación del Anexo B de ISO/IEC 27701:2025.

| # | Código G4 | Nombre Institucional del Artefacto | Cláusulas ISO 27701:2025 | Controles Anexo A | Secciones Anexo B | Mandato de Información Documentada Aplicable | Custodio / Responsable UNSA |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `G4-ALC-01` | Determinación del Alcance del SGPI (Arequipa y Filiales Camaná / Majes) | **4.1, 4.2, 4.3, 4.4** | A.3.4 | B.3.4 | *"The scope shall be available as documented information."* (Cl. 4.3, pág. PDF 12). | Oficial de Seguridad (OSI / DPO) |
| **2** | `G4-POL-01` | Política de Privacidad de la Información (1-Pager Ejecutivo) | **5.1, 5.2, 5.3** | A.3.3 | B.3.3, B.3.14 | *"The privacy policy shall: a) be available as documented information;"* (Cl. 5.2, pág. PDF 12). | Alta Dirección / Rectorado |
| **3** | `G4-RSK-INC-01` | Matriz de Riesgos de Incidentes de Privacidad | **6.1.1, 6.1.2, 8.2** | A.3.11, A.3.12, A.3.25, A.3.24 | B.3.11, B.3.12, B.3.25 | *"The organization shall retain documented information about the privacy risk assessment process... and of results."* (Cl. 6.1.2 / 8.2, págs. PDF 14, 18). | Oficial de Seguridad (OSI / DPO) |
| **4** | `G4-MET-RSK-01` | Metodología de Gestión del Riesgo de Privacidad (Criterios y Evaluación) | **6.1.2** (ref. ISO/IEC 27557 e ISO 31000) | A.1.2.6, A.3.13 | B.1.2.6, B.3.13 | *"The organization shall retain documented information about the privacy risk assessment process."* (Cl. 6.1.2, pág. PDF 14). | Oficial de Seguridad (OSI / DPO) |
| **5** | `G4-PLN-RSK-01` | Plan de Tratamiento de Riesgos de Privacidad | **6.1.3 f, g, 8.3** | Tablas A.1 y A.3 (controles seleccionados) | Anexo B (guías aplicables) | *"The organization shall retain documented information about the privacy risk treatment process... and of results."* (Cl. 6.1.3 / 8.3, págs. PDF 15, 18). | Oficial de Seguridad (OSI / DPO) |
| **6** | `G4-SOA-01` | Declaración de Aplicabilidad del SGPI (SoA - Tablas A.1, A.2 excluida, A.3) | **6.1.3 e, 4.1**, Anexo A Intro | Tablas A.1, A.2, A.3 (78 controles) | B.1, B.2, B.3 | *"The organization shall produce a statement of applicability... and justification for excluding any controls from Annex A."* (Cl. 6.1.3 e, pág. PDF 15). | Oficial de Seguridad (OSI / DPO) |
| **7** | `G4-OBJ-01` | Objetivos de Privacidad del SGPI y Plan de Consecución | **6.2, 9.1** | A.3.16 | B.3.16 | *"The privacy objectives shall: ... g) be available as documented information."* (Cl. 6.2, pág. PDF 15). | Oficial de Seguridad (OSI / DPO) |
| **8** | `G4-PRC-DOC-01` | Procedimiento de Control de Información Documentada y Versionado | **7.5.1, 7.5.2, 7.5.3** | A.3.14, A.1.4.8, A.1.4.9 | B.3.14, B.1.4.8, B.1.4.9 | *"Documented information required by this document shall be controlled for availability, suitability and protection."* (Cl. 7.5.3, pág. PDF 17). | Secretaría Técnica SGPI / DUTIC |
| **9** | `G4-CAP-INC-01` | Módulo Formativo: Respuesta a Incidentes de Privacidad (Syllabus) | **7.2, 7.3** | A.3.17, A.3.11 | B.3.17, B.3.11 | Requisitos de competencia y toma de conciencia en incidentes y privacidad (Cl. 7.2 / 7.3, pág. PDF 16). | Academia SGPI / DPO |
| **10** | `G4-REG-CAP-01` | Registro de Asistencia y Evaluación (Pre/Post-Test) Módulo Incidentes | **7.2, 7.5.3** | A.3.17, A.3.14 | B.3.17, B.3.14 | *"Appropriate documented information shall be available as evidence of competence."* (Cl. 7.2, pág. PDF 16). | Subdirección de Personal / RRHH |
| **11** | `G4-PRC-INC-01` | Procedimiento de Respuesta a Incidentes de Privacidad | **8.1, 7.5.3** | A.3.11, A.3.12, A.3.13 | B.3.11, B.3.12, B.3.13 | *"Documented information shall be available to have confidence processes carried out as planned."* (Cl. 8.1, pág. PDF 18; Controles A.3.11/A.3.12). | Líder CSIRT-UNSA / DPO |
| **12** | `G4-REG-INC-01` | Registro Oficial y Bitácora de Incidentes de Privacidad y Brechas de PII | **8.1, 7.5.3** | A.3.12, A.3.14, A.3.25 | B.3.12 (9 campos obligatorios), B.3.14, B.3.25 | *"Where a breach involving PII has occurred, a record should be maintained with sufficient information for regulatory or forensic report"* (B.3.12, págs. PDF 49-50). | Equipo CSIRT-UNSA / DPO |
| **13** | `G4-PRG-AUD-01` | Programa Anual de Auditorías Internas del SGPI (ref. ISO 19011:2026) | **9.2.1, 9.2.2** | A.3.15, A.3.16 | B.3.15, B.3.16 | *"Documented information shall be available as evidence of the implementation of the audit programme(s)..."* (Cl. 9.2.2, pág. PDF 19). | Auditor Líder SGPI |
| **14** | `G4-REP-AUD-01` | Informe de Auditoría Interna del SGPI (Hallazgos y Conformidad Multisede) | **9.2.2** | A.3.15, A.3.16, A.3.14 | B.3.15, B.3.16, B.3.14 | *"Documented information shall be available as evidence of... the audit results."* (Cl. 9.2.2, pág. PDF 19). | Auditor Líder SGPI |
| **15** | `G4-ACT-REV-01` | Acta de Revisión por la Dirección del SGPI (Entradas y Salidas Cl. 9.3) | **9.3.1, 9.3.2, 9.3.3** | A.3.3, A.3.15, A.3.14 | B.3.3, B.3.15, B.3.14 | *"Documented information shall be available as evidence of the results of management reviews."* (Cl. 9.3.3, pág. PDF 20). | Comité SGPI / Rectorado |
| **16** | `G4-PRC-CAPA-01` | Procedimiento de No Conformidades y Acciones Correctivas | **10.1, 10.2** | A.3.16 | B.3.16 | Procedimiento normativo para tratamiento de no conformidades y acciones correctivas (Cl. 10.2, pág. PDF 20). | Oficial de Seguridad (OSI / DPO) |
| **17** | `G4-REG-CAPA-01` | Registro y Cadena de Acciones Correctivas (CAPA RAG / PIMS) | **10.2** | A.3.14, A.3.16 | B.3.14, B.3.16 | *"Documented information shall be available as evidence of: the nature of nonconformities... and results of corrective action."* (Cl. 10.2, pág. PDF 20). | Oficial de Seguridad (OSI / DPO) |
| **18** | `G4-IDX-01` | Mapa e Índice Maestro de Documentos del SGPI (Auditor's Map) | **7.5.1, 7.5.2, 7.5.3** (Orden Cl. 4→10) | A.3.14 | B.3.14 | Estructura de control y trazabilidad de toda la información documentada del SGPI (Cl. 7.5, pág. PDF 17). | Secretaría Técnica SGPI / DPO |

---

## 5. Sección (e): Notas de Conversión ISO 27001 → ISO 27701 (Transición Normativa)

### 5.1 Sustitución Terminológica: SGSI → SGPI

Al transicionar de un Sistema de Gestión de Seguridad de la Información (SGSI / *ISMS*, basado en ISO/IEC 27001) a un Sistema de Gestión de Privacidad de la Información (SGPI / *PIMS*, basado en ISO/IEC 27701:2025), deben aplicarse las siguientes sustituciones conceptuales y terminológicas obligatorias en todos los artefactos documentales:

| Término Tradicional (ISO/IEC 27001) | Término Exigido (ISO/IEC 27701:2025) | Justificación Normativa y Fundamento |
| :--- | :--- | :--- |
| **SGSI** (Sistema de Gestión de la Seguridad de la Información) | **SGPI** (Sistema de Gestión de Privacidad de la Información / *PIMS*) | ISO/IEC 27701:2025 Cl. 3.23 define PIMS como el sistema de gestión específico que aborda la protección de la privacidad afectada por el tratamiento de datos personales. |
| **Seguridad de la información** | **Seguridad de la información y protección de la privacidad / PII** | La norma integra la protección de los datos personales como un fin superior que complementa la seguridad técnica (Cl. 1, pág. PDF 7). |
| **Activos de información** | **Activos de información y Datos Personales (PII / Personally Identifiable Information)** | Los datos personales son categorizados y protegidos en función de los derechos de los individuos, no solo como activos patrimoniales de la entidad. |
| **Riesgo de seguridad de la información** | **Riesgo de privacidad y de seguridad de la información** | Cl. 6.1.2 d.1 obliga a evaluar el impacto potencial no solo en la organización sino primordialmente en los **titulares de los datos (*PII principals*)**. |
| **Partes interesadas** | **Partes interesadas (con inclusión mandatoria de los Titulares / *PII Principals*)** | Cl. 4.2 exige taxativamente incorporar a las personas naturales cuyos datos se tratan y a las autoridades de protección de datos personales (ANPD). |
| **Propietario del riesgo (*Risk owner*)** | **Propietario del riesgo de privacidad (*Privacy risk owner*)** | Cl. 6.1.2 c.2 y 6.1.3 g asignan la aprobación formal del tratamiento de riesgos al dueño del riesgo de privacidad. |
| **Declaración de Aplicabilidad (SoA 27001)** | **Declaración de Aplicabilidad (SoA 27701)** | Cl. 6.1.3 e y Anexo A: El SoA debe evaluar los 78 controles de las Tablas A.1, A.2 y A.3, justificando inclusiones y exclusiones de roles. |
| **Incidente de seguridad** | **Incidente de seguridad de la información / Brecha de PII (*PII breach*)** | B.3.12 distingue entre eventos generales, incidentes de seguridad y brechas de datos personales que comprometen derechos de titulares. |

---

### 5.2 Referencias Cruzadas de Controles: ISO 27001 Anexo A → ISO 27701 Tablas A.1 / A.3

En la primera edición (ISO/IEC 27701:2019), la norma funcionaba subordinada a ISO/IEC 27001:2013, requiriendo que la organización mantuviera una certificación ISO 27001 previa y agregara guías aditivas (Cláusulas 5 y 6 referenciaban los controles de ISO 27001).

**En ISO/IEC 27701:2025 (Segunda edición)**:
1. **Estándar Independiente (*Stand-alone*)**: La norma puede implementarse de forma autónoma.
2. **Articulación con el Programa de Seguridad (Cl. 6.1.3 c)**: La norma exige identificar y documentar el "programa de seguridad de la información" (*information security programme*), el cual debe cubrir al menos las 14 áreas operativas especificadas en 6.1.3 c (gestión de riesgos, políticas, organización, RRHH, activos, accesos, operaciones, redes, desarrollo, proveedores, incidentes, continuidad, revisiones, criptografía y seguridad física). La Nota 2 de 6.1.3 indica que si dicho programa se basa en ISO/IEC 27001, puede consultarse ISO/IEC 27002.
3. **Selección de Controles en el Tratamiento de Riesgos (Cl. 6.1.3 d, e)**:
   - Para la protección de la privacidad, los controles de referencia residen en el **Anexo A de ISO/IEC 27701:2025**.
   - Los controles de seguridad técnica pertinentes a PII han sido sintetizados directamente en la **Tabla A.3** (29 controles, A.3.3 a A.3.31), la cual recoge y adapta los controles esenciales de ISO/IEC 27002:2022 con un enfoque específico en datos personales.
   - El Anexo F (*Correspondence with ISO/IEC 27701:2019*, informativo, págs. PDF 64 a 69) suministra la correlación exhaustiva (Tablas F.1 y F.2) entre los controles de la edición 2019 (alineada a ISO 27001:2013) y la nueva taxonomía independiente 2025 (Tablas A.1 y A.3).

---

### 5.3 Tríada CIA → Tríada CIA + Propiedades de Privacidad (ISO/IEC 29100)

En la seguridad tradicional (ISO/IEC 27001), los objetivos de control giran en torno a la tríada **CIA**:
- **C**onfidencialidad (*Confidentiality*): La información no se pone a disposición ni se revela a individuos, entidades o procesos no autorizados.
- **I**ntegridad (*Integrity*): Mantenimiento de la exactitud y completitud de la información y sus métodos de proceso.
- **D**isponibilidad (*Availability*): Accesibilidad y utilización de la información por solicitud de una entidad autorizada.

**La Transformación Normativa en ISO/IEC 27701:2025**:
El estándar reconoce que un sistema puede ser 100% confidencial, íntegro y disponible, y no obstante vulnerar gravemente la privacidad de los individuos si los datos fueron obtenidos sin consentimiento, tratados para fines incompatibles o conservados indefinidamente.

Por ello, el SGPI expande la tríada CIA mediante los siguientes mandatos:

1. **Doble Perspectiva Obligatoria en el Análisis de Riesgos (Cl. 6.1.2 d.1, Pág. PDF 14)**:
   La norma exige expresamente evaluar las consecuencias potenciales no solo para la organización (multas, pérdida de reputación, costos operativos), sino **primordialmente para los titulares de los datos (*PII principals*)** (discriminación, usurpación de identidad, pérdidas financieras, daño moral, estrés psicológico o afectación a derechos fundamentales).
2. **Tríada de Afectación en Brechas de PII (Control A.3.12 / Guía B.3.12, Págs. PDF 25, 49-50)**:
   Al documentar una brecha de datos, la norma requiere calificar de forma explícita el impacto sobre la PII mediante cuatro dimensiones operativas:
   - **Indisponibilidad** (*Unavailability*): Pérdida temporal o permanente de acceso legítimo.
   - **Pérdida / Destrucción** (*Loss*): Desaparición física o lógica irreversible de los datos.
   - **Divulgación no autorizada** (*Disclosure*): Exfiltración o acceso no autorizado (quiebre de confidencialidad).
   - **Alteración no autorizada** (*Alteration*): Modificación, corrupción o manipulación no autorizada (quiebre de integridad).
3. **Incorporación Normativa de los 11 Principios de Privacidad de ISO/IEC 29100 (Anexo C, Págs. PDF 57-58)**:
   El Anexo C mapea formalmente cómo los controles de ISO/IEC 27701:2025 implementan los principios de ingeniería de la privacidad:
   - *1. Consentimiento y elección* (*Consent and choice* - ISO/IEC 29100:2024, 6.2).
   - *2. Legitimidad del propósito y especificación* (*Purpose legitimacy and specification* - 6.3).
   - *3. Limitación de la recolección* (*Collection limitation* - 6.4).
   - *4. Minimización de datos* (*Data minimization* - 6.5).
   - *5. Limitación del uso, retención y divulgación* (*Use, retention and disclosure limitation* - 6.6).
   - *6. Exactitud y calidad* (*Accuracy and quality* - 6.7).
   - *7. Apertura, transparencia y notificación* (*Openness, transparency and notice* - 6.8).
   - *8. Participación y acceso individual / Derechos ARCO* (*Individual participation and access* - 6.9).
   - *9. Responsabilidad proactiva y rendición de cuentas* (*Accountability* - 6.10).
   - *10. Seguridad de la información* (*Information security* - 6.11).
   - *11. Cumplimiento de la privacidad* (*Privacy compliance* - 6.12).

---

### 5.4 Lo que GDPR y B.3.12 NO Exigen: Desmitificación del Reloj de 72 Horas

Un error recurrente en implementaciones de privacidad es trasladar automáticamente disposiciones normativas del Reglamento General de Protección de Datos europeo (RGPD / GDPR) al comportamiento de los agentes o procedimientos del SGPI bajo ISO 27701.

El análisis cover-to-cover del estándar ISO/IEC 27701:2025 establece con claridad las siguientes premisas:

1. **El Anexo D es estrictamente INFORMATIVO (*Mapping to the GDPR*, Pág. PDF 59)**:
   - El Anexo D no impone obligaciones técnicas auditables. Su finalidad es ilustrar cómo los controles de ISO 27701 ayudan a cumplir con artículos del RGPD (Art. 5, 6, 12-22, 28, 30, 32, 33, 34, 35, etc.).
   - Los artículos del RGPD (como el Artículo 33 y su reloj perentorio de 72 horas para notificar a la autoridad supervisora) **NO forman parte de los requisitos de certificación de ISO/IEC 27701:2025**.
2. **La Guía B.3.12 NO establece ningún reloj universal de 72 horas**:
   - El estándar ISO 27701 es de alcance global y reconoce la diversidad de ordenamientos jurídicos nacionales.
   - En la Guía B.3.11 y B.3.12 (pág. PDF 49), la norma indica que la organización debe establecer procedimientos para notificar a las partes pertinentes *"incluyendo los plazos de dichas notificaciones... tomando en consideración los requisitos legales aplicables"* (*"including the timing of such notifications... taking into account the applicable legal requirements"*).
   - Para la UNSA (entidad pública peruana), el marco legal vinculante es la **Ley N° 29733 (Ley de Protección de Datos Personales de Perú)**, su Reglamento (D.S. 003-2013-JUS) y la Directiva de Seguridad de la Información emitida por la Autoridad Nacional de Protección de Datos Personales (ANPD). Los plazos de notificación ante la ANPD y ante los titulares se rigen por la legislación peruana aplicable y no por el reloj de 72 horas del RGPD europeo.
3. **El mandato real de ISO 27701: Estructura de Datos Documentales**:
   - Lo que la norma ISO/IEC 27701:2025 exige imperativa y taxativamente en B.3.12 no es una carrera contrarreloj predeterminada en horas, sino **la calidad, integridad y completitud de los datos documentados en el registro forense y regulatorio**.
   - Los agentes y moldes del Grupo 4 deben concentrarse en asegurar que la bitácora oficial (`G4-REG-INC-01`) capture de forma inmutable los **nueve (9) campos requeridos por B.3.12** y que las notificaciones institucionales cumplan con los **cuatro (4) elementos de contenido de B.3.12 Nota 2**, garantizando la plena trazabilidad de evidencias ante auditorías de Fase 1 y Fase 2.

---

## 6. Evidencia de Aceptación y Citaciones Verificadas

Para dar cumplimiento a los criterios de aceptación fijados para el entregable de Fase 0, a continuación se consignan cinco (5) citas textuales directas extraídas y verificadas contra el archivo `docs/ISO 27701-2025_ocr.pdf`:

1. **Cláusula 4.3 (Página PDF 12 / Página de norma 5)**:
   > *"The scope shall be available as documented information."*
2. **Cláusula 5.2 (Página PDF 12 / Página de norma 5)**:
   > *"The privacy policy shall: a) be available as documented information;"*
3. **Cláusula 6.1.2 (Página PDF 14 / Página de norma 7)**:
   > *"The organization shall retain documented information about the privacy risk assessment process."*
4. **Cláusula 6.1.3 e (Página PDF 15 / Página de norma 8)**:
   > *"The organization shall produce a statement of applicability that includes: the necessary controls... justification for their inclusion; whether the necessary controls are implemented or not; and the justification for excluding any of the controls from Annex A."*
5. **Guía B.3.12 (Página PDF 49 / Página de norma 42)**:
   > *"Where a breach involving PII has occurred, a record should be maintained with sufficient information to provide a report for regulatory or forensic purposes, such as: — a description of the incident; — the time period; — the consequences of the incident; — the name of the reporter; — to whom the incident was reported; — the steps taken to resolve the incident (including the person in charge and the data recovered); — the fact that the incident resulted in unavailability, loss, disclosure or alteration of PII."*

---
*Fin del documento normativo — Elaborado para el SGPI de la Universidad Nacional de San Agustín de Arequipa (UNSA Grupo 4).*
