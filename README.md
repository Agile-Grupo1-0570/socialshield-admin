
# SocialShield Web

Interfaz web estática para configurar y lanzar campañas **simuladas** de concientización contra phishing. Forma parte del MVP de SocialShield y representa la HU-001:

> Como administrador, quiero lanzar campañas con 3 plantillas estáticas peruanas, para evaluar la vulnerabilidad base del personal.

En esta primera versión, la plantilla educativa BCP está habilitada. SUNAT, Interbank y BBVA se muestran como opciones futuras deshabilitadas. El proyecto no incorpora logos, imágenes oficiales ni contenido malicioso; las referencias se usan únicamente para identificar escenarios de capacitación interna autorizada.

## Características

- Dashboard administrativo responsive en español.
- Catálogo extensible de plantillas dirigido por datos.
- Formulario con validación de campos, correos y URL educativa.
- Detección y eliminación de destinatarios duplicados.
- Resumen de campaña actualizado en tiempo real.
- Envío `POST` en formato JSON a un Webhook de n8n.
- Estados de carga, éxito y error accesibles.
- HTML, CSS y JavaScript puro, sin dependencias ni proceso de compilación.

El correo de envío no se configura desde la interfaz. Se administra desde el nodo Gmail conectado en n8n.

