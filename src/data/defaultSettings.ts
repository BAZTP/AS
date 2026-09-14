import { BusinessConfig } from '../types';

export const DEFAULT_SETTINGS: BusinessConfig = {
  name: 'SEGURITECH & REDES ECUADOR',
  taxId: '1792345678001',
  phone: '+593 99 800 1234 / (02) 245-8900',
  email: 'ventas@seguritech.com.ec',
  address: 'Av. República del Salvador N36-84 y Naciones Unidas',
  city: 'Quito',
  state: 'Pichincha',
  website: 'https://www.seguritech.com.ec',
  whatsapp: '+593998001234',
  logoUrl: '',
  defaultTaxPercentage: 15, // IVA oficial vigente en Ecuador
  currency: 'USD',
  currencySymbol: '$',
  validityDays: 15,
  termsAndConditions: 
    '1. Precios expresados en Dólares de los Estados Unidos de América (USD).\n' +
    '2. Esta cotización tiene una validez de 15 días calendario a partir de su fecha de emisión.\n' +
    '3. Forma de pago: 60% de anticipo al confirmar la orden y 40% contra entrega e instalación.\n' +
    '4. Garantía de 1 año contra defectos de fabricación en equipos electrónicos (cámaras, grabadores y discos).\n' +
    '5. No cubre daños ocasionados por descargas eléctricas atmosféricas o fluctuaciones severas de voltaje sin protección UPS.\n' +
    '6. Cuentas bancarias: Banco Pichincha Cta. Cte. #2100456789 a nombre de SEGURITECH ECUADOR CIA. LTDA.',
  thankYouMessage: '¡Agradecemos su confianza en nuestros servicios de seguridad y tecnología!'
};
