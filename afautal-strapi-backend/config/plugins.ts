import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
	email: {
		config: {
			provider: 'nodemailer',
			providerOptions: {
				host: env('SMTP_HOST', 'smtp.gmail.com'),
				port: env.int('SMTP_PORT', 587),
				secure: env.bool('SMTP_SECURE', false),
				auth: {
					user: env('SMTP_USERNAME'),
					pass: env('SMTP_PASSWORD'),
				},
			},
			settings: {
				defaultFrom: env('SMTP_FROM', 'noreply@afautal.cl'),
				defaultReplyTo: env('SMTP_REPLY_TO', 'noreply@afautal.cl'),
			},
		},
	},
});

export default config;
