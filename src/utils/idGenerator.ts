/**
 * Generadores de ID y números correlativos para COTIZAPRO
 */

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Genera el siguiente número secuencial para cotizaciones en formato COT-000001
 * Inspecciona todos los números existentes para evitar duplicados.
 */
export function getNextQuotationNumber(existingNumbers: string[]): string {
  let maxNumber = 0;

  for (const num of existingNumbers) {
    if (!num) continue;
    const match = num.match(/COT-(\d+)/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > maxNumber) {
        maxNumber = parsed;
      }
    }
  }

  const nextNumber = maxNumber + 1;
  return `COT-${String(nextNumber).padStart(6, '0')}`;
}
