import { factories } from '@strapi/strapi';

interface ChangePasswordPayload {
  newPassword?: string;
}

const getBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

const resolveAuthUserId = async (ctx: any, strapi: any): Promise<number | null> => {
  if (ctx.state?.user?.id) {
    return ctx.state.user.id as number;
  }

  const token = getBearerToken(ctx.request?.header?.authorization);

  if (!token) {
    return null;
  }

  try {
    const jwtService = strapi.plugin('users-permissions').service('jwt');
    const payload = await jwtService.verify(token);
    const userId = Number(payload?.id);

    return Number.isFinite(userId) ? userId : null;
  } catch {
    return null;
  }
};

export default factories.createCoreController('api::solicitud.solicitud', ({ strapi }) => ({
  async registroOptions(ctx) {
    const solicitudContentType = strapi.contentType('api::solicitud.solicitud') as any;

    const tipoContratoOptions = Array.isArray(
      solicitudContentType?.attributes?.tipo_contrato?.enum
    )
      ? (solicitudContentType.attributes.tipo_contrato.enum as string[])
      : [];

    const jerarquiaOptions = Array.isArray(solicitudContentType?.attributes?.jerarquia?.enum)
      ? (solicitudContentType.attributes.jerarquia.enum as string[])
      : [];

    ctx.send({
      data: {
        tipo_contrato: tipoContratoOptions,
        jerarquia: jerarquiaOptions,
      },
    });
  },

  async me(ctx) {
    const authUserId = await resolveAuthUserId(ctx, strapi);

    if (!authUserId) {
      return ctx.unauthorized('No autenticado.');
    }

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: authUserId },
      select: ['id', 'username', 'email', 'rut', 'nombre_completo', 'unidad_academica', 'password_temporal'],
    });

    if (!user) {
      return ctx.notFound('Usuario no encontrado.');
    }

    ctx.send({ data: user });
  },

  async changePasswordFirstLogin(ctx) {
    const authUserId = await resolveAuthUserId(ctx, strapi);
    const payload = (ctx.request.body ?? {}) as ChangePasswordPayload;
    const newPassword = payload.newPassword || '';

    if (!authUserId) {
      return ctx.unauthorized('No autenticado.');
    }

    if (!newPassword) {
      return ctx.badRequest('newPassword es obligatorio.');
    }

    if (newPassword.length < 6) {
      return ctx.badRequest('La nueva contraseña debe tener al menos 6 caracteres.');
    }

    const userFromDb = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: authUserId },
      select: ['id', 'password_temporal'],
    });

    if (!userFromDb) {
      return ctx.notFound('Usuario no encontrado.');
    }

    if (!userFromDb.password_temporal) {
      return ctx.badRequest('El usuario no requiere cambio inicial de contraseña.');
    }

    const userService = strapi.plugin('users-permissions').service('user');

    await userService.edit(authUserId, {
      password: newPassword,
      password_temporal: false,
    });

    ctx.send({
      ok: true,
      message: 'Contraseña actualizada correctamente.',
    });
  },
}));
