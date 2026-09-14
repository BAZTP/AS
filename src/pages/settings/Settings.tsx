import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Building2, 
  Percent, 
  ShieldCheck, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Info, 
  AlertTriangle,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { BusinessConfig } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { getTodayInputString } from '../../utils/date';

export const Settings: React.FC = () => {
  const { success, error: showError, warning, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<BusinessConfig>(() => storageService.getConfig());
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setConfig(storageService.getConfig());
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    storageService.saveConfig(config);
    setTimeout(() => {
      setIsSaving(false);
      success('Configuración empresarial guardada exitosamente.');
    }, 200);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    try {
      const backupData = storageService.exportBackup();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      const dateStr = getTodayInputString();
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `cotizapro_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      success('Archivo de respaldo JSON exportado.');
    } catch (e) {
      showError('Error al generar el archivo de respaldo.');
    }
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const result = storageService.importBackup(content);
        if (result.success) {
          success(result.message);
          setConfig(storageService.getConfig());
        } else {
          showError(result.message);
        }
      } catch (err) {
        showError('No se pudo leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReloadDemo = () => {
    storageService.loadDemoData();
    setConfig(storageService.getConfig());
    success('Datos demo restablecidos con éxito.');
  };

  const handleConfirmReset = () => {
    storageService.clearAllData();
    setConfig(storageService.getConfig());
    setResetDialogOpen(false);
    warning('Todos los datos han sido restablecidos.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            Configuración del Negocio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personaliza tus datos de facturación, IVA oficial, términos comerciales y copias de seguridad.
          </p>
        </div>
      </div>

      {/* Formulario de Configuración Empresarial */}
      <form onSubmit={handleSaveConfig} className="space-y-6">
        <Card className="p-6">
          <CardHeader
            title="Identidad y Datos Fiscales"
            subtitle="Esta información se imprimirá en el encabezado oficial de tus cotizaciones y PDF"
          />
          <CardContent className="space-y-4 pt-4">
            {/* Nombre y RUC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre Comercial / Razón Social"
                value={config.name}
                onChange={e => setConfig({ ...config, name: e.target.value })}
                placeholder="Ej: SEGURITECH & REDES ECUADOR"
                required
              />

              <Input
                label="RUC de la Empresa (Ecuador)"
                value={config.taxId}
                onChange={e => setConfig({ ...config, taxId: e.target.value })}
                placeholder="Ej: 1792345678001"
                required
              />
            </div>

            {/* Teléfonos y Correo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Teléfonos de Contacto"
                value={config.phone}
                onChange={e => setConfig({ ...config, phone: e.target.value })}
                placeholder="+593 99 800 1234 / (02) 245-8900"
                required
              />

              <Input
                label="Correo Electrónico de Ventas"
                type="email"
                value={config.email}
                onChange={e => setConfig({ ...config, email: e.target.value })}
                placeholder="ventas@seguritech.com.ec"
                required
              />
            </div>

            {/* Ciudad, Provincia y Dirección */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Ciudad"
                value={config.city}
                onChange={e => setConfig({ ...config, city: e.target.value })}
                placeholder="Quito"
                required
              />

              <Input
                label="Provincia"
                value={config.state}
                onChange={e => setConfig({ ...config, state: e.target.value })}
                placeholder="Pichincha"
                required
              />

              <Input
                label="WhatsApp para Cotizaciones"
                value={config.whatsapp || ''}
                onChange={e => setConfig({ ...config, whatsapp: e.target.value })}
                placeholder="+593998001234"
                helperText="Número con prefijo país"
              />
            </div>

            {/* Dirección y Web */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Dirección Física de la Empresa"
                value={config.address}
                onChange={e => setConfig({ ...config, address: e.target.value })}
                placeholder="Av. República del Salvador N36-84 y Naciones Unidas"
                required
              />

              <Input
                label="Sitio Web (Opcional)"
                value={config.website || ''}
                onChange={e => setConfig({ ...config, website: e.target.value })}
                placeholder="https://www.seguritech.com.ec"
              />
            </div>
          </CardContent>
        </Card>

        {/* Parámetros Comerciales e Impuestos */}
        <Card className="p-6">
          <CardHeader
            title="Políticas Comerciales e IVA"
            subtitle="Reglas de vigencia, moneda e impuestos aplicados por defecto"
          />
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Porcentaje de IVA por Defecto (%)"
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={config.defaultTaxPercentage}
                onChange={e => setConfig({ ...config, defaultTaxPercentage: parseFloat(e.target.value) || 0 })}
                helperText="Ecuador actualmente aplica 15%"
                required
              />

              <Input
                label="Días de Validez de Cotización"
                type="number"
                min="1"
                max="180"
                value={config.validityDays}
                onChange={e => setConfig({ ...config, validityDays: parseInt(e.target.value, 10) || 15 })}
                helperText="Días calendario hasta vencimiento"
                required
              />

              <Input
                label="Moneda y Símbolo"
                value={`${config.currency} (${config.currencySymbol})`}
                disabled
                helperText="Predeterminada: Dólares de Estados Unidos ($)"
              />
            </div>

            {/* Condiciones Comerciales */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Condiciones Comerciales y Términos Predeterminados
              </label>
              <textarea
                rows={5}
                value={config.termsAndConditions}
                onChange={e => setConfig({ ...config, termsAndConditions: e.target.value })}
                placeholder="Formas de pago, anticipo, cuentas bancarias, garantías de cámaras..."
                className="w-full rounded-xl text-xs font-mono p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none leading-relaxed"
              />
            </div>

            {/* Mensaje de agradecimiento */}
            <Input
              label="Mensaje de Agradecimiento en Pie de Página"
              value={config.thankYouMessage}
              onChange={e => setConfig({ ...config, thankYouMessage: e.target.value })}
              placeholder="¡Agradecemos su confianza en nuestros servicios de seguridad y tecnología!"
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Guardar Configuración
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Sección de Respaldo y Gestión de Datos (Backup) */}
      <Card className="p-6">
        <CardHeader
          title="Respaldo y Seguridad de Datos (Backup)"
          subtitle="Exporta e importa tu base de datos completa en formato JSON para no perder información"
        />
        <CardContent className="space-y-4 pt-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Copia de Seguridad Completa (JSON)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                Descarga un archivo seguro con todos tus productos, categorías, clientes, cotizaciones históricas y parámetros del negocio.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="primary"
                onClick={handleExportBackup}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Exportar Respaldo
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Importar Respaldo
              </Button>
            </div>
          </div>

          {/* Acciones de Restablecimiento y Demo */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleReloadDemo}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Cargar Datos Demo de Prueba
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setResetDialogOpen(true)}
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Restablecer y Borrar Todos los Datos</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Información Técnica del Sistema */}
      <Card className="p-6">
        <CardHeader
          title="Acerca del Sistema"
          subtitle="Información técnica, arquitectura y seguridad de la aplicación"
        />
        <CardContent className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">
            <div>
              <span className="text-slate-400 block text-[11px]">Nombre del Software</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">COTIZAPRO</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Versión</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">v1.0.0 (Release)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Arquitectura de Despliegue</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Local-First / GitHub Pages</span>
            </div>
          </div>

          <p>
            <strong>Privacidad & Seguridad:</strong> Esta versión funciona en modo monousuario con almacenamiento directo en tu navegador mediante <code className="font-mono text-blue-600 dark:text-cyan-400">localStorage</code>. No almacena información en servidores de terceros ni requiere suscripciones.
          </p>
          <p>
            <strong>Evolución Futura:</strong> La capa de datos en <code className="font-mono">storageService</code> está diseñada con arquitectura desacoplada para facilitar la conexión con bases de datos en la nube (como <em>Supabase / PostgreSQL</em>) si deseas habilitar múltiples usuarios, autenticación y permisos en una futura versión.
          </p>
        </CardContent>
      </Card>

      {/* Modal Confirmar Restablecimiento Destructivo */}
      <ConfirmDialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleConfirmReset}
        title="Restablecer Datos del Sistema"
        message="¿Estás completamente seguro de que deseas eliminar todas las cotizaciones, productos y clientes registrados? Te recomendamos descargar un respaldo en JSON antes de continuar. Esta acción es irreversible."
        confirmText="Sí, Borrar Todo"
        variant="danger"
      />
    </div>
  );
};
