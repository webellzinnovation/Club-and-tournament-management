import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Trophy,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, loginAsDemoUser, registerWithEmail } = useApp();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);

  // Sign In Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('TOURNAMENT_ORGANIZER');
  const [signupOrgId, setSignupOrgId] = useState('org-1');
  const [signupClubId, setSignupClubId] = useState('club-1');

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsOperationNotAllowed(false);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsOperationNotAllowed(false);
    setLoading(true);
    try {
      await loginWithEmail(loginEmail, loginPassword);
    } catch (err: unknown) {
      console.error('Sign In Error:', err);
      const msg = err instanceof Error ? err.message : 'Sign in failed. Please check your credentials.';
      setError(msg);
      if (msg.includes('operation-not-allowed') || msg.includes('disabled in your Firebase Console')) {
        setIsOperationNotAllowed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsOperationNotAllowed(false);
    setLoading(true);
    try {
      await registerWithEmail(
        signupName,
        signupEmail,
        signupPassword,
        signupRole,
        signupOrgId,
        signupRole === 'CLUB_OWNER' || signupRole === 'COACH' ? signupClubId : undefined
      );
    } catch (err: unknown) {
      console.error('Sign Up Error:', err);
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError(msg);
      if (msg.includes('operation-not-allowed') || msg.includes('disabled in your Firebase Console')) {
        setIsOperationNotAllowed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Instant one-click login for quick testing across all roles
  const handleQuickSignIn = async (email: string, role: UserRole, name: string) => {
    setError(null);
    setIsOperationNotAllowed(false);
    setLoading(true);
    try {
      const orgId = email.includes('org2') ? 'org-2' : 'org-1';
      const clubId = role === 'CLUB_OWNER' || role === 'COACH' 
        ? (email.includes('org2') ? 'club-3' : 'club-1') 
        : 'club-1';

      // Use fast demo sandbox login that guarantees seamless access across roles
      await loginAsDemoUser(role, email, name, orgId, clubId);
    } catch (err: unknown) {
      console.error('Quick Sign In Error:', err);
      setError(err instanceof Error ? err.message : 'Quick sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          SportOS Cloud
        </h1>
        <p className="mt-1.5 text-xs text-neutral-400 max-w-sm mx-auto">
          Multi-Tenant Sports Club & Tournament Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-neutral-900 border border-neutral-800 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          
          {/* Primary Google Sign-In Provider (Standard for Firebase in AI Studio) */}
          <div className="mb-6">
            <button
              id="btn-google-signin"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{loading ? 'Authenticating with Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-neutral-900 px-3 text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">
                  Or sign in with email
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-800 mb-6">
            <button
              id="tab-auth-signin"
              onClick={() => { setTab('signin'); setError(null); setIsOperationNotAllowed(false); }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition-colors border-b-2 ${
                tab === 'signin'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-auth-signup"
              onClick={() => { setTab('signup'); setError(null); setIsOperationNotAllowed(false); }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition-colors border-b-2 ${
                tab === 'signup'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="font-medium">{error}</span>
              </div>

              {isOperationNotAllowed && (
                <div className="mt-1 pt-2 border-t border-red-800/50 text-[11px] text-red-200 space-y-1.5">
                  <p className="font-semibold text-amber-300">
                    Why did this happen?
                  </p>
                  <p>
                    By default, Firebase projects only have Google Login enabled. The Email/Password provider is turned off in the Firebase Console until you enable it.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href="https://console.firebase.google.com/project/favorable-iris-226301/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:underline"
                    >
                      Enable Email/Password in Console
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-neutral-400">•</span>
                    <button
                      type="button"
                      onClick={() => handleQuickSignIn('anand.organizer@sportos.app', 'TOURNAMENT_ORGANIZER', 'Anand Kumar')}
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Or Use Quick Test Access
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="block w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  Password
                </label>
                <div className="mt-1 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                id="btn-submit-signin"
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Sign In with Email</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-signup-name"
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Anand Kumar"
                    className="block w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="input-signup-email"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="anand@example.com"
                    className="block w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  Password
                </label>
                <div className="mt-1 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-signup-password"
                    type="password"
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="block w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    Role in Organization
                  </label>
                  <select
                    id="select-signup-role"
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as UserRole)}
                    className="mt-1 block w-full py-2 px-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="TOURNAMENT_ORGANIZER">Tournament Organizer</option>
                    <option value="CLUB_OWNER">Club Owner</option>
                    <option value="COACH">Coach</option>
                    <option value="PLAYER">Player / Athlete</option>
                    <option value="REFEREE">Referee</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    Organization
                  </label>
                  <select
                    id="select-signup-org"
                    value={signupOrgId}
                    onChange={(e) => setSignupOrgId(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="org-1">Tamil Nadu Sports Federation</option>
                    <option value="org-2">Karnataka Badminton Association</option>
                  </select>
                </div>
              </div>

              <button
                id="btn-submit-signup"
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Register Account</span>
              </button>
            </form>
          )}

          {/* Quick Role-Switcher Testing Sandbox */}
          <div className="mt-8 pt-6 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Instant Role Quick Access
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">1-Click Preview</span>
            </div>
            <p className="text-[11px] text-neutral-400 mb-3">
              Switch directly to any hierarchical role to test scoped views and permissions without needing an email setup:
            </p>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                id="btn-quick-auth-organizer"
                type="button"
                onClick={() => handleQuickSignIn('anand.organizer@sportos.app', 'TOURNAMENT_ORGANIZER', 'Anand Kumar')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-400">Tournament Organizer</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Org 1</span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate">Anand Kumar • Draws & Matches</p>
              </button>

              <button
                id="btn-quick-auth-clubowner"
                type="button"
                onClick={() => handleQuickSignIn('rajesh.owner@sportos.app', 'CLUB_OWNER', 'Rajesh Sharma')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-400">Club Owner</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">Club 1</span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate">Rajesh Sharma • Batches & Staff</p>
              </button>

              <button
                id="btn-quick-auth-coach"
                type="button"
                onClick={() => handleQuickSignIn('deepa.coach@sportos.app', 'COACH', 'Deepa Venkat')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-400">Coach</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Club 1</span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate">Deepa Venkat • Attendance & Plans</p>
              </button>

              <button
                id="btn-quick-auth-referee"
                type="button"
                onClick={() => handleQuickSignIn('vikram.referee@sportos.app', 'REFEREE', 'Vikram Malhotra')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-400">Referee</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Duty</span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate">Vikram Malhotra • Live Scoring</p>
              </button>

              <button
                id="btn-quick-auth-player"
                type="button"
                onClick={() => handleQuickSignIn('rohan.player@sportos.app', 'PLAYER', 'Rohan Verma')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-400">Player</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Athlete</span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate">Rohan Verma • Stats & Profile</p>
              </button>

              <button
                id="btn-quick-auth-superadmin"
                type="button"
                onClick={() => handleQuickSignIn('sarah.admin@sportos.app', 'SUPER_ADMIN', 'Sarah Jenkins')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-400">Super Admin</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Global</span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate">Sarah Jenkins • All Tenants</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
