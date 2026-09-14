/**
 * Utilidades de fecha para COTIZAPRO
 */

export function getTodayInputString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateLong(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return date.toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function isExpired(expirationDateStr: string): boolean {
  if (!expirationDateStr) return false;
  const today = getTodayInputString();
  return expirationDateStr < today;
}
