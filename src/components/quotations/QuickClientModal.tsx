import React, { useState } from 'react';
import { Client, ClientType } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { validateRucCedulaEcuador, validateEmail, validatePhone } from '../../utils/validators';
import { generateId } from '../../utils/idGenerator';

interface QuickClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: Client) => void;
}

export const QuickClientModal: React.FC<QuickClientModalProps> = ({
  isOpen,
  onClose,
  onClientCreated,
}) => {
  const [clientType, setClientType] = useState<ClientType>('EMPRESA');
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Quito');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { success } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'El nombre o razón social es obligatorio.';
    if (!phone.trim()) errs.phone = 'El teléfono es obligatorio.';
    else if (!validatePhone(phone)) errs.phone = 'Teléfono no válido.';

    if (email && !validateEmail(email)) errs.email = 'Correo no válido.';
    if (idNumber) {
      const rucVal = validateRucCedulaEcuador(idNumber);
      if (!rucVal.isValid) errs.idNumber = rucVal.message || 'Identificación no válida.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newClient: Client = {
      id: 'cli-' + generateId().substring(0, 8),
      clientType,
      name: name.trim(),
      idNumber: idNumber.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim(),
      city: city.trim(),
      state: 'Pichincha',
      createdAt: new Date().toISOString(),
    };

    storageService.saveClient(newClient);
    success('Cliente creado y seleccionado.');
    onClientCreated(newClient);
    onClose();

    // Reset
    setName('');
    setIdNumber('');
    setPhone('');
    setEmail('');
    setAddress('');
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Cliente Rápido"
      description="Registra al cliente sin abandonar la cotización."
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Crear y Seleccionar
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo"
            value={clientType}
            onChange={e => setClientType(e.target.value as ClientType)}
          >
            <option value="EMPRESA">Empresa</option>
            <option value="PERSONA_NATURAL">Persona Natural</option>
            <option value="OTRO">Otro</option>
          </Select>

          <Input
            label="Cédula / RUC"
            value={idNumber}
            onChange={e => setIdNumber(e.target.value)}
            placeholder="1792345890001"
            error={errors.idNumber}
          />
        </div>

        <Input
          label="Nombre o Razón Social"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Novatech Cía. Ltda."
          required
          error={errors.name}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Teléfono / WhatsApp"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+593 99 123 4567"
            required
            error={errors.phone}
          />

          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            error={errors.email}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ciudad"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Quito"
          />

          <Input
            label="Dirección"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Av. Amazonas y Colón"
          />
        </div>
      </form>
    </Modal>
  );
};
