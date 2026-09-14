import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Download, 
  Filter, 
  X, 
  Calendar,
  DollarSign,
  ArrowUpDown
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { downloadQuotationPdf } from '../../pdf/quotationPdfGenerator';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Card, CardContent } from '../../components/common/Card';
import { QuotationStatusBadge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export const QuotationsList: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const config = storageService.getConfig();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | QuotationStatus>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');

  // Delete dialog
  const [deletingQuotation, setDeletingQuotation] = useState<Quotation | null>(null);

  const loadQuotations = () => {
    setQuotations(storageService.getQuotations());
  };

  useEffect(() => {
    loadQuotations();
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cotizapro_quotations') {
        loadQuotations();
      }
    };
    window.addEventListener('cotizapro_storage_change', handleStorageChange);
    return () => window.removeEventListener('cotizapro_storage_change', handleStorageChange);
  }, []);

  const filteredQuotations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const min = minValue ? parseFloat(minValue) : null;
    const max = maxValue ? parseFloat(maxValue) : null;

    return quotations.filter(item => {
      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      // Text search
      if (q) {
        const matchNumber = item.number.toLowerCase().includes(q);
        const matchClient = item.clientName.toLowerCase().includes(q);
        const matchId = item.clientIdNumber && item.clientIdNumber.toLowerCase().includes(q);
        if (!matchNumber && !matchClient && !matchId) return false;
      }

      // Date range filter
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;

      // Value range filter
      if (min !== null && !isNaN(min) && item.total < min) return false;
      if (max !== null && !isNaN(max) && item.total > max) return false;

      return true;
    });
  }, [quotations, searchQuery, statusFilter, startDate, endDate, minValue, maxValue]);

  const handleDuplicate = (q: Quotation) => {
    const duplicated = storageService.duplicateQuotation(q.id);
    if (duplicated) {
      success(`Cotización duplicada con éxito como ${duplicated.number}.`);
      loadQuotations();
      navigate(`/cotizaciones/${duplicated.id}`);
    } else {
      showError('Error al duplicar la cotización.');
    }
  };

  const handleDelete = () => {
    if (!deletingQuotation) return;
    storageService.deleteQuotation(deletingQuotation.id);
    success(`Cotización ${deletingQuotation.number} eliminada.`);
    setDeletingQuotation(null);
    loadQuotations();
  };

  const handleStatusChange = (q: Quotation, newStatus: QuotationStatus) => {
    const updated: Quotation = {
      ...q,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveQuotation(updated);
    loadQuotations();
    success(`Estado de ${q.number} cambiado a ${newStatus}.`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setMinValue('');
    setMaxValue('');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'ALL' || startDate || endDate || minValue || maxValue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Cotizaciones Registradas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Administra, filtra, duplica y emite documentos comerciales para tus clientes.
          </p>
        </div>
        <Button onClick={() => navigate('/cotizaciones/nueva')} leftIcon={<Plus className="w-4 h-4" />}>
          Nueva Cotización
        </Button>
      </div>

      {/* Advanced Filters Card */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar número o cliente..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="ENVIADA">Enviada</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ACEPTADA">Aceptada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="VENCIDA">Vencida</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              title="Desde fecha"
              className="w-full py-1.5 px-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
            <span className="text-xs text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              title="Hasta fecha"
              className="w-full py-1.5 px-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
          </div>

          {/* Value range & Reset */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min $"
              value={minValue}
              onChange={e => setMinValue(e.target.value)}
              className="w-1/2 py-2 px-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max $"
              value={maxValue}
              onChange={e => setMaxValue(e.target.value)}
              className="w-1/2 py-2 px-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
            />

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Limpiar filtros"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Quotations Table */}
      {filteredQuotations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No se encontraron cotizaciones
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No hay registros que coincidan con los filtros aplicados.'
                : 'Crea tu primera cotización comercial para un cliente.'}
            </p>
            {!hasActiveFilters && (
              <Button size="sm" onClick={() => navigate('/cotizaciones/nueva')} leftIcon={<Plus className="w-4 h-4" />}>
                Crear Primera Cotización
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
                  <th className="px-5 py-3.5">Número</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Fecha / Vence</th>
                  <th className="px-5 py-3.5 text-center">Ítems</th>
                  <th className="px-5 py-3.5 text-right">Total</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredQuotations.map(q => (
                  <tr 
                    key={q.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Number */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/cotizaciones/${q.id}`)}
                        className="font-mono font-bold text-xs text-blue-600 dark:text-cyan-400 hover:underline"
                      >
                        {q.number}
                      </button>
                    </td>

                    {/* Client */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                        {q.clientName}
                      </div>
                      {q.clientIdNumber && (
                        <div className="text-xs font-mono text-slate-400">
                          {q.clientIdNumber}
                        </div>
                      )}
                    </td>

                    {/* Dates */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                      <div className="text-slate-700 dark:text-slate-300">
                        {formatDate(q.date)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Hasta: {formatDate(q.expirationDate)}
                      </div>
                    </td>

                    {/* Items count */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                      {q.items.length} {q.items.length === 1 ? 'ítem' : 'ítems'}
                    </td>

                    {/* Total */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(q.total)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <select
                        value={q.status}
                        onChange={e => handleStatusChange(q, e.target.value as QuotationStatus)}
                        className="text-xs font-medium py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="BORRADOR">Borrador</option>
                        <option value="ENVIADA">Enviada</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="ACEPTADA">Aceptada</option>
                        <option value="RECHAZADA">Rechazada</option>
                        <option value="VENCIDA">Vencida</option>
                        <option value="CANCELADA">Cancelada</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/cotizaciones/${q.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => downloadQuotationPdf(q, config)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDuplicate(q)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Duplicar cotización"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => navigate(`/cotizaciones/editar/${q.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingQuotation(q)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{filteredQuotations.length} cotizaciones encontradas</span>
            <span>Total listado: {formatCurrency(filteredQuotations.reduce((a, b) => a + b.total, 0))}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingQuotation}
        onClose={() => setDeletingQuotation(null)}
        onConfirm={handleDelete}
        title="Eliminar Cotización"
        message={`¿Estás seguro de que deseas eliminar la cotización ${deletingQuotation?.number} para el cliente "${deletingQuotation?.clientName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};
