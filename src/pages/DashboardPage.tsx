import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, PartyPopper, Sparkles, ArrowRight, History, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { historyApi, HistoryItem } from '../api/history';
import { fmt } from '../components/plan/PlanResultComponents';

const PLANNER_CARDS = [
  {
    type: 'home',
    label: 'Home Interior',
    emoji: '🏠',
    desc: 'Budget your dream home interior — lighting, fans, furniture and more.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    icon: Home,
    href: '/planner/home',
  },
  {
    type: 'party',
    label: 'Party & Event',
    emoji: '🎉',
    desc: 'Plan catering, décor and entertainment with per-guest cost tracking.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    icon: PartyPopper,
    href: '/planner/party',
  },
  {
    type: 'jewelry',
    label: 'Jewelry & Accessories',
    emoji: '💍',
    desc: 'Curate jewellery to match your outfit with AI colour analysis.',
    color: 'from-purple-500 to-pink-600',
    bg: 'bg-purple-50',
    icon: Sparkles,
    href: '/planner/jewelry',
  },
];

function TypeIcon({ type }: { type: string }) {
  if (type === 'home') return <Home className="w-4 h-4 text-blue-600" />;
  if (type === 'party') return <PartyPopper className="w-4 h-4 text-amber-600" />;
  return <Sparkles className="w-4 h-4 text-purple-600" />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    historyApi.recent()
      .then(setRecent)
      .catch(() => {}) // silently ignore — not critical
      .finally(() => setLoadingRecent(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-200">
      {/* Welcome */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-sm text-slate-500">What would you like to plan today?</p>
      </div>

      {/* Planner cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANNER_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.type}
              to={card.href}
              className="group bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center text-2xl`}>
                  {card.emoji}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors mt-1" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-1">{card.label}</h2>
                <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                <Icon className="w-3.5 h-3.5" /> Start planning
              </span>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
          </div>
          <Link to="/history" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            View all →
          </Link>
        </div>

        {loadingRecent ? (
          <div className="space-y-3" role="status" aria-live="polite">
            <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            <span className="sr-only">Loading recent plans...</span>
          </div>
        ) : recent.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p>No plans yet. Generate your first plan above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(item => (
              <Link
                key={item.id}
                to={`/history/${item.id}`}
                className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-blue-200 transition-colors flex items-center gap-4 group"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <TypeIcon type={item.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 capitalize">{item.type} Plan</span>
                    <span className="text-[11px] text-slate-400">{formatDate(item.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{item.summary}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-slate-900 tabular-nums">{fmt(item.total_budget)}</div>
                  <div className={`text-[11px] tabular-nums ${item.remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {fmt(item.remaining)} left
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
