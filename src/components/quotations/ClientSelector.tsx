import React, { useState, useMemo } from 'react';
import { User, Building2, Search, Plus, X, Phone, Mail, MapPin } from 'lucide-react';
import { Client } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { QuickClientModal } from './QuickClientModal';
import { ClientTypeBadge } from '../common/Badge';

interface ClientSelectorProps {
  clients: Client[];
  selectedClientId: string;
  onSelectClient: (client: Client) => void;
  onClearClient: () => void;
  error?: string;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onClearClient,
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);

  const selectedClient = useMemo(
    () => clients.find(c => c.id === selectedClientId),
    [clients, selectedClientId]
  );

  const filteredClients = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return clients.slice(0, 8);
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.idNumber.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [clients, searchTerm]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <User className="w-4 h-4 text-blue-600" />
          <span>Cliente Destinatario</span>
          <span className="text-rose-500">*</span>
        </label>

        <button
          type="button"
          onClick={() => setIsQuickModalOpen(true)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      {selectedClient ? (
        /* Selected Client Preview Card */
        <div className="relative p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-slate-800 dark:text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
              {selectedClient.clientType === 'EMPRESA' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedClient.name}
                </span>
                <ClientTypeBadge type={selectedClient.clientType} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                {selectedClient.idNumber && (
                  <span className="font-mono">RUC/C.I: {selectedClient.idNumber}</span>
                )}
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {selectedClient.phone}
                </span>
                {selectedClient.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {selectedClient.email}
                  </span>
                )}
                {selectedClient.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {selectedClient.city}, {selectedClient.state}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearClient}
            className="self-end sm:self-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Cambiar cliente"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Search / Select dropdown */
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setIsOpenDropdown(true);
              }}
              onFocus={() => setIsOpenDropdown(true)}
              placeholder="Buscar cliente por nombre, RUC, cédula, teléfono..."
              className={`
                w-full pl-9 pr-4 py-2.5 text-sm rounded-xl
                bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                border ${
                  error
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:border-blue-500'
                }
                focus:outline-none focus:ring-4 focus:ring-blue-500/10
              `}
            />
          </div>

          {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}

          {/* Autocomplete Dropdown */}
          {isOpenDropdown && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsOpenDropdown(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClients.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No se encontraron clientes coincidentes.
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setIsOpenDropdown(false);
                          setIsQuickModalOpen(true);
                        }}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Crear nuevo cliente
                      </Button>
                    </div>
                  </div>
                ) : (
                  filteredClients.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelectClient(c);
                        setIsOpenDropdown(false);
                        setSearchTerm('');
                      }}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({c.idNumber || 'Sin RUC'})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{c.phone}</span>
                          {c.email && <span>• {c.email}</span>}
                        </div>
                      </div>
                      <ClientTypeBadge type={c.clientType} />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick Client Modal */}
      <QuickClientModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        onClientCreated={client => {
          onSelectClient(client);
          setSearchTerm('');
        }}
      />
    </div>
  );
};
