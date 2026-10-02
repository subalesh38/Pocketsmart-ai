import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Home,
  PartyPopper,
  Sparkles,
  History,
  LogOut,
  Layers,
  Menu,
  X,
  User,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Home Planner', to: '/planner/home', icon: Home, matchPrefixes: ['/planner/home', '/recommendations/home'] },
    { label: 'Party Planner', to: '/planner/party', icon: PartyPopper, matchPrefixes: ['/planner/party', '/recommendations/party'] },
    { label: 'Jewelry Planner', to: '/planner/jewelry', icon: Sparkles, matchPrefixes: ['/planner/jewelry', '/recommendations/jewelry'] },
    { label: 'History', to: '/history', icon: History, matchPrefixes: ['/history'] },
  ];

  const isLinkActive = (item: typeof navLinks[0]) => {
    if (item.matchPrefixes) {
      return item.matchPrefixes.some(prefix => location.pathname.startsWith(prefix));
    }
    return location.pathname === item.to;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <Logo linkTo={isLanding ? '/' : '/dashboard'} />
        </div>

        {/* Zone 2: Navigation Links */}
        {isLanding ? (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
            <Link to="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
          </nav>
        ) : (
          /* Authenticated Desktop Navigation: Dashboard | Home Planner | Party Planner | Jewelry Planner | History */
          <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-600">
            {navLinks.map(item => {
              const active = isLinkActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">

          {isLanding ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="hidden sm:inline-flex px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-2xs whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          ) : isAuthPage ? (
            <Link
              to="/"
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Back to Home
            </Link>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User badge */}
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-medium border border-transparent hover:border-slate-200"
                title="View Profile"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px]">
                  {user?.name ? user.name.charAt(0) : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden lg:inline">{user?.name || 'Account'}</span>
              </Link>

              {/* Logout Button: explicitly required in Section 3 */}
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Logout of PocketSmart AI"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer / Responsive Menu */}
      {mobileMenuOpen && !isLanding && !isAuthPage && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Signed in as {user?.name || 'User'}
            </span>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
              AI Planner Active
            </span>
          </div>
          {navLinks.map(item => {
            const active = isLinkActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium py-1"
            >
              Profile & Settings
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="text-xs text-rose-600 font-medium flex items-center gap-1 py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
