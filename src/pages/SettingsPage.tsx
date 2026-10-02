import React, { useState } from 'react';
import { Bell, IndianRupee, Globe, Shield, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [language, setLanguage] = useState('en');
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [savingsAlerts, setSavingsAlerts] = useState(true);
  const [theme, setTheme] = useState('light');
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearSession = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await logout();
    setClearedNotice(true);
    setTimeout(() => {
      navigate('/login');
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Application Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure financial conventions, notifications, and application preferences.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* Currency & Region */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <IndianRupee className="w-4 h-4 text-blue-600" />
            <span>Currency & Regional Format</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-currency" className="block text-xs font-semibold text-slate-700 mb-1">
                Display Currency
              </label>
              <input
                id="settings-currency"
                type="text"
                readOnly
                value="₹ INR (Indian Rupee — en-IN format)"
                className="w-full min-h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standardized to Indian Rupee (en-IN format) across all planners.
              </span>
            </div>

            <div>
              <label htmlFor="settings-language" className="block text-xs font-semibold text-slate-700 mb-1">
                Language
              </label>
              <select
                id="settings-language"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full min-h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="en">English (India)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>Notifications & Guardrail Alerts</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer min-h-[44px]">
              <div>
                <div className="text-xs font-bold text-slate-900">Budget Limit Warning</div>
                <div className="text-[11px] text-slate-500">
                  Notify immediately when item selections reach 85% of total budget allowance.
                </div>
              </div>
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={e => setBudgetAlerts(e.target.checked)}
                className="accent-blue-600 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer min-h-[44px]">
              <div>
                <div className="text-xs font-bold text-slate-900">Tier Optimization Alerts</div>
                <div className="text-[11px] text-slate-500">
                  Highlight alternatives that keep your plan within the contingency buffer.
                </div>
              </div>
              <input
                type="checkbox"
                checked={savingsAlerts}
                onChange={e => setSavingsAlerts(e.target.checked)}
                className="accent-blue-600 w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Theme */}
        <div className="pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Theme Preference</span>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Light First (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                theme === 'system'
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              System Default
            </button>
          </div>
        </div>

        {/* Session & Privacy */}
        <div className="pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Session & Device Storage</span>
          </div>

          <p className="text-xs text-slate-500">
            PocketSmart communicates with the secure FastAPI backend. To end your session and clear local device cookies:
          </p>

          <button
            type="button"
            onClick={handleClearSession}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-rose-600"
          >
            {clearedNotice ? <Check className="w-4 h-4 text-emerald-600" /> : <LogOut className="w-4 h-4" />}
            <span>{clearedNotice ? 'Session ended. Redirecting...' : 'Sign Out and Clear Session Cache'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
