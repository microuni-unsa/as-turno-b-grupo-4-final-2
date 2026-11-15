# GUÍA DE USO OPERACIONAL — UNSA PIMS AGENTIC OPERATOR (TURNO B GRUPO 4)

Bienvenido al entorno de operación agéntica del Sistema de Gestión de Información de Privacidad (PIMS) para la **Universidad Nacional de San Agustín (UNSA)**.
Este operador agéntico implementa, audita, versiona y remedia evidencia documental y operativa en estricto cumplimiento con la norma **ISO/IEC 27701:2025** (segunda edición, 2025-10).

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
   - El operador interactúa directamente mediante la API REST (`/business/login/` con JWT y `/api/.../`).
2. **Espejo y Cache Semántico (pgvector Sidecar)**:
   - Copia local versionada en `corpus_mirror/<doc_id>/v<version>.<ext>` con `manifest.json`.
   - Vectorización semántica (1024 dimensiones, endpoint compatible con OpenAI configurado mediante `EMBEDDINGS_BASE_URL` y `EMBEDDING_MODEL`) almacenada en PostgreSQL con índice coseno (`<=>`).
   - Citas verbatim con formato: `pims:<doc_id>:v<version>:chunk:<index>:lines:<inicio>-<fin>` y hash SHA-256 por fragmento.
   - **Regla de Cache**: El espejo es estrictamente una cache. Si la API de PIMS no responde, el operador responde desde el espejo etiquetando: `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
3. **Moldes Typst (`molds/*.typ`)**:
   - Plantillas declarativas para compilar PDF y XLSX. Los archivos `.typ` locales son moldes, nunca el registro oficial.
4. **Sidecars de Soporte (`*.pimsai.mistercricro8.top`)**:
   - `demo`: Interfaz web de terminal Zellij.
   - `files`: Servicio de carga temporal de archivos con URL de 1 solo uso (expira en 5 min).
   - `secrets`: Almacén cifrado con age y formulario seguro para captura de credenciales.

---

## 3. REGLAS OPERATIVAS OBLIGATORIAS
1. **Prefijo `G4-` en Escrituras**:
   - Al compartir el tenant de GESTITEL con otros grupos, **toda escritura** (código de documento, incidente, auditoría o riesgo) DEBE incluir el prefijo `G4-` (ej. `G4-POL-001`, `G4-INC-2025-01`).
2. **Filtrado Estricto en Lecturas**:
   - En todas las consultas se filtran exclusivamente los registros de Turno B Grupo 4 (`G4-` / `grupob4`), ignorando datos de otros equipos.
3. **Manejo Seguro de Secretos**:
   - Nunca escriba contraseñas o tokens en el chat. Utilice el flujo de sidecar (`secrets.request` / `secrets.poll`) para obtener identificadores opacos (`secret:<nombre>@<v>`).
4. **Aprobación para Escrituras en Producción**:
   - Mutaciones fuera de documentos, incidentes, auditorías o riesgos requieren confirmación explícita del operador humano.

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
- **Actualización y generación de documentos**: Solicitar nuevas versiones por cambios de alcance o hechos institucionales, o subir archivos mediante enlaces temporales seguros para su indexación.
- **Notificaciones e integraciones**: Redactar requerimientos de seguimiento (con envío únicamente tras aprobación explícita) y habilitar conectores externos según necesidad.
