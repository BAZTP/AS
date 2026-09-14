import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicCatalog } from '../pages/public/PublicCatalog';
import { MainLayout } from '../components/layout/MainLayout';
import { Dashboard } from '../pages/Dashboard';
import { ProductsList } from '../pages/products/ProductsList';
import { ClientsList } from '../pages/clients/ClientsList';
import { CategoriesList } from '../pages/categories/CategoriesList';
import { QuotationsList } from '../pages/quotations/QuotationsList';
import { QuotationCreateEdit } from '../pages/quotations/QuotationCreateEdit';
import { QuotationDetail } from '../pages/quotations/QuotationDetail';
import { History } from '../pages/history/History';
import { Settings } from '../pages/settings/Settings';

export const AppRoutes: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* 🌐 Portal Público de Clientes (Catálogo & Cotizador en línea) */}
        <Route path="/" element={<PublicCatalog />} />
        <Route path="/catalogo" element={<PublicCatalog />} />

        {/* 🛡️ Panel de Administración Interno */}
        <Route path="/admin" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="cotizaciones" element={<QuotationsList />} />
          <Route path="cotizaciones/nueva" element={<QuotationCreateEdit />} />
          <Route path="cotizaciones/editar/:id" element={<QuotationCreateEdit />} />
          <Route path="cotizaciones/:id" element={<QuotationDetail />} />
          <Route path="productos" element={<ProductsList />} />
          <Route path="clientes" element={<ClientsList />} />
          <Route path="categorias" element={<CategoriesList />} />
          <Route path="historial" element={<History />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>

        {/* Redirecciones de conveniencia */}
        <Route path="/cotizaciones" element={<Navigate to="/admin/cotizaciones" replace />} />
        <Route path="/cotizaciones/nueva" element={<Navigate to="/admin/cotizaciones/nueva" replace />} />
        <Route path="/productos" element={<Navigate to="/admin/productos" replace />} />
        <Route path="/clientes" element={<Navigate to="/admin/clientes" replace />} />
        <Route path="/categorias" element={<Navigate to="/admin/categorias" replace />} />
        <Route path="/historial" element={<Navigate to="/admin/historial" replace />} />
        <Route path="/configuracion" element={<Navigate to="/admin/configuracion" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};
