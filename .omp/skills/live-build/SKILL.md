# Skill: live-build (SPEC 9.5)

Construcción, verificación y registro en caliente de conectores e integraciones externas en segundo plano (caso canónico: Evolution API / WhatsApp), manteniendo la sesión principal 100% interactiva y gestionando credenciales mediante el sidecar de secretos.

## 1. Trigger Patterns

Se activa ante solicitudes para conectar sistemas externos no preexistentes o levantar pasarelas de comunicación en vivo:
- "Conecta el sistema con WhatsApp usando Evolution API."
- "Integra las alertas de incidentes con Slack / Jira."
- "Construye un webhook para notificar brechas en tiempo real."
- "Levanta un conector nuevo para consultar la base de datos externa."
- Solicitudes imprevistas o "locas" del evaluador durante la demostración en vivo.

## 2. Step Protocol

1. **Reafirmación Inmediata del Objetivo (Restate Target)**:
   - Emitir un mensaje inicial inmediato reconfirmando con precisión el objetivo técnico solicitado:
     `"Objetivo recibido: Construcción y despliegue del conector Evolution API / WhatsApp para despacho de incidentes G4."`
   - Clarificar que la sesión principal se mantiene totalmente disponible para responder consultas mientras la construcción progresa en segundo plano.

2. **Aislamiento Multi-Tenant (Filtro G4 Obligatorio)**:
   - Configurar el nuevo conector para operar estrictamente dentro del namespace `G4-`, asegurando que cualquier evento entrante o saliente verifique metadatos y responsables del Grupo 4.

3. **Despacho del Subagente en Segundo Plano**:
   - Disparar un subagente de construcción basado en la convención `connectors/_template/` (SPEC 8.2):
     - Creación del cliente tipado: `connectors/<name>/client.ts`
     - Definición de capacidades del conector: `connectors/<name>/SKILL-FRAG.md`
   - El subagente implementa primero pruebas de lectura y sondas (`probe`) sin escrituras a producción sin autorización.

4. **Flujo de Credenciales vía Secrets Sidecar (SPEC 4.3)**:
   - Si la integración requiere credenciales sensibles (ej. API Key de Evolution, token de Jira):
     - El agente invoca: `secrets.request(label="evolution_api_key")`.
     - El sidecar de secretos genera una URL de un solo uso con expiración de 5 minutos:
       `https://secrets.pimsai.mistercricro8.top:444/s/<token>`
     - Presentar el enlace al usuario para que pegue la credencial en el formulario web.
     - El agente sondea periódicamente: `secrets.poll(handle="<token>")`.
     - El sidecar retorna un handle opaco: `secret:<name>@<v>`.
     - **Regla estricta**: Los valores en texto plano NUNCA tocan el transcript de chat, logs ni el repositorio. El handle se inyecta como variable de entorno en el contenedor hermano (`docker run -e API_KEY=secret:...`).
     - La demostración y la conversación continúan sin bloquearse mientras se espera el secreto.

5. **Despliegue y Registro en Red Interna Traefik**:
   - Levantar el contenedor del servicio puente en `internal-proxy` con etiquetas de Traefik bajo un slug único:
     - Router: `pimsai-<slug>`
     - Host: `<slug>.pimsai.mistercricro8.top:444`
   - Registrar dinámicamente las herramientas del conector concatenando `SKILL-FRAG.md` al runtime de herramientas.

6. **Anuncio Verificado o Diagnóstico**:
   - El subagente ejecuta una verificación en vivo: `connector.probe()`.
   - Una vez comprobada la operatividad, emitir el anuncio formal de disponibilidad.
   - Concluir obligatoriamente la respuesta con la convención: `"resultado aquí: link"`.

## 3. Failure Branches

- **Credenciales Faltantes o Tiempo Expirado en Secrets Sidecar**:
  - Si transcurren los 5 minutos sin ingreso del secreto, el subagente pausa la tarea y reporta: `"El enlace temporal para 'evolution_api_key' expiró sin recibir credenciales. La sesión principal continúa activa; puedes solicitar un nuevo enlace cuando lo desees."`
- **Falla en el Endpoint del Servicio Externo (Probe Failed)**:
  - Si el servicio externo devuelve error de red o autenticación:
    - No bloquear la sesión principal.
    - Emitir un diagnóstico detallado: `"Sonda de verificación fallida: Evolution API devolvió 401 Unauthorized. Verifique la validez del token en el proveedor."`
- **Intento de Escritura No Autorizada en Producción**:
  - Toda mutación o envío masivo hacia servicios externos queda pausada hasta confirmación humana explícita.
- **Límite de Presupuesto Alcanzado (Loan Profile Degraded-at-Cap)**:
  - Si se alcanza el límite de `task.softRequestBudget` o la cuota en perfil loan:
    - La recuperación de datos permanece activa: consulta de conectores existentes y documentación continúa funcionando.
    - La construcción y generación de nuevos conectores en vivo se pausa inmediatamente.
    - Mensaje de contacto obligatorio:
      `"Límite de presupuesto de tokens alcanzado en perfil loan. La recuperación continúa activa, pero la construcción de conectores en vivo está pausada. Contacte al equipo Turno B Grupo 4 para ampliación de cuota."`

## 4. Response Shape

### Fase Inicial (Reconfirmación y no bloqueo)
```markdown
> 🛠️ **Iniciando Construcción en Segundo Plano**  
> **Objetivo**: Integración en caliente de Evolution API / WhatsApp para gestión de alertas de incidentes (Tenant G4).  
> **Estado**: El subagente está configurando el conector a partir de `connectors/_template/`.  
> *La sesión principal continúa 100% interactiva. Puedes seguir realizando consultas o análisis normativos mientras se completa el despliegue.*
```

### Fase Intermedia (Si se requieren credenciales)
```markdown
> 🔐 **Credencial Requerida para Conector**  
> Para autenticar contra Evolution API, ingresa la clave de acceso de forma segura en:  
> https://secrets.pimsai.mistercricro8.top:444/s/tok_8a9f2bc71  
> *(Enlace válido por 5 minutos. El valor se cifra con age y nunca se expone en la conversación).*
```

### Fase Final (Verificación y Entrega)
```markdown
### Conector Evolution API / WhatsApp Operativo
- **Estado**: ✅ Verificado en vivo mediante sonda `probe()` (HTTP 200).
- **Herramientas Registradas**: `connectors.evolution.send_message`, `connectors.evolution.webhook_listen`.
- **Aislamiento**: Filtro de eventos restringido a prefijo `G4-` y responsables autorizados.

resultado aquí: https://evolution-g4-bridge-e4a1.pimsai.mistercricro8.top:444
```
