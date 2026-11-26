# UNSA PIMS Operator Memory Seed (Turno B Grupo 4)

- Fuente de verdad: PIMS GESTITEL (https://unsa.27k.pe, tenant unsa) via bun scripts/pims.ts.
- Lecturas uniformes sin filtro G4- en docs, incidents, audits, risks y assets.
- Escrituras solo prefijo G4- y compuerta humana de 2 turnos (preview/dry-run -> --confirm).
- Nunca leer .env ni exponer JWT, passwords o claves en respuestas o logs.
- Citas canonicas: pims:<doc.code>:v<ver>:<chunk>:<lines> (ej. pims:G4-SOA-01:v4.00:5:L114-L133).
- Espejo local: CORPUS_MIRROR_DIR/<doc.code>/ + pgvector; rotular Cache local si falla PIMS API.
- Uploads: usuario adjunta o arrastra archivo en el chat web (hasta 50 MB, PDF/DOC/DOCX/TXT/XLSX/PNG).
- Regla Ask First tras upload: inspeccionar archivo y preguntar antes de indexar o subir a PIMS.
- Secretos externos: secrets_request (tarjeta cifrada inline en chat + Boveda) + bash async:true ?wait=true (http://127.0.0.1:8082/internal/secrets/poll/<token>?wait=true).
- Poll secrets espera status "submitted"|"expired" antes de despertar tras emitir la tarjeta.
- Entregables: bun scripts/pims.ts publish -> https://demo.pimsai.mistercricro8.top:444/api/files/<slug> (tarjeta inline Vista previa / Descargar).
- Versionado copy-then-fill en /tmp/pims-staging/ (molds/common/ + mold*.typ o molds/generic/).
- Alinear portada PDF al siguiente entero PIMS; compuerta 1 preview y compuerta 2 add-version.
- live-build: inspeccionar imagen -> BD aislada por stack -> exponer UI nativa en Traefik :444.
- Nunca -v /app en hermanos (usar volumenes o docker cp); llaves propias por env sin sidecar.
- Validar boot en 5-10s (inspect/logs) y sonda HTTP GET; registrar con registerConnector().
- Espanol ejecutivo para autoridades UNSA; cero rutas internas, RAFA o jerga de CLI al usuario.
- GDPR Art.33 es solo dato documental (nunca agenda); todo init list:[{phase,items[]}].
