# Evidencia de Carga de Verdad Documental a GESTITEL PIMS (ESTADO: PARCIAL / BLOQUEADO)
## Sistema de Gestión de Privacidad de la Información (SGPI) — UNSA Grupo 4

> **Fecha de Ejecución**: 2026-11-19T21:25:00Z  
> **Entorno**: `https://unsa.27k.pe` | **Tenant**: `unsa` | **Inquilino**: `G4-`  
> **Usuario Ejecutor**: `grupob4` (Credenciales inyectadas vía variables de entorno seguras)  
> **Commit Base**: `d10d9e9` (P2-H corpus)  
> **Estado Operativo**: **PARCIAL / INTERRUPCIÓN POR CUOTA DE PLATAFORMA**  

---

## 1. Resumen Ejecutivo de Ejecución Live vs. Dry-Run

| Métrica | Planificación Dry-Run (Gate 1) | Ejecutado en Vivo (Live) | Brecha / Estado |
|---|---|---|---|
| **Documentos Totales** | 18 documentos G4 | 7 documentos registrados (IDs 1–7) | 11 documentos pendientes de creación |
| **Archivos Físicos Cargados** | 63 archivos (54 PDF + 9 XLSX) | 20 archivos PDF | 43 archivos pendientes (34 PDF + 9 XLSX) |
| **Llamadas POST Emitidas** | 72 POSTs | 20 POSTs (7 CREATE + 13 ADD_VERSION + 1 APPROVE abortado con 403) | Interrumpido por cuota en POST #21 |
| **Volumen Transferido** | ~30.87 MB | ~11.8 MB | Pendiente ~19.07 MB |
| **Categorías Utilizadas** | PO, PR, RE, IN | PO (IDs 1, 2, 6, 7), PR (IDs 4, 5), RE (ID 3) | 100% validadas contra catálogo `DOCUMENT_CATEGORY` |
| **Estado Resultante en PIMS** | v1/v2 Obsoleto, v3 Vigente | Obsoleto (`O`) en todas las versiones cargadas | Aprobación a Vigente bloqueada por permisos (403) |

---

## 2. Tabla de Evidencia de Artefactos Cargados (20 Registros / 7 Documentos)

Todos los registros fueron verificados mediante lecturas directas a la API (`GET /api/documents/` y `GET /api/documents/{id}/versions/`) bajo el aislamiento multi-inquilino estricto (`G4-`):

| PIMS Doc ID | Código Documental | Título Institucional | Cat. PIMS | PIMS Ver ID | Versión | Estado PIMS | SHA-256 Primario (Local Mirror) | Timestamp de Creación (UTC) | URL de Archivo PIMS |
|---|---|---|---|---|---|---|---|---|---|
| `1` | `G4-ALC-01` | Determinación del Alcance del SGPI | `PO` | `1` | `1.00` | Obsoleto (`O`) | `94b2b1e63c143c31ceeff0366e44fd21653c25400e94e25d54a37dec142d05c5` | 2026-11-19T21:23:04.949Z | `/media/tenants/unsa/documents/v1.pdf` |
| `1` | `G4-ALC-01` | Determinación del Alcance del SGPI | `PO` | `2` | `2.00` | Obsoleto (`O`) | `2da5fadf832c3265e71cc86871abaeef568a33f123b959a87a32024506e88454` | 2026-11-19T21:23:05.487Z | `/media/tenants/unsa/documents/v2.pdf` |
| `1` | `G4-ALC-01` | Determinación del Alcance del SGPI | `PO` | `3` | `3.00` | Obsoleto (`O`) | `94baf2765e4a564cad64dd0a3ae411026b1d7b561efa906b46103d47988f647b` | 2026-11-19T21:23:05.941Z | `/media/tenants/unsa/documents/v3.pdf` |
| `2` | `G4-POL-01` | Política de Privacidad de la Información | `PO` | `4` | `1.00` | Obsoleto (`O`) | `f62fc7701b50fa24f177f5f26a9a7250be05bbd1c2480bb74ad5b72cd27b543c` | 2026-11-19T21:25:05.672Z | `/media/tenants/unsa/documents/v1_GYqTPqg.pdf` |
| `2` | `G4-POL-01` | Política de Privacidad de la Información | `PO` | `5` | `2.00` | Obsoleto (`O`) | `653e115ddaa25da3cda1a00626355ec045e7f3e69d33c4033165f993f0d6ffe5` | 2026-11-19T21:25:06.046Z | `/media/tenants/unsa/documents/v2_lp31XLd.pdf` |
| `2` | `G4-POL-01` | Política de Privacidad de la Información | `PO` | `6` | `3.00` | Obsoleto (`O`) | `67fb1e954ed3d33c9abb829846aba60238124c20c1101b195e2f07ee82a59410` | 2026-11-19T21:25:06.399Z | `/media/tenants/unsa/documents/v3_9oqv9LJ.pdf` |
| `3` | `G4-RSK-INC-01` | Apéndice 3: Formulario - Informe evaluación riesgos | `RE` | `7` | `1.00` | Obsoleto (`O`) | `b0a29b20e25e5856d7ee6a4d14a6f76a8f1015cae8f5de56daa2e4426d9141cd` | 2026-11-19T21:25:06.722Z | `/media/tenants/unsa/documents/v1_q0dCNYg.pdf` |
| `3` | `G4-RSK-INC-01` | Apéndice 3: Formulario - Informe evaluación riesgos | `RE` | `8` | `2.00` | Obsoleto (`O`) | `2b7729fb89a67ae41271e07c24af5b41b5e9a3850a335e6d7ea32dcce1a184d0` | 2026-11-19T21:25:07.005Z | `/media/tenants/unsa/documents/v2_0Gv5Qpy.pdf` |
| `3` | `G4-RSK-INC-01` | Apéndice 3: Formulario - Informe evaluación riesgos | `RE` | `9` | `3.00` | Obsoleto (`O`) | `53dabdad2806da3c1c5ff071ff1e64906a2569fcabfa6ff0bc8eb4d9094e432d` | 2026-11-19T21:25:07.319Z | `/media/tenants/unsa/documents/v3_3bZ36Yh.pdf` |
| `4` | `G4-MET-RSK-01` | Metodología de evaluación y tratamiento de riesgos | `PR` | `10` | `1.00` | Obsoleto (`O`) | `b96f08796843477e0344d95a5bbddcaea3448f4bf06666ba8594249a37fa6b7d` | 2026-11-19T21:25:07.568Z | `/media/tenants/unsa/documents/v1_W3T649X.pdf` |
| `4` | `G4-MET-RSK-01` | Metodología de evaluación y tratamiento de riesgos | `PR` | `11` | `2.00` | Obsoleto (`O`) | `c58642e132924f2b96e2105da55d9bfa2439c364fe0f0580ea5d120d91244e82` | 2026-11-19T21:25:07.828Z | `/media/tenants/unsa/documents/v2_y3r0p0E.pdf` |
| `4` | `G4-MET-RSK-01` | Metodología de evaluación y tratamiento de riesgos | `PR` | `12` | `3.00` | Obsoleto (`O`) | `fb1344963650436a63bad81abd5f25a7cc74503e8eb09e678f1d2861e3c92ad0` | 2026-11-19T21:25:08.084Z | `/media/tenants/unsa/documents/v3_9nWYDEZ.pdf` |
| `5` | `G4-PLN-RSK-01` | Plan de tratamiento del riesgo | `PR` | `13` | `1.00` | Obsoleto (`O`) | `56ee4d5ca8d3de194c14c7ec73f9dac14328649916e17b2b583e4f03ebc71163` | 2026-11-19T21:25:08.290Z | `/media/tenants/unsa/documents/v1_8kRoicz.pdf` |
| `5` | `G4-PLN-RSK-01` | Plan de tratamiento del riesgo | `PR` | `14` | `2.00` | Obsoleto (`O`) | `8698d34803cad8dd7cb07b2a027a4178d1fb7a59fb736c7c10f87ee481647033` | 2026-11-19T21:25:08.562Z | `/media/tenants/unsa/documents/v2_MHXDNWs.pdf` |
| `5` | `G4-PLN-RSK-01` | Plan de tratamiento del riesgo | `PR` | `15` | `3.00` | Obsoleto (`O`) | `3b9a87353687eb621af493ceda94bf329482380537f19a2865a4f63d2b38be2b` | 2026-11-19T21:25:08.761Z | `/media/tenants/unsa/documents/v3_AEbGShW.pdf` |
| `6` | `G4-SOA-01` | Declaración de Aplicabilidad del SGPI (SoA) | `PO` | `16` | `1.00` | Obsoleto (`O`) | `999be357cc0c2a2d7237174a1b36a342e9d4f5c98e4b15cb7bec0d814168fbf7` | 2026-11-19T21:25:09.043Z | `/media/tenants/unsa/documents/v1_IsE2xAU.pdf` |
| `6` | `G4-SOA-01` | Declaración de Aplicabilidad del SGPI (SoA) | `PO` | `17` | `2.00` | Obsoleto (`O`) | `1f36245646fb343ca5dfdf04be51cb961d523bbcdbe3b43771316b9c6ee95384` | 2026-11-19T21:25:09.341Z | `/media/tenants/unsa/documents/v2_Gjg2h4k.pdf` |
| `6` | `G4-SOA-01` | Declaración de Aplicabilidad del SGPI (SoA) | `PO` | `18` | `3.00` | Obsoleto (`O`) | `f882d3b766115076d77d995b195f7153cc3a833a9f91ab2a5029af3cd60366f4` | 2026-11-19T21:25:09.624Z | `/media/tenants/unsa/documents/v3_MGaR76x.pdf` |
| `7` | `G4-OBJ-01` | Tabla de Objetivos de Privacidad de la Información | `PO` | `19` | `1.00` | Obsoleto (`O`) | `8619adc61caacdd106aa0d5281a3a625c613d0921e78ebf677dd23cd9a2d924e` | 2026-11-19T21:25:09.829Z | `/media/tenants/unsa/documents/v1_TXXcS9v.pdf` |
| `7` | `G4-OBJ-01` | Tabla de Objetivos de Privacidad de la Información | `PO` | `20` | `2.00` | Obsoleto (`O`) | `f436eb6d5376c5c8702457c90820d731156063943c82a0ab7ca1539073a75e3c` | 2026-11-19T21:25:10.048Z | `/media/tenants/unsa/documents/v2_xbSkeQq.pdf` |

---

## 3. Bloqueadores Técnicos Registrados (Blockers)

### 3.1. Bloqueador de Cuota de Plataforma (`DOCUMENT_LIMIT_REACHED`)
- **Endpoint**: `POST /api/documents/7/versions/`
- **Código HTTP**: `403 Forbidden`
- **Respuesta API**:
  ```json
  {
    "code": "DOCUMENT_LIMIT_REACHED",
    "detail": "Ha alcanzado el límite de 20 documentos (archivos cargados, incluidas las nuevas versiones) permitido para su empresa. Contacte a GESTITEL para ampliarlo."
  }
  ```
- **Causa Raíz**: La plataforma GESTITEL PIMS aplica un límite duro por empresa/tenant que contabiliza cada archivo individual subido (tanto creación inicial como nuevas versiones adjuntas). Al alcanzar exactamente 20 archivos subidos (Doc 1: 3, Doc 2: 3, Doc 3: 3, Doc 4: 3, Doc 5: 3, Doc 6: 3, Doc 7: 2 = 20), el backend rechaza cualquier carga adicional.
- **Acción Requerida**: El administrador o docente de GESTITEL debe ampliar la cuota de documentos/archivos en la base de datos de PIMS para el tenant `unsa` a un mínimo de 65 slots (el corpus completo requiere 54 PDFs + complementarios).

### 3.2. Bloqueador de Permisos de Aprobación API (`HTTP 403 Forbidden` en `/approve/`)
- **Endpoint**: `POST /api/documents/{id}/approve/`
- **Código HTTP**: `403 Forbidden`
- **Respuesta API**:
  ```json
  {
    "detail": "Usted no tiene permiso para realizar esta acción."
  }
  ```
- **Causa Raíz**: El usuario asignado (`grupob4`) tiene privilegios de creación y versionado de documentos, pero carece de permisos RBAC para ejecutar el endpoint `/approve/`.
- **Comportamiento en Backend**: Las mutaciones directas vía `PATCH /api/documents/{id}/` con `status: "V"` son rechazadas por el backend con el error `"El estado Vigente solo se establece al aprobar el documento"`. En consecuencia, no existe vía programática para que `grupob4` fije el estado `vigente` mediante la API REST.

---

## 4. Plan de Reanudación Operativa (Resume Plan)

Una vez que el administrador amplíe la cuota de documentos en GESTITEL PIMS:

1. **Carga de Versión Faltante para Doc 7**:
   - `POST /api/documents/7/versions/`: Subir `v3.pdf` para `G4-OBJ-01` con su respectivo `change_summary`.
2. **Carga de los 11 Documentos Institucionales Restantes (v1, v2, v3)**:
   - `G4-PRC-DOC-01` (Control de Información Documentada — Categoría `PR`)
   - `G4-CAP-INC-01` (Módulo Formativo: Respuesta a Incidentes — Categoría `PR`)
   - `G4-REG-CAP-01` (Registro de Asistencia y Evaluación — Categoría `RE`)
   - `G4-PRC-INC-01` (Procedimiento de Respuesta a Incidentes — Categoría `PR`)
   - `G4-REG-INC-01` (Registro de Incidentes B.3.12 — Categoría `RE`)
   - `G4-PRG-AUD-01` (Programa Anual de Auditorías Internas — Categoría `PR`)
   - `G4-REP-AUD-01` (Informe de Auditoría Interna del SGPI — Categoría `RE`)
   - `G4-ACT-REV-01` (Acta de Revisión por la Dirección — Categoría `RE`)
   - `G4-PRC-CAPA-01` (Procedimiento de No Conformidades y CAPA — Categoría `PR`)
   - `G4-REG-CAPA-01` (Registro de No Conformidades y CAPA — Categoría `RE`)
   - `G4-IDX-01` (Mapa e Índice Maestro de Documentos — Categoría `IN`)
3. **Paso de Control Manual en UI GESTITEL (Runbook Fase 6)**:
   - Un usuario con rol de Administrador/Aprobador (Docente o DPO institucional) debe acceder a `https://unsa.27k.pe/documents/`.
   - Para cada uno de los 18 documentos institucionales (`G4-ALC-01` a `G4-IDX-01`), abrir la vista de detalle y hacer clic en el botón de **Aprobar Documento**.
   - Esto fijará la versión v3.0 en estado formal `vigente` (`V`) y relegará las versiones históricas v1.0 y v2.0 a `obsoleto` (`O`).

---
*Fin del informe de evidencia parcial — Turno B Grupo 4 SGPI UNSA.*
