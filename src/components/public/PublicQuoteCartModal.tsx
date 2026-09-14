import React, { useState, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  Download, 
  MessageSquare, 
  CheckCircle, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import { Product, Quotation, QuotationItem, Client } from '../../types';
import { storageService } from '../../services/storageService';
import { calculateQuotationTotals } from '../../services/calculationService';
import { downloadQuotationPdf } from '../../pdf/quotationPdfGenerator';
import { formatCurrency, roundMoney } from '../../utils/currency';
import { getTodayInputString, addDays } from '../../utils/date';
import { generateId } from '../../utils/idGenerator';
import { validatePhone, validateEmail } from '../../utils/validators';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface PublicQuoteCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const PublicQuoteCartModal: React.FC<PublicQuoteCartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const config = storageService.getConfig();

  // Client form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCity, setClientCity] = useState('Quito');
  const [clientNotes, setClientNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastQuotation, setLastQuotation] = useState<Quotation | null>(null);

  // Convert cart to QuotationItems
  const quotationItems: QuotationItem[] = useMemo(() => {
    return cartItems.map(item => {
      const subtotal = roundMoney(item.product.price * item.quantity);
      return {
        id: 'item_' + item.product.id,
        productId: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        description: item.product.description,
        quantity: item.quantity,
        unitPrice: item.product.price,
        discountType: 'PERCENTAGE',
        discountValue: 0,
        discountAmount: 0,
        subtotal,
        total: subtotal,
      };
    });
  }, [cartItems]);

  const totals = useMemo(() => {
    return calculateQuotationTotals(quotationItems, 'PERCENTAGE', 0, config.defaultTaxPercentage || 15);
  }, [quotationItems, config.defaultTaxPercentage]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!clientName.trim()) errs.name = 'Por favor ingresa tu nombre o razón social.';
    if (!clientPhone.trim()) errs.phone = 'Por favor ingresa tu número de WhatsApp o teléfono.';
    else if (!validatePhone(clientPhone)) errs.phone = 'Ingresa un número telefónico válido.';

    if (clientEmail && !validateEmail(clientEmail)) {
      errs.email = 'El correo no tiene un formato válido.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const createQuotationRecord = (): Quotation => {
    const quotationNumber = storageService.getNextNumber();
    const today = getTodayInputString();
    const expiration = addDays(today, config.validityDays || 15);

    // Save client if not exists
    const existingClients = storageService.getClients();
    let client = existingClients.find(c => c.phone === clientPhone.trim());
    if (!client) {
      client = {
        id: 'cli-' + generateId().substring(0, 8),
        clientType: 'EMPRESA',
        name: clientName.trim(),
        idNumber: '',
        phone: clientPhone.trim(),
        email: clientEmail.trim() || undefined,
        address: '',
        city: clientCity.trim() || 'Quito',
        state: 'Pichincha',
        createdAt: new Date().toISOString(),
      };
      storageService.saveClient(client);
    }

    const newQuotation: Quotation = {
      id: 'quot-' + generateId().substring(0, 8),
      number: quotationNumber,
      clientId: client.id,
      clientName: client.name,
      clientIdNumber: client.idNumber || '',
      clientPhone: client.phone,
      clientEmail: client.email || '',
      clientAddress: `${clientCity}, Ecuador`,
      date: today,
      expirationDate: expiration,
      salesperson: 'Portal Web Clientes',
      items: quotationItems,
      subtotal: totals.subtotal,
      discountType: 'PERCENTAGE',
      discountValue: 0,
      discountAmount: 0,
      taxPercentage: config.defaultTaxPercentage || 15,
      taxAmount: totals.taxAmount,
      total: totals.total,
      status: 'PENDIENTE',
      notes: clientNotes.trim() ? `Solicitado desde Catálogo Web: "${clientNotes.trim()}"` : 'Solicitud generada desde el catálogo público de clientes.',
      termsAndConditions: config.termsAndConditions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveQuotation(newQuotation);
    return newQuotation;
  };

  const handleDownloadPdf = () => {
    if (!validate()) return;
    const quot = createQuotationRecord();
    downloadQuotationPdf(quot, config);
    setLastQuotation(quot);
    setIsSuccess(true);
    onClearCart();
  };

  const handleSendWhatsApp = () => {
    if (!validate()) return;
    const quot = createQuotationRecord();

    // Prepare WhatsApp message
    let companyPhone = (config.whatsapp || config.phone || '').replace(/\D/g, '');
    if (companyPhone.startsWith('09') && companyPhone.length === 10) {
      companyPhone = '593' + companyPhone.substring(1);
    }

    let itemsList = quotationItems
      .map(it => `• ${it.quantity}x ${it.name} (${formatCurrency(it.total)})`)
      .join('\n');

    const message = 
      `Hola ${config.name}, deseo solicitar la siguiente cotización armada en su catálogo web:\n\n` +
      `👤 *Cliente:* ${clientName.trim()}\n` +
      `📱 *Teléfono:* ${clientPhone.trim()}\n` +
      `📍 *Ciudad:* ${clientCity.trim()}\n\n` +
      `📦 *Equipos Solicitados:*\n${itemsList}\n\n` +
      `💰 *Subtotal:* ${formatCurrency(totals.subtotal)}\n` +
      `🧾 *IVA (15%):* ${formatCurrency(totals.taxAmount)}\n` +
      `⭐ *TOTAL ESTIMADO:* ${formatCurrency(totals.total)}\n` +
      (clientNotes ? `\n💬 *Comentario:* ${clientNotes.trim()}\n` : '') +
      `\nCotización generada: ${quot.number}. Quedo atento a su confirmación y disponibilidad.`;

    const encoded = encodeURIComponent(message);
    const waUrl = companyPhone 
      ? `https://api.whatsapp.com/send?phone=${companyPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setLastQuotation(quot);
    setIsSuccess(true);
    onClearCart();
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Mi Solicitud de Cotización"
      description="Revisa los productos seleccionados y genera tu proforma al instante."
      maxWidth="2xl"
    >
      {isSuccess && lastQuotation ? (
        <div className="py-8 text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              ¡Cotización Generada con Éxito!
            </h3>
            <p className="text-sm font-mono text-blue-600 dark:text-cyan-400 font-bold mt-1">
              {lastQuotation.number}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              Hemos registrado tu solicitud por un monto total de{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {formatCurrency(lastQuotation.total)}
              </strong>. Un asesor técnico comercial revisará tu solicitud de inmediato.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadQuotationPdf(lastQuotation, config)}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Volver a Descargar PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleClose}
            >
              Seguir Explorando el Catálogo
            </Button>
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Tu carrito de cotización está vacío
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explora el catálogo y agrega cámaras, DVRs o suministros de redes haciendo clic en "+ Cotizar".
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Items List */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
            {cartItems.map(item => (
              <div key={item.product.id} className="p-3 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {item.product.brand} • {formatCurrency(item.product.price)} c/u
                  </div>
                </div>

                {/* Quantity adjuster */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => onUpdateQuantity(item.product.id, parseInt(e.target.value, 10) || 1)}
                    className="w-14 text-center font-mono font-bold text-xs py-1 px-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />

                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white w-20 text-right">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                    title="Quitar ítem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal Productos:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>IVA ({config.defaultTaxPercentage || 15}%):</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {formatCurrency(totals.taxAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-blue-900 dark:text-blue-200">TOTAL ESTIMADO (USD):</span>
              <span className="font-mono text-base font-black text-blue-600 dark:text-cyan-400">
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tus Datos para la Proforma
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre o Razón Social"
                placeholder="Ej: Juan Pérez / Novatech Cía."
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
                error={formErrors.name}
              />

              <Input
                label="Teléfono o WhatsApp"
                placeholder="+593 99 123 4567"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                required
                error={formErrors.phone}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Correo Electrónico (Opcional)"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                error={formErrors.email}
              />

              <Input
                label="Ciudad de Entrega / Instalación"
                placeholder="Quito, Guayaquil, Cuenca..."
                value={clientCity}
                onChange={e => setClientCity(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                ¿Requieres instalación o tienes alguna duda técnica? (Opcional)
              </label>
              <textarea
                rows={2}
                value={clientNotes}
                onChange={e => setClientNotes(e.target.value)}
                placeholder="Ej: Necesito instalación para una casa de 2 pisos / fecha estimada..."
                className="w-full rounded-xl text-xs p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              leftIcon={<Download className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Descargar Proforma en PDF
            </Button>

            <Button
              variant="success"
              onClick={handleSendWhatsApp}
              leftIcon={<MessageSquare className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Enviar por WhatsApp a la Empresa
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
