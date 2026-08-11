import { factories } from '@strapi/strapi';

const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'https://telegestor.cl/afautal-data/index.php';

function formatRut(rut: string): string {
  const normalized = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (!normalized) return '';
  const cuerpo = normalized.slice(0, -1);
  const dv = normalized.slice(-1);
  const formattedBody = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dv ? `${formattedBody}-${dv}` : formattedBody;
}

async function registerCargaExterna(user: { id: number; rut?: string }, payload: Record<string, any>) {
  const rutFuncionario = formatRut(user.rut || '');
  if (!rutFuncionario) {
    console.log('External carga registration skipped: socio sin rut');
    return;
  }

  const externalPayload = new URLSearchParams({
    tipo: 'registrar_carga',
    rut_funcionario: rutFuncionario,
    carga_rut: payload.rut || '',
    carga_nombre: payload.nombre_completo || '',
    carga_parentesco: payload.parentesco || '',
    carga_fecha_nacimiento: payload.fecha_nacimiento || '',
  });

  console.log('PAYLOAD ENVIADO A TELEGESTOR (registrar_carga): ', Object.fromEntries(externalPayload.entries()));

  try {
    const externalResponse = await fetch(EXTERNAL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: externalPayload,
    });

    const externalBody = await externalResponse.text();
    console.log(`External API response (registrar_carga) | status: ${externalResponse.status} | body: ${externalBody}`);

    if (!externalResponse.ok) {
      console.error(`Failed to register carga in external API: ${externalResponse.status} - ${externalBody}`);
    }
  } catch (error) {
    console.error('Error while trying to register carga in external API:', error);
  }
}

export default factories.createCoreController('api::carga-familiar.carga-familiar', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const payload = ctx.request.body.data || {};

    const data = { ...payload, socio: user.id };
    if (!data.fecha_nacimiento) {
      delete data.fecha_nacimiento;
    }

    const entry = await strapi.db.query('api::carga-familiar.carga-familiar').create({
      data
    });

    await registerCargaExterna(user, payload);

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
