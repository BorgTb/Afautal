import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http:', 'https://analytics.strapi.io'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'https://excellent-nurture-beee0f6ec0.strapiapp.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'https://excellent-nurture-beee0f6ec0.strapiapp.com'],
          'frame-src': ["'self'", 'http://localhost:3000', 'https://api.tudominio.com', 'https://www.tudominio.com', process.env.FRONTEND_URL || 'http://localhost:3000'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
