import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  children,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>{label}</span>
          {props.required && <span className="text-rose-500 font-normal">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        className={`
          w-full rounded-xl text-sm transition-all duration-150
          bg-white dark:bg-slate-900 
          text-slate-900 dark:text-slate-100
          border ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
          }
          focus:outline-none focus:ring-4
          disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed
          px-3.5 py-2
          ${className}
        `}
        {...props}
      >
        {options
          ? options.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {opt.label}
              </option>
            ))
          : children}
      </select>

      {error ? (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
