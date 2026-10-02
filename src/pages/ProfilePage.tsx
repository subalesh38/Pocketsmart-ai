import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, ShieldCheck, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || user?.username || 'Planner');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [buffer, setBuffer] = useState(user?.budgetSafetyBuffer || 5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      city,
      budgetSafetyBuffer: buffer,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Personal Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal details, preferred metro region, and automatic budget buffers.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        {/* Avatar and basic info */}
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold shadow-xs">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{name}</h2>
            <p className="text-xs text-slate-500">{email || 'No email registered'}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified PocketSmart Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="profile-city" className="block text-xs font-semibold text-slate-700 mb-1">
            Primary Metro City
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              id="profile-city"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="Bengaluru">Bengaluru (Karnataka)</option>
              <option value="Mumbai">Mumbai (Maharashtra)</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Chennai">Chennai (Tamil Nadu)</option>
              <option value="Hyderabad">Hyderabad (Telangana)</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Localizes regional rates and courier delivery assumptions.
          </p>
        </div>

        {/* Safety buffer preferences */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="profile-buffer" className="text-xs font-bold text-slate-900 block cursor-pointer">
                Default Budget Safety Buffer
              </label>
              <p className="text-[11px] text-slate-500">
                Minimum unallocated cash PocketSmart reserves in every new plan.
              </p>
            </div>
            <span className="text-sm font-bold text-emerald-700 tabular-nums">{buffer}%</span>
          </div>

          <input
            id="profile-buffer"
            type="range"
            min="3"
            max="15"
            step="1"
            value={buffer}
            onChange={e => setBuffer(Number(e.target.value))}
            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>3% (Aggressive)</span>
            <span>8% (Recommended)</span>
            <span>15% (Ultra-Safe)</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {savedSuccess && (
            <span role="status" aria-live="polite" className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Profile updated successfully!</span>
            </span>
          )}
          {!savedSuccess && <div />}

          <button
            type="submit"
            className="min-h-[44px] px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-900"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
