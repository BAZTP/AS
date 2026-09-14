import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Tags, Package, Search } from 'lucide-react';
import { Category } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { generateId } from '../../utils/idGenerator';
import { formatDate } from '../../utils/date';

export const CategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const { success, error: showError, warning } = useToast();

  const loadCategories = () => {
    setCategories(storageService.getCategories());
  };

  useEffect(() => {
    loadCategories();
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cotizapro_categories' || customEvent.detail?.key === 'cotizapro_products') {
        loadCategories();
      }
    };
    window.addEventListener('cotizapro_storage_change', handleStorageChange);
    return () => window.removeEventListener('cotizapro_storage_change', handleStorageChange);
  }, []);

  // Product counts per category
  const productCounts = useMemo(() => {
    const products = storageService.getProducts();
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });
    return counts;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      c => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('El nombre de la categoría es obligatorio.');
      return;
    }

    // Check duplicate name
    const duplicate = categories.find(
      c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== editingCategory?.id
    );
    if (duplicate) {
      setFormError('Ya existe una categoría con este nombre.');
      return;
    }

    if (editingCategory) {
      const updated: Category = {
        ...editingCategory,
        name: name.trim(),
        description: description.trim() || undefined,
      };
      storageService.saveCategory(updated);
      success('Categoría actualizada exitosamente.');
    } else {
      const newCat: Category = {
        id: 'cat-' + generateId().substring(0, 8),
        name: name.trim(),
        description: description.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      storageService.saveCategory(newCat);
      success('Categoría creada exitosamente.');
    }

    setIsModalOpen(false);
    loadCategories();
  };

  const handleDeleteCategory = () => {
    if (!deletingCategory) return;
    const count = productCounts[deletingCategory.id] || 0;
    if (count > 0) {
      warning(`No se puede eliminar la categoría porque tiene ${count} productos asociados.`);
      setDeletingCategory(null);
      return;
    }

    storageService.deleteCategory(deletingCategory.id);
    success('Categoría eliminada.');
    setDeletingCategory(null);
    loadCategories();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tags className="w-6 h-6 text-blue-600" />
            Categorías de Productos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organiza tu catálogo de videovigilancia, redes y equipos tecnológicos.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Nueva Categoría
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar categoría..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
        />
      </div>

      {/* Grid of Categories */}
      {filteredCategories.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Tags className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No se encontraron categorías
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Intenta con otro término de búsqueda.'
                : 'Crea tu primera categoría para organizar los productos.'}
            </p>
            {!searchQuery && (
              <Button size="sm" onClick={handleOpenCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
                Crear Categoría
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(cat => {
            const count = productCounts[cat.id] || 0;
            return (
              <Card key={cat.id} className="flex flex-col justify-between hover:border-blue-500/40">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Tags className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar categoría"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                      {cat.description || 'Sin descripción adicional.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>{count} {count === 1 ? 'producto' : 'productos'}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {formatDate(cat.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        description="Define el nombre y la descripción descriptiva de la categoría."
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Nombre de la categoría"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setFormError('');
            }}
            placeholder="Ej: Cámaras IP, DVR, Discos Duros"
            required
            error={formError}
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Descripción (Opcional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Breve descripción del tipo de productos agrupados..."
              className="w-full rounded-xl text-sm p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${deletingCategory?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};
