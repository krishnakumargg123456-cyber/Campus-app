import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlatformConfig } from '../../context/PlatformConfigContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickLoginDemo } = useAuth();
  const { config } = usePlatformConfig();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (config?.website?.allowLogin === false) {
      setError('Student portal sign-in is temporarily paused by administrator policy.');
      return;
    }
    setIsLoading(true);
    try {
      const checkRes = await fetch('/api/public/check-student-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrPhone }),
      });
      if (checkRes.ok) {
        const access = await checkRes.json();
        if (access.allowLogin === false) {
          setIsLoading(false);
          setError('Student portal sign-in is temporarily disabled by platform administrator.');
          return;
        }
        if (access.suspended) {
          setIsLoading(false);
          setError('This student account is currently suspended. Contact KAMPUS Support.');
          return;
        }
      }
    } catch {
      // proceed to normal validation if offline
    }

    const result = await login(emailOrPhone, password, rememberMe);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else if (result.error) {
      setError(result.error);
    }
  };

  const handleDemoLogin = () => {
    if (config?.website?.allowLogin === false) {
      setError('Student portal sign-in is temporarily paused by administrator policy.');
      return;
    }
    quickLoginDemo();
    navigate('/');
  };

  const handleGoogleLogin = () => {
    if (config?.website?.allowLogin === false) {
      setError('Student portal sign-in is temporarily paused by administrator policy.');
      return;
    }
    setGoogleNotice(true);
    setTimeout(() => {
      quickLoginDemo();
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Lockup */}
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md">
            <span className="font-extrabold text-xl tracking-tight">K</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-slate-100">
            KAMPUS
          </span>
        </div>
        <p className="text-xs uppercase tracking-widest font-semibold text-blue-600 dark:text-blue-400">
          Your Student Life, Connected.
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome back
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Sign in to access your semester timetable, notes, campus passes & AI assistant
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 shadow-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          {googleNotice && (
            <div className="mb-5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-600 dark:text-blue-300 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Simulating Google SSO authentication for college domain...</span>
            </div>
          )}

          {/* Quick Demo Login Option */}
          <div className="mb-6 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                P
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-blue-950 dark:text-blue-200 truncate">
                  Priya Sharma (Demo Student)
                </div>
                <div className="text-[11px] text-blue-700/80 dark:text-blue-300/80 truncate">
                  IIT Bombay · CS & AI Sem 6
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap shadow-2xs transition-colors shrink-0"
            >
              1-Click Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Mobile Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                College Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. priya.sharma@cse.iitb.ac.in"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 select-none">
                  Remember this device for 30 days
                </span>
              </label>
            </div>

            {/* Login CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to KAMPUS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social or SSO Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign-In Button Placeholder */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google College Account</span>
              </button>
            </div>
          </div>

          {/* Link to Register */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>Don&apos;t have an account yet? </span>
            <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Create Student Account
            </Link>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};
