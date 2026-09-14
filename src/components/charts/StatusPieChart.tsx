import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface StatusPieChartProps {
  data: StatusData[];
}

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const activeData = data.filter(d => d.value > 0);

  if (activeData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No hay datos de cotizaciones para graficar.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value} cotizaciones`, 'Cantidad']}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
