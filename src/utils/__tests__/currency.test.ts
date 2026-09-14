import { describe, it, expect } from 'vitest';
import { roundMoney, formatCurrency, parseNumber } from '../currency';

describe('currency utils', () => {
  it('debe redondear valores monetarios a 2 decimales sin fallos de coma flotante', () => {
    // Caso clásico: 0.1 + 0.2 en JS es 0.30000000000000004
    const sum = 0.1 + 0.2;
    expect(roundMoney(sum)).toBe(0.3);

    // Redondeo de centavos
    expect(roundMoney(99.999999)).toBe(100);
    expect(roundMoney(12.345)).toBe(12.35);
    expect(roundMoney(12.344)).toBe(12.34);
  });

  it('debe formatear valores a moneda USD $0.00 de manera estricta', () => {
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(1500)).toBe('$1,500.00');
    expect(formatCurrency(45.5)).toBe('$45.50');
    expect(formatCurrency(99.99)).toBe('$99.99');
  });

  it('debe parsear cadenas numéricas de forma segura', () => {
    expect(parseNumber('$1,250.50')).toBe(1250.5);
    expect(parseNumber('')).toBe(0);
    expect(parseNumber('invalid', 10)).toBe(10);
  });
});
