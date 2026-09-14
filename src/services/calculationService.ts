import { QuotationItem, DiscountType } from '../types';
import { roundMoney } from '../utils/currency';

export interface ItemCalculationResult {
  subtotal: number;
  discountAmount: number;
  total: number;
}

export interface QuotationCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableBase: number;
  taxAmount: number;
  total: number;
}

/**
 * Calcula el subtotal, descuento individual y total para una línea de producto.
 * Garantiza que el descuento nunca supere el subtotal y evita valores negativos o flotantes infinitos.
 */
export function calculateItemTotals(
  quantity: number,
  unitPrice: number,
  discountType: DiscountType = 'PERCENTAGE',
  discountValue = 0
): ItemCalculationResult {
  const safeQty = Math.max(0, quantity || 0);
  const safePrice = Math.max(0, unitPrice || 0);
  const safeDiscVal = Math.max(0, discountValue || 0);

  const subtotal = roundMoney(safeQty * safePrice);

  let discountAmount = 0;
  if (discountType === 'PERCENTAGE') {
    const cappedPercent = Math.min(100, safeDiscVal);
    discountAmount = roundMoney(subtotal * (cappedPercent / 100));
  } else {
    // Valor fijo
    discountAmount = roundMoney(Math.min(subtotal, safeDiscVal));
  }

  const total = roundMoney(Math.max(0, subtotal - discountAmount));

  return {
    subtotal,
    discountAmount,
    total,
  };
}

/**
 * Calcula los totales consolidados de la cotización completa:
 * Subtotal de ítems, descuento general, base imponible, IVA y total neto.
 */
export function calculateQuotationTotals(
  items: QuotationItem[],
  globalDiscountType: DiscountType = 'PERCENTAGE',
  globalDiscountValue = 0,
  taxPercentage = 15 // Ecuador IVA default
): QuotationCalculationResult {
  // Suma de los totales de cada ítem (que ya tienen aplicado su descuento por línea)
  const itemsSubtotal = roundMoney(
    items.reduce((acc, item) => acc + (item.total || 0), 0)
  );

  const safeDiscVal = Math.max(0, globalDiscountValue || 0);
  let globalDiscountAmount = 0;

  if (globalDiscountType === 'PERCENTAGE') {
    const cappedPercent = Math.min(100, safeDiscVal);
    globalDiscountAmount = roundMoney(itemsSubtotal * (cappedPercent / 100));
  } else {
    globalDiscountAmount = roundMoney(Math.min(itemsSubtotal, safeDiscVal));
  }

  const taxableBase = roundMoney(Math.max(0, itemsSubtotal - globalDiscountAmount));

  const safeTaxPercent = Math.max(0, taxPercentage || 0);
  const taxAmount = roundMoney(taxableBase * (safeTaxPercent / 100));

  const total = roundMoney(taxableBase + taxAmount);

  return {
    subtotal: itemsSubtotal,
    discountAmount: globalDiscountAmount,
    taxableBase,
    taxAmount,
    total,
  };
}
