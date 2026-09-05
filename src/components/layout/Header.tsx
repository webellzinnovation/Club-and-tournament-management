import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  Search,
  Trophy,
  Tv,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  Building2,
  Database
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
    users,
    switchUser,
    switchRole,
    organizations,
    organization,
    activeOrgId,
    setActiveOrgId,
    unreadNotificationsCount,
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    activeTournament,
    schedulingConflicts,
    isFirestoreLive
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const roles: { role: UserRole; label: string; badgeColor: string }[] = [
    { role: 'TOURNAMENT_ORGANIZER', label: 'Tournament Organizer', badgeColor: 'bg-amber-100 text-amber-800' },
    { role: 'REFEREE', label: 'Referee / Official', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { role: 'PLAYER', label: 'Player (Athlete)', badgeColor: 'bg-blue-100 text-blue-800' },
    { role: 'CLUB_OWNER', label: 'Club Owner', badgeColor: 'bg-purple-100 text-purple-800' },
    { role: 'COACH', label: 'Head Coach', badgeColor: 'bg-indigo-100 text-indigo-800' },
    { role: 'SUPER_ADMIN', label: 'Super Admin', badgeColor: 'bg-rose-100 text-rose-800' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 lg:px-6 h-16 flex items-center justify-between shadow-xs">
      {/* Brand & Multi-Tenant Context */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          id="btn-brand-home"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-xs">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-neutral-900 tracking-tight text-lg">SportOS</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium truncate max-w-[140px] sm:max-w-none">
              {activeTournament?.title || 'Tournament & Club Platform'}
            </p>
          </div>
        </button>

        {/* Multi-Tenant Organization Switcher Pill */}
        <div className="relative hidden lg:block">
          <button
            id="btn-org-switcher"
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 transition-colors"
            title="Switch Active Organization Boundary"
          >
            <Building2 className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-semibold truncate max-w-[150px]">{organization.name}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showOrgDropdown && (
            <div className="absolute left-0 mt-2 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 z-50">
              <div className="px-2 py-1 border-b border-neutral-100 mb-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Multi-Tenant Boundary</p>
                <p className="text-xs text-neutral-600">Select active tenant organization</p>
              </div>
              <div className="space-y-1">
                {organizations.map(org => (
                  <button
                    key={org.id}
                    id={`btn-org-${org.id}`}
                    onClick={() => {
                      setActiveOrgId(org.id);
                      setShowOrgDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      activeOrgId === org.id
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{org.name}</p>
                      <p className={`text-[10px] ${activeOrgId === org.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        {org.type} • {org.tier} Tier
                      </p>
                    </div>
                    {activeOrgId === org.id && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Realtime Database Sync Badge */}
        <div
          id="badge-firestore-status"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"
          title="Cloud Firestore real-time listener active"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Firestore Live</span>
        </div>

        {/* Conflict Warning Pill if any */}
        {schedulingConflicts.length > 0 && (
          <button
            id="btn-header-conflicts"
            onClick={() => onNavigate('assignments')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors animate-pulse"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>{schedulingConflicts.length} Conflict{schedulingConflicts.length > 1 ? 's' : ''}</span>
          </button>
        )}
      </div>

      {/* Center Search Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          id="btn-search-trigger"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-neutral-100/80 hover:bg-neutral-100 text-neutral-500 rounded-lg text-sm border border-neutral-200/70 transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-400 text-xs font-normal">Search tournaments, players (TT-...), matches...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-neutral-300 rounded text-neutral-500">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          id="btn-mobile-search"
          onClick={onOpenSearch}
          className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Public View Trigger */}
        <button
          id="btn-public-portal"
          onClick={() => onNavigate('public_portal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            currentView === 'public_portal'
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'text-neutral-700 bg-white border-neutral-200 hover:bg-neutral-50'
          }`}
          title="View Public Tournament Portal"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Public Portal</span>
        </button>

        {/* TV Display Trigger */}
        <button
          id="btn-venue-display"
          onClick={() => onNavigate('tv_arena')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            currentView === 'tv_arena'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'text-amber-700 bg-amber-50/80 border-amber-200 hover:bg-amber-100'
          }`}
          title="TV Arena Display for Projectors & Screens"
        >
          <Tv className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">TV Arena</span>
        </button>

        {/* Claim Profile button */}
        {(!currentUser.linkedPlayerId || currentUser.currentRole === 'PLAYER') && (
          <button
            id="btn-claim-profile"
            onClick={onOpenClaimModal}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentUser.linkedPlayerId ? `Claimed (${currentUser.linkedPlayerId})` : 'Claim Player ID'}</span>
          </button>
        )}

        {/* Notification Bell & Dropdown */}
        <div className="relative">
          <button
            id="btn-notification-bell"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-neutral-900">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      {unreadNotificationsCount} unread
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    id="btn-mark-all-read"
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">No notifications yet.</div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.matchId) onNavigate('assignments');
                        setShowNotifDropdown(false);
                      }}
                      className={`p-3 cursor-pointer hover:bg-neutral-50 transition-colors ${
                        !n.isRead ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-semibold ${!n.isRead ? 'text-neutral-900' : 'text-neutral-600'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-neutral-100 bg-neutral-50 text-center">
                <button
                  id="btn-view-all-notifications"
                  onClick={() => {
                    onNavigate('announcements');
                    setShowNotifDropdown(false);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  View Announcements & Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role & Multi-Tenant Dev Quick Switcher */}
        <div className="relative">
          <button
            id="btn-user-role-dropdown"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-all text-left"
          >
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-neutral-300"
            />
            <div className="hidden lg:block leading-tight">
              <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1">
                <span className="truncate max-w-[110px]">{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </div>
              <div className="text-[10px] text-neutral-500 font-medium">
                {currentUser.currentRole.replace(/_/g, ' ')}
              </div>
            </div>
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 z-50">
              <div className="px-2 py-1.5 border-b border-neutral-100 mb-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Dev Quick Switcher</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-mono font-semibold">
                    Multi-Tenant RBAC
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 mt-0.5">Switch active role for current account</p>
              </div>

              <div className="space-y-1">
                {roles.map(r => (
                  <button
                    key={r.role}
                    id={`btn-role-${r.role.toLowerCase()}`}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.currentRole === r.role
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{r.label}</span>
                    {currentUser.currentRole === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-neutral-100">
                <p className="text-[10px] font-bold text-neutral-400 px-2 uppercase tracking-wider">Simulate Tenant Account</p>
                <div className="mt-1 space-y-1 max-h-48 overflow-y-auto">
                  {users.map(u => (
                    <button
                      key={u.id}
                      id={`btn-switch-user-${u.id}`}
                      onClick={() => {
                        switchUser(u.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                        currentUser.id === u.id ? 'bg-blue-50 text-blue-900 font-medium' : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <img src={u.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <div className="truncate flex-1">
                        <p className="font-semibold text-xs leading-tight">{u.name}</p>
                        <p className="text-[10px] text-neutral-400">
                          {u.currentRole.replace(/_/g, ' ')} • {u.orgId || 'All Orgs'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
