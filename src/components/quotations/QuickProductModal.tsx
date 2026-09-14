import React, { useState } from 'react';
import { Product, Category } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { roundMoney } from '../../utils/currency';
import { generateId } from '../../utils/idGenerator';

interface QuickProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onProductCreated: (product: Product) => void;
}

export const QuickProductModal: React.FC<QuickProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  onProductCreated,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [brand, setBrand] = useState('Hikvision');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('10');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { success } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'El nombre es obligatorio.';
    if (!sku.trim()) errs.sku = 'El SKU es obligatorio.';
    else {
      const existing = storageService.getProductBySku(sku.trim());
      if (existing) errs.sku = 'Este SKU ya existe en el catálogo.';
    }

    const p = parseFloat(price);
    if (isNaN(p) || p < 0) errs.price = 'Precio no válido.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newProduct: Product = {
      id: 'prod-' + generateId().substring(0, 8),
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      categoryId: categoryId || categories[0]?.id || 'cat-otros',
      brand: brand.trim(),
      model: model.trim(),
      description: description.trim(),
      price: roundMoney(p),
      cost: roundMoney(parseFloat(cost) || 0),
      stock: parseInt(stock, 10) || 0,
      unit: 'Unidad',
      status: 'ACTIVO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveProduct(newProduct);
    success('Producto creado e insertado en la cotización.');
    onProductCreated(newProduct);
    onClose();

    // Reset
    setSku('');
    setName('');
    setModel('');
    setDescription('');
    setPrice('');
    setCost('');
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Producto Rápido"
      description="Agrega un producto al catálogo e insértalo de inmediato en la cotización."
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Crear y Agregar
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-3.5">
        <Input
          label="Nombre del Producto"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Cámara Domo 5MP Full HD"
          required
          error={errors.name}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="SKU"
            value={sku}
            onChange={e => setSku(e.target.value.toUpperCase())}
            placeholder="CAM-001"
            required
            error={errors.sku}
          />

          <Select
            label="Categoría"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Marca"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder="Hikvision, Dahua..."
          />

          <Input
            label="Modelo"
            value={model}
            onChange={e => setModel(e.target.value)}
            placeholder="DS-XXXX"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Precio Venta ($)"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0.00"
            required
            error={errors.price}
          />

          <Input
            label="Costo ($)"
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={e => setCost(e.target.value)}
            placeholder="0.00"
          />

          <Input
            label="Stock"
            type="number"
            min="0"
            value={stock}
            onChange={e => setStock(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
