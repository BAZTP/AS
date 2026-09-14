import React from 'react';
import { QuotationStatus, ClientType } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantClasses = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    primary: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    info: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const QuotationStatusBadge: React.FC<{ status: QuotationStatus }> = ({ status }) => {
  switch (status) {
    case 'ACEPTADA':
      return <Badge variant="success">Aceptada</Badge>;
    case 'PENDIENTE':
      return <Badge variant="warning">Pendiente</Badge>;
    case 'ENVIADA':
      return <Badge variant="info">Enviada</Badge>;
    case 'BORRADOR':
      return <Badge variant="default">Borrador</Badge>;
    case 'RECHAZADA':
      return <Badge variant="danger">Rechazada</Badge>;
    case 'VENCIDA':
      return <Badge variant="purple">Vencida</Badge>;
    case 'CANCELADA':
      return <Badge variant="danger">Cancelada</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const ClientTypeBadge: React.FC<{ type: ClientType }> = ({ type }) => {
  switch (type) {
    case 'EMPRESA':
      return <Badge variant="primary">Empresa</Badge>;
    case 'PERSONA_NATURAL':
      return <Badge variant="default">Persona Natural</Badge>;
    default:
      return <Badge variant="default">Otro</Badge>;
  }
};
