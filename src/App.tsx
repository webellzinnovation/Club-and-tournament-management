import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { ClaimProfileModal } from './components/player/ClaimProfileModal';
import { TournamentWizardModal } from './components/tournament/TournamentWizardModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { Loader2 } from 'lucide-react';

// Dashboards
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { ClubOwnerDashboard } from './components/dashboards/ClubOwnerDashboard';
import { CoachDashboard } from './components/dashboards/CoachDashboard';
import { PlayerDashboard } from './components/dashboards/PlayerDashboard';
import { OrganizerDashboard } from './components/dashboards/OrganizerDashboard';
import { RefereeDashboard } from './components/dashboards/RefereeDashboard';

// Tournament & Core Views
import { AssignmentsBoard } from './components/tournament/AssignmentsBoard';
import { DrawsView } from './components/tournament/DrawsView';
import { LiveScoringView } from './components/tournament/LiveScoringView';
import { PlayersView } from './components/views/PlayersView';
import { AttendanceView } from './components/views/AttendanceView';
import { BatchesView } from './components/views/BatchesView';
import { ClubsView } from './components/views/ClubsView';
import { MembershipsView } from './components/views/MembershipsView';
import { AnnouncementsView } from './components/views/AnnouncementsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { StandingsView } from './components/views/StandingsView';
import { TvArenaView } from './components/views/TvArenaView';
import { PublicPortalView } from './components/views/PublicPortalView';

function SportOSApp() {
  const { authLoading, currentUser, setActiveTournamentId } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [scoringMatchId, setScoringMatchId] = useState<string | undefined>(undefined);

  // If in TV Arena Mode
  if (currentView === 'tv_arena') {
    return <TvArenaView onExit={() => setCurrentView('dashboard')} />;
  }

  // If in Public Portal Mode
  if (currentView === 'public_portal') {
    return (
      <PublicPortalView
        onBackToApp={() => setCurrentView('dashboard')}
        onSelectMatchForScoring={(id) => {
          setScoringMatchId(id);
          setCurrentView('live_scoring');
        }}
        onOpenLiveScore={() => setCurrentView('live_scoring')}
      />
    );
  }

  // If auth is verifying session on initial mount
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm text-neutral-400">Authenticating session with SportOS Cloud...</p>
      </div>
    );
  }

  // If user is not authenticated, render AuthScreen
  if (!currentUser) {
    return <AuthScreen />;
  }

  const handleSelectEntity = (type: 'PLAYER' | 'TOURNAMENT' | 'MATCH', id: string) => {
    if (type === 'PLAYER') {
      setCurrentView('players');
    } else if (type === 'TOURNAMENT') {
      setActiveTournamentId(id);
      setCurrentView('dashboard');
    } else if (type === 'MATCH') {
      setScoringMatchId(id);
      setCurrentView('live_scoring');
    }
  };

  // Render dashboard based on authenticated role
  const renderDashboard = () => {
    switch (currentUser.currentRole) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard onNavigate={setCurrentView} />;
      case 'CLUB_OWNER':
        return (
          <ClubOwnerDashboard
            onNavigate={setCurrentView}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        );
      case 'COACH':
        return <CoachDashboard onNavigate={setCurrentView} />;
      case 'PLAYER':
        return (
          <PlayerDashboard
            onNavigate={setCurrentView}
            onOpenClaimModal={() => setIsClaimOpen(true)}
          />
        );
      case 'REFEREE':
        return (
          <RefereeDashboard
            onNavigate={setCurrentView}
            onSelectMatchForScoring={(id) => {
              setScoringMatchId(id);
              setCurrentView('live_scoring');
            }}
          />
        );
      case 'TOURNAMENT_ORGANIZER':
      default:
        return (
          <OrganizerDashboard
            onNavigate={setCurrentView}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        );
    }
  };

  // Render view router
  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();

      case 'assignments':
        return (
          <AssignmentsBoard
            onNavigate={setCurrentView}
            onSelectMatchForScoring={(id) => {
              setScoringMatchId(id);
              setCurrentView('live_scoring');
            }}
          />
        );

      case 'draws':
        return (
          <DrawsView
            onNavigate={setCurrentView}
            onSelectMatchForScoring={(id) => {
              setScoringMatchId(id);
              setCurrentView('live_scoring');
            }}
          />
        );

      case 'live_scoring':
        return (
          <LiveScoringView
            selectedMatchId={scoringMatchId}
            onNavigate={setCurrentView}
          />
        );

      case 'players':
        return <PlayersView onOpenClaimModal={() => setIsClaimOpen(true)} />;

      case 'attendance':
        return <AttendanceView />;

      case 'batches':
        return <BatchesView />;

      case 'clubs':
      case 'organizations':
        return <ClubsView />;

      case 'memberships':
      case 'payments':
        return <MembershipsView />;

      case 'announcements':
        return <AnnouncementsView />;

      case 'audit_logs':
        return <AuditLogsView />;

      case 'standings':
        return <StandingsView />;

      default:
        return renderDashboard();
    }
  };

  return (
    <>
      <AppShell
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenClaimModal={() => setIsClaimOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
      >
        {renderMainContent()}
      </AppShell>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectEntity={handleSelectEntity}
      />

      {/* Player Identity Claim Modal */}
      <ClaimProfileModal
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
      />

      {/* Tournament Creation Wizard Modal */}
      <TournamentWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <SportOSApp />
    </AppProvider>
  );
}
