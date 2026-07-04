
# SocialShield Web

Interfaz web estática para configurar y lanzar campañas **simuladas** de concientización contra phishing. Forma parte del MVP de SocialShield y representa la HU-001:

> Como administrador, quiero lanzar campañas con 3 plantillas estáticas peruanas, para evaluar la vulnerabilidad base del personal.

Esta versión incluye tres plantillas educativas habilitadas: BCP, SUNAT y BBVA. Interbank queda fuera del MVP actual como posible escenario futuro. El proyecto no incorpora logos, imágenes oficiales ni contenido malicioso; las referencias se usan únicamente para identificar escenarios de capacitación interna autorizada.

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

## Uso local

Clona o descarga el repositorio y abre `index.html` directamente en un navegador. También puedes servir la carpeta con cualquier servidor HTTP estático.

La interfaz funciona sin servidor propio. El envío al Webhook requiere que n8n esté publicado, use HTTPS y permita solicitudes CORS desde el dominio de GitHub Pages (y desde el origen local utilizado durante las pruebas).

## Configurar el Webhook de n8n

Abre `app.js` y reemplaza la constante:

```js
const N8N_WEBHOOK_URL = "https://TU-N8N.com/webhook/lanzar-campana";
```

por la URL real del nodo **Webhook** de tu flujo:

```js
const N8N_WEBHOOK_URL = "https://automatizacion.tuempresa.com/webhook/lanzar-campana";
```

El Webhook debe aceptar solicitudes `POST` con `Content-Type: application/json`. La aplicación envía:

```json
{
  "template": "bcp",
  "templateId": "bcp",
  "templateName": "BCP",
  "templateSubject": "Aviso de seguridad de cuenta",
  "templateEntity": "BCP Simulado",
  "campaignName": "Evaluación interna",
  "senderName": "Centro de Seguridad Digital",
  "recipients": [
    "persona1@tuempresa.com",
    "persona2@tuempresa.com"
  ],
  "trainingUrl": "https://capacitacion.tuempresa.com/phishing",
  "scheduledDate": "2026-07-15T09:00",
  "createdAt": "2026-07-02T20:30:00.000Z",
  "source": "github-pages-admin"
}
```

Para una fecha de envío vacía, `scheduledDate` se envía como una cadena vacía. Cualquier respuesta HTTP `2xx` se considera exitosa.

> Antes de publicar, evita almacenar secretos o credenciales en este repositorio. GitHub Pages sirve todo el código al navegador. La autenticación sensible debe resolverse en n8n o en una capa de backend segura.

## Agregar nuevas plantillas

El catálogo está definido en `CAMPAIGN_TEMPLATES`, dentro de `app.js`. Añade un objeto siguiendo esta estructura:

```js
{
  id: "nueva-plantilla",
  name: "Nueva plantilla",
  entity: "Entidad simulada",
  subject: "Asunto educativo sugerido",
  description: "Descripción del escenario educativo.",
  previewText: "Texto seguro para la vista previa.",
  status: "Próximamente",
  isAvailable: false,
  accentClass: "template-card--nueva"
}
```

Mientras `isAvailable` sea `false`, la tarjeta aparecerá bloqueada. Para habilitarla:

1. Implementa y prueba el flujo correspondiente en n8n.
2. Cambia `isAvailable` a `true`.
3. Verifica que n8n utilice `template` o `templateId` para elegir el flujo correcto.
4. Mantén textos, recursos y destinos estrictamente educativos; no incluyas logos reales ni contenido que capture credenciales.

La etiqueta del botón y el resumen cambian automáticamente según la plantilla seleccionada.

## Desplegar en GitHub Pages

1. Sube `index.html`, `styles.css`, `app.js` y `README.md` a la rama principal del repositorio.
2. En GitHub, abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama principal (`main` o `master`) y la carpeta raíz (`/(root)`).
5. Guarda la configuración y espera a que GitHub publique la URL.
6. Abre la URL publicada y realiza una prueba con correos internos autorizados.

Los recursos usan rutas relativas, por lo que la aplicación funciona tanto en un dominio de usuario como en una ruta de proyecto de GitHub Pages.

## Estructura

```text
.
├── index.html   # Estructura semántica del dashboard
├── styles.css   # Diseño responsive y estados visuales
├── app.js       # Plantillas, validación, resumen y conexión con n8n
└── README.md    # Configuración y despliegue
```

## Uso responsable

SocialShield Web debe utilizarse únicamente en simulaciones internas autorizadas, con destinatarios informados según las políticas de la organización y las normas aplicables. No está diseñado para suplantación real, recolección de credenciales ni campañas maliciosas.
