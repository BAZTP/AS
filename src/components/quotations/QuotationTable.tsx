import React from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { QuotationItem, DiscountType } from '../../types';
import { formatCurrency, roundMoney } from '../../utils/currency';
import { calculateItemTotals } from '../../services/calculationService';

interface QuotationTableProps {
  items: QuotationItem[];
  onUpdateItem: (index: number, updatedItem: QuotationItem) => void;
  onRemoveItem: (index: number) => void;
}

export const QuotationTable: React.FC<QuotationTableProps> = ({
  items,
  onUpdateItem,
  onRemoveItem,
}) => {
  const handleQuantityChange = (index: number, newQtyStr: string) => {
    const qty = Math.max(1, parseFloat(newQtyStr) || 1);
    const item = items[index];
    const calc = calculateItemTotals(qty, item.unitPrice, item.discountType, item.discountValue);
    onUpdateItem(index, {
      ...item,
      quantity: qty,
      discountAmount: calc.discountAmount,
      subtotal: calc.subtotal,
      total: calc.total,
    });
  };

  const handlePriceChange = (index: number, newPriceStr: string) => {
    const price = Math.max(0, parseFloat(newPriceStr) || 0);
    const item = items[index];
    const calc = calculateItemTotals(item.quantity, price, item.discountType, item.discountValue);
    onUpdateItem(index, {
      ...item,
      unitPrice: price,
      discountAmount: calc.discountAmount,
      subtotal: calc.subtotal,
      total: calc.total,
    });
  };

  const handleDiscountChange = (index: number, newDiscStr: string) => {
    const disc = Math.max(0, parseFloat(newDiscStr) || 0);
    const item = items[index];
    const calc = calculateItemTotals(item.quantity, item.unitPrice, item.discountType, disc);
    onUpdateItem(index, {
      ...item,
      discountValue: disc,
      discountAmount: calc.discountAmount,
      subtotal: calc.subtotal,
      total: calc.total,
    });
  };

  const handleDescriptionChange = (index: number, desc: string) => {
    onUpdateItem(index, {
      ...items[index],
      description: desc,
    });
  };

  if (items.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
        <p className="text-sm font-medium">
          No has agregado productos a esta cotización todavía.
        </p>
        <p className="text-xs mt-1 text-slate-500">
          Usa el buscador superior para seleccionar cámaras, grabadores, discos o cables.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3 min-w-[200px]">Producto & Descripción</th>
              <th className="px-4 py-3 w-24 text-center">Cant.</th>
              <th className="px-4 py-3 w-28 text-right">P. Unitario</th>
              <th className="px-4 py-3 w-28 text-right">Descuento</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3 text-right">Total Línea</th>
              <th className="px-4 py-3 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                {/* SKU */}
                <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">
                  {item.sku}
                </td>

                {/* Name & editable description */}
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </div>
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={e => handleDescriptionChange(idx, e.target.value)}
                    placeholder="Detalles técnicos / garantía / observaciones..."
                    className="w-full text-xs text-slate-500 dark:text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none py-0.5 mt-0.5"
                  />
                </td>

                {/* Quantity */}
                <td className="px-4 py-3.5 text-center">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(idx, e.target.value)}
                    className="w-16 text-center text-sm font-mono font-bold py-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>

                {/* Unit Price */}
                <td className="px-4 py-3.5 text-right">
                  <div className="relative inline-block">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={e => handlePriceChange(idx, e.target.value)}
                      className="w-24 pl-5 pr-2 py-1 text-right text-sm font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </td>

                {/* Discount */}
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.discountValue}
                      onChange={e => handleDiscountChange(idx, e.target.value)}
                      className="w-16 py-1 px-2 text-right text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400">
                      {item.discountType === 'PERCENTAGE' ? '%' : '$'}
                    </span>
                  </div>
                  {item.discountAmount > 0 && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                      -{formatCurrency(item.discountAmount)}
                    </div>
                  )}
                </td>

                {/* Subtotal */}
                <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-400 text-xs">
                  {formatCurrency(item.subtotal)}
                </td>

                {/* Line Total */}
                <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(item.total)}
                </td>

                {/* Delete button */}
                <td className="px-4 py-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Eliminar producto de la cotización"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <span>{items.length} {items.length === 1 ? 'producto en cotización' : 'productos en cotización'}</span>
        <span>Puedes ajustar cantidades y precios directamente en la tabla</span>
      </div>
    </div>
  );
};
