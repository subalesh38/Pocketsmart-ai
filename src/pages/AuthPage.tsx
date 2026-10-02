import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';
import { Lock, Mail, User, ArrowRight, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const isLogin = location.pathname === '/login';
  const searchParams = new URLSearchParams(location.search);
  const isExpired = searchParams.get('expired') === '1' || searchParams.get('expired') === 'true';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!username.trim()) {
      errors.username = 'Username is required.';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }

    if (!isLogin) {
      if (!email.trim()) {
        errors.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!isLogin && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await authApi.login(username, password);
        login(username, username);
        navigate('/dashboard');
      } else {
        await authApi.register(username, email, password);
        await authApi.login(username, password);
        login(email, username);
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-2">
            <Logo compact={false} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {isLogin ? 'Sign in to PocketSmart' : 'Create your PocketSmart account'}
          </h1>
          <p className="text-xs text-slate-500">
            {isLogin
              ? 'Access your saved budget allocations and smart recommendations'
              : 'Begin planning with AI financial guardrails and smart recommendations'}
          </p>
        </div>

        {/* Session Expired State */}
        {isExpired && isLogin && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-800 text-xs"
          >
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <strong className="font-semibold">Session expired.</strong> Please sign in again to continue your session.
            </div>
          </div>
        )}

        {/* Server Error State */}
        {serverError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Username Field */}
          <div>
            <label htmlFor="auth-username" className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="auth-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.username}
                aria-describedby={fieldErrors.username ? 'auth-username-error' : undefined}
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: undefined }));
                }}
                placeholder="e.g. aditi_sharma"
                className={`w-full min-h-[44px] pl-9 pr-3 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
                  fieldErrors.username ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
            </div>
            {fieldErrors.username && (
              <p id="auth-username-error" role="alert" className="text-[11px] text-red-600 mt-1">
                {fieldErrors.username}
              </p>
            )}
          </div>

          {/* Email Field (Register only) */}
          {!isLogin && (
            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined}
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@example.com"
                  className={`w-full min-h-[44px] pl-9 pr-3 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
                    fieldErrors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-blue-600'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p id="auth-email-error" role="alert" className="text-[11px] text-red-600 mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>
          )}

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="auth-password" className="text-xs font-semibold text-slate-700">
                Password
              </label>
              {isLogin && (
                <span className="text-[11px] text-slate-400">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full min-h-[44px] pl-9 pr-3 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
                  fieldErrors.password ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p id="auth-password-error" role="alert" className="text-[11px] text-red-600 mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div>
              <label htmlFor="auth-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={fieldErrors.confirmPassword ? 'auth-confirm-password-error' : undefined}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`w-full min-h-[44px] pl-9 pr-3 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
                    fieldErrors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-blue-600'
                  }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p id="auth-confirm-password-error" role="alert" className="text-[11px] text-red-600 mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <span>{isSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Switch Links */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 min-h-[44px] inline-flex items-center">
                Create Account
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 min-h-[44px] inline-flex items-center">
                Sign In
              </Link>
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Encrypted financial budget data · Private & Secure</span>
        </div>
      </div>
    </div>
  );
};
