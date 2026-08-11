/**
 * solicitud controller
 */

import { factories } from '@strapi/strapi';
import { normalizeRut, isValidRut } from '../../../utils/rut';

interface SolicitudRegistroPayload {
	rut?: string;
	nombre_completo?: string;
	correo_electronico?: string;
	unidad_academica?: string;
	fecha_nacimiento?: string;
	tipo_contrato?: string;
	categoria?: string;
	jerarquia?: string;
	region?: string;
	comuna?: string;
	ciudad?: string;
	direccion_particular?: string;
	telefono?: string;
	banco?: string;
	tipo_cuenta?: string;
	es_nuevo_externo?: boolean;
}

interface SolicitudWriteData {
	rut: string;
	nombre_completo: string;
	correo_electronico: string;
	unidad_academica: string | null;
	fecha_nacimiento: string | null;
	tipo_contrato: { set: string[] } | null;
	categoria: { set: string[] } | null;
	jerarquia: { set: string[] } | null;
	region: { set: string[] } | null;
	comuna: { set: string[] } | null;
	ciudad: { set: string[] } | null;
	direccion_particular: string | null;
	telefono: string | null;
	banco: { set: string[] } | null;
	tipo_cuenta: { set: string[] } | null;
	estado: 'pendiente';
	es_nuevo_externo: boolean;
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

const resolveRelationDocumentId = async (
	strapi: any,
	uid: string,
	value?: string
): Promise<string | null> => {
	const normalizedValue = value?.trim();

	if (!normalizedValue) {
		return null;
	}

	const byDocumentId = await strapi.db.query(uid).findOne({
		where: { documentId: normalizedValue },
	});

	if (byDocumentId?.documentId) {
		return byDocumentId.documentId as string;
	}

	const byNombre = await strapi.db.query(uid).findOne({
		where: { nombre: normalizedValue },
	});

	if (byNombre?.documentId) {
		return byNombre.documentId as string;
	}

	return null;
};

export default factories.createCoreController('api::solicitud.solicitud', ({ strapi }) => ({
	async registerFromSolicitud(ctx) {
		const payload = (ctx.request.body ?? {}) as SolicitudRegistroPayload;
		const rut = normalizeRut(payload.rut ?? '');
		const nombreCompleto = payload.nombre_completo?.trim();
		const correo = payload.correo_electronico?.trim().toLowerCase();

		if (!rut || !nombreCompleto || !correo) {
			return ctx.badRequest('rut, nombre_completo y correo_electronico son obligatorios.');
		}

		if (!isValidRut(rut)) {
			return ctx.badRequest('Debes ingresar tu RUT con su dígito verificador (ej: 12.345.678-9).');
		}

		// Verificar si ya existe un usuario activo
		const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
			where: {
				$or: [{ rut }, { email: correo }],
				password_temporal: false,
			},
		});

		if (existingUser) {
			return ctx.throw(409, 'Ya existe una cuenta activa con este RUT o correo.');
		}

		const solicitudDocuments = strapi.documents('api::solicitud.solicitud') as any;

		// Verificar si ya existe una solicitud pendiente
		const existingSolicitud = await solicitudDocuments.findFirst({
			filters: {
				$or: [{ rut }, { correo_electronico: correo }],
				estado: 'pendiente',
			},
			status: 'published',
		});

		if (existingSolicitud) {
			return ctx.throw(409, 'Ya existe una solicitud de registro pendiente para este usuario.');
		}

		const bancoDocumentId = await resolveRelationDocumentId(strapi, 'api::banco.banco', payload.banco);
		if (payload.banco && !bancoDocumentId) {
			return ctx.badRequest('El banco seleccionado no existe.');
		}

		const tipoCuentaDocumentId = await resolveRelationDocumentId(
			strapi,
			'api::tipo-cuenta.tipo-cuenta',
			payload.tipo_cuenta
		);
		if (payload.tipo_cuenta && !tipoCuentaDocumentId) {
			return ctx.badRequest('El tipo de cuenta seleccionado no existe.');
		}

		const solicitudData: SolicitudWriteData = {
			rut,
			nombre_completo: nombreCompleto,
			correo_electronico: correo,
			unidad_academica: payload.unidad_academica?.trim() || "",
			fecha_nacimiento: payload.fecha_nacimiento || null,
			tipo_contrato: payload.tipo_contrato ? { set: [payload.tipo_contrato] } : null,
			categoria: payload.categoria ? { set: [payload.categoria] } : null,
			jerarquia: payload.jerarquia ? { set: [payload.jerarquia] } : null,
			region: payload.region ? { set: [payload.region] } : null,
			comuna: payload.comuna ? { set: [payload.comuna] } : null,
			ciudad: payload.ciudad ? { set: [payload.ciudad] } : null,
			direccion_particular: payload.direccion_particular?.trim() || null,
			telefono: payload.telefono?.trim() || null,
			banco: bancoDocumentId ? { set: [bancoDocumentId] } : null,
			tipo_cuenta: tipoCuentaDocumentId ? { set: [tipoCuentaDocumentId] } : null,
			estado: 'pendiente',
			es_nuevo_externo: payload.es_nuevo_externo ?? false,
		};

		const solicitud = await solicitudDocuments.create({
			status: 'published',
			data: solicitudData,
		});

		ctx.send({
			ok: true,
			message: 'Tu solicitud de registro ha sido enviada con éxito. Un administrador la revisará pronto.',
			data: {
				solicitudId: solicitud.documentId || solicitud.id,
			},
		});
	},

	async update(ctx) {
		const authUserId = await resolveAuthUserId(ctx, strapi);
		const payload = ((ctx.request.body ?? {}).data ?? {}) as SolicitudRegistroPayload;

		if (!authUserId) {
			return ctx.unauthorized('No autenticado.');
		}

		const user = await strapi.db.query('plugin::users-permissions.user').findOne({
			where: { id: authUserId },
			populate: { solicitud: true },
		});

		let solicitud = user?.solicitud as any;

		if (!solicitud && ctx.params?.id) {
			const routeId = String(ctx.params.id).trim();
			const numericRouteId = Number(routeId);

			solicitud = await strapi.db.query('api::solicitud.solicitud').findOne({
				where: {
					usuario: authUserId,
					...(Number.isFinite(numericRouteId)
						? { $or: [{ id: numericRouteId }, { documentId: routeId }] }
						: { documentId: routeId }),
				},
			});
		}

		if (!solicitud) {
			return ctx.notFound('No se encontró la solicitud asociada al usuario.');
		}

		const solicitudDocumentId = solicitud.documentId || String(solicitud.id);

		if (!solicitudDocumentId) {
			return ctx.badRequest('No se pudo resolver la solicitud a actualizar.');
		}

		const updateData: Record<string, unknown> = {};

		if (Object.prototype.hasOwnProperty.call(payload, 'banco')) {
			const bancoDocumentId = await resolveRelationDocumentId(strapi, 'api::banco.banco', payload.banco);

			if (payload.banco && !bancoDocumentId) {
				return ctx.badRequest('El banco seleccionado no existe.');
			}

			updateData.banco = bancoDocumentId ? { set: [bancoDocumentId] } : null;
		}

		if (Object.prototype.hasOwnProperty.call(payload, 'tipo_cuenta')) {
			const tipoCuentaDocumentId = await resolveRelationDocumentId(
				strapi,
				'api::tipo-cuenta.tipo-cuenta',
				payload.tipo_cuenta
			);

			if (payload.tipo_cuenta && !tipoCuentaDocumentId) {
				return ctx.badRequest('El tipo de cuenta seleccionado no existe.');
			}

			updateData.tipo_cuenta = tipoCuentaDocumentId ? { set: [tipoCuentaDocumentId] } : null;
		}

		if (Object.keys(updateData).length === 0) {
			return ctx.badRequest('No se enviaron datos para actualizar.');
		}

		const updatedSolicitud = await strapi.documents('api::solicitud.solicitud').update({
			documentId: solicitudDocumentId,
			data: updateData,
		});

		ctx.send({ data: updatedSolicitud });
	},
}));
