Alcance de este plan

Cuando se publica una noticia en Strapi (con texto + imagen), se genera automáticamente contenido adaptado por red social usando IA, y se publica (o se envía a aprobación) en Facebook, Instagram, X y LinkedIn.

FASE 0 — Infraestructura base

Objetivo: tener n8n corriendo y accesible antes de tocar lógica de negocio.

Agregar servicio n8n al docker-compose.yml existente (junto a Strapi y Next.js).
Configurar subdominio (ej. n8n.afautal.cl) apuntando al VPS.
Configurar HTTPS con Caddy o Nginx + Certbot.
Levantar el contenedor, verificar que la UI de n8n cargue y crear el usuario admin.
Configurar WEBHOOK_URL en las variables de entorno de n8n apuntando al dominio público (crítico, si no los webhooks no funcionan desde afuera).

Checkpoint: podés entrar a https://n8n.afautal.cl y crear un workflow de prueba manual.

FASE 1 — Conexión Strapi → n8n

Objetivo: que n8n reciba el evento cuando se publica una noticia.

En Strapi, crear el Webhook en Settings → Webhooks:
Evento: entry.publish
Content Type: Noticia
URL: la del nodo Webhook de n8n (se genera al crear el nodo)
En n8n, crear el workflow nuevo con nodo Webhook (trigger).
Publicar una noticia de prueba en Strapi y verificar en n8n (modo "Listen for test event") que llega el payload completo.
Verificar específicamente si el campo de imagen viene poblado en el payload.
Si NO viene poblado → agregar nodo HTTP Request después del webhook que haga GET /api/noticias/:id?populate=imagen a la API de Strapi para traer la URL completa de la imagen.

Checkpoint: al publicar una noticia en Strapi, ves en n8n el JSON completo con título, cuerpo, y URL pública de la imagen.

FASE 2 — Generación de contenido con IA

Objetivo: transformar el texto de la noticia en versiones cortas por red social.

Agregar nodo HTTP Request a la API de Anthropic (api.anthropic.com/v1/messages), o usar el nodo nativo de Anthropic si n8n lo tiene disponible en tu versión.
Prompt fijo (guardado como variable/credential en n8n, no hardcodeado suelto) que reciba {{titulo}} y {{cuerpo}} y devuelva JSON con las 4 versiones (twitter, instagram, facebook, linkedin).
Agregar nodo Code o Set para parsear la respuesta (extraer el bloque de texto y hacer JSON.parse), con manejo de error por si la IA devuelve algo mal formado (fallback: reintentar una vez, o mandar alerta al admin si falla dos veces).

Checkpoint: con el payload de la Fase 1 como input, el workflow genera y muestra las 4 versiones de texto correctamente formateadas.

FASE 3 — Aprobación humana antes de publicar (recomendado, no saltar esta fase)

Objetivo: que nada se publique sin que alguien lo revise, al menos en esta primera versión.

Agregar nodo que mande las 4 versiones generadas a un canal de revisión — más simple: un correo o mensaje a Telegram/Slack con las versiones y un link.
Opción simple para empezar: guardar el resultado en un content type nuevo en Strapi (Publicacion-Redes, estado pendiente), y que el admin lo apruebe manualmente desde el panel de Strapi cambiando el estado a aprobado.
Si vas por la opción de Strapi: agregar un segundo trigger en n8n (Webhook o Cron que consulte cada X minutos) que detecte cuándo una Publicacion-Redes pasa a aprobado, y ahí recién dispare la Fase 4.

Checkpoint: las versiones generadas quedan visibles para revisión antes de publicarse en cualquier red, y hay un mecanismo claro de "dar el visto bueno".

FASE 4 — Publicación por red (una red a la vez, no todas juntas)

Objetivo: publicar efectivamente, agregando redes de a una para aislar errores.

Orden sugerido (de más simple a más compleja para configurar):

Facebook — nodo nativo de n8n, requiere Page Access Token de larga duración generado desde Meta for Developers.
Instagram (Business, vía Graph API) — requiere que la imagen esté en URL pública accesible, y que la cuenta esté vinculada a la Página de Facebook.
LinkedIn — nodo nativo, requiere página de empresa (no perfil personal) y app aprobada.
X/Twitter — nodo nativo o HTTP Request a API v2, revisar plan/límites de la API antes de implementar (puede requerir plan pago según volumen de publicaciones).

Para cada red: implementar, probar con una publicación real (o en modo prueba/borrador si la API lo permite), y recién pasar a la siguiente red cuando la anterior funcione end-to-end.

Checkpoint por red: una noticia de prueba se publica correctamente con texto + imagen en esa red específica.

FASE 5 — Manejo de errores y visibilidad

Objetivo: que si algo falla, alguien se entere sin tener que revisar logs de servidor.

Agregar nodo de manejo de errores (Error Trigger en n8n) al workflow completo.
Si falla cualquier paso, enviar notificación (correo o Telegram) al admin con el detalle del error.
Guardar en Strapi (en el registro de Publicacion-Redes) el estado final: publicado, error, con detalle de qué red falló si fue parcial.

Checkpoint: si desconectás intencionalmente una API key, el sistema te avisa en vez de fallar en silencio.

Orden de prioridad si el tiempo aprieta

Si hay que recortar alcance para una primera entrega funcional:

Fase 0 y 1 son no negociables (base técnica).
Fase 2 (IA) es rápida de implementar una vez que el payload llega bien.
Fase 3 (aprobación) — no te la saltes, es la que evita publicaciones erróneas o embarazosas sin revisión.
Fase 4 — arrancá con una sola red (Facebook, que es la más directa) y dejá el resto como "próxima iteración" declarado explícitamente, en vez de intentar las 4 en paralelo y no terminar ninguna bien.
Fase 5 puede ir al final, pero no la elimines del plan — es la diferencia entre un sistema confiable y uno que falla silenciosamente.