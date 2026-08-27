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

    // Enviar notificación por correo al email configurado del servicio
    try {
      const servicioId = entry.servicio?.id || entry.servicio?.data?.id;
      if (servicioId) {
        await enviarNotificacionServicio(servicioId, entry.datos_formulario || {}, user.id);
      }
    } catch (emailError) {
      strapi.log.error('Error en notificación de servicio:', emailError);
    }

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

async function enviarNotificacionServicio(
  servicioId: number,
  datosFormulario: Record<string, any>,
  userId: number
) {
  try {
    const serv = await strapi.db.query('api::servicio.servicio').findOne({
      where: { id: servicioId },
      populate: ['email_notificaciones', 'campos_formulario']
    });

    if (!serv?.attributes?.email_notificaciones) return;

    const emailNotif = serv.attributes.email_notificaciones;
    const servicioNombre = serv.attributes.nombre;

    // Formatear datos del formulario de forma amigable
    const datosFormateados = Object.entries(datosFormulario)
      .map(([key, val]) => {
        const campo = serv.attributes.campos_formulario?.find(
          (c: any) => c.nombre_variable === key
        );
        const etiqueta = campo?.etiqueta || key.replace(/_/g, ' ');
        const valor = Array.isArray(val) ? val.join(', ') : (val ?? '-');
        return `- ${etiqueta}: ${valor}`;
      })
      .join('\n');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const emailBody = [
      'Ha recibido una nueva solicitud de servicio.',
      '',
      `Servicio: ${servicioNombre}`,
      `Fecha: ${new Date().toLocaleDateString()}`,
      '',
      'Detalles del formulario:',
      datosFormateados,
      '',
      'Mensaje adicional:',
      datosFormulario.mensaje || 'Ninguno',
      '',
      'Solicitud enviada desde: ' + frontendUrl,
    ].join('\n');

    await strapi.plugin('email').service('email').send({
      to: emailNotif,
      from: 'noreply@afautal.cl',
      subject: `Nueva solicitud de servicio: ${servicioNombre}`,
      text: emailBody,
    });
  } catch (error) {
    strapi.log.error('Error enviando notificación de servicio:', error);
  }
}
