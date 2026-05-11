
import { geographyData } from "../scripts/geography-data";

export async function seedGeography(strapi) {
  const regionsCount = await strapi.db.query("api::region.region").count();
  if (regionsCount > 0) {
    console.log("Geography data already exists, skipping seed.");
    return;
  }

  console.log("Seeding geography data...");

  for (const item of geographyData) {
    const region = await strapi.db.query("api::region.region").create({
      data: { nombre: item.region }
    });

    // Seed Ciudades
    for (const cityName of item.ciudades) {
      await strapi.db.query("api::ciudad.ciudad").create({
        data: { nombre: cityName, region: region.id }
      });
    }

    // Seed Comunas
    for (const comunaName of item.comunas) {
      await strapi.db.query("api::comuna.comuna").create({
        data: { nombre: comunaName, region: region.id }
      });
    }
  }

  console.log("Geography seeding completed.");
}
