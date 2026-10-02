import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  PartyPopper,
  Sparkles,
  History,
  User,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Home Planner',
      to: '/planner/home',
      icon: Home,
    },
    {
      label: 'Party Planner',
      to: '/planner/party',
      icon: PartyPopper,
    },
    {
      label: 'Jewelry Planner',
      to: '/planner/jewelry',
      icon: Sparkles,
    },
    {
      label: 'History',
      to: '/history',
      icon: History,
    },
  ];

  const secondaryItems = [
    {
      label: 'Profile',
      to: '/profile',
      icon: User,
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 hidden lg:flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Planning Suite
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Secondary & Account settings */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          {secondaryItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Budget Safety Guarantee */}
        <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>PocketSmart 100% Zero-Overspend Guarantee</span>
        </div>
      </div>
    </aside>
  );
};
