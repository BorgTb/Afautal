import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::solicitud-servicio.solicitud-servicio', ({ strapi }) => ({
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const { id } = ctx.params;
    const numericId = Number(id);
    const payload = ctx.request.body.data || {};

    const existingEntry = await strapi.db.query('api::solicitud-servicio.solicitud-servicio').findOne({
      where: { id: numericId, usuario: user.id }
    });

    if (!existingEntry) {
      return ctx.notFound('Solicitud no encontrada o no tienes permiso para modificarla');
    }

    const updatedEntry = await strapi.db.query('api::solicitud-servicio.solicitud-servicio').update({
      where: { id: numericId },
      data: payload,
      populate: ['usuario', 'carga_familiar', 'servicio']
    });

    return { data: updatedEntry };
  }
}));
