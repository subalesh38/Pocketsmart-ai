import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export const Layout: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuth = location.pathname === '/login' || location.pathname === '/register';

  if (isLanding || isAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 text-slate-900">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-slate-900">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
