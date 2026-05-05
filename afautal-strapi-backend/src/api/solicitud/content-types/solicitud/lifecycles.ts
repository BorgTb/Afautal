export default {
  async afterUpdate(event) {
    const { result, params } = event;
    console.log('Lifecycles afterUpdate triggered');
    console.log('Result state:', result?.estado);
    console.log('Result ID:', result?.id);

    if (result && result.estado === 'aprobado') {
      try {
        console.log('Attempting to approve solicitud...');
        await strapi.service('api::solicitud.solicitud').approveSolicitud(result.id);
        console.log('approveSolicitud called successfully');
      } catch (error) {
        console.error('Error al procesar la aprobación de la solicitud:');
        console.error(error);
      }
    }
  },
};

