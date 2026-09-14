import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  Package, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  DollarSign, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Quotation, Product, Client } from '../types';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { QuotationStatusBadge } from '../components/common/Badge';
import { MonthlyQuotesChart } from '../components/charts/MonthlyQuotesChart';
import { StatusPieChart } from '../components/charts/StatusPieChart';
import { TopProductsChart } from '../components/charts/TopProductsChart';
import { formatCurrency, roundMoney } from '../utils/currency';
import { formatDate } from '../utils/date';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const loadData = () => {
    setQuotations(storageService.getQuotations());
    setProducts(storageService.getProducts());
    setClients(storageService.getClients());
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener('cotizapro_storage_change', handleStorageChange);
    return () => window.removeEventListener('cotizapro_storage_change', handleStorageChange);
  }, []);

  // --- KPI Computations ---
  const stats = useMemo(() => {
    const total = quotations.length;
    const currentYearMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

    const thisMonthQuotes = quotations.filter(q => q.date.startsWith(currentYearMonth));
    const pendingQuotes = quotations.filter(q => q.status === 'PENDIENTE' || q.status === 'ENVIADA');
    const acceptedQuotes = quotations.filter(q => q.status === 'ACEPTADA');
    const rejectedQuotes = quotations.filter(q => q.status === 'RECHAZADA');

    const totalValue = roundMoney(quotations.reduce((acc, q) => acc + q.total, 0));
    const potentialSales = roundMoney(pendingQuotes.reduce((acc, q) => acc + q.total, 0));
    const closedSales = roundMoney(acceptedQuotes.reduce((acc, q) => acc + q.total, 0));

    const conversionRate = total > 0 ? roundMoney((acceptedQuotes.length / total) * 100) : 0;
    const averageTicket = total > 0 ? roundMoney(totalValue / total) : 0;

    return {
      total,
      thisMonthCount: thisMonthQuotes.length,
      pendingCount: pendingQuotes.length,
      acceptedCount: acceptedQuotes.length,
      rejectedCount: rejectedQuotes.length,
      totalValue,
      potentialSales,
      closedSales,
      conversionRate,
      averageTicket,
    };
  }, [quotations]);

  // --- Monthly Data for Recharts ---
  const monthlyData = useMemo(() => {
    const monthMap: Record<string, { total: number; count: number }> = {};
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Initialize last 6 months or current year
    quotations.forEach(q => {
      if (!q.date) return;
      const parts = q.date.split('-');
      if (parts.length >= 2) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        const key = `${months[monthIndex]} ${parts[0].substring(2)}`;
        if (!monthMap[key]) {
          monthMap[key] = { total: 0, count: 0 };
        }
        monthMap[key].total = roundMoney(monthMap[key].total + q.total);
        monthMap[key].count += 1;
      }
    });

    return Object.entries(monthMap).map(([month, val]) => ({
      month,
      total: val.total,
      count: val.count,
    }));
  }, [quotations]);

  // --- Status Distribution Data for Pie Chart ---
  const statusPieData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      ACEPTADA: 0,
      PENDIENTE: 0,
      ENVIADA: 0,
      BORRADOR: 0,
      RECHAZADA: 0,
      VENCIDA: 0,
      CANCELADA: 0,
    };

    quotations.forEach(q => {
      statusCounts[q.status] = (statusCounts[q.status] || 0) + 1;
    });

    return [
      { name: 'Aceptadas', value: statusCounts.ACEPTADA, color: '#10b981' },
      { name: 'Pendientes', value: statusCounts.PENDIENTE, color: '#f59e0b' },
      { name: 'Enviadas', value: statusCounts.ENVIADA, color: '#0ea5e9' },
      { name: 'Borradores', value: statusCounts.BORRADOR, color: '#64748b' },
      { name: 'Rechazadas', value: statusCounts.RECHAZADA, color: '#f43f5e' },
      { name: 'Vencidas', value: statusCounts.VENCIDA, color: '#a855f7' },
    ];
  }, [quotations]);

  // --- Top Products Data ---
  const topProductsData = useMemo(() => {
    const productQuantities: Record<string, number> = {};

    quotations.forEach(q => {
      q.items.forEach(item => {
        const name = item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name;
        productQuantities[name] = (productQuantities[name] || 0) + item.quantity;
      });
    });

    return Object.entries(productQuantities)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [quotations]);

  // --- Recent Activity (Last 5 quotations) ---
  const recentQuotations = useMemo(() => {
    return [...quotations].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 5);
  }, [quotations]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            Panel de Inteligencia Comercial
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Métricas clave de cotizaciones, productos de seguridad electrónica y ventas proyectadas.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/cotizaciones/nueva')} leftIcon={<Plus className="w-4 h-4" />}>
          Nueva Cotización
        </Button>
      </div>

      {/* KPI Cards Grid (Requirement #5 & #38) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cotizaciones */}
        <Card className="hover:border-blue-500/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Total Cotizaciones
              </p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {stats.total}
              </h3>
              <p className="text-[11px] text-blue-600 dark:text-cyan-400 mt-0.5">
                {stats.thisMonthCount} este mes
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Valor Total Cotizado */}
        <Card className="hover:border-blue-500/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Valor Total Cotizado
              </p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 truncate">
                {formatCurrency(stats.totalValue)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ticket prom: {formatCurrency(stats.averageTicket)}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Ventas Potenciales (Pendientes) */}
        <Card className="hover:border-amber-500/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Ventas Potenciales
              </p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 truncate">
                {formatCurrency(stats.potentialSales)}
              </h3>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                {stats.pendingCount} cotizaciones pendientes
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Tasa de Aceptación */}
        <Card className="hover:border-purple-500/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Tasa de Conversión
              </p>
              <h3 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.conversionRate}%
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                {stats.acceptedCount} aceptadas • {formatCurrency(stats.closedSales)}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Counters (Catálogo & Clientes) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-500" />
          <div>
            <span className="text-[11px] text-slate-400 block">Productos Registrados</span>
            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{products.length}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-500" />
          <div>
            <span className="text-[11px] text-slate-400 block">Clientes en Directorio</span>
            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{clients.length}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div>
            <span className="text-[11px] text-slate-400 block">Cotizaciones Aceptadas</span>
            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{stats.acceptedCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-rose-500" />
          <div>
            <span className="text-[11px] text-slate-400 block">Cotizaciones Rechazadas</span>
            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{stats.rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Quotes Value BarChart */}
        <Card className="lg:col-span-8">
          <CardHeader
            title="Monto Cotizado por Mes"
            subtitle="Evolución en dólares del valor total de cotizaciones emitidas"
          />
          <CardContent className="pt-2">
            <MonthlyQuotesChart data={monthlyData} />
          </CardContent>
        </Card>

        {/* Status Donut Chart */}
        <Card className="lg:col-span-4">
          <CardHeader
            title="Distribución por Estado"
            subtitle="Proporción de cotizaciones aceptadas, pendientes y vencidas"
          />
          <CardContent className="pt-2">
            <StatusPieChart data={statusPieData} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Top Products & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Products */}
        <Card className="lg:col-span-6">
          <CardHeader
            title="Productos Más Cotizados"
            subtitle="Equipos de CCTV, grabadores y suministros con mayor demanda"
          />
          <CardContent className="pt-2">
            <TopProductsChart data={topProductsData} />
          </CardContent>
        </Card>

        {/* Recent Activity (Requirement #5) */}
        <Card className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <CardHeader
              title="Actividad Reciente"
              subtitle="Últimas cotizaciones generadas en el sistema"
              action={
                <button
                  onClick={() => navigate('/admin/cotizaciones')}
                  className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Ver todas</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              }
            />
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentQuotations.map(q => (
                <div
                  key={q.id}
                  onClick={() => navigate(`/admin/cotizaciones/${q.id}`)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">
                        {q.number}
                      </span>
                      <span className="text-xs text-slate-400">• {formatDate(q.date)}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {q.clientName}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {formatCurrency(q.total)}
                    </div>
                    <div className="mt-0.5">
                      <QuotationStatusBadge status={q.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 text-center">
            Persistencia local automática en el navegador (Local-First)
          </div>
        </Card>
      </div>
    </div>
  );
};
