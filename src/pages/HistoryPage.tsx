import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, PartyPopper, Sparkles, History, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { historyApi, HistoryItem } from '../api/history';
import { fmt } from '../components/plan/PlanResultComponents';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

function TypeIcon({ type }: { type: string }) {
  if (type === 'home') return <Home className="w-4 h-4 text-blue-600" />;
  if (type === 'party') return <PartyPopper className="w-4 h-4 text-amber-600" />;
  return <Sparkles className="w-4 h-4 text-purple-600" />;
}

function TypeBg({ type }: { type: string }) {
  if (type === 'home') return 'bg-blue-50';
  if (type === 'party') return 'bg-amber-50';
  return 'bg-purple-50';
}

function TypeLabel({ type }: { type: string }) {
  if (type === 'home') return 'Home';
  if (type === 'party') return 'Party';
  return 'Jewelry';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PAGE_SIZE = 10;

export const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = async (off: number, replace = false) => {
    try {
      const data = await historyApi.list(PAGE_SIZE, off);
      setItems(prev => replace ? data : [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      setOffset(off + data.length);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load history');
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadPage(0, true).finally(() => setIsLoading(false));
  }, []);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await loadPage(offset);
    setIsLoadingMore(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
          <History className="w-4 h-4" /><span>Plan History</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Your Budget Plans</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">All your AI-generated plans, newest first.</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton
          title="Loading history..."
          subtitle="Fetching your saved budget plans..."
          variant="list"
        />
      ) : error ? (
        <div role="alert" aria-live="assertive" className="p-4 rounded-xl bg-red-50 border border-red-200 text-center text-red-700 text-xs font-medium">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No saved plans yet</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">Generate your first budget plan to see it here.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            {['home', 'party', 'jewelry'].map(t => (
              <Link
                key={t}
                to={`/planner/${t}`}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 capitalize"
              >
                Start {t} plan
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-blue-200 transition-colors flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${TypeBg({ type: item.type })} flex items-center justify-center shrink-0`}>
                <TypeIcon type={item.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">
                    <TypeLabel type={item.type} /> Plan
                  </span>
                  {item.has_image && (
                    <span title="Has outfit image">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">{formatDate(item.created_at)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{item.summary}</p>
                <div className="flex items-center gap-4 mt-1 text-xs tabular-nums">
                  <span className="text-slate-600">Total: <strong>{fmt(item.total_budget)}</strong></span>
                  <span className={item.remaining < 0 ? 'text-red-600' : 'text-emerald-600'}>
                    Remaining: <strong>{fmt(item.remaining)}</strong>
                  </span>
                </div>
              </div>
              <Link to={`/history/${item.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shrink-0">
                View <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-2">
              <button onClick={handleLoadMore} disabled={isLoadingMore}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer">
                {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoadingMore ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
