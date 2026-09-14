import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, 
  Save, 
  Download, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  Calendar,
  UserCheck,
  Building2
} from 'lucide-react';
import { 
  Quotation, 
  QuotationItem, 
  Client, 
  Product, 
  Category, 
  DiscountType, 
  QuotationStatus 
} from '../../types';
import { storageService } from '../../services/storageService';
import { calculateQuotationTotals } from '../../services/calculationService';
import { downloadQuotationPdf } from '../../pdf/quotationPdfGenerator';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Card, CardContent } from '../../components/common/Card';
import { ClientSelector } from '../../components/quotations/ClientSelector';
import { ProductSelector } from '../../components/quotations/ProductSelector';
import { QuotationTable } from '../../components/quotations/QuotationTable';
import { QuotationSummary } from '../../components/quotations/QuotationSummary';
import { getTodayInputString, addDays } from '../../utils/date';
import { generateId } from '../../utils/idGenerator';

export const QuotationCreateEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { success, error: showError, warning, info } = useToast();

  const config = useMemo(() => storageService.getConfig(), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Draft notification
  const [hasDraftNotice, setHasDraftNotice] = useState(false);

  // Quotation State
  const [quotationNumber, setQuotationNumber] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [salesperson, setSalesperson] = useState('Asesor Técnico Comercial');
  const [date, setDate] = useState(getTodayInputString());
  const [expirationDate, setExpirationDate] = useState(() => 
    addDays(getTodayInputString(), config.validityDays || 15)
  );
  const [status, setStatus] = useState<QuotationStatus>('PENDIENTE');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(config.defaultTaxPercentage || 15);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(config.termsAndConditions || '');

  // Validation errors
  const [clientError, setClientError] = useState('');

  // Load initial data
  useEffect(() => {
    setProducts(storageService.getProducts());
    setCategories(storageService.getCategories());
    const allClients = storageService.getClients();
    setClients(allClients);

    if (isEditing && id) {
      const existing = storageService.getQuotationById(id);
      if (existing) {
        setQuotationNumber(existing.number);
        const cli = allClients.find(c => c.id === existing.clientId) || {
          id: existing.clientId,
          name: existing.clientName,
          idNumber: existing.clientIdNumber,
          phone: existing.clientPhone,
          email: existing.clientEmail,
          address: existing.clientAddress || '',
          city: '',
          state: '',
          clientType: 'EMPRESA',
          createdAt: existing.createdAt,
        };
        setSelectedClient(cli);
        setSalesperson(existing.salesperson);
        setDate(existing.date);
        setExpirationDate(existing.expirationDate);
        setStatus(existing.status);
        setItems(existing.items);
        setDiscountType(existing.discountType);
        setDiscountValue(existing.discountValue);
        setTaxPercentage(existing.taxPercentage);
        setNotes(existing.notes || '');
        setTerms(existing.termsAndConditions || config.termsAndConditions);
      } else {
        showError('No se encontró la cotización solicitada.');
        navigate('/admin/cotizaciones');
      }
    } else {
      // Nueva cotización: obtener número correlativo
      setQuotationNumber(storageService.getNextNumber());

      // Verificar si hay borrador previo guardado
      const draft = storageService.getDraft();
      if (draft && draft.items && draft.items.length > 0) {
        setHasDraftNotice(true);
      }
    }
  }, [id, isEditing, navigate, showError, config]);

  // Handle draft restore
  const handleRestoreDraft = () => {
    const draft = storageService.getDraft();
    if (!draft) return;

    if (draft.clientId) {
      const cli = clients.find(c => c.id === draft.clientId);
      if (cli) setSelectedClient(cli);
    }
    if (draft.items) setItems(draft.items);
    if (draft.salesperson) setSalesperson(draft.salesperson);
    if (draft.notes) setNotes(draft.notes);
    if (draft.termsAndConditions) setTerms(draft.termsAndConditions);
    if (draft.discountType) setDiscountType(draft.discountType);
    if (draft.discountValue !== undefined) setDiscountValue(draft.discountValue);
    if (draft.taxPercentage !== undefined) setTaxPercentage(draft.taxPercentage);

    setHasDraftNotice(false);
    success('Borrador recuperado.');
  };

  const handleDiscardDraft = () => {
    storageService.clearDraft();
    setHasDraftNotice(false);
    info('Borrador descartado.');
  };

  // Autosave draft only when creating new quotation
  useEffect(() => {
    if (isEditing) return;

    const draftData: Partial<Quotation> = {
      clientId: selectedClient?.id,
      salesperson,
      date,
      expirationDate,
      items,
      discountType,
      discountValue,
      taxPercentage,
      notes,
      termsAndConditions: terms,
    };

    if (items.length > 0 || selectedClient) {
      storageService.saveDraft(draftData);
    }
  }, [isEditing, selectedClient, salesperson, date, expirationDate, items, discountType, discountValue, taxPercentage, notes, terms]);

  // Recalculate totals dynamically
  const totals = useMemo(() => {
    return calculateQuotationTotals(items, discountType, discountValue, taxPercentage);
  }, [items, discountType, discountValue, taxPercentage]);

  // Item table handlers
  const handleAddItem = useCallback((item: QuotationItem) => {
    setItems(prev => [...prev, item]);
    success(`"${item.name}" agregado.`);
  }, [success]);

  const handleUpdateItem = useCallback((index: number, updated: QuotationItem) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Save quotation
  const handleSave = (shouldDownloadPdf = false) => {
    if (!selectedClient) {
      setClientError('Debes seleccionar o registrar un cliente antes de guardar.');
      showError('Por favor selecciona un cliente para la cotización.');
      return;
    }

    if (items.length === 0) {
      showError('No se puede guardar la cotización porque no has agregado productos.');
      return;
    }

    const quotationId = isEditing && id ? id : 'quot-' + generateId().substring(0, 8);

    const quotationData: Quotation = {
      id: quotationId,
      number: quotationNumber || storageService.getNextNumber(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientIdNumber: selectedClient.idNumber || '',
      clientPhone: selectedClient.phone || '',
      clientEmail: selectedClient.email || '',
      clientAddress: selectedClient.address ? `${selectedClient.address}, ${selectedClient.city}` : '',
      date,
      expirationDate,
      salesperson,
      items,
      subtotal: totals.subtotal,
      discountType,
      discountValue,
      discountAmount: totals.discountAmount,
      taxPercentage,
      taxAmount: totals.taxAmount,
      total: totals.total,
      status,
      notes: notes.trim() || undefined,
      termsAndConditions: terms.trim() || undefined,
      createdAt: isEditing ? (storageService.getQuotationById(quotationId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveQuotation(quotationData);
    storageService.clearDraft();

    if (shouldDownloadPdf) {
      downloadQuotationPdf(quotationData, config);
      success('Cotización guardada y PDF descargado.');
    } else {
      success('Cotización guardada exitosamente.');
    }

    navigate(`/admin/cotizaciones/${quotationId}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Draft notice banner */}
      {hasDraftNotice && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                Se encontró un borrador pendiente guardado automáticamente.
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                ¿Deseas restaurar los productos y datos del borrador anterior?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleDiscardDraft}>
              Descartar
            </Button>
            <Button size="sm" variant="primary" onClick={handleRestoreDraft}>
              Continuar borrador
            </Button>
          </div>
        </div>
      )}

      {/* Header with Quotation Number and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/cotizaciones')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Volver a cotizaciones"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditing ? `Editar Cotización` : `Nueva Cotización`}
              </h2>
              <span className="font-mono text-base font-extrabold text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40">
                {quotationNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configura cliente, productos, descuentos y emite una cotización formal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/cotizaciones')}
          >
            Cancelar
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleSave(true)}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Guardar y PDF
          </Button>

          <Button
            variant="primary"
            onClick={() => handleSave(false)}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Guardar Cotización
          </Button>
        </div>
      </div>

      {/* Quotation Metadata Card: Dates, Salesperson, Status */}
      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Fecha de Emisión"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />

          <Input
            label="Válida Hasta"
            type="date"
            value={expirationDate}
            onChange={e => setExpirationDate(e.target.value)}
            required
            helperText={`Vigencia: ${config.validityDays} días predeterminados`}
          />

          <Input
            label="Asesor / Vendedor"
            value={salesperson}
            onChange={e => setSalesperson(e.target.value)}
            placeholder="Nombre del asesor comercial"
          />

          <Select
            label="Estado Inicial"
            value={status}
            onChange={e => setStatus(e.target.value as QuotationStatus)}
          >
            <option value="BORRADOR">Borrador</option>
            <option value="ENVIADA">Enviada</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ACEPTADA">Aceptada</option>
            <option value="RECHAZADA">Rechazada</option>
            <option value="CANCELADA">Cancelada</option>
          </Select>
        </div>
      </Card>

      {/* 1. Client Selector */}
      <Card className="p-5">
        <ClientSelector
          clients={clients}
          selectedClientId={selectedClient?.id || ''}
          onSelectClient={client => {
            setSelectedClient(client);
            setClientError('');
          }}
          onClearClient={() => setSelectedClient(null)}
          error={clientError}
        />
      </Card>

      {/* 2. Product Selector */}
      <ProductSelector
        products={products}
        categories={categories}
        onAddItem={handleAddItem}
      />

      {/* 3. Items Table */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
          Detalle de la Cotización
        </label>
        <QuotationTable
          items={items}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
        />
      </div>

      {/* 4. Quotation Summary: Totals, Discounts, Tax, Terms */}
      <QuotationSummary
        subtotal={totals.subtotal}
        discountType={discountType}
        discountValue={discountValue}
        discountAmount={totals.discountAmount}
        taxableBase={totals.taxableBase}
        taxPercentage={taxPercentage}
        taxAmount={totals.taxAmount}
        total={totals.total}
        onChangeDiscountType={setDiscountType}
        onChangeDiscountValue={setDiscountValue}
        onChangeTaxPercentage={setTaxPercentage}
        notes={notes}
        onChangeNotes={setNotes}
        terms={terms}
        onChangeTerms={setTerms}
      />

      {/* Floating Bottom Action Bar for Mobile & Quick Save */}
      <div className="fixed bottom-0 left-0 right-0 lg:pl-64 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Total Estimado:
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-cyan-400">
            {totals.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleSave(true)}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Guardar & PDF
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => handleSave(false)}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};
