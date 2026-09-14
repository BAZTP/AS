import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  Filter, 
  AlertCircle,
  TrendingUp,
  Tag,
  Boxes,
  CheckCircle2,
  XCircle,
  Barcode
} from 'lucide-react';
import { Product, Category } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';
import { formatCurrency, roundMoney } from '../../utils/currency';
import { generateId } from '../../utils/idGenerator';

interface ProductFormData {
  sku: string;
  internalCode: string;
  name: string;
  categoryId: string;
  brand: string;
  model: string;
  description: string;
  price: string;
  cost: string;
  stock: string;
  unit: string;
  status: 'ACTIVO' | 'INACTIVO';
}

const initialForm: ProductFormData = {
  sku: '',
  internalCode: '',
  name: '',
  categoryId: '',
  brand: '',
  model: '',
  description: '',
  price: '',
  cost: '',
  stock: '0',
  unit: 'Unidad',
  status: 'ACTIVO',
};

export const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVO' | 'INACTIVO'>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const { success, error: showError } = useToast();

  const loadData = () => {
    setProducts(storageService.getProducts());
    setCategories(storageService.getCategories());
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cotizapro_products' || customEvent.detail?.key === 'cotizapro_categories') {
        loadData();
      }
    };
    window.addEventListener('cotizapro_storage_change', handleStorageChange);
    return () => window.removeEventListener('cotizapro_storage_change', handleStorageChange);
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p => {
      const matchCategory = !selectedCategory || p.categoryId === selectedCategory;
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      if (!matchCategory || !matchStatus) return false;
      if (!q) return true;

      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.internalCode && p.internalCode.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      ...initialForm,
      categoryId: categories[0]?.id || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      internalCode: prod.internalCode || '',
      name: prod.name,
      categoryId: prod.categoryId,
      brand: prod.brand,
      model: prod.model,
      description: prod.description,
      price: prod.price.toString(),
      cost: prod.cost.toString(),
      stock: prod.stock.toString(),
      unit: prod.unit,
      status: prod.status,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre del producto es obligatorio.';
    }

    if (!formData.sku.trim()) {
      errors.sku = 'El código SKU es obligatorio.';
    } else {
      // Validar que SKU sea único
      const existing = products.find(
        p => p.sku.toLowerCase() === formData.sku.trim().toLowerCase() && p.id !== editingProduct?.id
      );
      if (existing) {
        errors.sku = 'Este SKU ya está en uso por otro producto.';
      }
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Debes seleccionar una categoría.';
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.price = 'El precio debe ser un número válido mayor o igual a 0.';
    }

    const costNum = parseFloat(formData.cost);
    if (isNaN(costNum) || costNum < 0) {
      errors.cost = 'El costo debe ser un número válido mayor o igual a 0.';
    }

    const stockNum = parseInt(formData.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      errors.stock = 'El stock no puede ser negativo.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const price = roundMoney(parseFloat(formData.price) || 0);
    const cost = roundMoney(parseFloat(formData.cost) || 0);
    const stock = parseInt(formData.stock, 10) || 0;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        sku: formData.sku.trim().toUpperCase(),
        internalCode: formData.internalCode.trim() || undefined,
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        description: formData.description.trim(),
        price,
        cost,
        stock,
        unit: formData.unit.trim() || 'Unidad',
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };
      storageService.saveProduct(updated);
      success('Producto actualizado exitosamente.');
    } else {
      const newProduct: Product = {
        id: 'prod-' + generateId().substring(0, 8),
        sku: formData.sku.trim().toUpperCase(),
        internalCode: formData.internalCode.trim() || undefined,
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        description: formData.description.trim(),
        price,
        cost,
        stock,
        unit: formData.unit.trim() || 'Unidad',
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storageService.saveProduct(newProduct);
      success('Producto agregado al catálogo.');
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteProduct = () => {
    if (!deletingProduct) return;
    storageService.deleteProduct(deletingProduct.id);
    success(`Producto "${deletingProduct.name}" eliminado.`);
    setDeletingProduct(null);
    loadData();
  };

  // Profit margin calculation in form
  const currentMargin = useMemo(() => {
    const p = parseFloat(formData.price) || 0;
    const c = parseFloat(formData.cost) || 0;
    if (p <= 0) return 0;
    return roundMoney(((p - c) / p) * 100);
  }, [formData.price, formData.cost]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Catálogo de Productos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Administra tus cámaras, DVRs, discos, cableado y accesorios de seguridad electrónica.
          </p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Nuevo Producto
        </Button>
      </div>

      {/* Filter / Search Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, SKU, marca (Hikvision, Dahua...), modelo..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Todas las categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVO">Solo Activos</option>
              <option value="INACTIVO">Solo Inactivos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No existen productos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory || statusFilter !== 'ALL'
                ? 'No se encontraron coincidencias con los filtros aplicados.'
                : 'Comienza agregando tu primer producto al inventario.'}
            </p>
            {!searchQuery && !selectedCategory && statusFilter === 'ALL' && (
              <Button size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
                Agregar Producto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">SKU / Código</th>
                  <th className="px-5 py-3.5">Producto & Marca</th>
                  <th className="px-5 py-3.5">Categoría</th>
                  <th className="px-5 py-3.5 text-right">Precio Venta</th>
                  <th className="px-5 py-3.5 text-right">Costo</th>
                  <th className="px-5 py-3.5 text-center">Stock</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map(prod => {
                  const catName = categoryMap.get(prod.categoryId) || 'Sin categoría';
                  const margin = prod.price > 0 ? roundMoney(((prod.price - prod.cost) / prod.price) * 100) : 0;

                  return (
                    <tr 
                      key={prod.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* SKU */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {prod.sku}
                        </div>
                        {prod.internalCode && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            {prod.internalCode}
                          </div>
                        )}
                      </td>

                      {/* Product Name & Brand */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {prod.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {prod.brand && <span className="font-medium text-slate-500 dark:text-slate-400">{prod.brand}</span>}
                          {prod.brand && prod.model && <span>•</span>}
                          {prod.model && <span>{prod.model}</span>}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Badge variant="primary" size="sm">
                          {catName}
                        </Badge>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(prod.price)}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {margin}% margen
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {formatCurrency(prod.cost)}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${
                            prod.stock <= 0
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                              : prod.stock <= 5
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                              : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {prod.stock} {prod.unit}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        {prod.status === 'ACTIVO' ? (
                          <Badge variant="success" size="sm">Activo</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Inactivo</Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Editar producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Mostrando {filteredProducts.length} de {products.length} productos registrados</span>
            <span>Precios con formato monetario seguro en USD</span>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        description="Ingresa los datos técnicos, precios y existencia del producto."
        maxWidth="2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {/* Row 1: Nombre */}
          <Input
            label="Nombre del Producto"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Cámara Tubular Hikvision 5MP EXIR 20m"
            required
            error={formErrors.name}
            autoFocus
          />

          {/* Row 2: SKU, Código Interno y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Código SKU"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              placeholder="Ej: HIK-B5MP-01"
              required
              error={formErrors.sku}
              helperText="Identificador único del producto"
            />

            <Input
              label="Código Interno (Opcional)"
              value={formData.internalCode}
              onChange={e => setFormData({ ...formData, internalCode: e.target.value })}
              placeholder="Ej: CAM-001"
            />

            <Select
              label="Categoría"
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              required
              error={formErrors.categoryId}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Row 3: Marca, Modelo y Unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Marca"
              value={formData.brand}
              onChange={e => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Ej: Hikvision, Dahua, WD"
            />

            <Input
              label="Modelo"
              value={formData.model}
              onChange={e => setFormData({ ...formData, model: e.target.value })}
              placeholder="Ej: DS-2CE16H0T-ITPF"
            />

            <Select
              label="Unidad de Medida"
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
            >
              <option value="Unidad">Unidad</option>
              <option value="Metro">Metro</option>
              <option value="Kit">Kit</option>
              <option value="Rollo">Rollo (Bobina)</option>
              <option value="Par">Par</option>
              <option value="Juego">Juego</option>
              <option value="Caja">Caja</option>
            </Select>
          </div>

          {/* Row 4: Precios, Costo y Margen */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <Input
              label="Precio Venta ($)"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
              error={formErrors.price}
            />

            <Input
              label="Costo Adquisición ($)"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={e => setFormData({ ...formData, cost: e.target.value })}
              placeholder="0.00"
              error={formErrors.cost}
            />

            <Input
              label="Stock / Existencia"
              type="number"
              min="0"
              value={formData.stock}
              onChange={e => setFormData({ ...formData, stock: e.target.value })}
              required
              error={formErrors.stock}
            />

            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Margen Estimado
              </span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {currentMargin}%
              </div>
              <span className="text-[10px] text-slate-400">Sobre precio de venta</span>
            </div>
          </div>

          {/* Row 5: Estado */}
          <div className="flex items-center gap-4 pt-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Estado del Producto:
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="radio"
                name="status"
                value="ACTIVO"
                checked={formData.status === 'ACTIVO'}
                onChange={() => setFormData({ ...formData, status: 'ACTIVO' })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-800 dark:text-slate-200">Activo (Visible en cotizador)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="radio"
                name="status"
                value="INACTIVO"
                checked={formData.status === 'INACTIVO'}
                onChange={() => setFormData({ ...formData, status: 'INACTIVO' })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-800 dark:text-slate-200">Inactivo</span>
            </label>
          </div>

          {/* Row 6: Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Descripción Técnica y Especificaciones
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Detalles que aparecerán en la cotización: resolución, lente, visión nocturna, etc."
              className="w-full rounded-xl text-sm p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
        title="Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar el producto "${deletingProduct?.name}" (SKU: ${deletingProduct?.sku})? Esta acción no se puede revertir.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};
