// config/middlewares.ts
// No necesitas importar Core, usa la exportación directa
export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
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
            'https://afautal.vercel.app',
            'http://localhost:3000',
          ],
          'frame-ancestors': [
            "'self'",
            'https://excellent-nurture-beee0f6ec0.strapiapp.com'
          ],
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