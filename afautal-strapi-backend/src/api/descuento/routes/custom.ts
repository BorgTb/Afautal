export default {
  routes: [
    {
      method: 'POST',
      path: '/descuentos/importar',
      handler: 'descuento.importar',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/descuentos/mios',
      handler: 'descuento.mios',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/descuentos/periodos',
      handler: 'descuento.periodos',
      config: {
        auth: false,
      },
    },
  ],
};