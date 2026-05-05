/**
 * solicitud service
 */

import { factories } from '@strapi/strapi';
import crypto from 'node:crypto';

export default factories.createCoreService('api::solicitud.solicitud', ({ strapi }) => ({
  async approveSolicitud(solicitudId: number) {
    const solicitud = await strapi.db.query('api::solicitud.solicitud').findOne({
      where: { id: solicitudId },
      populate: { usuario: true },
    });

    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    if (solicitud.estado !== 'aprobado') {
      console.log('Solicitud state is not approved:', solicitud.estado);
      return; // Solo procesar si está aprobada
    }

    if (solicitud.usuario) {
      console.log('Solicitud already has a user linked');
      return; // Ya tiene un usuario vinculado
    }

    console.log('Proceeding to create/update user for email:', solicitud.correo_electronico);
    const temporaryPassword = this.buildTemporaryPassword();
    const authenticatedRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!authenticatedRole) {
      throw new Error('No se encontro el rol authenticated en users-permissions.');
    }

    const userService = strapi.plugin('users-permissions').service('user');

    // Buscar si ya existe un usuario con ese correo o RUT (por si acaso)
    const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: {
        $or: [
          { email: solicitud.correo_electronico },
          { rut: solicitud.rut }
        ]
      }
    });

    let userId: number;

    if (existingUser) {
      await userService.edit(existingUser.id, {
        password: temporaryPassword,
        confirmed: true,
        blocked: false,
        role: authenticatedRole.id,
        rut: solicitud.rut,
        nombre_completo: solicitud.nombre_completo,
        unidad_academica: solicitud.unidad_academica,
        password_temporal: true,
        solicitud: solicitud.id,
      });
      userId = existingUser.id;
    } else {
      const user = await userService.add({
        username: this.buildUsernameFromEmail(solicitud.correo_electronico),
        email: solicitud.correo_electronico,
        provider: 'local',
        password: temporaryPassword,
        confirmed: true,
        blocked: false,
        role: authenticatedRole.id,
        rut: solicitud.rut,
        nombre_completo: solicitud.nombre_completo,
        unidad_academica: solicitud.unidad_academica,
        password_temporal: true,
        solicitud: solicitud.id,
      });
      userId = user.id;
    }

    // Vincular solicitud con usuario
    await strapi.db.query('api::solicitud.solicitud').update({
      where: { id: solicitud.id },
      data: { usuario: userId },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      await strapi.plugin('email').service('email').send({
        to: solicitud.correo_electronico,
        subject: 'AFAUTAL - Solicitud de registro aprobada',
        text: [
          `Hola ${solicitud.nombre_completo},`,
          'Tu solicitud de registro en AFAUTAL ha sido aprobada.',
          'Aquí tienes tus credenciales de acceso inicial:',
          `Correo: ${solicitud.correo_electronico}`,
          `Contraseña temporal: ${temporaryPassword}`,
          `Inicia sesión en: ${frontendUrl}/auth/inicio-sesion`,
          'Al ingresar por primera vez deberás cambiar tu contraseña obligatoriamente.',
        ].join('\n'),
      });
    } catch (error) {
      strapi.log.error('No fue posible enviar el correo de aprobación.');
      strapi.log.error(error);
    }

    return { userId };
  },

  buildTemporaryPassword(): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const all = `${uppercase}${lowercase}${digits}`;

    const pick = (pool: string): string => {
      const index = crypto.randomInt(0, pool.length);
      return pool[index];
    };

    const chars = [pick(uppercase), pick(lowercase), pick(digits)];

    for (let i = 0; i < 9; i += 1) {
      chars.push(pick(all));
    }

    for (let i = chars.length - 1; i > 0; i -= 1) {
      const j = crypto.randomInt(0, i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
  },

  buildUsernameFromEmail(email: string): string {
    const prefix = email.split('@')[0]?.replace(/[^a-zA-Z0-9._-]/g, '') || 'usuario';
    return `${prefix}-${Date.now()}`;
  },
}));
