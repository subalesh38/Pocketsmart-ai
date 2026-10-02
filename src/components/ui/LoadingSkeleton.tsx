import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface LoadingSkeletonProps {
  title?: string;
  subtitle?: string;
  variant?: 'plan' | 'list' | 'detail';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  title = 'Planning your budget...',
  subtitle = 'Analyzing your preferences and finding suitable recommendations...',
  variant = 'plan',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-3xl mx-auto p-6 sm:p-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-6 animate-pulse"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{title}</span>
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {variant === 'plan' && (
        <div className="space-y-5 pt-2">
          {/* Summary bar skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
          </div>

          {/* Health bar skeleton */}
          <div className="h-3 bg-slate-100 rounded-full w-full" />

          {/* Category card skeletons */}
          <div className="space-y-3 pt-2">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-20 bg-slate-100 rounded-xl" />
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
        </div>
      )}

      {variant === 'list' && (
        <div className="space-y-3 pt-2">
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
        </div>
      )}

      {variant === 'detail' && (
        <div className="space-y-4 pt-2">
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-32 bg-slate-100 rounded-xl" />
        </div>
      )}

      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};
