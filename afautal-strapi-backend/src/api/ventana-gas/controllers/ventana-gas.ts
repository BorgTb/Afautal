/**
 * ventana-gas controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::ventana-gas.ventana-gas', ({ strapi }) => ({
  async getVentanaActiva(ctx) {
    try {
      const ventanas = await strapi.documents('api::ventana-gas.ventana-gas').findMany({
        filters: { estado: 'activa' },
        limit: 1,
      });

      if (ventanas && ventanas.length > 0) {
        return ctx.send({ data: ventanas[0] });
      }

      return ctx.send({ data: null });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async iniciarVentana(ctx) {
    try {
      // 1. Cerrar ventana actual
      const ventanasActivas = await strapi.documents('api::ventana-gas.ventana-gas').findMany({
        filters: { estado: 'activa' },
      });

      for (const ventana of ventanasActivas) {
        await strapi.documents('api::ventana-gas.ventana-gas').update({
          documentId: ventana.documentId,
          data: {
            estado: 'cerrada',
            fecha_fin: new Date().toISOString(),
          },
        });
      }

      // 2. Publicar precios de gas
      // Primero encontramos los documentos
      const precios = await strapi.documents('api::precio-gas.precio-gas').findMany({
        status: 'draft', // Buscar en borradores
      });

      for (const precio of precios) {
        // En Strapi 5, para publicar simplemente llamamos a publish con el documentId
        await strapi.documents('api::precio-gas.precio-gas').publish({
          documentId: precio.documentId,
        });
      }

      // 3. Crear nueva ventana activa
      const ahora = new Date();
      const mes = ahora.toLocaleString('es-ES', { month: 'long' });
      const año = ahora.getFullYear();
      const nombreVentana = `Venta ${mes} ${año}`;

      const nuevaVentana = await strapi.documents('api::ventana-gas.ventana-gas').create({
        data: {
          nombre: nombreVentana,
          estado: 'activa',
          fecha_inicio: ahora.toISOString(),
        },
      });

      // 4. Enviar correos a usuarios
      try {
        const usuarios = await strapi.db.query('plugin::users-permissions.user').findMany({
          where: { confirmed: true },
          select: ['email', 'username'],
        });

        strapi.log.info(`Iniciando envío de correos a ${usuarios.length} usuarios...`);

        for (const user of usuarios) {
          try {
            await strapi.plugin('email').service('email').send({
              to: user.email,
              from: 'noreply@afautal.cl',
              subject: 'Nueva ventana de venta de vales de gas abierta',
              text: `Hola ${user.username},\n\nSe ha abierto una nueva ventana para solicitar vales de gas. Ingresa a la plataforma para ver los nuevos precios.\n\nSaludos,\nEquipo AFAUTAL`,
            });
          } catch (e) {
            strapi.log.error(`Error enviando correo a ${user.email}:`, e);
          }
        }
        strapi.log.info('Proceso de envío de correos finalizado.');
      } catch (emailError) {
        strapi.log.error('Error general en el proceso de correos:', emailError);
      }

      return ctx.send({
        message: 'Ventana iniciada correctamente y correos en proceso de envío',
        data: nuevaVentana,
      });

    } catch (err) {
      strapi.log.error('Error al iniciar ventana:', err);
      ctx.throw(500, 'Hubo un error al iniciar la ventana de gas');
    }
  }
}));
