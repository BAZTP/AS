import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-900 
        rounded-2xl border border-slate-200/80 dark:border-slate-800 
        shadow-sm hover:shadow-md transition-shadow duration-200 
        overflow-hidden ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, action, className = '', children }) => {
  if (children) {
    return <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 ${className}`}>{children}</div>;
  }

  return (
    <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 ${className}`}>
      <div>
        {title && <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  );
};
