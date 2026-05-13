import { seedGeography } from './geography-seeder';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    await seedGeography(strapi);

    // Set public permissions for public dropdowns
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (publicRole) {
      const actions = [
        'api::jerarquia.jerarquia.find',
        'api::jerarquia.jerarquia.findOne',
        'api::tipo-contrato.tipo-contrato.find',
        'api::tipo-contrato.tipo-contrato.findOne',
        'api::tipo-cuenta.tipo-cuenta.find',
        'api::tipo-cuenta.tipo-cuenta.findOne',
        'api::categoria.categoria.find',
        'api::categoria.categoria.findOne',
        'api::banco.banco.find',
        'api::banco.banco.findOne'
      ];

      for (const action of actions) {
        const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: { action, role: publicRole.id },
        });

        if (!existingPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: publicRole.id,
            },
          });
        }
      }
    }
  },
};
