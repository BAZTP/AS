import { Client } from '../types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    clientType: 'EMPRESA',
    name: 'Corporación Novatech Cía. Ltda.',
    idNumber: '1792345890001',
    phone: '+593 99 876 5432',
    email: 'compras@novatech.ec',
    address: 'Av. Amazonas N35-12 y Corea, Edif. Millennium, Of. 402',
    city: 'Quito',
    state: 'Pichincha',
    notes: 'Empresa corporativa. Pagos a 15 días previa aprobación de orden de compra.',
    createdAt: '2026-01-05T10:00:00.000Z'
  },
  {
    id: 'cli-002',
    clientType: 'EMPRESA',
    name: 'Supermercados del Norte S.A.',
    idNumber: '0992384756001',
    phone: '+593 98 432 1098',
    email: 'seguridad@supernorte.com.ec',
    address: 'Km 6.5 Vía a Daule y Av. Juan Tanca Marengo',
    city: 'Guayaquil',
    state: 'Guayas',
    notes: 'Cadena de minimarkets en expansión. Requiere cotizaciones continuas de cámaras de alta resolución.',
    createdAt: '2026-01-08T11:30:00.000Z'
  },
  {
    id: 'cli-003',
    clientType: 'PERSONA_NATURAL',
    name: 'Ing. Roberto Carlos Morales Andrade',
    idNumber: '1718293041',
    phone: '+593 99 123 4567',
    email: 'roberto.morales@gmail.com',
    address: 'Urb. El Condado, Calle B y Pasaje 4, Casa #45',
    city: 'Quito',
    state: 'Pichincha',
    notes: 'Instalación residencial particular. Cotizar con mano de obra e instalación llave en mano.',
    createdAt: '2026-01-15T15:00:00.000Z'
  },
  {
    id: 'cli-004',
    clientType: 'EMPRESA',
    name: 'Distribuidora Logística El Sol S.A.S.',
    idNumber: '0190456123001',
    phone: '+593 97 654 3210',
    email: 'operaciones@elsollogistica.ec',
    address: 'Parque Industrial, Vía a Chaullabamba Nave 12',
    city: 'Cuenca',
    state: 'Azuay',
    notes: 'Bodegas principales. Interesados en circuito cerrado perimetral IP de 16 cámaras con analítica.',
    createdAt: '2026-01-20T09:45:00.000Z'
  },
  {
    id: 'cli-005',
    clientType: 'PERSONA_NATURAL',
    name: 'Dra. Patricia Elena Cevallos Viteri',
    idNumber: '1802938475',
    phone: '+593 96 789 0123',
    email: 'dra.patriciacevallos@hotmail.com',
    address: 'Av. Cevallos y Montalvo, Consultorios Médicos Médica Sur, Cons. 203',
    city: 'Ambato',
    state: 'Tungurahua',
    notes: 'Consultorio médico privado. Desea 4 cámaras discretas con audio y monitoreo en smartphone.',
    createdAt: '2026-02-01T14:10:00.000Z'
  }
];
