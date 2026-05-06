import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::solicitud-optica.solicitud-optica', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const payload = ctx.request.body.data || {};

    const entry = await strapi.db.query('api::solicitud-optica.solicitud-optica').create({
      data: {
        ...payload,
        usuario: user.id,
        estado: payload.estado || 'pendiente',
        fecha_solicitud: new Date()
      },
      populate: ['usuario', 'carga_familiar']
    });

    // Enviar correo electrónico
    try {
      const config = await strapi.db.query('api::configuracion-optica.configuracion-optica').findOne();
      const emailTo = config?.email_notificaciones;

      if (emailTo) {
        let beneficiario = user.nombre_completo || user.email;
        if (entry.carga_familiar) {
          beneficiario += ` (Para carga: ${entry.carga_familiar.nombre_completo} - ${entry.carga_familiar.parentesco})`;
        }

        await strapi.plugin('email').service('email').send({
          to: emailTo,
          subject: `AFAUTAL - Nueva Solicitud de Hora Óptica`,
          text: [
            `Se ha recibido una nueva solicitud de hora óptica.`,
            ``,
            `Solicitante: ${user.nombre_completo || 'No registrado'}`,
            `RUT: ${user.rut || 'No registrado'}`,
            `Correo: ${user.email}`,
            `Beneficiario: ${beneficiario}`,
            `Mensaje/Preferencia:`,
            `${payload.mensaje}`
          ].join('\n'),
        });
      }
    } catch (error) {
      strapi.log.error('No fue posible enviar el correo de solicitud de óptica.');
      strapi.log.error(error);
    }

    return { data: entry };
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const entries = await strapi.db.query('api::solicitud-optica.solicitud-optica').findMany({
      where: {
        usuario: user.id,
        estado: { $ne: 'cancelada' }
      },
      orderBy: { fecha_solicitud: 'desc' },
      populate: ['usuario', 'carga_familiar']
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

    const existingEntry = await strapi.db.query('api::solicitud-optica.solicitud-optica').findOne({
      where: { id: numericId, usuario: user.id }
    });

    if (!existingEntry) {
      return ctx.unauthorized('No tienes permiso para modificar esta solicitud o no existe');
    }

    const updatedEntry = await strapi.db.query('api::solicitud-optica.solicitud-optica').update({
      where: { id: numericId },
      data: payload,
      populate: ['usuario', 'carga_familiar']
    });

    return { data: updatedEntry };
  }
}));
