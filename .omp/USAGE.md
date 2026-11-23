# GUÍA DE USO OPERACIONAL — UNSA PIMS AGENTIC OPERATOR (TURNO B GRUPO 4)

Bienvenido al entorno de operación agéntica del Sistema de Gestión de Información de Privacidad (PIMS) para la **Universidad Nacional de San Agustín (UNSA)** bajo **ISO/IEC 27701:2025** (segunda edición, 2025-10). El operador gestiona cualquier escenario del SGPI de extremo a extremo.

---

## 1. COMANDOS PRINCIPALES Y ATAJOS
- `/new`: Reinicia la sesión conversacional manteniendo la configuración activa.
  > **Recomendación**: Ejecute `/new` cada vez que termine una línea temática de investigación o demo para mantener el contexto limpio y preservar la cuota de peticiones (`task.softRequestBudget`).
- `/resume`: Abre el selector interactivo para reanudar sesiones históricas previas.
- `mas ayuda`: Muestra este manual de uso completo.

---

## 2. ARQUITECTURA Y FUENTE DE VERDAD
1. **Fuente Primaria de Verdad (PIMS GESTITEL)**:
   - URL: `https://unsa.27k.pe` | Esquema del tenant: `unsa`.
   - Todos los documentos, incidentes, auditorías y evaluaciones de riesgo oficiales residen en GESTITEL.
   - El operador interactúa mediante `PimsClient` (`packages/pims-adapter/client.ts`) y la API REST (`/business/login/` con JWT y `/api/.../`).
2. **Espejo y Cache Semántico (`CORPUS_MIRROR_DIR` + pgvector)**:
   - Copia local versionada en `CORPUS_MIRROR_DIR/<doc.code>/v<version>.<ext>` (con `v<version>.txt` normalizado y `manifest.json`), montada fuera de `/app` en `/var/lib/pimsai/corpus_mirror`.
   - Vectorización semántica (`mistral-embed`, 1024 dimensiones) almacenada en `pims_registry` y `chunks` (`pimsai-db`) con índice coseno (`<=>`) y SHA-256 por fragmento.
   - Consulta directa: `bun scripts/rag-query.ts "<consulta>"` o `bun scripts/rag-query.ts --full --doc <doc.code>`.
   - Citas verbatim con formato: `pims:<doc.code>:v<version>:<chunk_id>:lines:<inicio>-<fin>`.
   - **Regla de Cache**: El espejo es estrictamente una cache. Si la API de PIMS no responde, el operador responde desde el espejo etiquetando: `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
3. **Moldes Parametrizados Typst (`molds/`) y Flujo Copy-Then-Fill**:
   - Funciones puras en `molds/<category>/mold*.typ` (copiando `molds/common/` a `/tmp/pims-staging/common/`).
   - **Sin dependencia de `corpus_g4_src/`**: Los valores vigentes del documento se reconstruyen desde `CORPUS_MIRROR_DIR/<doc.code>/v<n>.txt` o PDF vivo de PIMS, alineando la versión del PDF al siguiente entero de PIMS (`"3.00"` → PDF `"4.0"` → `"4.00"`), compilando en staging y esperando aprobación humana antes de cargar a PIMS. `RAFA.md` se consulta en silencio (jamás se cita al usuario).
4. **Sidecars de Soporte (`*.pimsai.mistercricro8.top`)**:
   - `demo`: Interfaz web de terminal Zellij.
   - `files`: Servicio de carga temporal de archivos con URL de 1 solo uso (expira en 5 min).
   - `secrets`: Almacén cifrado con age y formulario seguro para captura de credenciales.

---

## 3. REGLAS OPERATIVAS OBLIGATORIAS
1. **Prefijo `G4-` en Escrituras / Lecturas Uniformes**:
   - Toda escritura en PIMS (código de documento o incidente) DEBE iniciar con `G4-` y contar con aprobación humana explícita.
   - Las lecturas (`GET /api/documents/`, `/api/incidents/`, `/api/audits/`) inspeccionan el sistema completo de forma uniforme sin filtrar por `G4-`.
3. **Manejo Seguro de Secretos**:
   - Jamás leer `.env` ni mostrar contraseñas, JWTs o claves en el chat. Contenedores auto-alojados usan claves generadas al iniciar; solo credenciales externas del usuario pasan por `secrets-sidecar` (`:444/s/<token>`).
4. **Aprobación para Escrituras en Producción**:
   - Toda mutación en PIMS (incluidos documentos y versiones) o envío SMTP (`"envíalo"`) requiere confirmación explícita humana tras presentar vista previa o borrador.
5. **Disciplina Copy-Then-Fill y Referencia Normativa**:
   - Nuevas versiones se compilan en `/tmp/pims-staging/` desde `molds/` + `CORPUS_MIRROR_DIR` sin editar `molds/` en su lugar ni PDFs a mano; las evaluaciones normativas usan `reference/iso-27701-2025.md`.

---

## 4. ALCANCE NORMATIVO ISO/IEC 27701:2025
- **Rol Determinado (Cl. 4.1)**: La UNSA actúa exclusivamente como **PII Controller** (determina fines y medios para admisión de estudiantes y nómina docente/administrativa).
- **Tablas Aplicables**:
  - **Tabla A.1** (Controles para Responsables de PII): En alcance.
  - **Tabla A.3** (Controles comunes a ambos roles): En alcance.
  - **Tabla A.2** (Controles para Encargados de PII): Excluida con justificación en la Declaración de Aplicabilidad (SoA).
- **GDPR**: Es exclusivamente dato documental (el reloj de 72h del Art. 33 de GDPR **nunca** guía la conducta del agente).

---

## 5. CAPACIDADES DISPONIBLES (LENGUAJE NATURAL)

No es necesario invocar comandos especiales para usar las capacidades del operador; basta con formular su solicitud en lenguaje natural:

- **Consulta y comparación documental**: Buscar políticas, procedimientos, SoA o actas, y comparar diferencias e historial entre versiones.
- **Gestión de incidentes y riesgos**: Consultar el registro de incidentes, evaluar severidad/contención y revisar escenarios y planes de tratamiento de riesgos.
- **Trazabilidad de auditorías**: Seguir la cadena completa desde un hallazgo de auditoría hacia su No Conformidad (NC), acción correctiva, responsables y evidencia documental.
- **Actualización y generación de documentos**: Solicitar nuevas versiones por cambios de alcance o hechos institucionales mediante el flujo desacoplado copy-then-fill (molde parametrizado + invocador con diccionario de datos), o subir archivos mediante enlaces temporales seguros para su indexación.
- **Notificaciones e integraciones**: Redactar requerimientos de seguimiento (con envío únicamente tras aprobación explícita) y habilitar conectores externos según necesidad.
