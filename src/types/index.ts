export type QuotationStatus =
  | 'BORRADOR'
  | 'ENVIADA'
  | 'PENDIENTE'
  | 'ACEPTADA'
  | 'RECHAZADA'
  | 'VENCIDA'
  | 'CANCELADA';

export type ClientType = 'PERSONA_NATURAL' | 'EMPRESA' | 'OTRO';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  internalCode?: string;
  name: string;
  categoryId: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  unit: string; // ej: "Unidad", "Metro", "Kit", "Rollo"
  imageUrl?: string;
  status: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  clientType: ClientType;
  name: string; // Nombre o Razón Social
  idNumber: string; // Cédula o RUC
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string; // Provincia
  notes?: string;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  subtotal: number;
  total: number;
}

export interface Quotation {
  id: string;
  number: string; // ej: "COT-000001"
  clientId: string;
  clientName: string;
  clientIdNumber: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  date: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  salesperson: string;
  items: QuotationItem[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  total: number;
  status: QuotationStatus;
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessConfig {
  name: string;
  taxId: string; // RUC
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  website?: string;
  whatsapp?: string;
  logoUrl?: string; // Data URL o path relativo
  defaultTaxPercentage: number; // ej: 15% (Ecuador)
  currency: string; // "USD"
  currencySymbol: string; // "$"
  validityDays: number; // ej: 15 días
  termsAndConditions: string;
  thankYouMessage: string;
}

export interface DashboardStats {
  totalQuotations: number;
  thisMonthQuotations: number;
  pendingQuotations: number;
  acceptedQuotations: number;
  rejectedQuotations: number;
  totalValue: number;
  clientsCount: number;
  productsCount: number;
  conversionRate: number;
  averageTicket: number;
}

export interface BackupData {
  version: string;
  exportDate: string;
  categories: Category[];
  products: Product[];
  clients: Client[];
  quotations: Quotation[];
  config: BusinessConfig;
}
