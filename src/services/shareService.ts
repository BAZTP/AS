import { Quotation, BusinessConfig } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

/**
 * Genera el enlace de WhatsApp seguro para abrir en el navegador
 */
export function getWhatsAppShareUrl(quotation: Quotation, config: BusinessConfig): string {
  // Limpiar número telefónico: extraer solo dígitos
  let cleanPhone = (quotation.clientPhone || '').replace(/\D/g, '');

  // Si empieza con 09 (móvil Ecuador), anteponer prefijo país 593
  if (cleanPhone.startsWith('09') && cleanPhone.length === 10) {
    cleanPhone = '593' + cleanPhone.substring(1);
  }

  const message = 
    `Hola ${quotation.clientName},\n\n` +
    `Le compartimos la cotización ${quotation.number} de ${config.name}.\n` +
    `Total: ${formatCurrency(quotation.total)}\n` +
    `Válida hasta: ${formatDate(quotation.expirationDate)}\n\n` +
    `Quedamos atentos a sus requerimientos o cualquier consulta adicional.`;

  const encodedText = encodeURIComponent(message);

  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }

  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Genera el enlace mailto para abrir el cliente de correo predeterminado
 */
export function getEmailShareUrl(quotation: Quotation, config: BusinessConfig): string {
  const recipient = quotation.clientEmail || '';
  const subject = encodeURIComponent(`Cotización ${quotation.number} - ${config.name}`);
  const body = encodeURIComponent(
    `Estimado/a ${quotation.clientName},\n\n` +
    `Le compartimos el detalle de su cotización ${quotation.number}.\n\n` +
    `Resumen de la oferta:\n` +
    `- Cantidad de productos: ${quotation.items.length}\n` +
    `- Subtotal: ${formatCurrency(quotation.subtotal)}\n` +
    `- IVA (${quotation.taxPercentage}%): ${formatCurrency(quotation.taxAmount)}\n` +
    `- TOTAL: ${formatCurrency(quotation.total)}\n` +
    `- Fecha de vencimiento: ${formatDate(quotation.expirationDate)}\n\n` +
    `Condiciones comerciales:\n${quotation.termsAndConditions || config.termsAndConditions}\n\n` +
    `Saludos cordiales,\n` +
    `${config.name}\n` +
    `Tel: ${config.phone} | ${config.email}`
  );

  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}
