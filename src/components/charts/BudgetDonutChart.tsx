import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategorySlice {
  name: string;
  percentage: number;
  amount: number;
}

interface BudgetDonutChartProps {
  categories: CategorySlice[];
  totalBudget: number;
  formatCurrency: (val: number) => string;
}

const PALETTE = [
  '#059669', // Emerald
  '#0284C7', // Sky
  '#D97706', // Amber
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#94A3B8', // Slate / Buffer
];

export const BudgetDonutChart: React.FC<BudgetDonutChartProps> = ({
  categories,
  totalBudget,
  formatCurrency,
}) => {
  const chartData = categories.map((cat, idx) => ({
    name: cat.name,
    value: cat.amount,
    percentage: cat.percentage,
    color: PALETTE[idx % PALETTE.length],
  }));

  const totalAllocated = categories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
      <div className="relative w-44 h-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={52}
              outerRadius={76}
              paddingAngle={3}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value)), 'Allocation']}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#1E293B',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12px',
                padding: '6px 10px',
              }}
              itemStyle={{ color: '#E2E8F0' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] font-medium text-slate-400">Total Budget</span>
          <span className="text-xs font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalBudget)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2">
        {chartData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-700 font-medium truncate max-w-[130px] sm:max-w-[180px]">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className="text-slate-400 tabular-nums">{item.percentage}%</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatCurrency(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
