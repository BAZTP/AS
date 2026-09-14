import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface TopProductData {
  name: string;
  quantity: number;
}

interface TopProductsChartProps {
  data: TopProductData[];
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No hay ítems registrados en cotizaciones todavía.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={120} 
            tick={{ fontSize: 11, fill: '#64748b' }} 
          />
          <Tooltip 
            formatter={(value: number) => [`${value} unidades`, 'Cotizadas']}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="quantity" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
