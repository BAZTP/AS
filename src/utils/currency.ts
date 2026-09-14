/**
 * Utilidades monetarias de alta precisión para COTIZAPRO
 * Evita anomalías de coma flotante (como 0.30000000000000004 o 99.999999)
 */

export function roundMoney(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  // Usar redondeo con épsilon para evitar imprecisiones de flotante
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function formatCurrency(amount: number, symbol = '$'): string {
  const cleanAmount = roundMoney(amount);
  return `${symbol}${cleanAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseNumber(value: string | number, fallback = 0): number {
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }
  if (!value) return fallback;
  const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ''));
  return isNaN(parsed) ? fallback : parsed;
}
