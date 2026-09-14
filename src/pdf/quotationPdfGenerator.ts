import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation, BusinessConfig } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

export function generateQuotationPdf(quotation: Quotation, config: BusinessConfig): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // --- Paleta de colores corporativos ---
  const primaryColor: [number, number, number] = [30, 58, 138]; // Azul institucional oscuro (slate-900 / blue-900)
  const secondaryColor: [number, number, number] = [37, 99, 235]; // Azul brillante
  const textDark: [number, number, number] = [30, 41, 59]; // Slate-800
  const textMuted: [number, number, number] = [100, 116, 139]; // Slate-500
  const bgLight: [number, number, number] = [248, 250, 252]; // Slate-50

  let currentY = margin;

  // ==========================================
  // 1. CABECERA: EMPRESA Y DATOS FISCALES
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(config.name || 'COTIZAPRO ECUADOR', margin, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text(`RUC: ${config.taxId || '1792345678001'}`, margin, currentY + 12);
  doc.text(`Dirección: ${config.address || 'Quito, Ecuador'} - ${config.city || ''}`, margin, currentY + 16);
  doc.text(`Teléfono: ${config.phone || ''} | Correo: ${config.email || ''}`, margin, currentY + 20);
  if (config.website) {
    doc.text(`Sitio Web: ${config.website}`, margin, currentY + 24);
  }

  // Cuadro destacado con Número de Cotización y Fechas (Derecha)
  const boxWidth = 65;
  const boxHeight = 26;
  const boxX = pageWidth - margin - boxWidth;
  const boxY = currentY;

  doc.setFillColor(...bgLight);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...secondaryColor);
  doc.text(`COTIZACIÓN`, boxX + 6, boxY + 7);
  doc.text(quotation.number, boxX + 6, boxY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  doc.text(`Fecha Emisión: ${formatDate(quotation.date)}`, boxX + 6, boxY + 18);
  doc.text(`Válida hasta: ${formatDate(quotation.expirationDate)}`, boxX + 6, boxY + 22);

  currentY += 32;

  // ==========================================
  // 2. DATOS DEL CLIENTE
  // ==========================================
  doc.setFillColor(...bgLight);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text('DATOS DEL CLIENTE / DESTINATARIO', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  doc.text(quotation.clientName, margin + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  const rucText = quotation.clientIdNumber ? `RUC/C.I: ${quotation.clientIdNumber}` : '';
  const phoneText = quotation.clientPhone ? `Tel: ${quotation.clientPhone}` : '';
  const emailText = quotation.clientEmail ? `Email: ${quotation.clientEmail}` : '';
  doc.text(`${rucText}   ${phoneText}   ${emailText}`, margin + 4, currentY + 17);

  if (quotation.clientAddress) {
    doc.text(`Dirección: ${quotation.clientAddress}`, margin + 4, currentY + 21);
  }

  currentY += 28;

  // ==========================================
  // 3. TABLA DE PRODUCTOS (autoTable)
  // ==========================================
  const tableData = quotation.items.map(item => [
    item.sku,
    `${item.name}\n${item.description || ''}`.trim(),
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    item.discountAmount > 0 ? `-${formatCurrency(item.discountAmount)}` : '$0.00',
    formatCurrency(item.total),
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['SKU', 'DESCRIPCIÓN DEL PRODUCTO', 'CANT', 'P. UNIT', 'DESC.', 'TOTAL']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: textDark,
      font: 'helvetica',
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 20, halign: 'right', textColor: [180, 83, 9] },
      5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // @ts-ignore - jspdf-autotable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 6;

  // Si queda poco espacio para totales y condiciones, agregar nueva página
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = margin;
  }

  // ==========================================
  // 4. BLOQUE DE TOTALES Y CONDICIONES
  // ==========================================
  const totalsWidth = 70;
  const totalsX = pageWidth - margin - totalsWidth;

  // Condiciones comerciales y observaciones (Izquierda)
  const termsWidth = pageWidth - margin * 2 - totalsWidth - 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('CONDICIONES COMERCIALES Y FORMA DE PAGO:', margin, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  const termsLines = doc.splitTextToSize(
    quotation.termsAndConditions || config.termsAndConditions || 'Garantía de 1 año en equipos de fábrica.',
    termsWidth
  );
  doc.text(termsLines, margin, currentY + 9);

  if (quotation.notes) {
    const notesY = currentY + 10 + termsLines.length * 3.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', margin, notesY);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(quotation.notes, termsWidth);
    doc.text(noteLines, margin, notesY + 4);
  }

  // Cuadro de totales (Derecha)
  doc.setFillColor(...bgLight);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsX, currentY, totalsWidth, 38, 2, 2, 'FD');

  const printTotalLine = (label: string, value: string, yPos: number, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 9.5 : 8);
    doc.setTextColor(...(isBold ? primaryColor : textDark));
    doc.text(label, totalsX + 4, yPos);
    doc.text(value, totalsX + totalsWidth - 4, yPos, { align: 'right' });
  };

  printTotalLine('Subtotal Ítems:', formatCurrency(quotation.subtotal), currentY + 7);
  if (quotation.discountAmount > 0) {
    printTotalLine('Descuento General:', `-${formatCurrency(quotation.discountAmount)}`, currentY + 13);
  } else {
    printTotalLine('Descuento:', '$0.00', currentY + 13);
  }
  printTotalLine(`Base Imponible:`, formatCurrency(quotation.subtotal - quotation.discountAmount), currentY + 19);
  printTotalLine(`IVA (${quotation.taxPercentage}%):`, formatCurrency(quotation.taxAmount), currentY + 25);

  // Recuadro TOTAL FINAL
  doc.setFillColor(...secondaryColor);
  doc.roundedRect(totalsX + 2, currentY + 28, totalsWidth - 4, 8, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL USD:', totalsX + 5, currentY + 33.5);
  doc.text(formatCurrency(quotation.total), totalsX + totalsWidth - 5, currentY + 33.5, { align: 'right' });

  // ==========================================
  // 5. PIE DE PÁGINA Y NUMERACIÓN
  // ==========================================
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);

    // Línea divisoria
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Mensaje de agradecimiento
    doc.text(
      config.thankYouMessage || '¡Agradecemos su confianza!',
      margin,
      pageHeight - 8
    );

    // Paginación
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  return doc;
}

export function downloadQuotationPdf(quotation: Quotation, config: BusinessConfig): void {
  const doc = generateQuotationPdf(quotation, config);
  const cleanClient = (quotation.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${quotation.number}_${cleanClient}.pdf`;
  doc.save(filename);
}
