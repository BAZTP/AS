import { describe, it, expect } from 'vitest';
import { getNextQuotationNumber } from '../idGenerator';

describe('idGenerator - getNextQuotationNumber', () => {
  it('debe generar COT-000001 cuando no existen cotizaciones previas', () => {
    expect(getNextQuotationNumber([])).toBe('COT-000001');
  });

  it('debe generar el siguiente correlativo secuencial respetando padding de 6 dígitos', () => {
    const existing = ['COT-000001', 'COT-000002', 'COT-000005'];
    expect(getNextQuotationNumber(existing)).toBe('COT-000006');
  });

  it('debe manejar números con saltos o desordenados correctamente', () => {
    const existing = ['COT-000125', 'COT-000050', 'COT-000001'];
    expect(getNextQuotationNumber(existing)).toBe('COT-000126');
  });
});
