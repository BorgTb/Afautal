import { factories } from '@strapi/strapi';
import { normalizeRut, isValidRut } from '../../../utils/rut';

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

const toRelationLabel = (value: any): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.nombre || value.title || value.name || value.documentId || undefined;
};

const resolveDocId = async (strapi: any, uid: string, docId: string): Promise<number | null> => {
  if (!docId) return null;
  const record = await strapi.db.query(uid).findOne({
    where: { documentId: docId },
    select: ['id'],
  });
  return record?.id ?? null;
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
      // Eliminamos el 'select' restrictivo y agregamos 'populate'
      // para que incluya toda la info de la solicitud en la respuesta
      populate: {
        solicitud: {
          populate: ['region', 'comuna', 'ciudad', 'tipo_contrato', 'categoria', 'jerarquia', 'banco', 'tipo_cuenta']
        },
        role: true,
      },
    });

    if (!user) {
      return ctx.notFound('Usuario no encontrado.');
    }

    const registroIncompleto = Boolean(
      user.password_temporal &&
      (!user.solicitud || !user.solicitud.fecha_nacimiento)
    );

    if (user?.solicitud) {
      user.solicitud = {
        ...user.solicitud,
        tipo_contrato: toRelationLabel(user.solicitud.tipo_contrato),
        categoria: toRelationLabel(user.solicitud.categoria),
        jerarquia: toRelationLabel(user.solicitud.jerarquia),
        banco: toRelationLabel(user.solicitud.banco),
        tipo_cuenta: toRelationLabel(user.solicitud.tipo_cuenta),
      };
    }

    ctx.send({ data: { ...user, registro_incompleto: registroIncompleto } });
  },

  async loginRut(ctx) {
    const { rut, password } = ctx.request.body ?? {};

    if (!rut) {
      return ctx.badRequest('RUT es obligatorio.');
    }

    if (!password) {
      return ctx.badRequest('Contraseña es obligatoria.');
    }

    const normalizedRut = normalizeRut(rut);
    if (!isValidRut(normalizedRut)) {
      return ctx.badRequest('Debes ingresar tu RUT con su dígito verificador (ej: 12.345.678-9).');
    }

    const rutSinDV = normalizedRut.slice(0, -1);
    const last4 = rutSinDV.slice(-4);

    console.error('=== loginRut DEBUG ===');
    console.error('normalizedRut:', normalizedRut);
    console.error('rutSinDV (sent to API):', rutSinDV);
    console.error('last4:', last4);

    const userService = strapi.plugin('users-permissions').service('user');
    const jwtService = strapi.plugin('users-permissions').service('jwt');

    const fetchExternal = async () => {
      try {
        const url = `https://telegestor.cl/afautal-data/index.php?tipo=obtener_cliente&cli_rut=${rutSinDV}`;
        console.error('[loginRut] Fetching external data from:', url);
        const extRes = await fetch(url);
        console.error('[loginRut] External API status:', extRes.status);
        if (!extRes.ok) {
          console.error('[loginRut] External API not OK:', extRes.status, extRes.statusText);
          return null;
        }
        const text = await extRes.text();
        console.error('[loginRut] External API raw text:', text);
        let json;
        try { json = JSON.parse(text); } catch { return null; }
        console.error('[loginRut] External API parsed JSON:', JSON.stringify(json));
        const result = Array.isArray(json) && json.length > 0 ? json[0] : null;
        console.error('[loginRut] External API selected item:', JSON.stringify(result));
        return result;
      } catch (e) {
        console.error('[loginRut] External API fetch error:', e);
        return null;
      }
    };

    const parseExternal = (data: any) => {
      const parsed = {
        nombre: (data.cli_nombre || '').trim(),
        email: (data.cli_emp_mail || '').trim(),
        direccion: (data.cli_emp_direccion || '').trim(),
        unidad: (data.cli_emp_descrip_giro || '').trim(),
        telefono: (data.cli_emp_fono_contacto || data.cli_emp_fono || '').trim(),
        ciud_nombre: (data.ciud_nombre || '').trim(),
      };
      console.error('[loginRut] Parsed external data:', JSON.stringify(parsed));
      return parsed;
    };

    const buildSolicitudData = (externalData: any) => ({
      rut: normalizedRut,
      nombre_completo: externalData.nombre,
      correo_electronico: externalData.email || `${rutSinDV}@afautal-externo.cl`,
      direccion_particular: externalData.direccion || 'No especificada',
      unidad_academica: externalData.unidad,
      telefono: externalData.telefono,
      estado: 'aprobado' as const,
      es_nuevo_externo: false,
    });

    // 1. Verificar si el usuario ya existe en Strapi por RUT
    const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: {
        $or: [{ rut: normalizedRut }, { rut: normalizedRut.toLowerCase() }],
      },
      populate: { solicitud: true },
    });

    if (existingUser) {
      // Validar contraseña contra el hash almacenado
      const validPassword = await userService.validatePassword(password, existingUser.password);
      if (!validPassword) {
        return ctx.badRequest('Contraseña incorrecta.');
      }

      // Determinar estado de registro y refrescar datos desde API externa
      let registroIncompleto = false;

      const externalRaw = await fetchExternal();
      const externalData = externalRaw ? parseExternal(externalRaw) : null;

      console.error('[loginRut] Existing user solicitud:', JSON.stringify(existingUser.solicitud));
      console.error('[loginRut] externalData:', JSON.stringify(externalData));
      console.error('[loginRut] externalData?.nombre:', externalData?.nombre);

      if (!existingUser.solicitud) {
        console.error('[loginRut] User has NO solicitud — will be created in completar-registro');
        registroIncompleto = true;
      } else if (!existingUser.solicitud.fecha_nacimiento) {
        registroIncompleto = true;
        console.error('[loginRut] Solicitud exists but incomplete (no fecha_nacimiento), refreshing from API');
        if (externalData && externalData.nombre) {
          const updated = await strapi.db.query('api::solicitud.solicitud').update({
            where: { id: existingUser.solicitud.id },
            data: {
              nombre_completo: externalData.nombre,
              correo_electronico: externalData.email || `${rutSinDV}@afautal-externo.cl`,
              direccion_particular: externalData.direccion || 'No especificada',
              unidad_academica: externalData.unidad,
              telefono: externalData.telefono,
            },
          });
          console.error('[loginRut] Solicitud updated:', JSON.stringify(updated));
        } else {
          console.error('[loginRut] Cannot refresh solicitud: no external data');
        }
      } else {
        console.error('[loginRut] Solicitud complete (has fecha_nacimiento):', existingUser.solicitud.fecha_nacimiento);
      }

      // Emitir JWT
      const jwt = await jwtService.issue({ id: existingUser.id });

      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: existingUser.id },
        populate: {
          solicitud: {
            populate: ['region', 'comuna', 'ciudad', 'banco', 'tipo_cuenta'],
          },
          role: true,
        },
      });

      ctx.send({
        jwt,
        user: {
          ...user,
          telefono: externalData?.telefono || '',
          direccion_particular: externalData?.direccion || '',
          ciud_nombre: externalData?.ciud_nombre || '',
          registro_incompleto: registroIncompleto,
        },
      });
      return;
    }

    // 2. Usuario nuevo — validar que la contraseña sean los últimos 4 dígitos
    if (password !== last4) {
      return ctx.badRequest('Tu contraseña inicial son los últimos 4 dígitos de tu RUT.');
    }

    // 3. Obtener datos desde API externa
    console.error('[loginRut] New user flow - fetching external data');
    const externalRaw = await fetchExternal();
    const externalData = externalRaw ? parseExternal(externalRaw) : null;
    console.error('[loginRut] New user flow - externalData:', JSON.stringify(externalData));

    if (!externalData || !externalData.nombre) {
      console.error('[loginRut] External data missing or nombre empty');
      return ctx.badRequest('RUT no encontrado en la base externa.');
    }

    // 4. Obtener rol authenticated
    const authenticatedRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!authenticatedRole) {
      return ctx.badRequest('Error de configuración: rol no encontrado.');
    }

    // 5. Crear usuario (sin solicitud, se crea en completar-registro)
    const username = `rut-${rutSinDV}`;

    const newUser = await userService.add({
      username,
      email: externalData.email || `${rutSinDV}@afautal-externo.cl`,
      provider: 'local',
      password: last4,
      confirmed: true,
      blocked: false,
      role: authenticatedRole.id,
      rut: normalizedRut,
      nombre_completo: externalData.nombre,
      unidad_academica: externalData.unidad,
      password_temporal: true,
    });

    // 6. Emitir JWT
    const jwt = await jwtService.issue({ id: newUser.id });

    // 7. Retornar usuario + JWT + flag registro_incompleto + datos externos
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: newUser.id },
      populate: {
        solicitud: true,
        role: true,
      },
    });

    ctx.send({
      jwt,
      user: {
        ...user,
        telefono: externalData.telefono,
        direccion_particular: externalData.direccion,
        ciud_nombre: externalData.ciud_nombre,
        registro_incompleto: true,
      },
    });
  },

  async completeExternalRegistration(ctx) {
    const authUserId = await resolveAuthUserId(ctx, strapi);
    if (!authUserId) {
      return ctx.unauthorized('No autenticado.');
    }

    const body = ctx.request.body ?? {};
    const {
      telefono, fecha_nacimiento, tipo_contrato, categoria, jerarquia,
      region, comuna, ciudad, direccion_particular, banco, tipo_cuenta,
      correo_electronico, unidad_academica,
    } = body;

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: authUserId },
      populate: { solicitud: true },
    });

    if (!user) {
      return ctx.badRequest('Usuario no encontrado.');
    }

    // Resolver documentIds a numeric ids para las relaciones
    const [tipoContratoId, categoriaId, jerarquiaId, regionId, comunaId, ciudadId, bancoId, tipoCuentaId] =
      await Promise.all([
        resolveDocId(strapi, 'api::tipo-contrato.tipo-contrato', tipo_contrato),
        resolveDocId(strapi, 'api::categoria.categoria', categoria),
        resolveDocId(strapi, 'api::jerarquia.jerarquia', jerarquia),
        resolveDocId(strapi, 'api::region.region', region),
        resolveDocId(strapi, 'api::comuna.comuna', comuna),
        resolveDocId(strapi, 'api::ciudad.ciudad', ciudad),
        resolveDocId(strapi, 'api::banco.banco', banco),
        resolveDocId(strapi, 'api::tipo-cuenta.tipo-cuenta', tipo_cuenta),
      ]);

    const solicitudData: Record<string, any> = {};
    if (telefono) solicitudData.telefono = telefono;
    if (fecha_nacimiento) solicitudData.fecha_nacimiento = fecha_nacimiento;
    if (tipoContratoId) solicitudData.tipo_contrato = tipoContratoId;
    if (categoriaId) solicitudData.categoria = categoriaId;
    if (jerarquiaId) solicitudData.jerarquia = jerarquiaId;
    if (regionId) solicitudData.region = regionId;
    if (comunaId) solicitudData.comuna = comunaId;
    if (ciudadId) solicitudData.ciudad = ciudadId;
    if (direccion_particular) solicitudData.direccion_particular = direccion_particular;
    if (bancoId) solicitudData.banco = bancoId;
    if (tipoCuentaId) solicitudData.tipo_cuenta = tipoCuentaId;
    if (unidad_academica) solicitudData.unidad_academica = unidad_academica;

    if (!user.solicitud) {
      // Crear solicitud con todos los datos
      const newSolicitud = await strapi.documents('api::solicitud.solicitud').create({
        status: 'published',
        data: {
          rut: user.rut,
          nombre_completo: (user as any).nombre_completo,
          correo_electronico: correo_electronico || user.email,
          ...solicitudData,
          estado: 'aprobado' as const,
          es_nuevo_externo: false,
        } as any,
      });
      if (!newSolicitud) {
        return ctx.badRequest('Error al crear la solicitud.');
      }
      await strapi.db.query('api::solicitud.solicitud').update({
        where: { id: newSolicitud.id },
        data: { usuario: authUserId },
      });
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: authUserId },
        data: { solicitud: newSolicitud.id },
      });
    } else {
      // Actualizar solicitud existente
      await strapi.db.query('api::solicitud.solicitud').update({
        where: { id: user.solicitud.id },
        data: solicitudData,
      });
    }

    if (correo_electronico && correo_electronico !== user.email) {
      const userService = strapi.plugin('users-permissions').service('user');
      await userService.edit(authUserId, {
        email: correo_electronico.trim().toLowerCase(),
      });
    }

    ctx.send({ ok: true });
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
