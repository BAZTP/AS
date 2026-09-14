import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
  debounceMs = 250,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={e => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-9 pr-9 py-2 text-sm rounded-xl
          bg-white dark:bg-slate-900
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          border border-slate-200 dark:border-slate-800
          focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
          transition-all duration-150
        "
      />
      {internalValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
          title="Limpiar búsqueda"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
