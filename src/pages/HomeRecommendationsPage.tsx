import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { PlanResult, planApi } from '../api/plan';
import { ApiError } from '../api/client';
import {
  fmt,
  BudgetSummaryCard,
  CategorySection,
  DemoBanner,
} from '../components/plan/PlanResultComponents';

export const HomeRecommendationsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanResult | null>(location.state?.plan ?? null);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [tierError, setTierError] = useState<string | null>(null);

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">No plan loaded</h1>
        <p className="text-sm text-slate-500">Go back and generate a home plan first.</p>
        <Link
          to="/planner/home"
          className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Your Home Budget Plan</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            AI-allocated categories and recommended items matching your home specifications.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/planner/home"
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Requirements</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate('/planner/home')}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Fallback Banner */}
      {hasDemoItems && <DemoBanner />}

      {/* Tier Change Error */}
      {tierError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{tierError}</span>
        </div>
      )}

      {/* Summary Bar & Meter & Chart */}
      <BudgetSummaryCard plan={plan} />

      {/* Categories & Items */}
      <div className="space-y-8">
        {byCategory.map(cat => (
          <CategorySection
            key={cat.category}
            category={cat.category}
            allocated={cat.allocated}
            items={cat.items}
            onTierChange={handleTierChange}
            changingId={changingId}
          />
        ))}
      </div>
    </div>
  );
};
