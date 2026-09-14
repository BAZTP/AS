import React from 'react';
import { DiscountType } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Select } from '../common/Select';
import { Input } from '../common/Input';

interface QuotationSummaryProps {
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxableBase: number;
  taxPercentage: number;
  taxAmount: number;
  total: number;
  onChangeDiscountType: (type: DiscountType) => void;
  onChangeDiscountValue: (value: number) => void;
  onChangeTaxPercentage: (value: number) => void;
  notes: string;
  onChangeNotes: (notes: string) => void;
  terms: string;
  onChangeTerms: (terms: string) => void;
}

export const QuotationSummary: React.FC<QuotationSummaryProps> = ({
  subtotal,
  discountType,
  discountValue,
  discountAmount,
  taxableBase,
  taxPercentage,
  taxAmount,
  total,
  onChangeDiscountType,
  onChangeDiscountValue,
  onChangeTaxPercentage,
  notes,
  onChangeNotes,
  terms,
  onChangeTerms,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left side: Notes & Terms */}
      <div className="lg:col-span-7 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Observaciones Adicionales
          </label>
          <textarea
            value={notes}
            onChange={e => onChangeNotes(e.target.value)}
            rows={3}
            placeholder="Notas especiales para el cliente, tiempo estimado de instalación, incluir canalización, etc."
            className="w-full rounded-xl text-sm p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Condiciones Comerciales y Garantía
          </label>
          <textarea
            value={terms}
            onChange={e => onChangeTerms(e.target.value)}
            rows={4}
            placeholder="Términos comerciales, anticipo, cuentas de transferencia, validez de la oferta..."
            className="w-full rounded-xl text-sm p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none font-mono text-xs"
          />
        </div>
      </div>

      {/* Right side: Financial Totals Box */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3.5 flex flex-col justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
          Liquidación de la Oferta
        </h4>

        <div className="space-y-3 text-sm">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Subtotal Ítems:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {/* Descuento General */}
          <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Descuento General:</span>
              <select
                value={discountType}
                onChange={e => onChangeDiscountType(e.target.value as DiscountType)}
                className="text-xs py-0.5 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="PERCENTAGE">%</option>
                <option value="FIXED">$</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={e => onChangeDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-20 text-right font-mono text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
              />
              <span className="font-mono text-amber-600 dark:text-amber-400 text-xs w-20 text-right">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          </div>

          {/* Base Imponible */}
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Base Imponible:</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {formatCurrency(taxableBase)}
            </span>
          </div>

          {/* IVA */}
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>IVA:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxPercentage}
                  onChange={e => onChangeTaxPercentage(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-14 text-center font-mono text-xs py-0.5 px-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
                <span className="text-xs font-mono">%</span>
              </div>
            </div>

            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {formatCurrency(taxAmount)}
            </span>
          </div>
        </div>

        {/* TOTAL */}
        <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-700">
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-900 dark:text-blue-200 block">
                TOTAL COTIZACIÓN
              </span>
              <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-medium">
                Valores en Dólares (USD)
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-cyan-400">
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
