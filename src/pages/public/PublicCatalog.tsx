import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  ShoppingCart, 
  Lock, 
  Phone, 
  MessageSquare, 
  Sun, 
  Moon, 
  Check, 
  Plus, 
  Minus, 
  Package, 
  CheckCircle2, 
  Truck, 
  Shield, 
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Product, Category } from '../../types';
import { storageService } from '../../services/storageService';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { PublicQuoteCartModal, CartItem } from '../../components/public/PublicQuoteCartModal';
import { formatCurrency } from '../../utils/currency';

export const PublicCatalog: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { success } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Local quantity buffer per product for the cards
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>({});

  const config = storageService.getConfig();

  useEffect(() => {
    storageService.initializeDefaultDataIfNeeded();
    setProducts(storageService.getProducts());
    setCategories(storageService.getCategories());
  }, []);

  // Filter products: only ACTIVO products in public catalog
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p => {
      if (p.status !== 'ACTIVO') return false;
      const matchCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, selectedCategory, searchQuery]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.quantity, 0);
  }, [cart]);

  const totalCartValue = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    const qty = cardQuantities[product.id] || 1;
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += qty;
        return updated;
      }
      return [...prev, { product, quantity: qty }];
    });
    setCardQuantities(prev => ({ ...prev, [product.id]: 1 }));
    success(`${qty}x "${product.name}" agregado a tu cotización.`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const safeQty = Math.max(1, quantity);
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: safeQty } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const changeCardQty = (productId: string, delta: number) => {
    setCardQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* 1. Public Store Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {config.name || 'COTIZAPRO'}
              </span>
              <p className="text-[10px] text-slate-400 font-medium">
                Catálogo de Seguridad Electrónica & Tecnología
              </p>
            </div>
          </div>

          {/* Right Side: Contact, Theme, Cart & Admin Access */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp direct contact */}
            {config.whatsapp && (
              <a
                href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Asesor WhatsApp</span>
              </a>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Quote Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Mi Cotización</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-blue-600 font-bold text-[11px] flex items-center justify-center font-mono">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Admin Switcher Button */}
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 text-xs font-semibold transition-colors"
              title="Ir al panel administrativo interno"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Banner */}
      <section className="bg-gradient-to-b from-blue-50/50 via-slate-50 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/60 dark:border-slate-800/60 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Equipos 100% Originales con 1 Año de Garantía</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-3xl mx-auto">
            Cotiza en Línea Equipos de <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Seguridad Electrónica & CCTV</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Selecciona cámaras, grabadores DVR/NVR, discos de videovigilancia y cableado. Descarga tu proforma al instante o envíala a nuestros asesores por WhatsApp.
          </p>

          {/* Quick Value Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Precios con IVA Desglosado (15%)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="w-4 h-4 text-blue-500" />
              Envíos a todo el Ecuador
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Award className="w-4 h-4 text-amber-500" />
              Hikvision • Dahua • Western Digital
            </span>
          </div>
        </div>
      </section>

      {/* 3. Catalog Main Content: Filters & Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Search & Category Tabs */}
        <div className="space-y-4">
          {/* Live Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar cámara, DVR, disco 1TB, cable UTP, switch PoE..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Category Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Todos los Equipos
            </button>

            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === c.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No se encontraron equipos
            </h3>
            <p className="text-xs text-slate-500">
              Prueba con otro término de búsqueda o selecciona otra categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map(prod => {
              const qty = cardQuantities[prod.id] || 1;

              return (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between hover:shadow-lg hover:border-blue-500/40 transition-all duration-200 group"
                >
                  <div className="space-y-2.5">
                    {/* Top Tag: Brand & SKU */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                        {prod.brand || 'Seguridad'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {prod.sku}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[40px] group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {prod.name}
                    </h3>

                    {/* Model & Specs Snippet */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed min-h-[48px]">
                      {prod.description}
                    </p>

                    {/* Stock indicator */}
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Disponible en inventario</span>
                    </div>
                  </div>

                  {/* Pricing & Add to Quote Action */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Precio PVP
                        </span>
                        <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
                          {formatCurrency(prod.price)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">por {prod.unit}</span>
                    </div>

                    {/* Quantity Stepper & Add Button */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <button
                          type="button"
                          onClick={() => changeCardQty(prod.id, -1)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          title="Menos"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono font-bold text-xs">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeCardQty(prod.id, 1)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          title="Más"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(prod)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cotizar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. Floating Cart Badge for Mobile & Quick Access */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-2xl shadow-blue-600/40 transition-transform active:scale-95 border-2 border-white/20"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Ver Cotización ({totalCartCount})</span>
            <span className="font-mono bg-blue-800/80 px-2 py-0.5 rounded-full text-xs">
              {formatCurrency(totalCartValue)}
            </span>
          </button>
        </div>
      )}

      {/* 5. Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">{config.name}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              RUC: {config.taxId} • {config.address}, {config.city} • Tel: {config.phone}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Panel de Administración Interno</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Carrito de Cotización del Cliente */}
      <PublicQuoteCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
};
