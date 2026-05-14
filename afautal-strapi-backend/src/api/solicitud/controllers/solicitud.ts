/**
 * solicitud controller
 */

import { factories } from '@strapi/strapi';

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
}

export default factories.createCoreController('api::solicitud.solicitud', ({ strapi }) => ({
	async registerFromSolicitud(ctx) {
		const payload = (ctx.request.body ?? {}) as SolicitudRegistroPayload;
		const rut = payload.rut?.trim();
		const nombreCompleto = payload.nombre_completo?.trim();
		const correo = payload.correo_electronico?.trim().toLowerCase();

		if (!rut || !nombreCompleto || !correo) {
			return ctx.badRequest('rut, nombre_completo y correo_electronico son obligatorios.');
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
			banco: payload.banco ? { set: [payload.banco] } : null,
			tipo_cuenta: payload.tipo_cuenta ? { set: [payload.tipo_cuenta] } : null,
			estado: 'pendiente',
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
}));
