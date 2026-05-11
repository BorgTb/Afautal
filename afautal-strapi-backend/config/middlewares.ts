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
          // Agregamos explícitamente Vercel para que la API permita la conexión
          'connect-src': ["'self'", 'https:', 'http:', 'https://afautal.vercel.app', 'https://analytics.strapi.io'],
          'img-src': [
            "'self'", 
            'data:', 
            'blob:', 
            'res.cloudinary.com', 
            'https://excellent-nurture-beee0f6ec0.strapiapp.com',
            'https://afautal.vercel.app'
          ],
          'media-src': [
            "'self'", 
            'data:', 
            'blob:', 
            'res.cloudinary.com', 
            'https://excellent-nurture-beee0f6ec0.strapiapp.com'
          ],
          'frame-src': [
            "'self'", 
            'http://localhost:3000', 
            'https://afautal.vercel.app', 
            'https://www.afautal.vercel.app',
            process.env.FRONTEND_URL
          ].filter(Boolean),
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