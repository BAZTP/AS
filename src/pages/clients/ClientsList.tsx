import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Building2, 
  User, 
  MessageSquare 
} from 'lucide-react';
import { Client, ClientType } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge, ClientTypeBadge } from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';
import { validateRucCedulaEcuador, validateEmail, validatePhone } from '../../utils/validators';
import { generateId } from '../../utils/idGenerator';
import { formatDate } from '../../utils/date';

interface ClientFormData {
  clientType: ClientType;
  name: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  notes: string;
}

const initialForm: ClientFormData = {
  clientType: 'EMPRESA',
  name: '',
  idNumber: '',
  phone: '',
  email: '',
  address: '',
  city: 'Quito',
  state: 'Pichincha',
  notes: '',
};

export const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ClientType>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(initialForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});

  const { success, error: showError } = useToast();

  const loadClients = () => {
    setClients(storageService.getClients());
  };

  useEffect(() => {
    loadClients();
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cotizapro_clients') {
        loadClients();
      }
    };
    window.addEventListener('cotizapro_storage_change', handleStorageChange);
    return () => window.removeEventListener('cotizapro_storage_change', handleStorageChange);
  }, []);

  // Quotes count per client
  const quotationCounts = useMemo(() => {
    const quotes = storageService.getQuotations();
    const counts: Record<string, number> = {};
    quotes.forEach(q => {
      counts[q.clientId] = (counts[q.clientId] || 0) + 1;
    });
    return counts;
  }, [clients]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return clients.filter(c => {
      const matchType = typeFilter === 'ALL' || c.clientType === typeFilter;
      if (!matchType) return false;
      if (!q) return true;

      return (
        c.name.toLowerCase().includes(q) ||
        c.idNumber.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
      );
    });
  }, [clients, searchQuery, typeFilter]);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setFormData({
      clientType: c.clientType,
      name: c.name,
      idNumber: c.idNumber,
      phone: c.phone,
      email: c.email || '',
      address: c.address,
      city: c.city,
      state: c.state,
      notes: c.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ClientFormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre o razón social es obligatorio.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono o celular es obligatorio.';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Ingresa un número telefónico válido.';
    }

    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'El formato del correo electrónico no es válido.';
    }

    if (formData.idNumber) {
      const rucValidation = validateRucCedulaEcuador(formData.idNumber);
      if (!rucValidation.isValid) {
        errors.idNumber = rucValidation.message;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingClient) {
      const updated: Client = {
        ...editingClient,
        clientType: formData.clientType,
        name: formData.name.trim(),
        idNumber: formData.idNumber.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        notes: formData.notes.trim() || undefined,
      };
      storageService.saveClient(updated);
      success('Datos del cliente actualizados exitosamente.');
    } else {
      const newClient: Client = {
        id: 'cli-' + generateId().substring(0, 8),
        clientType: formData.clientType,
        name: formData.name.trim(),
        idNumber: formData.idNumber.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        notes: formData.notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      storageService.saveClient(newClient);
      success('Cliente registrado exitosamente.');
    }

    setIsModalOpen(false);
    loadClients();
  };

  const handleDeleteClient = () => {
    if (!deletingClient) return;
    storageService.deleteClient(deletingClient.id);
    success(`Cliente "${deletingClient.name}" eliminado.`);
    setDeletingClient(null);
    loadClients();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Directorio de Clientes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestiona información de empresas, instituciones y personas naturales para tus cotizaciones.
          </p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Nuevo Cliente
        </Button>
      </div>

      {/* Filter / Search Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, RUC/Cédula, teléfono, correo o ciudad..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="ALL">Todos los tipos</option>
              <option value="EMPRESA">Empresas</option>
              <option value="PERSONA_NATURAL">Personas Naturales</option>
              <option value="OTRO">Otros</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No se encontraron clientes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery || typeFilter !== 'ALL'
                ? 'No hay registros que coincidan con los criterios de búsqueda.'
                : 'Registra a tu primer cliente para comenzar a cotizar.'}
            </p>
            {!searchQuery && typeFilter === 'ALL' && (
              <Button size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
                Crear Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(c => {
            const quoteCount = quotationCounts[c.id] || 0;

            return (
              <Card key={c.id} className="flex flex-col justify-between hover:border-blue-500/40">
                <CardContent className="p-5 space-y-3.5">
                  {/* Card Header: Type Badge & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        {c.clientType === 'EMPRESA' ? (
                          <Building2 className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <ClientTypeBadge type={c.clientType} />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar cliente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingClient(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Name & ID */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {c.name}
                    </h3>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.idNumber ? `RUC/C.I: ${c.idNumber}` : 'Sin identificación registrada'}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a 
                        href={`tel:${c.phone}`} 
                        className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                      >
                        {c.phone}
                      </a>
                    </div>

                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a 
                          href={`mailto:${c.email}`} 
                          className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                        >
                          {c.email}
                        </a>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-slate-500 dark:text-slate-400">
                        {c.address ? `${c.address}, ` : ''}{c.city}, {c.state}
                      </span>
                    </div>
                  </div>

                  {/* Notes snippet */}
                  {c.notes && (
                    <p className="text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-slate-500 dark:text-slate-400 italic line-clamp-2">
                      "{c.notes}"
                    </p>
                  )}

                  {/* Footer Stats */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>{quoteCount} {quoteCount === 1 ? 'cotización' : 'cotizaciones'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Desde {formatDate(c.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        description="Ingresa los datos fiscales y de contacto del cliente."
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveClient}>
              {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          {/* Row 1: Tipo de Cliente y RUC/Cédula */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Tipo de Cliente"
              value={formData.clientType}
              onChange={e => setFormData({ ...formData, clientType: e.target.value as ClientType })}
            >
              <option value="EMPRESA">Empresa (Jurídica)</option>
              <option value="PERSONA_NATURAL">Persona Natural</option>
              <option value="OTRO">Otro / Institución</option>
            </Select>

            <Input
              label="RUC o Cédula (Ecuador)"
              value={formData.idNumber}
              onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
              placeholder="Ej: 1792345890001 o 1718293041"
              error={formErrors.idNumber}
              helperText="10 dígitos para Cédula o 13 para RUC"
            />
          </div>

          {/* Row 2: Nombre o Razón Social */}
          <Input
            label="Nombre Completo o Razón Social"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Corporación Novatech Cía. Ltda."
            required
            error={formErrors.name}
          />

          {/* Row 3: Teléfono y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Teléfono / Celular (WhatsApp)"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+593 99 123 4567"
              required
              error={formErrors.phone}
            />

            <Input
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="cliente@dominio.com"
              error={formErrors.email}
            />
          </div>

          {/* Row 4: Ciudad y Provincia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Ciudad"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              placeholder="Ej: Quito, Guayaquil, Cuenca"
            />

            <Input
              label="Provincia"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
              placeholder="Ej: Pichincha, Guayas, Azuay"
            />
          </div>

          {/* Row 5: Dirección */}
          <Input
            label="Dirección de Entrega / Instalación"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            placeholder="Calle principal, número y secundaria o referencia"
          />

          {/* Row 6: Observaciones */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Observaciones Comerciales (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Condiciones de pago acordadas, contactos alternativos, requerimientos especiales..."
              className="w-full rounded-xl text-sm p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDeleteClient}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar el cliente "${deletingClient?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};
