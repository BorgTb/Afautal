/**
 * Formatea un RUT chileno (agrega puntos y guión).
 * @param rut RUT en cualquier formato (con o sin puntos/guión)
 * @returns RUT formateado (ej: 12.345.678-9) o el string original si no es válido
 */
export const formatRUT = (rut: string): string => {
  if (!rut) return "No disponible";
  
  // Limpiar puntos y guiones
  let value = rut.replace(/\./g, "").replace(/-/g, "").trim();
  
  if (value.length < 2) return rut;

  // Extraer cuerpo y dígito verificador
  const body = value.slice(0, -1);
  const dv = value.slice(-1).toUpperCase();

  // Formatear cuerpo con puntos
  let formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  return `${formattedBody}-${dv}`;
};

/**
 * Formatea un número de teléfono chileno para visualización.
 * @param value Número de teléfono (ej: +56912345678 o 12345678)
 * @returns Teléfono formateado (ej: +56 9 1234 5678)
 */
export const formatPhone = (value: string): string => {
  if (!value) return "No registrado";
  const digits = value.replace(/\D/g, "");
  if (!digits) return value;

  const withoutCountry = digits.startsWith("56") ? digits.slice(2) : digits;

  if (withoutCountry.startsWith("9")) {
    const body = withoutCountry.slice(1);
    if (body.length >= 8) {
      return `+56 9 ${body.slice(0, 4)} ${body.slice(4, 8)}`;
    }
    return `+56 9 ${body}`.trim();
  }

  return `+56 ${withoutCountry}`.trim();
};
