import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PartyPopper, ArrowRight, IndianRupee,
  Users, Calendar, Building, Check, AlertCircle,
} from 'lucide-react';
import { planApi } from '../api/plan';
import { ApiError } from '../api/client';
import { fmt } from '../components/plan/PlanResultComponents';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const PARTY_TYPES = ['birthday', 'corporate', 'wedding', 'anniversary', 'other'] as const;
const VENUE_TYPES = ['Home', 'Hall', 'Outdoor', 'Hotel', 'Other'];
const NEEDS_OPTIONS = [
  { id: 'Catering', label: 'Catering', emoji: '🍽', desc: 'Buffet, snacks, drinks & live food' },
  { id: 'Decoration', label: 'Decoration', emoji: '🎨', desc: 'Balloon arches, floral setup & mood lights' },
  { id: 'Entertainment', label: 'Entertainment', emoji: '🎵', desc: 'DJ, live music, interactive games & sound' },
];

export const PartyPlannerPage: React.FC = () => {
  const navigate = useNavigate();

  const [totalBudget, setTotalBudget] = useState(50000);
  const [guestCount, setGuestCount] = useState(50);
  const [partyType, setPartyType] = useState<typeof PARTY_TYPES[number]>('birthday');
  const [venueType, setVenueType] = useState('Home');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(['Catering', 'Decoration', 'Entertainment']);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleNeed = (id: string) => {
    if (selectedNeeds.includes(id)) {
      if (selectedNeeds.length > 1) setSelectedNeeds(selectedNeeds.filter(n => n !== id));
    } else {
      setSelectedNeeds([...selectedNeeds, id]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalBudget < 1000 || totalBudget > 10000000) {
      setError('Budget must be between ₹1,000 and ₹1,00,00,000');
      return;
    }
    if (guestCount < 1 || guestCount > 1000) {
      setError('Guests must be between 1 and 1,000');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const result = await planApi.createPartyPlan({
        total_budget: totalBudget,
        guests: guestCount,
        party_type: partyType,
        venue_type: venueType,
        needs: selectedNeeds.join(', '),
        notes: notes.slice(0, 500),
      });
      navigate('/recommendations/party', { state: { plan: result } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'BUDGET_TOO_LOW' && err.details?.minimum) {
          setError(`Budget too low. Minimum required: ${fmt(err.details.minimum)}`);
        } else {
          setError(err.message);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        <LoadingSkeleton
          title="Planning your budget..."
          subtitle="Calculating per-guest catering, venue allocations, and day-of checklist..."
          variant="plan"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
          <PartyPopper className="w-4 h-4" />
          <span>Party & Event Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Party Budget Planner</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Plan your perfect event with AI-powered budget recommendations.</p>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-8">
        {/* Budget & Guests */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-blue-600" /><span>Basic Information</span>
            </h2>
            <span className="text-xs text-slate-400">Budget & scale</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="party-total-budget" className="block text-xs font-semibold text-slate-700">
                Total Budget (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-lg font-bold">₹</span>
                <input
                  id="party-total-budget"
                  type="number"
                  min="1000"
                  max="10000000"
                  step="1000"
                  required
                  value={totalBudget}
                  onChange={e => setTotalBudget(Number(e.target.value))}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2.5 text-base font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 tabular-nums"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="party-guest-count" className="block text-xs font-semibold text-slate-700">
                Number of Guests
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Users className="w-4 h-4" />
                </div>
                <input
                  id="party-guest-count"
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={guestCount}
                  onChange={e => setGuestCount(Number(e.target.value))}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2.5 text-base font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 tabular-nums"
                />
              </div>
            </div>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex justify-between items-center">
            <span>Estimated per-plate (catering ~45%):</span>
            <strong className="tabular-nums">~{fmt(Math.round((totalBudget * 0.45) / Math.max(1, guestCount)))}</strong>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /><span>Event Details</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="party-type-select" className="block text-xs font-semibold text-slate-700">
                Party Type
              </label>
              <select
                id="party-type-select"
                value={partyType}
                onChange={e => setPartyType(e.target.value as any)}
                className="w-full min-h-[44px] px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-600 capitalize"
              >
                {PARTY_TYPES.map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="party-venue-select" className="block text-xs font-semibold text-slate-700">
                Venue Type
              </label>
              <select
                id="party-venue-select"
                value={venueType}
                onChange={e => setVenueType(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-600"
              >
                {VENUE_TYPES.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* What You Need */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" /><span>What do you need?</span>
            </h2>
            <span className="text-xs text-slate-400">At least one service</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {NEEDS_OPTIONS.map(opt => {
              const isSelected = selectedNeeds.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleNeed(opt.id)}
                  className={`min-h-[44px] p-4 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected ? 'border-blue-600 bg-blue-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{opt.emoji}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{opt.label}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Requests */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
          <label htmlFor="party-special-requests" className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
            Special Requests & Notes (Optional)
          </label>
          <textarea
            id="party-special-requests"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value.slice(0, 500))}
            placeholder="Themes, dietary requirements, specific games or entertainment..."
            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800 leading-relaxed"
          />
          <p className="text-[11px] text-slate-400">Max 500 characters · {500 - notes.length} remaining</p>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <span>Generate Party Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
