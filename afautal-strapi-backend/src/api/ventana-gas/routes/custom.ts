export default {
  routes: [
    {
      method: 'POST',
      path: '/ventanas-gas/iniciar',
      handler: 'ventana-gas.iniciarVentana',
      config: {
        auth: false // Temporal para debug o restringir después por admin
      }
    },
    {
      method: 'GET',
      path: '/ventanas-gas/activa',
      handler: 'ventana-gas.getVentanaActiva',
      config: {
        auth: false
      }
    }
  ]
}
