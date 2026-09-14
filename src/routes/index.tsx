import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="/" element={<MainLayout />}>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};
