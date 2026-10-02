import React from 'react';

interface AllocationBarProps {
  totalBudget: number;
  allocatedAmount: number;
  formatCurrency: (amount: number) => string;
  label?: string;
  className?: string;
}

export const AllocationBar: React.FC<AllocationBarProps> = ({
  totalBudget,
  allocatedAmount,
  formatCurrency,
  label = 'Budget Allocated',
  className = '',
}) => {
  const percentage = Math.min(Math.round((allocatedAmount / (totalBudget || 1)) * 100), 100);
  const remaining = Math.max(totalBudget - allocatedAmount, 0);
  const isOver = allocatedAmount > totalBudget;
  const isNear = percentage >= 85 && percentage <= 100;

  let barColor = 'bg-emerald-600';
  if (isOver) {
    barColor = 'bg-rose-600';
  } else if (isNear) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 tabular-nums">
            {formatCurrency(allocatedAmount)}
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500 tabular-nums">{formatCurrency(totalBudget)}</span>
          <span
            className={`font-semibold tabular-nums ${
              isOver ? 'text-rose-600' : isNear ? 'text-amber-600' : 'text-emerald-700'
            }`}
          >
            ({percentage}%)
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>
          {isOver ? (
            <span className="text-rose-600 font-medium">Over budget by {formatCurrency(allocatedAmount - totalBudget)}</span>
          ) : (
            <span>
              Remaining:{' '}
              <strong className="text-slate-800 tabular-nums font-semibold">
                {formatCurrency(remaining)}
              </strong>
            </span>
          )}
        </span>
        <span className="tabular-nums">Safety Buffer: ~{Math.max(100 - percentage, 0)}%</span>
      </div>
    </div>
  );
};
