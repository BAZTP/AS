import React, { useState, useMemo } from 'react';
import { Package, Search, Plus, Tag, Check, ArrowDown } from 'lucide-react';
import { Product, Category, QuotationItem, DiscountType } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { QuickProductModal } from './QuickProductModal';
import { formatCurrency, roundMoney } from '../../utils/currency';
import { calculateItemTotals } from '../../services/calculationService';
import { generateId } from '../../utils/idGenerator';

interface ProductSelectorProps {
  products: Product[];
  categories: Category[];
  onAddItem: (item: QuotationItem) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  categories,
  onAddItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);

  // Line item customization before adding
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('0');

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return products.filter(p => {
      if (p.status !== 'ACTIVO') return false;
      const matchCat = !selectedCategory || p.categoryId === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.internalCode && p.internalCode.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q)
      );
    }).slice(0, 10);
  }, [products, searchTerm, selectedCategory]);

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setUnitPrice(prod.price.toString());
    setQuantity('1');
    setDiscountValue('0');
    setIsOpenDropdown(false);
    setSearchTerm('');
  };

  // Preview line calculations
  const preview = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    const discVal = parseFloat(discountValue) || 0;
    return calculateItemTotals(qty, price, discountType, discVal);
  }, [quantity, unitPrice, discountType, discountValue]);

  const handleAdd = () => {
    if (!selectedProduct) return;
    const qty = Math.max(1, parseFloat(quantity) || 1);
    const price = Math.max(0, parseFloat(unitPrice) || 0);
    const discVal = Math.max(0, parseFloat(discountValue) || 0);

    const calc = calculateItemTotals(qty, price, discountType, discVal);

    const newItem: QuotationItem = {
      id: 'item_' + generateId().substring(0, 8),
      productId: selectedProduct.id,
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      description: selectedProduct.description,
      quantity: qty,
      unitPrice: price,
      discountType,
      discountValue: discVal,
      discountAmount: calc.discountAmount,
      subtotal: calc.subtotal,
      total: calc.total,
    };

    onAddItem(newItem);

    // Reset selection
    setSelectedProduct(null);
    setQuantity('1');
    setUnitPrice('');
    setDiscountValue('0');
  };

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Package className="w-4 h-4 text-blue-600" />
          <span>Agregar Productos a la Cotización</span>
        </label>

        <button
          type="button"
          onClick={() => setIsQuickModalOpen(true)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nuevo Producto Rápido</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setIsOpenDropdown(true);
            }}
            onFocus={() => setIsOpenDropdown(true)}
            placeholder="Buscar por código SKU, nombre, Hikvision, Dahua..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
          />

          {/* Autocomplete Dropdown */}
          {isOpenDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsOpenDropdown(false)} />
              <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No se encontraron productos coincidentes.
                  </div>
                ) : (
                  filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">[{p.sku}]</span>
                          <span>{p.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {p.brand} {p.model ? `• ${p.model}` : ''} • Stock: {p.stock} {p.unit}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-white text-right shrink-0">
                        {formatCurrency(p.price)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="py-2 px-3 text-sm rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* If product is selected, show line item configuration before adding */}
      {selectedProduct && (
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 mr-2">
                {selectedProduct.sku}
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {selectedProduct.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
            <Input
              label="Cantidad"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
            />

            <Input
              label="P. Unitario ($)"
              type="number"
              step="0.01"
              min="0"
              value={unitPrice}
              onChange={e => setUnitPrice(e.target.value)}
              required
            />

            <Select
              label="Tipo Desc."
              value={discountType}
              onChange={e => setDiscountType(e.target.value as DiscountType)}
            >
              <option value="PERCENTAGE">% Porcentaje</option>
              <option value="FIXED">$ Fijo</option>
            </Select>

            <Input
              label={discountType === 'PERCENTAGE' ? 'Desc. (%)' : 'Desc. ($)'}
              type="number"
              step="0.01"
              min="0"
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
            />

            <div className="col-span-2 sm:col-span-1">
              <Button
                type="button"
                onClick={handleAdd}
                className="w-full"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Agregar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 pt-1">
            <span>Subtotal: {formatCurrency(preview.subtotal)}</span>
            {preview.discountAmount > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                Descuento: -{formatCurrency(preview.discountAmount)}
              </span>
            )}
            <span className="font-bold text-slate-900 dark:text-white">
              Total Línea: {formatCurrency(preview.total)}
            </span>
          </div>
        </div>
      )}

      <QuickProductModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        categories={categories}
        onProductCreated={prod => {
          handleSelectProduct(prod);
        }}
      />
    </div>
  );
};
