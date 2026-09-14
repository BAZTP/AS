import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Plus, Globe, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { storageService } from '../../services/storageService';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const config = storageService.getConfig();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'Dashboard Principal';
    if (path === '/admin/cotizaciones') return 'Gestión de Cotizaciones';
    if (path === '/admin/cotizaciones/nueva') return 'Generador de Cotización';
    if (path.startsWith('/admin/cotizaciones/editar')) return 'Editar Cotización';
    if (path.startsWith('/admin/cotizaciones/')) return 'Detalle de Cotización';
    if (path === '/admin/productos') return 'Catálogo de Productos & Costos';
    if (path === '/admin/clientes') return 'Directorio de Clientes';
    if (path === '/admin/categorias') return 'Categorías de Productos';
    if (path === '/admin/historial') return 'Historial & Auditoría';
    if (path === '/admin/configuracion') return 'Configuración del Negocio';
    return 'Panel de Administración';
  };

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {config.name} • Modo Administrador
          </p>
        </div>
      </div>

      {/* Right side: Public Catalog Link, New Quote & Theme toggle */}
      <div className="flex items-center gap-2.5">
        {/* Button to view Public Customer Catalog */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/')}
          leftIcon={<Globe className="w-4 h-4 text-blue-500" />}
          className="hidden sm:inline-flex"
          title="Ver cómo ven los clientes el catálogo online"
        >
          Ver Catálogo Clientes
        </Button>

        {location.pathname !== '/admin/cotizaciones/nueva' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/admin/cotizaciones/nueva')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="hidden sm:inline-flex shadow-sm"
          >
            Nueva Cotización
          </Button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Alternar tema visual"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};
