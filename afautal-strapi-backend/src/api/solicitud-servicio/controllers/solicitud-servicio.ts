import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::solicitud-servicio.solicitud-servicio', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const payload = ctx.request.body.data || {};

    const entry = await strapi.db.query('api::solicitud-servicio.solicitud-servicio').create({
      data: {
        ...payload,
        usuario: user.id,
        estado: payload.estado || 'pendiente'
      },
      populate: ['usuario', 'carga_familiar', 'servicio']
    });

    return { data: entry };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const { id } = ctx.params;
    const numericId = Number(id);
    const payload = ctx.request.body.data || {};

    const existingEntry = await strapi.db.query('api::solicitud-servicio.solicitud-servicio').findOne({
      where: { id: numericId },
      populate: ['usuario']
    });

    if (!existingEntry) {
      return ctx.notFound('Solicitud no encontrada');
    }

    const entryUserId = existingEntry.usuario?.id ?? existingEntry.usuario;
    if (entryUserId && entryUserId !== user.id) {
      return ctx.notFound('Solicitud no encontrada o no tienes permiso para modificarla');
    }

    const updatedEntry = await strapi.db.query('api::solicitud-servicio.solicitud-servicio').update({
      where: { id: numericId },
      data: {
        ...payload,
        usuario: entryUserId ? undefined : user.id,
      },
      populate: ['usuario', 'carga_familiar', 'servicio']
    });

    return { data: updatedEntry };
  }
}));
