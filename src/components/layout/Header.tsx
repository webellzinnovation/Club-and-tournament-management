import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Search,
  Trophy,
  Tv,
  ExternalLink,
  ChevronDown,
  Building2,
  LogOut,
  Sparkles,
  ShieldCheck,
  Plus,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenClaimModal: () => void;
  onNavigate: (view: string) => void;
  currentView?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenClaimModal,
  onNavigate,
  currentView = 'dashboard'
}) => {
  const {
    currentUser,
    logout,
    organizations,
    activeOrgId,
    setActiveOrgId,
    unreadNotificationsCount,
    notifications,
    markAllNotificationsAsRead,
    activeTournament,
    tournaments,
    setActiveTournamentId
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const firstName = currentUser?.name?.split(' ')[0] || 'Member';
  const role = currentUser?.currentRole || 'TOURNAMENT_ORGANIZER';

  const getGreetingSubtitle = () => {
    switch (role) {
      case 'CLUB_OWNER':
        return 'Manage club athletes, batches, and subscription plans';
      case 'COACH':
        return 'Track batch attendance and athletic development';
      case 'PLAYER':
        return 'Review your upcoming fixtures and competition points';
      case 'REFEREE':
        return 'Ready for live match court officiating and verification';
      case 'SUPER_ADMIN':
        return 'Platform administration, security audits, and tenant telemetry';
      case 'TOURNAMENT_ORGANIZER':
      default:
        return 'Oversee tournament draws, schedules, and live scorelines';
    }
  };

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
      {/* 1. Left: Friendly SaaS Greeting */}
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <span>Hello {firstName}</span>
          <span className="text-lg">👋</span>
        </h1>
        <p className="text-xs text-slate-400 font-normal hidden sm:block truncate">
          {getGreetingSubtitle()}
        </p>
      </div>

      {/* 2. Middle & Right: Search, Tournament/Org Quick Selector, Notifications, Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar (Modern pill search inspired by reference image) */}
        <button
          id="btn-global-search"
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-2xl text-slate-400 hover:text-slate-600 text-xs transition-all w-60 lg:w-72"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">Search athletes, draws, matches...</span>
          <kbd className="ml-auto text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Tournament Selector for Organizers / Referees */}
        {(role === 'TOURNAMENT_ORGANIZER' || role === 'REFEREE' || role === 'SUPER_ADMIN') && tournaments.length > 0 && (
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <select
              value={activeTournament?.id}
              onChange={(e) => setActiveTournamentId(e.target.value)}
              className="bg-transparent font-medium text-slate-700 text-xs border-none focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Multi-Tenant Organization Switcher */}
        {organizations.length > 1 && (
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[120px]">
                {organizations.find(o => o.id === activeOrgId)?.name || 'Tenant Org'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showOrgDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-1.5">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Organization
                </div>
                {organizations.map(org => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setActiveOrgId(org.id);
                      setShowOrgDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                      org.id === activeOrgId ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    {org.id === activeOrgId && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TV Arena Mode Quick Launcher */}
        <button
          onClick={() => onNavigate('tv_arena')}
          title="Open TV Court Display Arena"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
        >
          <Tv className="w-3.5 h-3.5 text-slate-500" />
          <span>Court TV</span>
        </button>

        {/* Notifications Icon with Badge (Inspired by reference icon) */}
        <div className="relative">
          <button
            id="btn-header-notifications"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-[11px] text-emerald-600 font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs transition-colors ${
                        n.read ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50/70 text-emerald-950 font-medium'
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/60"
          >
            <img
              src={currentUser?.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
              referrerPolicy="no-referrer"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2">
              <div className="p-3 bg-slate-50 rounded-xl mb-2">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {role.replace(/_/g, ' ')}
                </span>
              </div>

              {role === 'PLAYER' && (
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenClaimModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Claim Athlete Profile</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
