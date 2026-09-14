import { describe, it, expect } from 'vitest';
import { 
  validateRucCedulaEcuador, 
  validateEmail, 
  validatePhone,
  validateRequired
} from '../validators';

describe('validators', () => {
  it('debe validar cédula y RUC de Ecuador con longitud y provincia correctas', () => {
    // RUC válido de 13 dígitos
    const rucValido = validateRucCedulaEcuador('1792345890001');
    expect(rucValido.isValid).toBe(true);

    // Cédula válida de 10 dígitos (provincia 17 - Pichincha)
    const cedulaValida = validateRucCedulaEcuador('1718293041');
    expect(cedulaValida.isValid).toBe(true);

    // Identificación con longitud incorrecta (ej: 8 dígitos)
    const invalidoLongitud = validateRucCedulaEcuador('12345678');
    expect(invalidoLongitud.isValid).toBe(false);

    // Identificación con provincia no válida (código 35)
    const invalidoProvincia = validateRucCedulaEcuador('3512345678');
    expect(invalidoProvincia.isValid).toBe(false);
  });

  it('debe validar correos electrónicos de forma precisa', () => {
    expect(validateEmail('ventas@novatech.ec')).toBe(true);
    expect(validateEmail('')).toBe(true); // Opcional si vacío
    expect(validateEmail('correo-invalido@')).toBe(false);
    expect(validateEmail('sin_arroba.com')).toBe(false);
  });

  it('debe validar teléfonos de formato internacional y local', () => {
    expect(validatePhone('+593 99 876 5432')).toBe(true);
    expect(validatePhone('0998765432')).toBe(true);
    expect(validatePhone('123')).toBe(false); // Muy corto
  });

  it('debe validar campos requeridos no vacíos', () => {
    expect(validateRequired('Texto')).toBe(true);
    expect(validateRequired('   ')).toBe(false);
    expect(validateRequired('')).toBe(false);
    expect(validateRequired(undefined)).toBe(false);
  });
});
