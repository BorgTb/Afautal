export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/solicitud-registro',
      handler: 'api::solicitud.solicitud.registerFromSolicitud',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/auth/registro-options',
      handler: 'api::auth.auth.registroOptions',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/auth/me',
      handler: 'api::auth.auth.me',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/change-password-first-login',
      handler: 'api::auth.auth.changePasswordFirstLogin',
      config: {
        auth: false,
      },
    },
  ],
};
