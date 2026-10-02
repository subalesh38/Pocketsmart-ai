/**
 * Shared plan result components reused by Home, Party and Jewelry results pages.
 */
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, Info, ChevronDown } from 'lucide-react';
import { PlanItem, PlanResult } from '../../api/plan';

export const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
export const fmt = (n: number) => INR.format(n);

// ─── Budget health meter ──────────────────────────────────────────────
export function BudgetHealthMeter({ allocated, total }: { allocated: number; total: number }) {
  const pct = Math.round((allocated / total) * 100);
  const isRed = pct > 97;
  const isAmber = pct > 85;
  const color = isRed ? 'bg-red-500' : isAmber ? 'bg-amber-400' : 'bg-emerald-500';
  const label = isRed ? 'Over budget' : isAmber ? 'Near limit' : 'Healthy';
  const labelColor = isRed ? 'text-red-700' : isAmber ? 'text-amber-700' : 'text-emerald-700';
  const StatusIcon = isAmber ? AlertTriangle : CheckCircle2;
  const iconColor = isRed ? 'text-red-500' : isAmber ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">Budget utilisation</span>
        <span className={`inline-flex items-center gap-1 font-bold ${labelColor}`}>
          <StatusIcon className={`w-3.5 h-3.5 ${iconColor}`} />
          {label} · {pct}%
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────
const PALETTE = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#e879f9', '#f97316', '#06b6d4', '#84cc16'];

export function DonutChart({
  categories,
}: {
  categories: { category: string; allocated: number; percent_of_budget: number }[];
}) {
  let offset = 0;
  const r = 36;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width={96} height={96} viewBox="0 0 96 96">
        <circle cx={48} cy={48} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
        {categories.map((cat, i) => {
          const frac = cat.percent_of_budget / 100;
          const dash = circ * frac;
          const gap = circ - dash;
          const el = (
            <circle
              key={cat.category}
              cx={48}
              cy={48}
              r={r}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={14}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="space-y-1.5">
        {categories.map((cat, i) => (
          <div key={cat.category} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
            <span className="text-slate-700 font-medium truncate max-w-[140px]">{cat.category}</span>
            <span className="text-slate-400 tabular-nums ml-auto">{fmt(cat.allocated)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Budget summary card ──────────────────────────────────────────────
export function BudgetSummaryCard({ plan }: { plan: PlanResult }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-xs font-medium text-slate-500">Total Budget</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{fmt(plan.total_budget)}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-xs font-medium text-slate-500">Allocated</span>
          <div className="text-2xl font-bold text-blue-700 tabular-nums mt-1">{fmt(plan.allocated)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {Math.round((plan.allocated / plan.total_budget) * 100)}% of total
          </span>
        </div>
        <div
          className={`p-4 rounded-xl border ${
            plan.remaining < 0 ? 'bg-red-50/70 border-red-200' : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <span className={`text-xs font-medium ${plan.remaining < 0 ? 'text-red-800' : 'text-emerald-800'}`}>
            Remaining
          </span>
          <div
            className={`text-2xl font-bold tabular-nums mt-1 ${
              plan.remaining < 0 ? 'text-red-700' : 'text-emerald-700'
            }`}
          >
            {fmt(plan.remaining)}
          </div>
        </div>
      </div>

      <BudgetHealthMeter allocated={plan.allocated} total={plan.total_budget} />

      {plan.categories && plan.categories.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-700 mb-3">Allocation by category</p>
          <DonutChart categories={plan.categories} />
        </div>
      )}
    </div>
  );
}

// ─── Tier selector ────────────────────────────────────────────────────
const TIERS = ['budget', 'balanced', 'premium'] as const;
type Tier = (typeof TIERS)[number];

export function TierSelector({
  item,
  onTierChange,
  isChanging,
}: {
  item: PlanItem;
  onTierChange: (itemId: string, tier: string) => void;
  isChanging: boolean;
}) {
  return (
    <div className="flex items-center gap-1 mt-2">
      {TIERS.map(t => (
        <button
          key={t}
          type="button"
          disabled={isChanging}
          onClick={() => t !== item.tier && onTierChange(item.id, t)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors capitalize ${
            item.tier === t
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
          } disabled:opacity-50`}
        >
          {t === item.tier && isChanging ? '…' : t}
        </button>
      ))}
      <span className="text-[10px] text-slate-400 ml-1">
        B:{fmt(item.tier_prices.budget)} · M:{fmt(item.tier_prices.balanced)} · P:{fmt(item.tier_prices.premium)}
      </span>
    </div>
  );
}

// ─── Item card ────────────────────────────────────────────────────────
export function ItemCard({
  item,
  onTierChange,
  changingId,
  showMatchScore = false,
}: {
  item: PlanItem;
  onTierChange: (id: string, tier: string) => void;
  changingId: string | null;
  showMatchScore?: boolean;
}) {
  const [showReason, setShowReason] = useState(false);
  const unitPrice = item.tier_prices[item.tier as Tier];
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-blue-200 transition-colors space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              Estimated
            </span>
            {item.source_type === 'demo' && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Demo data
              </span>
            )}
            {showMatchScore && item.match_score != null && (
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                {item.match_score}% style match
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-base font-bold text-slate-900 tabular-nums">{fmt(lineTotal)}</div>
          <div className="text-[11px] text-slate-400 tabular-nums">
            {item.quantity} × {fmt(unitPrice)}
          </div>
        </div>
      </div>

      <TierSelector item={item} onTierChange={onTierChange} isChanging={changingId === item.id} />

      <button
        type="button"
        onClick={() => setShowReason(v => !v)}
        className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 mt-1"
      >
        <Info className="w-3.5 h-3.5" />
        <span>Why this pick</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${showReason ? 'rotate-180' : ''}`} />
      </button>
      {showReason && (
        <p className="text-[11px] text-slate-600 bg-blue-50 rounded-lg p-2 border border-blue-100">{item.reason}</p>
      )}

      {item.links && item.links.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {item.links.map(link => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
            >
              {link.platform}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category section ─────────────────────────────────────────────────
export function CategorySection({
  category,
  allocated,
  items,
  onTierChange,
  changingId,
  showMatchScore = false,
}: {
  category: string;
  allocated: number;
  items: PlanItem[];
  onTierChange: (id: string, tier: string) => void;
  changingId: string | null;
  showMatchScore?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">{category}</h2>
          <span className="text-xs text-slate-500">Allocated: {fmt(allocated)}</span>
        </div>
        <span className="text-xs font-bold text-slate-900 tabular-nums bg-slate-100 px-3 py-1 rounded-lg">
          {fmt(allocated)}
        </span>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onTierChange={onTierChange}
            changingId={changingId}
            showMatchScore={showMatchScore}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Demo banner ──────────────────────────────────────────────────────
export function DemoBanner() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
      <div>
        <strong>Sample suggestions in use.</strong> Some items use demo data because the AI service was unavailable. Prices
        are illustrative only.
      </div>
    </div>
  );
}
