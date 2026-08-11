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

async function postToExternal(params: Record<string, string>): Promise<{ ok: boolean; status: number; data: any }> {
  const body = new URLSearchParams(params);
  console.log('PAYLOAD ENVIADO A TELEGESTOR:', Object.fromEntries(body.entries()));

  let response: Response;
  let text = '';
  try {
    response = await fetch(EXTERNAL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    text = await response.text();
  } catch (error) {
    console.error('Error while calling external API:', error);
    throw error;
  }

  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  console.log(`External API response | status: ${response.status} | body: ${text}`);
  return { ok: response.ok, status: response.status, data };
}

async function findExternalCargaId(socioRutFormateado: string, cargaRutFormateado: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({ tipo: 'listar_cargas' });
    const response = await fetch(`${EXTERNAL_API_URL}?${params.toString()}`);
    if (!response.ok) {
      console.error(`Failed to list cargas in external API: ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      return null;
    }

    const match = data.find(
      (row: any) =>
        row.usu_afa_rut === socioRutFormateado && row.car_fam_afa_rut === cargaRutFormateado
    );
    return match ? String(match.car_fam_afa_idn) : null;
  } catch (error) {
    console.error('Error while listing cargas in external API:', error);
    return null;
  }
}

async function getExternalCargaId(
  entry: { external_id?: string | null; rut?: string },
  user: { rut?: string }
): Promise<string | null> {
  if (entry.external_id) {
    return String(entry.external_id);
  }
  const socioRutFormateado = formatRut(user.rut || '');
  const cargaRutFormateado = formatRut(entry.rut || '');
  if (!socioRutFormateado || !cargaRutFormateado) {
    console.log('External carga id lookup skipped: rut de socio o carga vacío');
    return null;
  }
  return findExternalCargaId(socioRutFormateado, cargaRutFormateado);
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

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const { id } = ctx.params;
    const numericId = Number(id);
    const payload = ctx.request.body.data || {};

    const existingEntry = await strapi.db.query('api::carga-familiar.carga-familiar').findOne({
      where: { id: numericId, socio: user.id }
    });

    if (!existingEntry) {
      return ctx.unauthorized('No tienes permiso para modificar esta carga o no existe');
    }

    const data = { ...payload };
    if (!data.fecha_nacimiento) {
      delete data.fecha_nacimiento;
    }

    const updatedEntry = await strapi.db.query('api::carga-familiar.carga-familiar').update({
      where: { id: numericId },
      data
    });

    try {
      const externalId = existingEntry.external_id
        ? String(existingEntry.external_id)
        : await getExternalCargaId(existingEntry, user);

      if (externalId) {
        await postToExternal({
          tipo: 'editar_carga',
          car_fam_afa_idn: externalId,
          carga_rut: payload.rut || '',
          carga_nombre: payload.nombre_completo || '',
          carga_fecha_nacimiento: payload.fecha_nacimiento || '',
        });

        if (existingEntry.external_id !== externalId) {
          await strapi.db.query('api::carga-familiar.carga-familiar').update({
            where: { id: numericId },
            data: { external_id: externalId }
          });
        }
      } else {
        console.log('External carga update skipped: no se encontró car_fam_afa_idn');
      }
    } catch (error) {
      console.error('Error while trying to update carga in external API:', error);
    }

    return { data: updatedEntry };
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

    try {
      const externalId = existingEntry.external_id
        ? String(existingEntry.external_id)
        : await getExternalCargaId(existingEntry, user);

      if (externalId) {
        await postToExternal({
          tipo: 'eliminar_carga',
          car_fam_afa_idn: externalId,
        });
      } else {
        console.log('External carga delete skipped: no se encontró car_fam_afa_idn');
      }
    } catch (error) {
      console.error('Error while trying to delete carga in external API:', error);
    }

    const deletedEntry = await strapi.db.query('api::carga-familiar.carga-familiar').delete({
      where: { id: numericId }
    });

    return { data: deletedEntry };
  }
}));
