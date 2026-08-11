/**
 * descuento controller
 */

import { factories } from '@strapi/strapi';

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

const getUserWithRole = async (strapi: any, id: number) => {
  return strapi.db.query('plugin::users-permissions.user').findOne({
    where: { id },
    populate: { role: true },
  });
};

const normalizeRutBody = (value: string | number): string => {
  const digits = String(value ?? '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  const cuerpo = digits.length > 8 ? digits.slice(0, -1) : digits;
  return cuerpo.replace(/^0+/, '') || '';
};

export default factories.createCoreController('api::descuento.descuento', ({ strapi }) => ({
  async importar(ctx) {
    try {
      const authUserId = await resolveAuthUserId(ctx, strapi);

      if (!authUserId) {
        return ctx.unauthorized('No autenticado.');
      }

      const user = await getUserWithRole(strapi, authUserId);
      if (!user || user.role?.type !== 'admin') {
        return ctx.forbidden('Solo el administrador puede importar descuentos.');
      }

      const body = (ctx.request.body ?? {}) as {
        registros?: any[];
        sobrescribir?: boolean;
      };

      const registros = Array.isArray(body.registros) ? body.registros : [];
      const sobrescribir = Boolean(body.sobrescribir);

      if (registros.length === 0) {
        return ctx.badRequest('No se recibieron registros para importar.');
      }

      const clean: any[] = [];
      const periodos = new Map<string, { anio: number; mes: number; cant: number }>();

      for (const reg of registros) {
        const rut = normalizeRutBody(reg.rut);
        const anio = Number(reg.anio);
        const mes = Number(reg.mes);
        const monto = Number(reg.monto);

        if (!rut || !Number.isInteger(anio) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
          return ctx.badRequest('Registros con datos inválidos (rut, año o mes).');
        }

        if (!Number.isFinite(monto) || monto < 0) {
          return ctx.badRequest('Monto inválido en un registro.');
        }

        const key = `${anio}-${mes}`;
        const periodo = periodos.get(key) ?? { anio, mes, cant: 0 };
        periodo.cant += 1;
        periodos.set(key, periodo);

        clean.push({
          rut,
          nombre_completo: typeof reg.nombre_completo === 'string' ? reg.nombre_completo : '',
          unidad: typeof reg.unidad === 'string' ? reg.unidad : '',
          anio,
          mes,
          monto,
        });
      }

      const periodosList = Array.from(periodos.values());

      // Detectar periodos que ya tienen datos cargados
      const existentes: { anio: number; mes: number; cant: number }[] = [];
      for (const p of periodosList) {
        const count = await strapi.db.query('api::descuento.descuento').count({
          where: { anio: p.anio, mes: p.mes },
        });
        if (count > 0) {
          existentes.push({ ...p, cant: count });
        }
      }

      if (existentes.length > 0 && !sobrescribir) {
        ctx.status = 409;
        ctx.body = {
          data: {
            mensaje: 'Ya existen descuentos para uno o más periodos del archivo.',
            periodos_existentes: existentes,
          },
        };
        return;
      }

      // SQLite limita a 500 términos en un compound SELECT (INSERT ... SELECT ... UNION ALL).
      // Se inserta en lotes dentro de una transacción para mantener atomicidad.
      const BATCH_SIZE = 100;

      await strapi.db.transaction(async () => {
        // Borrar datos previos de los periodos del archivo (fuente de verdad)
        if (existentes.length > 0) {
          for (const p of periodosList) {
            await strapi.db.query('api::descuento.descuento').deleteMany({
              where: { anio: p.anio, mes: p.mes },
            });
          }
        }

        for (let i = 0; i < clean.length; i += BATCH_SIZE) {
          const chunk = clean.slice(i, i + BATCH_SIZE);
          await strapi.db.query('api::descuento.descuento').createMany({
            data: chunk,
          });
        }
      });

      strapi.log.info(`Descuentos importados por admin: ${clean.length} registros en ${periodosList.length} periodos`);

      return ctx.send({
        data: {
          insertados: clean.length,
          periodos: periodosList,
          reemplazados: existentes.length > 0,
        },
      });
    } catch (err) {
      strapi.log.error('Error al importar descuentos:', err);
      ctx.throw(500, 'Hubo un error al importar los descuentos.');
    }
  },

  async mios(ctx) {
    try {
      const authUserId = await resolveAuthUserId(ctx, strapi);

      if (!authUserId) {
        return ctx.unauthorized('No autenticado.');
      }

      const user = await getUserWithRole(strapi, authUserId);
      if (!user) {
        return ctx.notFound('Usuario no encontrado.');
      }

      // Candidatos del cuerpo de RUT (sin dígito verificador) según cómo esté guardado:
      // 9+ dígitos -> incluye DV, se descarta el último; 8 dígitos -> puede ser cuerpo
      // de 8 o cuerpo de 7 + DV numérico; 7 o menos -> cuerpo sin DV.
      // El cuerpo se guarda sin ceros a la izquierda (canónico).
      const digits = String(user.rut || '').replace(/[^0-9]/g, '');
      const sinCeros = (s: string): string => s.replace(/^0+/, '') || '';
      const candidatos = new Set<string>();

      if (digits.length >= 9) {
        candidatos.add(sinCeros(digits.slice(0, -1)));
      } else if (digits.length === 8) {
        candidatos.add(sinCeros(digits.slice(0, -1)));
        candidatos.add(sinCeros(digits));
      } else if (digits.length > 0) {
        candidatos.add(sinCeros(digits));
      }

      if (candidatos.size === 0) {
        return ctx.send({ data: [] });
      }

      const descuentos = await strapi.documents('api::descuento.descuento').findMany({
        filters: { rut: { $in: Array.from(candidatos) } },
        sort: ['anio:asc', 'mes:asc'],
      });

      return ctx.send({ data: descuentos });
    } catch (err) {
      strapi.log.error('Error al consultar mis descuentos:', err);
      ctx.throw(500, 'Hubo un error al consultar los descuentos.');
    }
  },

  async periodos(ctx) {
    try {
      const authUserId = await resolveAuthUserId(ctx, strapi);

      if (!authUserId) {
        return ctx.unauthorized('No autenticado.');
      }

      const user = await getUserWithRole(strapi, authUserId);
      if (!user || user.role?.type !== 'admin') {
        return ctx.forbidden('Solo el administrador puede consultar los periodos.');
      }

      const results = await strapi.db.connection('descuentos')
        .select('anio', 'mes')
        .count({ total: '*' })
        .groupBy('anio', 'mes')
        .orderBy('anio', 'asc')
        .orderBy('mes', 'asc');

      const periodos = (results as any[]).map((row) => ({
        anio: Number(row.anio),
        mes: Number(row.mes),
        total: Number(row.total),
      }));

      return ctx.send({ data: periodos });
    } catch (err) {
      strapi.log.error('Error al consultar periodos de descuentos:', err);
      ctx.throw(500, 'Hubo un error al consultar los periodos.');
    }
  },
}));