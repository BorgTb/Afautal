import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::solicitud-gas.solicitud-gas', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const payload = ctx.request.body.data || {};

    // Crear la entrada directamente en la base de datos saltando la validación REST
    const entry = await strapi.db.query('api::solicitud-gas.solicitud-gas').create({
      data: {
        ...payload,
        usuario: user.id,
        estado: payload.estado || 'pendiente'
      },
      populate: ['usuario', 'comprobante']
    });

    return { data: entry };
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const entries = await strapi.db.query('api::solicitud-gas.solicitud-gas').findMany({
      where: {
        usuario: user.id,
        estado: { $ne: 'cancelado' }
      },
      orderBy: { fecha_solicitud: 'desc' },
      populate: ['usuario', 'comprobante']
    });

    return { data: entries };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const { id } = ctx.params;
    const numericId = Number(id);
    const payload = ctx.request.body.data || {};

    // Verificar que la solicitud pertenezca al usuario
    const existingEntry = await strapi.db.query('api::solicitud-gas.solicitud-gas').findOne({
      where: { id: numericId, usuario: user.id }
    });

    if (!existingEntry) {
      return ctx.unauthorized('No tienes permiso para modificar esta solicitud o no existe');
    }

    // Actualizar saltando la validación REST estricta
    const updatedEntry = await strapi.db.query('api::solicitud-gas.solicitud-gas').update({
      where: { id: numericId },
      data: payload,
      populate: ['usuario', 'comprobante']
    });

    return { data: updatedEntry };
  }
}));
