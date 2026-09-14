import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { formatCurrency } from '../../utils/currency';

interface MonthlyData {
  month: string;
  total: number;
  count: number;
}

interface MonthlyQuotesChartProps {
  data: MonthlyData[];
}

export const MonthlyQuotesChart: React.FC<MonthlyQuotesChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No hay datos mensuales para graficar.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            axisLine={{ stroke: '#cbd5e1' }}
            tickFormatter={val => `$${val}`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'Monto Total ($)') return [formatCurrency(value), name];
              return [value, name];
            }}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#f8fafc',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar 
            dataKey="total" 
            name="Monto Total ($)" 
            fill="#2563eb" 
            radius={[6, 6, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
