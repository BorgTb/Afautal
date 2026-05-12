// middlewares.ts - CORRECCIÓN
const config: Core.Config.Middlewares = [
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
            // Eliminar www o usar solo el dominio principal
            process.env.FRONTEND_URL
          ].filter(Boolean),
          // También necesitas agregar frame-ancestors si Strapi carga tu app en iframe
          'frame-ancestors': [
            "'self'",
            'https://excellent-nurture-beee0f6ec0.strapiapp.com' // URL de tu Strapi Cloud
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