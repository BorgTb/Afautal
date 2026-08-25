/**
 * solicitud service
 */

import { factories } from '@strapi/strapi';
import crypto from 'node:crypto';

export default factories.createCoreService('api::solicitud.solicitud', ({ strapi }) => ({
  async approveSolicitud(solicitudId: number) {
    const solicitud = await strapi.db.query('api::solicitud.solicitud').findOne({
      where: { id: solicitudId },
      populate: { usuario: true, ciudad: true, comuna: true, jerarquia: true },
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

    if (solicitud.es_nuevo_externo) {
      if (process.env.DEV_MODE === 'true') {
        console.log('[DEV_MODE] Saltando escritura a Telegestor (registrar_funcionario)');
      } else {
        try {
          console.log('Solicitud is marked as new for external DB, registering in telegestor...');
          const { rutSinDv, dv } = this.splitRut(solicitud.rut);
          
          let jerarquiaNombre = solicitud.jerarquia ? solicitud.jerarquia.nombre : "";
          let ciudadNombre = solicitud.ciudad ? solicitud.ciudad.nombre : "";
          let comunaNombre = solicitud.comuna ? solicitud.comuna.nombre : "";
          let ciudadCodigo = /^\d+$/.test(solicitud.ciudad?.codigo ?? "") ? solicitud.ciudad.codigo : "";
          let comunaCodigo = /^\d+$/.test(solicitud.comuna?.codigo ?? "") ? solicitud.comuna.codigo : "";

          console.log('Resolved external fields | jerarquia:', jerarquiaNombre, '| ciudad:', ciudadNombre, ciudadCodigo, '| comuna:', comunaNombre, comunaCodigo);

          const externalPayload = new URLSearchParams({
            tipo: "registrar_funcionario",
            rut: rutSinDv,
            dv: dv,
            nombre: solicitud.nombre_completo,
            correo: solicitud.correo_electronico,
            telefono: (solicitud.telefono ?? "").replace(/\D/g, "").slice(-8),
            unidad_academica: solicitud.unidad_academica || "",
            fecha_nacimiento: solicitud.fecha_nacimiento || "",
            jerarquia: jerarquiaNombre,
            ciudad: ciudadNombre,
            comuna: comunaNombre,
            ciudad_id: ciudadCodigo,
            comuna_id: comunaCodigo,
            direccion: solicitud.direccion_particular || "",
          });
          
          console.log("PAYLOAD ENVIADO A TELEGESTOR: ", Object.fromEntries(externalPayload.entries()));

          const externalResponse = await fetch("https://telegestor.cl/afautal-data/index.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: externalPayload,
          });

          const externalBody = await externalResponse.text();
          console.log(`External API response | status: ${externalResponse.status} | body: ${externalBody}`);

          if (!externalResponse.ok) {
            console.error(`Failed to register in external API: ${externalResponse.status} - ${externalBody}`);
          } else {
            console.log(`Successfully registered in external API: ${externalBody}`);
          }
        } catch (error) {
          console.error('Error while trying to register in external API:', error);
        }
      }
    }

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
      strapi.log.error(`Contraseña temporal del usuario (para recuperación manual): ${temporaryPassword}`);
      strapi.log.error(`SMTP config | host=${process.env.SMTP_HOST} | user=${process.env.SMTP_USERNAME ? 'definido' : 'NO DEFINIDO'} | pass=${process.env.SMTP_PASSWORD ? 'definido' : 'NO DEFINIDO'}`);
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

  splitRut(rut: string): { rutSinDv: string; dv: string } {
    const normalized = rut.replace(/[^0-9kK]/g, "");
    return {
      rutSinDv: normalized.slice(0, -1),
      dv: normalized.slice(-1).toLowerCase(),
    };
  },
}));
