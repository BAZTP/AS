/**
 * Validadores para COTIZAPRO
 */

export function validateRequired(value?: string | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateEmail(email?: string): boolean {
  if (!email || email.trim() === '') return true; // Opcional si está vacío
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePhone(phone?: string): boolean {
  if (!phone || phone.trim() === '') return false;
  // Permite números, +, -, espacios y paréntesis (mínimo 7 caracteres)
  const phoneRegex = /^[\d\s+\-()]{7,20}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Validador de Cédula y RUC para Ecuador
 */
export function validateRucCedulaEcuador(idNumber?: string): { isValid: boolean; message?: string } {
  if (!idNumber || idNumber.trim() === '') {
    return { isValid: true }; // Campo no obligatorio por defecto según requerimientos
  }

  const clean = idNumber.trim().replace(/\s+/g, '');

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, message: 'La identificación debe contener solo números.' };
  }

  if (clean.length !== 10 && clean.length !== 13) {
    return { isValid: false, message: 'Debe tener 10 dígitos (Cédula) o 13 dígitos (RUC).' };
  }

  const province = parseInt(clean.substring(0, 2), 10);
  if (province < 1 || (province > 24 && province !== 30)) {
    return { isValid: false, message: 'Código de provincia inicial no válido en Ecuador.' };
  }

  // Si es RUC, debe terminar en 001 (o al menos números finales válidos)
  if (clean.length === 13) {
    const establishment = clean.substring(10, 13);
    if (establishment === '000') {
      return { isValid: false, message: 'El RUC debe terminar con un establecimiento válido (ej: 001).' };
    }
  }

  return { isValid: true };
}

export function validatePositiveNumber(value: number, allowZero = true): boolean {
  if (isNaN(value) || !isFinite(value)) return false;
  return allowZero ? value >= 0 : value > 0;
}
