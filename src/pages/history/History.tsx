import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Calendar, ArrowRight, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Quotation, QuotationStatus } from '../../types';
import { Card, CardContent } from '../../components/common/Card';
import { QuotationStatusBadge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatDateLong } from '../../utils/date';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    setQuotations(storageService.getQuotations());
  }, []);

  // Sort quotations descending by date
  const sortedQuotations = useMemo(() => {
    return [...quotations].sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [quotations]);

  const getStatusIcon = (status: QuotationStatus) => {
    switch (status) {
      case 'ACEPTADA':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'PENDIENTE':
      case 'ENVIADA':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'RECHAZADA':
      case 'CANCELADA':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HistoryIcon className="w-6 h-6 text-blue-600" />
          Historial & Auditoría de Operaciones
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Línea de tiempo cronológica de cotizaciones emitidas, estados comerciales y montos acordados.
        </p>
      </div>

      {sortedQuotations.length === 0 ? (
        <Card className="p-8 text-center text-slate-400">
          <CardContent>No existen registros históricos de cotizaciones aún.</CardContent>
        </Card>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {sortedQuotations.map(q => (
            <div key={q.id} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 group-hover:border-blue-500 flex items-center justify-center transition-colors shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              </div>

              {/* Event card */}
              <Card 
                className="hover:border-blue-500/40 cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/admin/cotizaciones/${q.id}`)}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-sm text-blue-600 dark:text-cyan-400">
                        {q.number}
                      </span>
                      <QuotationStatusBadge status={q.status} />
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateLong(q.date)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {q.clientName}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {q.items.length} {q.items.length === 1 ? 'producto cotizado' : 'productos cotizados'} • Asesor: {q.salesperson}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                      <span className="text-lg font-mono font-black text-slate-900 dark:text-white">
                        {formatCurrency(q.total)}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
