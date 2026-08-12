# AFAUTAL · n8n — Publicación automática de Noticias a Redes Sociales

Pipeline: **Strapi publica una noticia** → webhook a n8n → IA genera 4 versiones por red → queda en **`publicacion-red` (estado `pendiente`)** → el admin aprueba en Strapi → n8n publica en las redes habilitadas → estado `publicado`/`error` y avisos al admin.

Carpeta autocontenida y subible a cualquier VPS/VM con Docker. **Todo lo de dominio/URL/credenciales va por variables de entorno** (`.env`), nada hardcodeado.

## Contenido

```
n8n/
  docker-compose.yml        n8n + PostgreSQL + Caddy (perfil opcional)
  .env.example              copiar a .env y completar
  caddy/Caddyfile           proxy HTTPS, dominio desde env
  prompts/versiones-redes.txt   prompt IA (fuente de verdad)
  workflows/
    01-noticia-a-ia.json        Fases 1-2
    02-aprobacion-a-redes.json  Fases 3-4
    03-error-handler.json       Fase 5
```

Strapi (en `afautal-strapi-backend`): content type nuevo **`publicacion-red`**.

---

## FASE 0 — Levantar n8n

```bash
cd n8n
cp .env.example .env
# editar .env (mínimo: POSTGRES_PASSWORD, N8N_ENCRYPTION_KEY, N8N_WEBHOOK_URL,
#               STAPI_WEBHOOK_SECRET, STRAPI_API_TOKEN, ADMIN_EMAIL)
openssl rand -hex 32   # para N8N_ENCRYPTION_KEY
openssl rand -base64 24  # para STAPI_WEBHOOK_SECRET

# Levantamiento básico (UI por http://IP:5678):
docker compose up -d

# O con proxy HTTPS (dominio público, ej. n8n.afautal.cl):
#   1) Apuntá el subdominio n8n.afautal.cl al VPS (registro A).
#   2) En .env seteas N8N_DOMAIN=n8n.afautal.cl y N8N_EMAIL=...
#   3) Levantar con Caddy:
docker compose --profile proxy up -d
```

Entra a `https://n8n.afautal.cl` (o `http://IP:5678` en dev), creá el usuario admin y comprobá que cargue.

> Para probar local sin dominio: en el `.env` poné `N8N_WEBHOOK_URL=http://localhost:5678/` y en `caddy/Caddyfile` usá `tls internal` con dominio `localhost` (docker no estará corriendo local en este repo; se valida en el server).

---

## FASE 1 — Strapi → n8n (webhook)

1. En Strapi Admin → **Settings → Webhooks** → Create:
   - **Name**: `n8n - noticia publicada`
   - **Event**: `entry.publish` sobre **Noticia**.
   - **URL**: `https://n8n.afautal.cl/webhook/strapi-noticia` (tu `N8N_WEBHOOK_URL` + `webhook/strapi-noticia`).
   - **Headers**: `X-AFAUTAL-Token` = tu `STAPI_WEBHOOK_SECRET` (el mismo de `.env`).
   - Guardar y probar con "Send test".

2. En n8n importá **`workflows/01-noticia-a-ia.json`** (Import from File / Clipboard).

3. Credenciales a crear y asignar (botón **Credentials** de n8n):
   - **Header Auth** → para el nodo `01 - Webhook (Strapi)` (name `X-AFAUTAL-Token`, value el secret).
   - **HTTP Bearer Auth** → para los nodos `02 - GET noticia + imagen` y `07 - Crear publicacion-red` (name `Strapi Bearer`, user el `STRAPI_API_TOKEN`; el nodo mandará `Authorization: Bearer <token>`).
   - **SMTP** → para los nodos de email (host/puerto/usr/pass de `.env`).

4. En Strapi creá un **API Token** (Settings → API Tokens) **Full access** (o con permisos de lectura sobre `noticia` + read/create/update sobre `publicacion-red`) y ponelo en `STRAPI_API_TOKEN` del `.env` n8n.

5. **Verificación Fase 1**: publicar una noticia en Strapi y en el workflow click "Listen for test event", luego en "Executions" ver que llegó el JSON. El nodo `02` hace `GET /api/noticias/{documentId}` con `populate` para traer la URL **completa** de `foto_portada_noticia` (el webhook de Strapi trae la imagen solo como id).

---

## FASE 2 — Generación con IA

- La IA se llama en el nodo `04 - Llamada IA`. Provider/model/token salen de env:
  - `AI_PROVIDER=anthropic` (default) → `https://api.anthropic.com/v1/messages`, header `x-api-key`.
  - `AI_PROVIDER=openai` → `https://api.openai.com/v1/chat/completions`, header `Authorization`.
- El prompt pide un JSON con `twitter / instagram / facebook / linkedin` y se parsea en `05 - Parsear respuesta IA`.
- Si la IA devuelve algo mal formado, el workflow sigue por la salida de error hacia `09 - Aviso error IA (email)` y no crea registro.
  - Para reintentar una vez más automáticamente, activá la opción **Retry on Failed** del nodo (Production) o conectá la salida de error otra vez al nodo `04` con un contador.

**Verificación**: con el payload de la Fase 1, el execution muestra las 4 versiones formateadas (`03 - Armar request IA` → `05 - Parsear respuesta IA`).

---

## FASE 3 — Aprobación humana

- El workflow 01 crea un registro en Content Type **`publicacion-red`** con `estado: pendiente` (en Strapi, apartado **Publicaciones Redes**).
- Llega un email al admin (nodo `08`) con las 4 versiones y link directo al Content Manager.
- Para aprobar: en Strapi, abrir el registro y cambiar **`estado` → `aprobado`**.
- El workflow 02 consulta cada `APPROVAL_POLL_MINUTES` (default 5) los `aprobado` y no los publica hasta que no los aprobés.

**Verificación**: las versiones quedan visibles antes de publicar y hay un mecanismo claro de "visto bueno".

---

## FASE 4 — Publicación por red (una a la vez)

Importá **`workflows/02-aprobacion-a-redes.json`**. Está armado para **Facebook primero**; las demás redes son nodes placeholder desactivados.

### Facebook (end-to-end)
1. En Meta for Developers creá una app conectada a la Página de AFAUTAL.
2. Generá un **Page Access Token de larga duración**:
   - Obtener short-lived `Page Access Token` (Graph API Explorer + `me/accounts`).
   - Extender: `GET /oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN` (o usar "Long-lived → Page token" en el explorer).
3. En `.env`: `FACEBOOK_PAGE_ID` (id numérico de la Página) y `FACEBOOK_PAGE_ACCESS_TOKEN`.
4. Activá `SOCIAL_ENABLED_FACEBOOK=true` y recreá el contenedor (`docker compose up -d`).
5. En n8n: habilitá el workflow 02 (activo) y asigná las credenciales de Strapi y SMTP a sus nodos.

El nodo `04 - Publicar en Facebook` publica foto + mensaje en la Página (Graph API `/photos`), después `05` marca `estado: publicado` y `06` avisa.

**Verificación**: aprobás una noticia en Strapi → en pocos minutos aparece en Facebook con texto + imagen.

### Instagram / LinkedIn / X (siguiente iteración, no en paralelo)
Los nodos placeholder (`07/08/09`) están **desactivados**; para activar cualquiera:
- **Instagram (Business)**: cuenta Business vinculada a la Página. Dos pasos con Graph API:
  1. `POST /{ig_user}/media` con `{image_url, caption}` → devuelve `id` de container.
  2. `POST /{ig_user}/media_publish?creation_id={container_id}` → el post.
  Requiere `INSTAGRAM_BUSINESS_ID` y token de página con permiso `instagram_basic_content`/`instagram_manage_content`. Cablear luego del nodo `04` (y sumar a `redes_publicadas`).
- **LinkedIn**: `LINKEDIN_ORGANIZATION_ID` + app aprobada; `POST /v2/ugcPosts`. 
- **X/Twitter**: `X_APP_ID` / `X_OAUTH_TOKEN`; `POST /2/tweets`. Revisar límites/plan de la API.

Actualizá `redes_publicadas` y el email en cada red que agregues.

---

## FASE 5 — Manejo de errores y visibilidad

1. Importá **`workflows/03-error-handler.json`** y asignale la credencial SMTP.
2. En n8n: **Settings → Error Workflow** → seleccioná `03 - Error handler`.
3. Cuando cualquier workflow falla, el Error Trigger manda email al `ADMIN_EMAIL`.

En el workflow 02, si falla la publicación podés derivar a un nodo que haga `PATCH` a Strapi con `estado: error` + `detalle_error` (para no dejar pendientes fantasma).

**Verificación**: desconectás una API key → recibís el email y el registro en Strapi queda marcado como `error`.

---

## Flujo de variables (`.env`)

| Variable | Para qué |
|---|---|
| `N8N_WEBHOOK_URL` | URL pública que recibe los webhooks (crítico) |
| `N8N_DOMAIN`, `N8N_EMAIL` | Caddy/HTTPS |
| `N8N_ENCRYPTION_KEY`, `POSTGRES_*` | Cifrado interno + DB |
| `STRAPI_PUBLIC_URL`, `STRAPI_API_TOKEN` | Llamadas a la API de Strapi |
| `FRONTEND_URL` | Enlace a la noticia (hoy `https://afautal.vercel.app`, futuro `https://afautal.cl`) |
| `STAPI_WEBHOOK_SECRET` | Valida el webhook de Strapi (`X-AFAUTAL-Token`) |
| `AI_PROVIDER/MODEL/KEY/MAX_TOKENS` | Generación de versiones |
| `SOCIAL_ENABLED_*` + credenciales por red | Toggle de publicación |
| `SMTP_*`, `ADMIN_EMAIL` | Avisos de aprobación y errores |
| `APPROVAL_POLL_MINUTES` | Frecuencia del polling de aprobación |

Cuando cambie el dominio del frontend (Vercel → `afautal.cl`) solo hay que actualizar `FRONTEND_URL` del `.env` y `docker compose up -d`.

## Backup (postgres de n8n)

```bash
docker compose exec postgres pg_dump -U n8n n8n > dump-$(date +%F).sql
```

## Notas
- Los secrets de redes (Facebook/IG/LinkedIn/X) salen del `.env` para simplicidad; si querés más seguridad, movelos a **Credentials de n8n** (nodo por nodo) y borrá las vars del `.env`.
- `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` está seteado para que los workflows lean `$env.*`. No lo quites sin adaptar los workflows.