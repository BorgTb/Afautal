export function normalizeRut(value: string): string {
  return value.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function splitRut(rut: string): { cuerpo: string; dv: string } {
  const n = normalizeRut(rut);
  return { cuerpo: n.slice(0, -1), dv: n.slice(-1) };
}

export function calcularDv(cuerpo: string): string {
  const digits = String(cuerpo).replace(/[^0-9]/g, '');
  let sum = 0;
  let mul = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += Number(digits[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const result = 11 - (sum % 11);
  if (result === 11) return '0';
  if (result === 10) return 'K';
  return String(result);
}

export function isValidRut(rut: string): boolean {
  const n = normalizeRut(rut);
  if (n.length < 3 || n.length > 9) return false;
  const { cuerpo, dv } = splitRut(n);
  if (!/^\d+$/.test(cuerpo)) return false;
  return calcularDv(cuerpo) === dv;
}

export function formatRut(rut: string): string {
  const n = normalizeRut(rut).slice(0, 9);
  if (!n) return '';
  const { cuerpo, dv } = splitRut(n);
  const formattedBody = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dv ? `${formattedBody}-${dv}` : formattedBody;
}
