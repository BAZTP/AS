import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Share2, 
  Mail, 
  Copy, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Phone, 
  MessageSquare,
  ShieldCheck,
  Calendar,
  Building2,
  User,
  AlertTriangle
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { downloadQuotationPdf } from '../../pdf/quotationPdfGenerator';
import { getWhatsAppShareUrl, getEmailShareUrl } from '../../services/shareService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { QuotationStatusBadge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../utils/currency';
import { formatDate, isExpired } from '../../utils/date';

export const QuotationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const config = storageService.getConfig();

  useEffect(() => {
    if (!id) return;
    const q = storageService.getQuotationById(id);
    if (q) {
      setQuotation(q);
    } else {
      showError('Cotización no encontrada.');
      navigate('/admin/cotizaciones');
    }
  }, [id, navigate, showError]);

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Cargando cotización...</p>
      </div>
    );
  }

  const handleStatusChange = (newStatus: QuotationStatus) => {
    const updated: Quotation = {
      ...quotation,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveQuotation(updated);
    setQuotation(updated);
    success(`Estado actualizado a ${newStatus}.`);
  };

  const handleDuplicate = () => {
    const duplicated = storageService.duplicateQuotation(quotation.id);
    if (duplicated) {
      success(`Cotización duplicada con éxito como ${duplicated.number}.`);
      navigate(`/admin/cotizaciones/${duplicated.id}`);
    } else {
      showError('Error al duplicar la cotización.');
    }
  };

  const handleDelete = () => {
    storageService.deleteQuotation(quotation.id);
    success(`Cotización ${quotation.number} eliminada.`);
    navigate('/admin/cotizaciones');
  };

  const handleDownloadPdf = () => {
    downloadQuotationPdf(quotation, config);
    success('Documento PDF generado y descargado.');
  };

  const handleWhatsApp = () => {
    const url = getWhatsAppShareUrl(quotation, config);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    const url = getEmailShareUrl(quotation, config);
    window.location.href = url;
  };

  const handlePrint = () => {
    window.print();
  };

  const expired = isExpired(quotation.expirationDate);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Bar - Hidden in print */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/cotizaciones')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {quotation.number}
              </h2>
              <QuotationStatusBadge status={quotation.status} />
              {expired && quotation.status !== 'ACEPTADA' && quotation.status !== 'VENCIDA' && (
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">
                  Vencida
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Emitida el {formatDate(quotation.date)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick status selector */}
          <select
            value={quotation.status}
            onChange={e => handleStatusChange(e.target.value as QuotationStatus)}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            title="Cambiar estado"
          >
            <option value="BORRADOR">Borrador</option>
            <option value="ENVIADA">Enviada</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ACEPTADA">Aceptada</option>
            <option value="RECHAZADA">Rechazada</option>
            <option value="VENCIDA">Vencida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          {/* WhatsApp */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleWhatsApp}
            leftIcon={<MessageSquare className="w-4 h-4 text-emerald-500" />}
            title="Enviar por WhatsApp"
          >
            WhatsApp
          </Button>

          {/* Email */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleEmail}
            leftIcon={<Mail className="w-4 h-4 text-blue-500" />}
            title="Enviar por correo"
          >
            Correo
          </Button>

          {/* PDF */}
          <Button
            size="sm"
            variant="primary"
            onClick={handleDownloadPdf}
            leftIcon={<Download className="w-4 h-4" />}
          >
            PDF
          </Button>

          {/* Print */}
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            title="Imprimir"
          >
            Imprimir
          </Button>

          {/* Duplicate */}
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDuplicate}
            leftIcon={<Copy className="w-4 h-4" />}
            title="Duplicar cotización"
          >
            Duplicar
          </Button>

          {/* Edit */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/admin/cotizaciones/editar/${quotation.id}`)}
            leftIcon={<Edit className="w-4 h-4" />}
            title="Editar cotización"
          >
            Editar
          </Button>

          {/* Delete */}
          <button
            onClick={() => setIsDeleting(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Quotation Sheet (Print-ready document) */}
      <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-blue-900">
                  {config.name}
                </h1>
                <p className="text-xs font-semibold text-slate-500">
                  RUC: {config.taxId}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 mt-3 space-y-0.5">
              <p>{config.address} • {config.city}, {config.state}</p>
              <p>Teléfonos: {config.phone} | Correo: {config.email}</p>
              {config.website && <p>Web: {config.website}</p>}
            </div>
          </div>

          {/* Document ID Card Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-right space-y-1 min-w-[220px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              COTIZACIÓN COMERCIAL
            </span>
            <div className="text-xl font-mono font-black text-blue-600">
              {quotation.number}
            </div>
            <div className="text-xs text-slate-600 space-y-0.5 pt-1">
              <p><span className="font-semibold">Fecha:</span> {formatDate(quotation.date)}</p>
              <p><span className="font-semibold">Vence:</span> {formatDate(quotation.expirationDate)}</p>
              <p><span className="font-semibold">Asesor:</span> {quotation.salesperson}</p>
            </div>
          </div>
        </div>

        {/* Client Block */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
              Cliente / Destinatario:
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              {quotation.clientName}
            </h3>
            {quotation.clientIdNumber && (
              <p className="font-mono text-slate-600 mt-0.5">
                RUC / C.I: {quotation.clientIdNumber}
              </p>
            )}
            {quotation.clientAddress && (
              <p className="text-slate-600 mt-0.5">
                Dirección: {quotation.clientAddress}
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
              Información de Contacto:
            </span>
            <p className="text-slate-700 font-medium">
              Teléfono: {quotation.clientPhone}
            </p>
            {quotation.clientEmail && (
              <p className="text-slate-700">
                Correo: {quotation.clientEmail}
              </p>
            )}
            <div className="mt-2">
              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">
                Estado: {quotation.status}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Descripción de Equipos y Suministros</th>
                <th className="px-4 py-3 text-center">Cant.</th>
                <th className="px-4 py-3 text-right">P. Unitario</th>
                <th className="px-4 py-3 text-right">Descuento</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotation.items.map((item, i) => (
                <tr key={item.id || i} className={i % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                  <td className="px-4 py-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    {item.description && (
                      <div className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-700">
                    {item.discountAmount > 0 ? `-${formatCurrency(item.discountAmount)}` : '$0.00'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Commercial Terms Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          {/* Terms */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Condiciones Comerciales y Garantía:
              </h4>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-mono">
                {quotation.termsAndConditions || config.termsAndConditions}
              </p>
            </div>

            {quotation.notes && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="text-xs font-bold text-slate-700">
                  Observaciones:
                </h4>
                <p className="text-xs text-slate-600 italic">
                  "{quotation.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Totals Box */}
          <div className="md:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Productos:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(quotation.subtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Descuento General:</span>
              <span className="font-mono text-amber-700">
                {quotation.discountAmount > 0 ? `-${formatCurrency(quotation.discountAmount)}` : '$0.00'}
              </span>
            </div>

            <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
              <span>Base Imponible:</span>
              <span className="font-mono font-medium text-slate-900">
                {formatCurrency(quotation.subtotal - quotation.discountAmount)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>IVA ({quotation.taxPercentage}%):</span>
              <span className="font-mono font-medium text-slate-900">{formatCurrency(quotation.taxAmount)}</span>
            </div>

            <div className="pt-2 border-t-2 border-slate-300">
              <div className="p-3 rounded-lg bg-blue-600 text-white flex justify-between items-center shadow-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold block">
                    TOTAL GENERAL
                  </span>
                  <span className="text-[9px] text-blue-100">Dólares Americanos (USD)</span>
                </div>
                <span className="text-xl font-mono font-black">
                  {formatCurrency(quotation.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{config.thankYouMessage || '¡Gracias por su preferencia!'}</p>
          <div className="text-right">
            <p className="font-semibold text-slate-700">{config.name}</p>
            <p className="text-[11px]">Sistema Profesional de Cotizaciones COTIZAPRO</p>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Eliminar Cotización"
        message={`¿Estás seguro de que deseas eliminar permanentemente la cotización ${quotation.number}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Cotización"
        variant="danger"
      />
    </div>
  );
};
