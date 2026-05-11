import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  preview: {
    enabled: true,
    config: {
      handler(uid: string, { documentId }: { documentId: string }) {
        if (uid === 'api::noticia.noticia') {
          // Obtenemos la URL y limpiamos cualquier barra final que pueda traer
          let baseUrl = env('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, "");
          
          const secret = env('PREVIEW_SECRET', 'tu-secreto-super-seguro');
          
          // Retornamos la URL limpia
          return `${baseUrl}/api/preview?secret=${secret}&documentId=${documentId}`;
        }
        return null;
      },
    },
  },
});

export default config;
