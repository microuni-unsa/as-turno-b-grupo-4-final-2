# GUÍA DE USO OPERACIONAL — OPERADOR DEL SGPI UNSA (GRUPO 4)

Bienvenido al entorno de operación agéntica del **Sistema de Gestión de Información de Privacidad (SGPI / PIMS)** de la **Universidad Nacional de San Agustín de Arequipa (UNSA)**, alineado con **ISO/IEC 27701:2025** (segunda edición).

---

## 1. COMANDOS RÁPIDOS DE SESIÓN

- `/new`: Inicia una conversación limpia manteniendo la configuración institucional activa.
  > **Recomendación**: Ejecute `/new` al finalizar cada línea de revisión o cláusula de auditoría para mantener respuestas ágiles y conservar la cuota operativa de la sesión.
- `/resume`: Abre el selector de sesiones previas para retomar inspecciones anteriores.
- `mas ayuda`: Muestra esta guía operativa en cualquier momento sin consumir cuota conversacional.

---

## 2. CAPACIDADES DEL OPERADOR (EN LENGUAJE NATURAL)

No necesita memorizar comandos ni sintaxis técnica; formule sus consultas o solicitudes directamente en español:

- **Consultas normativas y documentales**: Solicite políticas, procedimientos, alcances, Declaración de Aplicabilidad (SoA), matrices de riesgo o actas. Todas las respuestas incluyen citas verificables al documento oficial vigente (`pims:<código>:v<versión>:<fragmento>:<líneas>`).
- **Comparación e historial de versiones**: Pida comparar versiones de cualquier documento del repositorio PIMS para identificar cambios estructurales, evolución de cláusulas e historial formal de aprobaciones.
- **Tablero de incidentes, riesgos y auditorías**: Consulte el estado consolidado de incidentes de privacidad, hallazgos de auditoría, no conformidades y acciones correctivas con clasificación semafórica estricta (**Rojo / Ámbar / Verde**), donde el estado Verde exige cierre formal, cumplimiento al 100 % y evidencia documental verificada.
- **Trazabilidad de auditoría**: Siga la cadena completa desde un hallazgo o incidente hasta su no conformidad, acción correctiva, responsable, plazo y documento de respaldo.
- **Actualización y emisión de nuevas versiones**: Solicite actualizar un documento o evaluar el impacto en cascada de una nueva Resolución Rectoral o cambio organizacional. El operador genera primero una vista previa publicada en enlace seguro para su revisión y **espera su aprobación explícita antes de registrar la versión oficial** en la plataforma PIMS.
- **Carga segura de documentos externos**: Solicite subir un informe o documento externo; recibirá un enlace temporal de un solo uso (vigencia de 5 minutos, máximo 50 MB). Tras la carga, el operador revisa el contenido y consulta qué acción desea realizar antes de indexar o registrar el archivo.
- **Notificaciones de seguimiento e integraciones**: Redacte citaciones de seguimiento para responsables de acciones correctivas (el envío por correo institucional solo se ejecuta cuando usted escriba literalmente **`envíalo`**) o solicite habilitar conectores y tableros de soporte en vivo cuando la operación lo requiera.

---

## 3. PRINCIPIOS DE GOBERNANZA Y SEGURIDAD

1. **Fuente Oficial de Verdad (PIMS GESTITEL — `https://unsa.27k.pe`)**:
   - Toda lectura de documentos, incidentes, auditorías, riesgos y activos consulta de forma uniforme el registro completo de la plataforma institucional.
   - Si la plataforma institucional presentara interrupción temporal de red, el operador responderá desde la copia de respaldo sincronizada indicando explícitamente el aviso de fuente en caché.
2. **Aislamiento de Grupo y Doble Compuerta Humana**:
   - Toda creación o modificación nueva emitida por este operador corresponde exclusivamente al **Grupo 4** (código con prefijo `G4-`).
   - Ninguna mutación en producción (documentos, versiones, incidentes o envío de correos) se ejecuta sin confirmación explícita del usuario tras revisar la vista previa o el detalle propuesto.
3. **Confidencialidad de Credenciales**:
   - Las contraseñas, llaves y credenciales institucionales nunca se solicitan por el chat ni se muestran en pantalla. Para credenciales externas de usuario se emplea un formulario cifrado de un solo uso.
4. **Portales de Soporte (`*.pimsai.mistercricro8.top:444`)**:
   - **Terminal Web (`demo`)**: Interfaz interactiva de operación.
   - **Portal de Archivos (`files`)**: Carga temporal de documentos y publicación de reportes y vistas previas para revisión.
   - **Portal de Secretos (`secrets`)**: Captura cifrada de un solo uso para credenciales externas autorizadas.

---

## 4. ALCANCE NORMATIVO ISO/IEC 27701:2025

- **Rol de la UNSA (Cl. 4.1)**: La universidad actúa exclusivamente como **Responsable de Tratamiento de PII (*PII Controller*)** para los procesos de **Admisión de Pregrado** y **Planilla de Remuneraciones**.
- **Controles Aplicables**:
  - **Tabla A.1** (Controles para Responsables de PII): En alcance.
  - **Tabla A.3** (Controles comunes): En alcance.
  - **Tabla A.2** (Controles para Encargados de PII): Excluida con justificación formal en la Declaración de Aplicabilidad (`G4-SOA-01`).
- **Marco Referencial**: Las referencias a normativa extranjera (como GDPR) presentes en los documentos son estrictamente informativas y no rigen los plazos operativos ni el flujo de trabajo del SGPI.
