/**
 * solicitud controller
 */

import { factories } from '@strapi/strapi';
import crypto from 'node:crypto';

interface SolicitudRegistroPayload {
	rut?: string;
	nombre_completo?: string;
	correo_electronico?: string;
	unidad_academica?: string;
	fecha_nacimiento?: string;
	tipo_contrato?: string;
	jerarquia?: string;
	region?: string;
	comuna?: string;
	ciudad?: string;
	direccion_particular?: string;
	acepta_descuento?: boolean;
}

interface SolicitudWriteData {
	rut: string;
	nombre_completo: string;
	correo_electronico: string;
	unidad_academica: string | null;
	fecha_nacimiento: string | null;
	tipo_contrato: 'Planta_regular' | null;
	jerarquia: 'Titular' | null;
	region: string | null;
	comuna: string | null;
	ciudad: string | null;
	direccion_particular: string | null;
	acepta_descuento: boolean;
	estado: 'aprobado';
}

const normalizeTipoContrato = (value?: string): 'Planta_regular' | null => {
	if (value === 'Planta_regular') {
		return value;
	}

	return null;
};

const normalizeJerarquia = (value?: string): 'Titular' | null => {
	if (value === 'Titular') {
		return value;
	}

	return null;
};

const buildTemporaryPassword = (): string => {
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
};

const buildUsernameFromEmail = (email: string): string => {
	const prefix = email.split('@')[0]?.replace(/[^a-zA-Z0-9._-]/g, '') || 'usuario';
	return `${prefix}-${Date.now()}`;
};

export default factories.createCoreController('api::solicitud.solicitud', ({ strapi }) => ({
	async registerFromSolicitud(ctx) {
		const payload = (ctx.request.body ?? {}) as SolicitudRegistroPayload;
		const rut = payload.rut?.trim();
		const nombreCompleto = payload.nombre_completo?.trim();
		const correo = payload.correo_electronico?.trim().toLowerCase();

		if (!rut || !nombreCompleto || !correo) {
			return ctx.badRequest('rut, nombre_completo y correo_electronico son obligatorios.');
		}

		const existingUserByRut = await strapi.db.query('plugin::users-permissions.user').findOne({
			where: { rut },
			select: ['id', 'password_temporal'],
		});

		const existingUserByEmail = await strapi.db.query('plugin::users-permissions.user').findOne({
			where: { email: correo },
			select: ['id', 'password_temporal'],
		});

		if (existingUserByRut && existingUserByEmail && existingUserByRut.id !== existingUserByEmail.id) {
			return ctx.throw(409, 'El RUT y el correo ya pertenecen a usuarios distintos.');
		}

		const existingUser = existingUserByRut ?? existingUserByEmail;

		if (existingUser && !existingUser.password_temporal) {
			return ctx.throw(409, 'El usuario ya tiene una cuenta activa.');
		}

		const existingSolicitudByRut = await strapi.db.query('api::solicitud.solicitud').findOne({
			where: { rut },
			select: ['id'],
		});

		const existingSolicitudByEmail = await strapi.db.query('api::solicitud.solicitud').findOne({
			where: { correo_electronico: correo },
			select: ['id'],
		});

		if (
			existingSolicitudByRut &&
			existingSolicitudByEmail &&
			existingSolicitudByRut.id !== existingSolicitudByEmail.id
		) {
			return ctx.throw(409, 'El RUT y el correo pertenecen a solicitudes distintas.');
		}

		const solicitudData: SolicitudWriteData = {
			rut,
			nombre_completo: nombreCompleto,
			correo_electronico: correo,
			unidad_academica: payload.unidad_academica?.trim() || null,
			fecha_nacimiento: payload.fecha_nacimiento || null,
			tipo_contrato: normalizeTipoContrato(payload.tipo_contrato),
			jerarquia: normalizeJerarquia(payload.jerarquia),
			region: payload.region?.trim() || null,
			comuna: payload.comuna?.trim() || null,
			ciudad: payload.ciudad?.trim() || null,
			direccion_particular: payload.direccion_particular?.trim() || null,
			acepta_descuento: Boolean(payload.acepta_descuento),
			estado: 'aprobado',
		};

		let solicitudId: number | null = null;

		if (existingSolicitudByRut || existingSolicitudByEmail) {
			solicitudId = (existingSolicitudByRut?.id ?? existingSolicitudByEmail?.id) as number;

			await strapi.db.query('api::solicitud.solicitud').update({
				where: { id: solicitudId },
				data: {
					...solicitudData,
					publishedAt: new Date(),
				},
			});
		}

		if (!solicitudId) {
			const solicitud = await strapi.documents('api::solicitud.solicitud').create({
				status: 'published',
				data: solicitudData,
			});

			solicitudId = solicitud.id as number;
		}

		const temporaryPassword = buildTemporaryPassword();
		const authenticatedRole = await strapi.db
			.query('plugin::users-permissions.role')
			.findOne({ where: { type: 'authenticated' } });

		if (!authenticatedRole) {
			return ctx.throw(500, 'No se encontro el rol authenticated en users-permissions.');
		}

		const userService = strapi.plugin('users-permissions').service('user');

		let userId: number;

		if (existingUser) {
			await userService.edit(existingUser.id, {
				email: correo,
				provider: 'local',
				password: temporaryPassword,
				confirmed: true,
				blocked: false,
				role: authenticatedRole.id,
				rut,
				nombre_completo: nombreCompleto,
				unidad_academica: payload.unidad_academica?.trim() || null,
				password_temporal: true,
				solicitud: solicitudId,
			});

			userId = existingUser.id;
		} else {
			const user = await userService.add({
				username: buildUsernameFromEmail(correo),
				email: correo,
				provider: 'local',
				password: temporaryPassword,
				confirmed: true,
				blocked: false,
				role: authenticatedRole.id,
				rut,
				nombre_completo: nombreCompleto,
				unidad_academica: payload.unidad_academica?.trim() || null,
				password_temporal: true,
				solicitud: solicitudId,
			});

			userId = user.id;
		}

		const createdUser = await strapi.db.query('plugin::users-permissions.user').findOne({
			where: { id: userId },
			select: ['id', 'password'],
		});

		if (!createdUser?.password) {
			return ctx.throw(500, 'No fue posible verificar el usuario creado.');
		}

		const temporaryPasswordIsValid = await userService.validatePassword(
			temporaryPassword,
			createdUser.password
		);

		if (!temporaryPasswordIsValid) {
			return ctx.throw(500, 'La contraseña temporal generada no pudo validarse.');
		}

		await strapi.db.query('api::solicitud.solicitud').update({
			where: { id: solicitudId },
			data: { usuario: userId },
		});

		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

		try {
			await strapi.plugin('email').service('email').send({
				to: correo,
				subject: 'AFAUTAL - Acceso inicial con contraseña temporal',
				text: [
					`Hola ${nombreCompleto},`,
					'Tu acceso inicial ha sido creado.',
					`Contraseña temporal: ${temporaryPassword}`,
					`Inicia sesion en: ${frontendUrl}/auth/inicio-sesion`,
					'Al ingresar por primera vez deberas cambiar tu contraseña obligatoriamente.',
				].join('\n'),
			});
		} catch (error) {
			strapi.log.error('No fue posible enviar el correo de contraseña temporal.');
			strapi.log.error(error);
		}

		ctx.send({
			ok: true,
			message: 'Solicitud registrada. Revisa tu correo para obtener la contraseña temporal.',
			data: {
				solicitudId,
			},
		});
	},
}));
