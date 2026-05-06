import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::carga-familiar.carga-familiar', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const payload = ctx.request.body.data || {};

    const entry = await strapi.db.query('api::carga-familiar.carga-familiar').create({
      data: {
        ...payload,
        socio: user.id
      }
    });

    return { data: entry };
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const entries = await strapi.db.query('api::carga-familiar.carga-familiar').findMany({
      where: {
        socio: user.id
      },
      orderBy: { createdAt: 'desc' }
    });

    return { data: entries };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const { id } = ctx.params;
    const numericId = Number(id);

    const existingEntry = await strapi.db.query('api::carga-familiar.carga-familiar').findOne({
      where: { id: numericId, socio: user.id }
    });

    if (!existingEntry) {
      return ctx.unauthorized('No tienes permiso o no existe la carga');
    }

    const deletedEntry = await strapi.db.query('api::carga-familiar.carga-familiar').delete({
      where: { id: numericId }
    });

    return { data: deletedEntry };
  }
}));
