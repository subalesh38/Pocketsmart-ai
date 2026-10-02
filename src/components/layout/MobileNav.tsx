import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, PartyPopper, Sparkles, History } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Home', to: '/planner/home', icon: Home },
    { label: 'Party', to: '/planner/party', icon: PartyPopper },
    { label: 'Jewelry', to: '/planner/jewelry', icon: Sparkles },
    { label: 'History', to: '/history', icon: History },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1 flex items-center justify-around h-14 shadow-lg">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
