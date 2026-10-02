import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  compact?: boolean;
  className?: string;
  linkTo?: string;
}

export const Logo: React.FC<LogoProps> = ({ compact = false, className = '', linkTo = '/' }) => {
  return (
    <Link to={linkTo} className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Wallet / Pocket silhouette with smart blue intelligence element */}
      <div className="relative w-8 h-8 rounded-lg bg-blue-900 border border-blue-800 flex items-center justify-center text-blue-300 shadow-sm transition-transform duration-200 group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-blue-300"
        >
          {/* Pocket / Fold shape */}
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h14a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" />
          {/* Smart central gem / notch */}
          <path d="M16 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
      </div>

      {!compact && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-slate-900">PocketSmart</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              AI
            </span>
          </div>
          <span className="text-[10px] text-slate-500 tracking-tight -mt-0.5 hidden sm:block">
            Spend smarter. Plan better.
          </span>
        </div>
      )}
    </Link>
  );
};
