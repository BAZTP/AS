import { describe, it, expect } from 'vitest';
import { calculateItemTotals, calculateQuotationTotals } from '../calculationService';
import { QuotationItem } from '../../types';

describe('calculationService', () => {
  describe('calculateItemTotals', () => {
    it('debe calcular correctamente subtotal sin descuento', () => {
      const res = calculateItemTotals(4, 55); // 4 cámaras a $55
      expect(res.subtotal).toBe(220);
      expect(res.discountAmount).toBe(0);
      expect(res.total).toBe(220);
    });

    it('debe calcular descuento porcentual en un ítem con redondeo exacto', () => {
      const res = calculateItemTotals(3, 33.33, 'PERCENTAGE', 10);
      // Subtotal = 3 * 33.33 = 99.99
      // Descuento 10% = 9.999 -> redondeado a 10.00
      // Total = 99.99 - 10.00 = 89.99
      expect(res.subtotal).toBe(99.99);
      expect(res.discountAmount).toBe(10);
      expect(res.total).toBe(89.99);
    });

    it('debe calcular descuento de valor fijo en un ítem', () => {
      const res = calculateItemTotals(2, 50, 'FIXED', 15);
      expect(res.subtotal).toBe(100);
      expect(res.discountAmount).toBe(15);
      expect(res.total).toBe(85);
    });

    it('el descuento nunca debe exceder el subtotal', () => {
      const res = calculateItemTotals(1, 40, 'FIXED', 60);
      expect(res.subtotal).toBe(40);
      expect(res.discountAmount).toBe(40);
      expect(res.total).toBe(0);
    });
  });

  describe('calculateQuotationTotals', () => {
    it('debe calcular los totales de la cotización exactamente como en el requerimiento #14', () => {
      // Requerimiento #14:
      // CAM-001: 4 * $55 = $220
      // DVR-008: 1 * $95 = $95
      // HDD-001: 1 * $48 = $48
      // Subtotal: $363.00
      // Descuento: $10.00
      // Base imponible: $353.00
      // IVA 15% Ecuador: 353 * 0.15 = 52.95
      // Total: $405.95
      const items: QuotationItem[] = [
        {
          id: '1',
          productId: 'p1',
          sku: 'CAM-001',
          name: 'Cámara 5MP',
          quantity: 4,
          unitPrice: 55,
          discountType: 'PERCENTAGE',
          discountValue: 0,
          discountAmount: 0,
          subtotal: 220,
          total: 220,
        },
        {
          id: '2',
          productId: 'p2',
          sku: 'DVR-008',
          name: 'DVR 8 canales',
          quantity: 1,
          unitPrice: 95,
          discountType: 'PERCENTAGE',
          discountValue: 0,
          discountAmount: 0,
          subtotal: 95,
          total: 95,
        },
        {
          id: '3',
          productId: 'p3',
          sku: 'HDD-001',
          name: 'Disco 1TB',
          quantity: 1,
          unitPrice: 48,
          discountType: 'PERCENTAGE',
          discountValue: 0,
          discountAmount: 0,
          subtotal: 48,
          total: 48,
        },
      ];

      const res = calculateQuotationTotals(items, 'FIXED', 10, 15);
      expect(res.subtotal).toBe(363.00);
      expect(res.discountAmount).toBe(10.00);
      expect(res.taxableBase).toBe(353.00);
      expect(res.taxAmount).toBe(52.95);
      expect(res.total).toBe(405.95);
    });

    it('debe manejar descuento general porcentual', () => {
      const items: QuotationItem[] = [
        {
          id: '1',
          productId: 'p1',
          sku: 'PROD',
          name: 'Producto',
          quantity: 1,
          unitPrice: 100,
          discountType: 'PERCENTAGE',
          discountValue: 0,
          discountAmount: 0,
          subtotal: 100,
          total: 100,
        },
      ];

      // 10% descuento general de $100 -> base $90. IVA 15% -> 13.50. Total -> 103.50
      const res = calculateQuotationTotals(items, 'PERCENTAGE', 10, 15);
      expect(res.subtotal).toBe(100);
      expect(res.discountAmount).toBe(10);
      expect(res.taxableBase).toBe(90);
      expect(res.taxAmount).toBe(13.5);
      expect(res.total).toBe(103.5);
    });

    it('nunca produce totales negativos ante valores atípicos', () => {
      const items: QuotationItem[] = [];
      const res = calculateQuotationTotals(items, 'PERCENTAGE', 0, 15);
      expect(res.subtotal).toBe(0);
      expect(res.discountAmount).toBe(0);
      expect(res.taxAmount).toBe(0);
      expect(res.total).toBe(0);
    });
  });
});
