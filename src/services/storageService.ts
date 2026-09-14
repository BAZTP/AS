import { 
  Category, 
  Product, 
  Client, 
  Quotation, 
  BusinessConfig, 
  BackupData 
} from '../types';
import { INITIAL_CATEGORIES } from '../data/initialCategories';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_CLIENTS } from '../data/initialClients';
import { INITIAL_QUOTATIONS } from '../data/initialQuotations';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { getNextQuotationNumber, generateId } from '../utils/idGenerator';
import { getTodayInputString, addDays } from '../utils/date';

const STORAGE_KEYS = {
  CATEGORIES: 'cotizapro_categories',
  PRODUCTS: 'cotizapro_products',
  CLIENTS: 'cotizapro_clients',
  QUOTATIONS: 'cotizapro_quotations',
  CONFIG: 'cotizapro_config',
  DRAFT: 'cotizapro_draft',
  INITIALIZED: 'cotizapro_initialized',
  IS_DEMO: 'cotizapro_is_demo_loaded',
} as const;

class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): boolean {
    if (!this.isBrowser()) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      this.notifyChange(key);
      return true;
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
        console.error('LocalStorage quota exceeded!');
        alert('Se ha alcanzado el límite de almacenamiento del navegador. Por favor exporta un respaldo y elimina imágenes o cotizaciones antiguas.');
      } else {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
      return false;
    }
  }

  private removeItem(key: string): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.removeItem(key);
      this.notifyChange(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }

  private notifyChange(key: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cotizapro_storage_change', { detail: { key } }));
    }
  }

  // --- Inicialización ---
  public initializeDefaultDataIfNeeded(): void {
    if (!this.isBrowser()) return;
    const initialized = window.localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      this.loadDemoData();
      window.localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  public isDemoDataLoaded(): boolean {
    return this.getItem<boolean>(STORAGE_KEYS.IS_DEMO, false);
  }

  public loadDemoData(): void {
    this.setItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    this.setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.setItem(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    this.setItem(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    this.setItem(STORAGE_KEYS.CONFIG, DEFAULT_SETTINGS);
    this.setItem(STORAGE_KEYS.IS_DEMO, true);
  }

  public clearAllData(): void {
    this.setItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    this.setItem(STORAGE_KEYS.PRODUCTS, []);
    this.setItem(STORAGE_KEYS.CLIENTS, []);
    this.setItem(STORAGE_KEYS.QUOTATIONS, []);
    this.setItem(STORAGE_KEYS.CONFIG, DEFAULT_SETTINGS);
    this.removeItem(STORAGE_KEYS.DRAFT);
    this.setItem(STORAGE_KEYS.IS_DEMO, false);
  }

  // --- Categorías ---
  public getCategories(): Category[] {
    return this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public saveCategory(category: Category): boolean {
    const list = this.getCategories();
    const index = list.findIndex(c => c.id === category.id);
    if (index >= 0) {
      list[index] = category;
    } else {
      list.push(category);
    }
    return this.setItem(STORAGE_KEYS.CATEGORIES, list);
  }

  public deleteCategory(id: string): boolean {
    const list = this.getCategories().filter(c => c.id !== id);
    return this.setItem(STORAGE_KEYS.CATEGORIES, list);
  }

  // --- Productos ---
  public getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  public getProductBySku(sku: string): Product | undefined {
    return this.getProducts().find(p => p.sku.toLowerCase() === sku.toLowerCase());
  }

  public saveProduct(product: Product): boolean {
    const list = this.getProducts();
    const index = list.findIndex(p => p.id === product.id);
    if (index >= 0) {
      list[index] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    return this.setItem(STORAGE_KEYS.PRODUCTS, list);
  }

  public deleteProduct(id: string): boolean {
    const list = this.getProducts().filter(p => p.id !== id);
    return this.setItem(STORAGE_KEYS.PRODUCTS, list);
  }

  public searchProducts(query: string, categoryId?: string): Product[] {
    const q = query.toLowerCase().trim();
    return this.getProducts().filter(p => {
      const matchCategory = !categoryId || p.categoryId === categoryId;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.internalCode && p.internalCode.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }

  // --- Clientes ---
  public getClients(): Client[] {
    return this.getItem<Client[]>(STORAGE_KEYS.CLIENTS, []);
  }

  public getClientById(id: string): Client | undefined {
    return this.getClients().find(c => c.id === id);
  }

  public saveClient(client: Client): boolean {
    const list = this.getClients();
    const index = list.findIndex(c => c.id === client.id);
    if (index >= 0) {
      list[index] = client;
    } else {
      list.unshift({ ...client, createdAt: client.createdAt || new Date().toISOString() });
    }
    return this.setItem(STORAGE_KEYS.CLIENTS, list);
  }

  public deleteClient(id: string): boolean {
    const list = this.getClients().filter(c => c.id !== id);
    return this.setItem(STORAGE_KEYS.CLIENTS, list);
  }

  public searchClients(query: string): Client[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getClients();
    return this.getClients().filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.idNumber.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      c.city.toLowerCase().includes(q)
    );
  }

  // --- Cotizaciones ---
  public getQuotations(): Quotation[] {
    return this.getItem<Quotation[]>(STORAGE_KEYS.QUOTATIONS, []);
  }

  public getQuotationById(id: string): Quotation | undefined {
    return this.getQuotations().find(q => q.id === id);
  }

  public getNextNumber(): string {
    const quotations = this.getQuotations();
    const numbers = quotations.map(q => q.number);
    return getNextQuotationNumber(numbers);
  }

  public saveQuotation(quotation: Quotation): boolean {
    const list = this.getQuotations();
    const index = list.findIndex(q => q.id === quotation.id);
    if (index >= 0) {
      list[index] = { ...quotation, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...quotation, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    return this.setItem(STORAGE_KEYS.QUOTATIONS, list);
  }

  public deleteQuotation(id: string): boolean {
    const list = this.getQuotations().filter(q => q.id !== id);
    return this.setItem(STORAGE_KEYS.QUOTATIONS, list);
  }

  public duplicateQuotation(id: string): Quotation | null {
    const original = this.getQuotationById(id);
    if (!original) return null;

    const config = this.getConfig();
    const today = getTodayInputString();
    const expiration = addDays(today, config.validityDays || 15);

    const duplicated: Quotation = {
      ...original,
      id: generateId(),
      number: this.getNextNumber(),
      date: today,
      expirationDate: expiration,
      status: 'BORRADOR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveQuotation(duplicated);
    return duplicated;
  }

  // --- Borrador del Cotizador ---
  public getDraft(): Partial<Quotation> | null {
    return this.getItem<Partial<Quotation> | null>(STORAGE_KEYS.DRAFT, null);
  }

  public saveDraft(draft: Partial<Quotation>): boolean {
    return this.setItem(STORAGE_KEYS.DRAFT, draft);
  }

  public clearDraft(): void {
    this.removeItem(STORAGE_KEYS.DRAFT);
  }

  // --- Configuración ---
  public getConfig(): BusinessConfig {
    return this.getItem<BusinessConfig>(STORAGE_KEYS.CONFIG, DEFAULT_SETTINGS);
  }

  public saveConfig(config: BusinessConfig): boolean {
    return this.setItem(STORAGE_KEYS.CONFIG, config);
  }

  // --- Exportación / Importación ---
  public exportBackup(): BackupData {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      categories: this.getCategories(),
      products: this.getProducts(),
      clients: this.getClients(),
      quotations: this.getQuotations(),
      config: this.getConfig(),
    };
  }

  public importBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString) as Partial<BackupData>;
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'El archivo no contiene un objeto JSON válido.' };
      }

      // Validar estructura mínima esperada
      if (!Array.isArray(data.products) || !Array.isArray(data.clients) || !Array.isArray(data.quotations)) {
        return { success: false, message: 'El archivo JSON no tiene la estructura requerida de COTIZAPRO (faltan productos, clientes o cotizaciones).' };
      }

      // Aplicar datos
      if (Array.isArray(data.categories)) this.setItem(STORAGE_KEYS.CATEGORIES, data.categories);
      this.setItem(STORAGE_KEYS.PRODUCTS, data.products);
      this.setItem(STORAGE_KEYS.CLIENTS, data.clients);
      this.setItem(STORAGE_KEYS.QUOTATIONS, data.quotations);
      if (data.config && typeof data.config === 'object') {
        this.setItem(STORAGE_KEYS.CONFIG, data.config as BusinessConfig);
      }
      this.setItem(STORAGE_KEYS.IS_DEMO, false);

      return { success: true, message: 'Respaldo importado y restaurado exitosamente.' };
    } catch (e) {
      return { success: false, message: `Error al procesar el archivo: ${(e as Error).message}` };
    }
  }
}

export const storageService = new StorageService();
