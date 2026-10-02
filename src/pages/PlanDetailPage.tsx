import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Home, PartyPopper, Sparkles, Clock } from 'lucide-react';
import { historyApi } from '../api/history';
import { planApi, PlanResult } from '../api/plan';
import { ApiError } from '../api/client';
import {
  fmt, BudgetSummaryCard, CategorySection, DemoBanner,
} from '../components/plan/PlanResultComponents';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

function TypeLabel({ type }: { type?: string }) {
  if (type === 'home') return <><Home className="w-4 h-4" /> Home Plan</>;
  if (type === 'party') return <><PartyPopper className="w-4 h-4" /> Party Plan</>;
  return <><Sparkles className="w-4 h-4" /> Jewelry Plan</>;
}

export const PlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [tierError, setTierError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    historyApi.detail(id)
      .then(data => setPlan(data))
      .catch((e: any) => setError(e.message ?? 'Plan not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleTierChange = async (itemId: string, tier: string) => {
    if (!plan) return;
    setTierError(null);
    setChangingId(itemId);
    try {
      const updated = await planApi.recalculate(plan.plan_id, itemId, tier);
      setPlan(updated);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'BUDGET_TOO_LOW' && err.details?.minimum) {
        setTierError(`Cannot upgrade: minimum budget required is ${fmt(err.details.minimum)}`);
      } else if (err instanceof ApiError) {
        setTierError(err.message);
      } else {
        setTierError('Failed to recalculate. Please try again.');
      }
    } finally {
      setChangingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <LoadingSkeleton
          title="Loading plan details..."
          subtitle="Retrieving allocation and category recommendations..."
          variant="detail"
        />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-lg mx-auto text-center py-24 space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Plan not found</h2>
        <p className="text-sm text-slate-500">{error ?? 'This plan may have been deleted or belongs to another account.'}</p>
        <Link to="/history" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
      </div>
    );
  }

  const hasDemoItems = plan.items.some(i => i.source_type === 'demo');
  const categories = plan.categories ?? [];
  const byCategory = categories.map(c => ({
    ...c,
    items: plan.items.filter(i => i.category === c.category),
  }));
  const uncategorised = plan.items.filter(i => !categories.some(c => c.category === i.category));
  const oa = plan.outfit_analysis;

  // Detect type from plan data
  const planType = plan.checklist ? 'party' : oa ? 'jewelry' : 'home';

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
            <TypeLabel type={planType} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Plan Details</h1>
        </div>
        <Link to="/history" className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to History
        </Link>
      </div>

      {hasDemoItems && <DemoBanner />}

      {tierError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{tierError}</span>
        </div>
      )}

      {/* Party extras */}
      {(plan.guests != null || plan.per_guest_cost != null) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {plan.guests != null && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-4">
              <span className="text-xs text-slate-500">Guests</span>
              <div className="text-lg font-bold text-slate-900">{plan.guests}</div>
            </div>
          )}
          {plan.per_guest_cost != null && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-4">
              <span className="text-xs text-slate-500">Per-Guest Cost</span>
              <div className="text-lg font-bold text-slate-900">{fmt(plan.per_guest_cost)}</div>
            </div>
          )}
          {plan.contingency != null && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-4">
              <span className="text-xs text-slate-500">Contingency</span>
              <div className="text-lg font-bold text-slate-900">{fmt(plan.contingency)}</div>
            </div>
          )}
        </div>
      )}

      {/* Outfit analysis */}
      {oa && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Outfit Analysis</h2>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
            {oa.colors?.map((c: string) => (
              <span key={c} className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 font-medium">{c}</span>
            ))}
            {oa.style && <span className="font-semibold">{oa.style}</span>}
            {oa.formality && <span className="text-slate-500">{oa.formality}</span>}
          </div>
        </div>
      )}

      <BudgetSummaryCard plan={plan} />

      {byCategory.map(cat => (
        <CategorySection key={cat.category} category={cat.category} allocated={cat.allocated}
          items={cat.items} onTierChange={handleTierChange} changingId={changingId}
          showMatchScore={planType === 'jewelry'} />
      ))}

      {uncategorised.length > 0 && (
        <CategorySection category="Other Items" allocated={uncategorised.reduce((s, i) => s + i.tier_prices[i.tier as 'budget' | 'balanced' | 'premium'] * i.quantity, 0)}
          items={uncategorised} onTierChange={handleTierChange} changingId={changingId} />
      )}

      {plan.checklist && plan.checklist.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Day-of Timeline</h2>
          </div>
          <div className="space-y-2">
            {plan.checklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="shrink-0 font-bold text-blue-600 w-20">{item.time}</span>
                <span className="text-slate-700">{item.task}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
