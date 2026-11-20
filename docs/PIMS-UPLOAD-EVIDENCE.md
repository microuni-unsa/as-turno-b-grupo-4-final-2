# Evidencia de Carga de Verdad Documental a GESTITEL PIMS (ESTADO: FINAL / CARGA COMPLETA)
## Sistema de Gestión de Privacidad de la Información (SGPI) — UNSA Grupo 4

> **Fecha de Ejecución Inicial**: 2026-11-19T21:25:00Z  
> **Fecha de Reanudación y Cierre**: 2026-11-19T22:17:32Z  
> **Entorno**: `https://unsa.27k.pe` | **Tenant**: `unsa` | **Inquilino**: `G4-`  
> **Usuario Ejecutor**: `grupob4` (Credenciales inyectadas vía variables de entorno seguras)  
> **Commit Base**: `c870ae8`  
> **Estado Operativo**: **FINAL — CARGA COMPLETA EXITOSA (54/54 VERSIONES PDF)**  

---

## 1. Resumen Ejecutivo e Historial Operativo (Dry-Run vs. Parcial vs. Final)

| Métrica | Planificación Dry-Run (Gate 1) | Ejecución Parcial Inicial (Bloqueada) | Reanudación y Cierre Final (Post-Cuota) | Estado Final / Brecha |
|---|---|---|---|---|
| **Documentos Totales** | 18 documentos G4 | 7 documentos registrados (IDs 1–7) | 18 documentos registrados (IDs 1–18) | 100% completado (18 de 18) |
| **Archivos Físicos en PIMS** | 63 archivos (54 PDF + 9 XLSX) | 20 archivos PDF | 54 archivos PDF cargados | 100% de versiones PDF en PIMS (54 de 54) |
| **Llamadas POST Emitidas** | 72 POSTs planificados | 20 POSTs (7 CREATE + 13 ADD_VERSION + 1 403) | 34 POSTs en reanudación (1 ADD_VERSION + 11 CREATE + 22 ADD_VERSION) | 54 POSTs de carga exitosos en total |
| **Volumen Transferido** | ~30.87 MB | ~11.8 MB | ~30.87 MB acumulado | Carga íntegra completada |
| **Categorías Utilizadas** | PO, PR, RE, IN | PO (IDs 1, 2, 6, 7), PR (IDs 4, 5), RE (ID 3) | PO (5 docs), PR (6 docs), RE (6 docs), IN (1 doc) | 100% validadas contra catálogo `DOCUMENT_CATEGORY` |
| **Estado Resultante en PIMS** | v1/v2 Obsoleto, v3 Vigente | Obsoleto (`O`) en todas las versiones cargadas | Obsoleto (`O`) en las 54 versiones cargadas | Pendiente de aprobación manual UI (RBAC 403) |

### 1.1. Historial de Ejecución y Reanudación Operativa
1. **Ejecución Inicial (Gate 1 - Parcial)**:
   - Se planificó la carga de 18 documentos institucionales multiversión (v1, v2, v3).
   - Se ejecutaron exitosamente 20 POSTs correspondientes a los documentos 1 al 6 completos (v1, v2, v3) y el documento 7 (`G4-OBJ-01`) en sus versiones v1 y v2.
   - En el intento de subir la versión v3 de `G4-OBJ-01`, la plataforma PIMS retornó `HTTP 403 Forbidden` (`DOCUMENT_LIMIT_REACHED`), informando un límite duro de 20 archivos para la empresa.
   - Adicionalmente, se confirmó que las llamadas a `POST /api/documents/{id}/approve/` retornaban `HTTP 403 Forbidden` debido a restricciones RBAC de la cuenta `grupob4`.
2. **Ampliación de Cuota por Administración**:
   - La administración de GESTITEL PIMS amplió la cuota de almacenamiento/documentos del tenant `unsa`.
3. **Reanudación Idempotente y Cierre Exitoso**:
   - Verificado el commit base `c870ae8` y el estado previo de PIMS (7 docs / 20 versiones).
   - Se ejecutó `bun scripts/upload-pims-truth.ts --live`.
   - El script detectó e ignoró idempotentemente los 7 documentos y 20 versiones existentes.
   - Se ejecutaron exactamente 34 nuevas peticiones POST:
     - 1 `ADD_VERSION` para completar `G4-OBJ-01` (v3).
     - 11 `CREATE_DOCUMENT` para los documentos restantes (`G4-PRC-DOC-01` a `G4-IDX-01`).
     - 22 `ADD_VERSION` para las versiones v2 y v3 de dichos 11 documentos.
   - Resultado final: 18 documentos institucionales registrados con sus 3 versiones cada uno (54 versiones PDF totales en PIMS).

---

## 2. Nota de Alcance y Limitación Técnica Conocida (Archivos XLSX)

> [!NOTE]
> **Limitación de la Documents API de GESTITEL PIMS respecto a archivos XLSX**:  
> Durante la fase de planificación (dry-run), el planificador contabiliza 63 archivos físicos totales (54 archivos PDF correspondientes a las versiones normativas primarias más 9 libros complementarios en formato Microsoft Excel `XLSX`: `G4-REG-INC-01` v1..v3, `G4-RSK-INC-01` v1..v3 y `G4-PLN-RSK-01` v1..v3).  
> Sin embargo, la API REST de documentos de GESTITEL PIMS (`/api/documents/` y `/api/documents/{id}/versions/`) únicamente admite y procesa archivos binarios con MIME type PDF (`application/pdf`), sin contar con un parámetro o endpoint para adjuntar hojas de cálculo complementarias.  
> Por diseño del adaptador y de la arquitectura del SGPI, los 54 archivos PDF residen formalmente en GESTITEL PIMS, mientras que los 9 libros XLSX se conservan bajo custodia local verificable en `corpus_mirror/` con sus respectivos hashes SHA-256 certificados en los manifiestos JSON.

---

## 3. Bloqueadores Técnicos Registrados y Estado de Resolución

### 3.1. Bloqueador de Cuota de Plataforma (`DOCUMENT_LIMIT_REACHED`) — RESUELTO
- **Endpoint**: `POST /api/documents/7/versions/`
- **Código HTTP**: `403 Forbidden`
- **Detalle de Error Original**:
  ```json
  {
    "code": "DOCUMENT_LIMIT_REACHED",
    "detail": "Ha alcanzado el límite de 20 documentos (archivos cargados, incluidas las nuevas versiones) permitido para su empresa. Contacte a GESTITEL para ampliarlo."
  }
  ```
- **Estado**: **SUPERADO / RESUELTO**. El administrador amplió la cuota de archivos en PIMS para el tenant `unsa`. La reanudación completó satisfactoriamente los 34 archivos PDF restantes, alcanzando 54 versiones cargadas sin incidencias.

### 3.2. Bloqueador de Permisos de Aprobación API (`HTTP 403 Forbidden` en `/approve/`) — LIMITACIÓN RBAC CONOCIDA
- **Endpoint**: `POST /api/documents/{id}/approve/`
- **Código HTTP**: `403 Forbidden`
- **Detalle de Error**:
  ```json
  {
    "detail": "Usted no tiene permiso para realizar esta acción."
  }
  ```
- **Causa Raíz**: El usuario asignado (`grupob4`) cuenta con rol de operador técnico para creación y versionado documental, pero la regla de negocio de GESTITEL PIMS restringe el endpoint de aprobación a roles directivos/administradores (Docente / DPO institucional).
- **Mecanismo de Mitigación en Script**: Conforme a la directiva del coordinador, el script `upload-pims-truth.ts` omite deliberadamente la emisión de peticiones a dicho endpoint para evitar excepciones bloqueantes.
- **Acción Pendiente**: Requiere ejecución manual desde la interfaz de usuario web por parte de un usuario con privilegios de aprobación (ver Sección 5).

---

## 4. Tabla de Evidencia de Artefactos Cargados en PIMS (54 Registros / 18 Documentos)

Verificación realizada mediante lecturas directas a la API (`GET /api/documents/` y `GET /api/documents/{id}/versions/`) bajo el aislamiento multi-inquilino estricto (`G4-`):

| PIMS Doc ID | Código Documental | Título Institucional | Cat. PIMS | PIMS Ver ID | Versión | Estado PIMS | SHA-256 Primario (Local Mirror) | Timestamp de Creación (UTC) | URL de Archivo PIMS |
|---|---|---|---|---|---|---|---|---|---|
| `1` | `G4-ALC-01` | Determinación del Alcance del SGPI | `PO` | `1` | `1.00` | Obsoleto (`O`) | `94b2b1e63c143c31ceeff0366e44fd21653c25400e94e25d54a37dec142d05c5` | 2026-11-19T21:23:04.949238Z | `/media/tenants/unsa/documents/v1.pdf` |
| `1` | `G4-ALC-01` | Determinación del Alcance del SGPI | `PO` | `2` | `2.00` | Obsoleto (`O`) | `2da5fadf832c3265e71cc86871abaeef568a33f123b959a87a32024506e88454` | 2026-11-19T21:23:05.487058Z | `/media/tenants/unsa/documents/v2.pdf` |
| `1` | `G4-ALC-01` | Determinación del Alcance del SGPI | `PO` | `3` | `3.00` | Obsoleto (`O`) | `94baf2765e4a564cad64dd0a3ae411026b1d7b561efa906b46103d47988f647b` | 2026-11-19T21:23:05.941603Z | `/media/tenants/unsa/documents/v3.pdf` |
| `2` | `G4-POL-01` | Política de Privacidad de la Información | `PO` | `4` | `1.00` | Obsoleto (`O`) | `f62fc7701b50fa24f177f5f26a9a7250be05bbd1c2480bb74ad5b72cd27b543c` | 2026-11-19T21:25:05.672945Z | `/media/tenants/unsa/documents/v1_GYqTPqg.pdf` |
| `2` | `G4-POL-01` | Política de Privacidad de la Información | `PO` | `5` | `2.00` | Obsoleto (`O`) | `653e115ddaa25da3cda1a00626355ec045e7f3e69d33c4033165f993f0d6ffe5` | 2026-11-19T21:25:06.046496Z | `/media/tenants/unsa/documents/v2_lp31XLd.pdf` |
| `2` | `G4-POL-01` | Política de Privacidad de la Información | `PO` | `6` | `3.00` | Obsoleto (`O`) | `67fb1e954ed3d33c9abb829846aba60238124c20c1101b195e2f07ee82a59410` | 2026-11-19T21:25:06.399765Z | `/media/tenants/unsa/documents/v3_9oqv9LJ.pdf` |
| `3` | `G4-RSK-INC-01` | Apéndice 3: Formulario - Informe sobre evaluación y tratamiento de riesgos | `RE` | `7` | `1.00` | Obsoleto (`O`) | `b0a29b20e25e5856d7ee6a4d14a6f76a8f1015cae8f5de56daa2e4426d9141cd` | 2026-11-19T21:25:06.722824Z | `/media/tenants/unsa/documents/v1_q0dCNYg.pdf` |
| `3` | `G4-RSK-INC-01` | Apéndice 3: Formulario - Informe sobre evaluación y tratamiento de riesgos | `RE` | `8` | `2.00` | Obsoleto (`O`) | `2b7729fb89a67ae41271e07c24af5b41b5e9a3850a335e6d7ea32dcce1a184d0` | 2026-11-19T21:25:07.005429Z | `/media/tenants/unsa/documents/v2_0Gv5Qpy.pdf` |
| `3` | `G4-RSK-INC-01` | Apéndice 3: Formulario - Informe sobre evaluación y tratamiento de riesgos | `RE` | `9` | `3.00` | Obsoleto (`O`) | `53dabdad4062abe18581ac2b2b91a664392df966fe6d46e984ec28e8e61edce0` | 2026-11-19T21:25:07.294945Z | `/media/tenants/unsa/documents/v3_bf5r7TM.pdf` |
| `4` | `G4-MET-RSK-01` | Metodología de evaluación y tratamiento de riesgos | `PR` | `10` | `1.00` | Obsoleto (`O`) | `b96f0879ffbd2eeb35b1326ff6e9dd92aab795a9215ecd48096d6f1753c4cde1` | 2026-11-19T21:25:07.564342Z | `/media/tenants/unsa/documents/v1_X9EudyR.pdf` |
| `4` | `G4-MET-RSK-01` | Metodología de evaluación y tratamiento de riesgos | `PR` | `11` | `2.00` | Obsoleto (`O`) | `c58642e18a035c9f0668e26c4c1c9cdd93f1f35fa37a2b56fdfdc6461f57a750` | 2026-11-19T21:25:07.812564Z | `/media/tenants/unsa/documents/v2_t1j5JtS.pdf` |
| `4` | `G4-MET-RSK-01` | Metodología de evaluación y tratamiento de riesgos | `PR` | `12` | `3.00` | Obsoleto (`O`) | `fb1344963650436a63bad81abd5f25a7cc74503e8eb09e678f1d2861e3c92ad0` | 2026-11-19T21:25:08.084683Z | `/media/tenants/unsa/documents/v3_9nWYDEZ.pdf` |
| `5` | `G4-PLN-RSK-01` | Plan de tratamiento del riesgo | `PR` | `13` | `1.00` | Obsoleto (`O`) | `56ee4d5ca8d3de194c14c7ec73f9dac14328649916e17b2b583e4f03ebc71163` | 2026-11-19T21:25:08.290220Z | `/media/tenants/unsa/documents/v1_8kRoicz.pdf` |
| `5` | `G4-PLN-RSK-01` | Plan de tratamiento del riesgo | `PR` | `14` | `2.00` | Obsoleto (`O`) | `8698d34803cad8dd7cb07b2a027a4178d1fb7a59fb736c7c10f87ee481647033` | 2026-11-19T21:25:08.562685Z | `/media/tenants/unsa/documents/v2_MHXDNWs.pdf` |
| `5` | `G4-PLN-RSK-01` | Plan de tratamiento del riesgo | `PR` | `15` | `3.00` | Obsoleto (`O`) | `3b9a87353687eb621af493ceda94bf329482380537f19a2865a4f63d2b38be2b` | 2026-11-19T21:25:08.761075Z | `/media/tenants/unsa/documents/v3_AEbGShW.pdf` |
| `6` | `G4-SOA-01` | Declaración de Aplicabilidad del SGPI (SoA) | `PO` | `16` | `1.00` | Obsoleto (`O`) | `999be357cc0c2a2d7237174a1b36a342e9d4f5c98e4b15cb7bec0d814168fbf7` | 2026-11-19T21:25:09.043965Z | `/media/tenants/unsa/documents/v1_IsE2xAU.pdf` |
| `6` | `G4-SOA-01` | Declaración de Aplicabilidad del SGPI (SoA) | `PO` | `17` | `2.00` | Obsoleto (`O`) | `1f36245646fb343ca5dfdf04be51cb961d523bbcdbe3b43771316b9c6ee95384` | 2026-11-19T21:25:09.341857Z | `/media/tenants/unsa/documents/v2_Gjg2h4k.pdf` |
| `6` | `G4-SOA-01` | Declaración de Aplicabilidad del SGPI (SoA) | `PO` | `18` | `3.00` | Obsoleto (`O`) | `f882d3b766115076d77d995b195f7153cc3a833a9f91ab2a5029af3cd60366f4` | 2026-11-19T21:25:09.624735Z | `/media/tenants/unsa/documents/v3_MGaR76x.pdf` |
| `7` | `G4-OBJ-01` | Tabla de Objetivos de Privacidad de la Información | `PO` | `19` | `1.00` | Obsoleto (`O`) | `8619adc61caacdd106aa0d5281a3a625c613d0921e78ebf677dd23cd9a2d924e` | 2026-11-19T21:25:09.829575Z | `/media/tenants/unsa/documents/v1_TXXcS9v.pdf` |
| `7` | `G4-OBJ-01` | Tabla de Objetivos de Privacidad de la Información | `PO` | `20` | `2.00` | Obsoleto (`O`) | `f436eb6d5376c5c8702457c90820d731156063943c82a0ab7ca1539073a75e3c` | 2026-11-19T21:25:10.048563Z | `/media/tenants/unsa/documents/v2_xbSkeQq.pdf` |
| `7` | `G4-OBJ-01` | Tabla de Objetivos de Privacidad de la Información | `PO` | `21` | `3.00` | Obsoleto (`O`) | `4f7e333a820866f3378a6a5de9f52380132cc88bc70cde8027f34080db4c981a` | 2026-11-19T22:17:23.708602Z | `/media/tenants/unsa/documents/v3_Fq9q1nY.pdf` |
| `8` | `G4-PRC-DOC-01` | Procedimiento para control de documentos y registros | `PR` | `22` | `1.00` | Obsoleto (`O`) | `5c51e3d64a55f7ad1387cd53097c76fd3b874df38051e86692f44e67c293870e` | 2026-11-19T22:17:24.013877Z | `/media/tenants/unsa/documents/v1_cZac2VS.pdf` |
| `8` | `G4-PRC-DOC-01` | Procedimiento para control de documentos y registros | `PR` | `23` | `2.00` | Obsoleto (`O`) | `903598160c0c94359dd3ef23583291290b80e8f499d55a88d281846d5cb71051` | 2026-11-19T22:17:24.245492Z | `/media/tenants/unsa/documents/v2_hAWMeJa.pdf` |
| `8` | `G4-PRC-DOC-01` | Procedimiento para control de documentos y registros | `PR` | `24` | `3.00` | Obsoleto (`O`) | `175dad29d760fc9693d60bbb5d93268e303564098eeba14418d10d523412bc98` | 2026-11-19T22:17:24.922407Z | `/media/tenants/unsa/documents/v3_X8KmzYv.pdf` |
| `9` | `G4-CAP-INC-01` | Plan de capacitación y concienciación | `PR` | `25` | `1.00` | Obsoleto (`O`) | `302c2df32d67edf92bf962394c1b167d72c4345d827e4e18ca15bc6034c3d0ba` | 2026-11-19T22:17:25.153104Z | `/media/tenants/unsa/documents/v1_rxBrebi.pdf` |
| `9` | `G4-CAP-INC-01` | Plan de capacitación y concienciación | `PR` | `26` | `2.00` | Obsoleto (`O`) | `76275a9deb4ea1398c695be4c78dda60cc9bce59e7b97a0a7d36ef5e14f02537` | 2026-11-19T22:17:25.387116Z | `/media/tenants/unsa/documents/v2_QPcTh9I.pdf` |
| `9` | `G4-CAP-INC-01` | Plan de capacitación y concienciación | `PR` | `27` | `3.00` | Obsoleto (`O`) | `537562d35f3cb021aa52f60860c32747fbaf3640fb9724f65d1d3cdb13a9d867` | 2026-11-19T22:17:25.948926Z | `/media/tenants/unsa/documents/v3_OiRqh35.pdf` |
| `10` | `G4-REG-CAP-01` | Registro de Asistencia y Evaluación | `RE` | `28` | `1.00` | Obsoleto (`O`) | `cab98597fa8dff200d6850663b606d8e8a00440d95676ab70c4cde0e029a324b` | 2026-11-19T22:17:26.124296Z | `/media/tenants/unsa/documents/v1_84h38bo.pdf` |
| `10` | `G4-REG-CAP-01` | Registro de Asistencia y Evaluación | `RE` | `29` | `2.00` | Obsoleto (`O`) | `f4075e3f0b0e70347e753c339da9aecbcd31b9a55e951d9613fce237b7beed0f` | 2026-11-19T22:17:26.370151Z | `/media/tenants/unsa/documents/v2_9XNG4hP.pdf` |
| `10` | `G4-REG-CAP-01` | Registro de Asistencia y Evaluación | `RE` | `30` | `3.00` | Obsoleto (`O`) | `3d7cc57abf60f79c0ff6bf321364224cf3f0c76fc56a8615a973eae029e5c83b` | 2026-11-19T22:17:26.559220Z | `/media/tenants/unsa/documents/v3_JO0ucdw.pdf` |
| `11` | `G4-PRC-INC-01` | Procedimiento de Respuesta a Incidentes de Privacidad | `PR` | `31` | `1.00` | Obsoleto (`O`) | `f5f0f65f873039cd3c16c10bdc2088192354ebf68cda079813f8a0be6d38dfeb` | 2026-11-19T22:17:26.919336Z | `/media/tenants/unsa/documents/v1_IYBqxmm.pdf` |
| `11` | `G4-PRC-INC-01` | Procedimiento de Respuesta a Incidentes de Privacidad | `PR` | `32` | `2.00` | Obsoleto (`O`) | `cf9b68cf8981656b16ddfb71304e9228a8fbfb8577434b129555bd8c60b70c39` | 2026-11-19T22:17:27.201588Z | `/media/tenants/unsa/documents/v2_5hdVhPV.pdf` |
| `11` | `G4-PRC-INC-01` | Procedimiento de Respuesta a Incidentes de Privacidad | `PR` | `33` | `3.00` | Obsoleto (`O`) | `3079c7af754bca83c6c023493cc1d18bba40ac4dbc5780db800e8048ccbf9ecf` | 2026-11-19T22:17:27.407471Z | `/media/tenants/unsa/documents/v3_o5YCznc.pdf` |
| `12` | `G4-REG-INC-01` | Registro Oficial de Incidentes de Privacidad (SGPI) | `RE` | `34` | `1.00` | Obsoleto (`O`) | `6d71ceb355863cdfe56cd5ba2e293b8086d219f060fb584f7cbe200f261e185e` | 2026-11-19T22:17:27.582309Z | `/media/tenants/unsa/documents/v1_2f3cNlL.pdf` |
| `12` | `G4-REG-INC-01` | Registro Oficial de Incidentes de Privacidad (SGPI) | `RE` | `35` | `2.00` | Obsoleto (`O`) | `b17c33f3c639fa449100a1e9871bef8da03481e921bdff66ac11b80ee3bc5cbe` | 2026-11-19T22:17:27.765679Z | `/media/tenants/unsa/documents/v2_KIGTXos.pdf` |
| `12` | `G4-REG-INC-01` | Registro Oficial de Incidentes de Privacidad (SGPI) | `RE` | `36` | `3.00` | Obsoleto (`O`) | `9534ae17d269269510f9b796ba9d5317683300200436d977b7920b7b144d40ea` | 2026-11-19T22:17:27.917131Z | `/media/tenants/unsa/documents/v3_EMFwVCb.pdf` |
| `13` | `G4-PRG-AUD-01` | Programa Anual de Auditorías Internas del SGPI | `PR` | `37` | `1.00` | Obsoleto (`O`) | `afc6680121bb8c9e8b43bbc985e50b12c47842e53a8dcb86314a432b519ecc2b` | 2026-11-19T22:17:28.046368Z | `/media/tenants/unsa/documents/v1_EjHdbCn.pdf` |
| `13` | `G4-PRG-AUD-01` | Programa Anual de Auditorías Internas del SGPI | `PR` | `38` | `2.00` | Obsoleto (`O`) | `321c0973c8840f15d59dbb81b79baf4f31c05495d48b5f198132d40e23109b89` | 2026-11-19T22:17:28.182078Z | `/media/tenants/unsa/documents/v2_FhaEkTZ.pdf` |
| `13` | `G4-PRG-AUD-01` | Programa Anual de Auditorías Internas del SGPI | `PR` | `39` | `3.00` | Obsoleto (`O`) | `bf17f9b04007d3ee1b8198696e60e07c60e7711ec9d8934d189626a6c033734a` | 2026-11-19T22:17:28.571491Z | `/media/tenants/unsa/documents/v3_luwrryV.pdf` |
| `14` | `G4-REP-AUD-01` | Informe de Auditoría Interna del SGPI | `RE` | `40` | `1.00` | Obsoleto (`O`) | `893aa45cdac2ce4f901d2adfd8640703e3c09ee5b0d5c5886e274263c83dfa85` | 2026-11-19T22:17:28.729278Z | `/media/tenants/unsa/documents/v1_AnSnyys.pdf` |
| `14` | `G4-REP-AUD-01` | Informe de Auditoría Interna del SGPI | `RE` | `41` | `2.00` | Obsoleto (`O`) | `1237e3cec3f6215cd179056c189af1d12b101fc81f28e9f01d38c59b94e0c66c` | 2026-11-19T22:17:29.246845Z | `/media/tenants/unsa/documents/v2_zvTmO6I.pdf` |
| `14` | `G4-REP-AUD-01` | Informe de Auditoría Interna del SGPI | `RE` | `42` | `3.00` | Obsoleto (`O`) | `0c7a116b38aa1f52cf5cb40a3248e35e4efbdf97a8b294e0decfcd1e39f7ad35` | 2026-11-19T22:17:29.404389Z | `/media/tenants/unsa/documents/v3_Hv0hRaA.pdf` |
| `15` | `G4-ACT-REV-01` | Acta de Revisión por la Dirección del SGPI | `RE` | `43` | `1.00` | Obsoleto (`O`) | `4a5d249514807faa46ee5fa6d529c60407c67184587280362b179e2f604dc44a` | 2026-11-19T22:17:29.583300Z | `/media/tenants/unsa/documents/v1_WREIJmn.pdf` |
| `15` | `G4-ACT-REV-01` | Acta de Revisión por la Dirección del SGPI | `RE` | `44` | `2.00` | Obsoleto (`O`) | `64019f94037ae449c2001f5e0938d45d909485148477dc78dc2fa5c469683056` | 2026-11-19T22:17:29.719369Z | `/media/tenants/unsa/documents/v2_bzNz2qf.pdf` |
| `15` | `G4-ACT-REV-01` | Acta de Revisión por la Dirección del SGPI | `RE` | `45` | `3.00` | Obsoleto (`O`) | `c297ca200a35b1b77579b3d70a235bf818664bb17227162ef2e03d74581d278c` | 2026-11-19T22:17:30.227613Z | `/media/tenants/unsa/documents/v3_yzgjlM9.pdf` |
| `16` | `G4-PRC-CAPA-01` | Procedimiento para medidas correctivas | `PR` | `46` | `1.00` | Obsoleto (`O`) | `3b84de244a4d9d98fb32053c01d0397d7656f26708795eb0c4980c8ee23eb092` | 2026-11-19T22:17:30.409759Z | `/media/tenants/unsa/documents/v1_sSJwukC.pdf` |
| `16` | `G4-PRC-CAPA-01` | Procedimiento para medidas correctivas | `PR` | `47` | `2.00` | Obsoleto (`O`) | `382db2ac42148a67b611673f2f4c9bb9d6c50f31d832e26e6b33d4069f1dc435` | 2026-11-19T22:17:30.683277Z | `/media/tenants/unsa/documents/v2_cHgjUWr.pdf` |
| `16` | `G4-PRC-CAPA-01` | Procedimiento para medidas correctivas | `PR` | `48` | `3.00` | Obsoleto (`O`) | `37fc0800f60bdb3519f379b5847cb48f4da815a00c21338dc104c49996912d76` | 2026-11-19T22:17:30.846476Z | `/media/tenants/unsa/documents/v3_X3pUeKv.pdf` |
| `17` | `G4-REG-CAPA-01` | Apéndice: Formulario para medidas correctivas | `RE` | `49` | `1.00` | Obsoleto (`O`) | `c7a143610e59aa0d826d12d39051543716f72706f22ea2ec4cfb23890d41c78c` | 2026-11-19T22:17:30.980828Z | `/media/tenants/unsa/documents/v1_uvoGp1m.pdf` |
| `17` | `G4-REG-CAPA-01` | Apéndice: Formulario para medidas correctivas | `RE` | `50` | `2.00` | Obsoleto (`O`) | `2e80cbdc5074cb60d49f638adaa69ca7f63ca4f3f45b7c5756e85e53ddb16500` | 2026-11-19T22:17:31.119618Z | `/media/tenants/unsa/documents/v2_hTSaZjm.pdf` |
| `17` | `G4-REG-CAPA-01` | Apéndice: Formulario para medidas correctivas | `RE` | `51` | `3.00` | Obsoleto (`O`) | `65c4122de9cbbc5cad79596323f0b3536123877b3caccc974539c32804cee4d8` | 2026-11-19T22:17:31.413690Z | `/media/tenants/unsa/documents/v3_dHqhJjR.pdf` |
| `18` | `G4-IDX-01` | Mapa e Índice Maestro de Documentos (Auditor's Map) | `IN` | `52` | `1.00` | Obsoleto (`O`) | `53dc35543aa2e947b08001426a09503675432f8ceaef99a1e4ec53b1fbf0bed7` | 2026-11-19T22:17:31.670508Z | `/media/tenants/unsa/documents/v1_ZFBdW3j.pdf` |
| `18` | `G4-IDX-01` | Mapa e Índice Maestro de Documentos (Auditor's Map) | `IN` | `53` | `2.00` | Obsoleto (`O`) | `a449c27e295fb4a429d41122ef6c3747df1fd10c65661251b004a1906876a25e` | 2026-11-19T22:17:31.969240Z | `/media/tenants/unsa/documents/v2_qg9lH4B.pdf` |
| `18` | `G4-IDX-01` | Mapa e Índice Maestro de Documentos (Auditor's Map) | `IN` | `54` | `3.00` | Obsoleto (`O`) | `5b3101eba86f22a8c6e77e84c7e8c51d30ed9470bba9445beaf4fe4befeea220` | 2026-11-19T22:17:32.785509Z | `/media/tenants/unsa/documents/v3_he1bRSM.pdf` |

---

## 5. Procedimiento de Aprobación Manual en UI GESTITEL (Runbook Fase 6)

Dado que el usuario de servicio `grupob4` no cuenta con permisos para invocar el endpoint `/api/documents/{id}/approve/`, la transición de las versiones finales (v3.00) de estado **Obsoleto (`O`)** a estado **Vigente (`V`)** debe ser efectuada manualmente por un usuario con perfil Administrador/Docente a través de la consola web.

### 5.1. Instrucciones de Aprobación
1. Ingresar a la plataforma web de GESTITEL: `https://unsa.27k.pe` con credenciales administrativas.
2. Navegar a la sección **Gestión Documental** (`/documents/`).
3. Para cada uno de los 18 documentos listados a continuación:
   - Acceder al registro del documento mediante su ID o Código.
   - Verificar que la versión activa sea la `v3.00`.
   - Hacer clic en la acción **Aprobar Documento**.
   - Confirmar que el estado del documento cambia a **Vigente** (`V`), lo que formaliza la vigencia rectoral de la versión v3.00 y asegura que las versiones históricas v1.00 y v2.00 permanezcan como **Obsoleto** (`O`).

### 5.2. Catálogo Maestro de los 18 Documentos Institucionales a Aprobar

| PIMS Doc ID | Código Documental | Título Institucional | Categoría PIMS | Versión a Aprobar | Estado Actual en PIMS | Estado Objetivo tras Aprobación UI |
|---|---|---|---|---|---|---|
| `1` | `G4-ALC-01` | Determinación del Alcance del SGPI | `PO` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `2` | `G4-POL-01` | Política de Privacidad de la Información | `PO` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `3` | `G4-RSK-INC-01` | Apéndice 3: Formulario - Informe sobre evaluación y tratamiento de riesgos | `RE` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `4` | `G4-MET-RSK-01` | Metodología de evaluación y tratamiento de riesgos | `PR` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `5` | `G4-PLN-RSK-01` | Plan de tratamiento del riesgo | `PR` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `6` | `G4-SOA-01` | Declaración de Aplicabilidad del SGPI (SoA) | `PO` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `7` | `G4-OBJ-01` | Tabla de Objetivos de Privacidad de la Información | `PO` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `8` | `G4-PRC-DOC-01` | Procedimiento para control de documentos y registros | `PR` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `9` | `G4-CAP-INC-01` | Plan de capacitación y concienciación | `PR` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `10` | `G4-REG-CAP-01` | Registro de Asistencia y Evaluación | `RE` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `11` | `G4-PRC-INC-01` | Procedimiento de Respuesta a Incidentes de Privacidad | `PR` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `12` | `G4-REG-INC-01` | Registro Oficial de Incidentes de Privacidad (SGPI) | `RE` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `13` | `G4-PRG-AUD-01` | Programa Anual de Auditorías Internas del SGPI | `PR` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `14` | `G4-REP-AUD-01` | Informe de Auditoría Interna del SGPI | `RE` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `15` | `G4-ACT-REV-01` | Acta de Revisión por la Dirección del SGPI | `RE` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `16` | `G4-PRC-CAPA-01` | Procedimiento para medidas correctivas | `PR` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `17` | `G4-REG-CAPA-01` | Apéndice: Formulario para medidas correctivas | `RE` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |
| `18` | `G4-IDX-01` | Mapa e Índice Maestro de Documentos (Auditor's Map) | `IN` | `3.00` | Obsoleto (`O`) | Vigente (`V`) |

---
*Informe de evidencia final emitido conforme al estándar de auditoría ISO/IEC 27701:2025 — Turno B Grupo 4 SGPI UNSA.*

---

## 5. Addendum de Estados (2026-11-19, decisión usuario)

Tras la carga completa, los 18 documentos (IDs 1–18) fueron transicionados vía `PATCH /api/documents/{id}/` de `O` a **`en_revision` (`R`)** (18/18 HTTP 200, verificado por lectura). Motivo: `grupob4` carece de permiso `approve` y el backend rechaza `V` por cualquier otra vía (`El estado "Vigente" solo se establece al aprobar`), por lo que `V` es inalcanzable vía API.

**Política vigente:** el agente y la ingesta RAG (`sync-pims-truth`, `pimsai-db`) DEBEN aceptar estados `R` y `V` por igual. La aprobación formal a `V` en UI por un administrador queda como paso opcional futuro, NO bloqueante para RAG ni para el despliegue.
