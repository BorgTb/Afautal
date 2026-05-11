import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [
      'es',
    ],
    translations: {
      es: {
        'Auth.form.welcome.subtitle': 'Inicia sesión en tu cuenta',
        'Auth.form.welcome.title': 'Bienvenido a AFAUTAL',
      },
    },
  },
  bootstrap(app: StrapiApp) {
    // Puedes personalizar la interfaz aquí si lo deseas en el futuro
  },
};
