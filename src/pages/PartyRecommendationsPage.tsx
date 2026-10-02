import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle, Users, Clock } from 'lucide-react';
import { PlanResult, planApi } from '../api/plan';
import { ApiError } from '../api/client';
import {
  fmt, BudgetSummaryCard, CategorySection, DemoBanner,
} from '../components/plan/PlanResultComponents';

export const PartyRecommendationsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanResult | null>(location.state?.plan ?? null);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [tierError, setTierError] = useState<string | null>(null);

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">No plan loaded</h2>
        <p className="text-sm text-slate-500">Go back and generate a party plan first.</p>
        <Link to="/planner/party" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Go to Planner
        </Link>
      </div>
    );
  }

  const hasDemoItems = plan.items.some(i => i.source_type === 'demo');

  const handleTierChange = async (itemId: string, tier: string) => {
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

  const categories = plan.categories ?? [];
  const byCategory = categories.map(c => ({
    ...c,
    items: plan.items.filter(i => i.category === c.category),
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Party Budget Plan</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">AI-allocated budget across catering, decoration and entertainment.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/planner/party" className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs">
            <ArrowLeft className="w-3.5 h-3.5" /> Edit Requirements
          </Link>
          <button onClick={() => navigate('/planner/party')}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> New Plan
          </button>
        </div>
      </div>

      {hasDemoItems && <DemoBanner />}

      {tierError && (
        <div role="alert" aria-live="assertive" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{tierError}</span>
        </div>
      )}

      {/* Party-specific stats */}
      {(plan.guests != null || plan.per_guest_cost != null || plan.contingency != null) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {plan.guests != null && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500 bg-blue-50 rounded-lg p-1.5" />
              <div>
                <span className="text-xs text-slate-500">Guests</span>
                <div className="text-lg font-bold text-slate-900">{plan.guests}</div>
              </div>
            </div>
          )}
          {plan.per_guest_cost != null && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">🍽</span>
              <div>
                <span className="text-xs text-slate-500">Per-Guest Cost</span>
                <div className="text-lg font-bold text-slate-900">{fmt(plan.per_guest_cost)}</div>
              </div>
            </div>
          )}
          {plan.contingency != null && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <span className="text-xs text-slate-500">Contingency (8%)</span>
                <div className="text-lg font-bold text-slate-900">{fmt(plan.contingency)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <BudgetSummaryCard plan={plan} />

      {byCategory.map(cat => (
        <CategorySection key={cat.category} category={cat.category} allocated={cat.allocated}
          items={cat.items} onTierChange={handleTierChange} changingId={changingId} />
      ))}

      {/* Day-of checklist */}
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
