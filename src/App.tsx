import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { ClaimProfileModal } from './components/player/ClaimProfileModal';
import { TournamentWizardModal } from './components/tournament/TournamentWizardModal';

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
  const { currentUser, setActiveTournamentId } = useApp();
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
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans text-neutral-900 antialiased selection:bg-amber-400 selection:text-neutral-950">
      {/* Universal Top Header with Role Switcher */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenClaimModal={() => setIsClaimOpen(true)}
        onNavigate={setCurrentView}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenWizard={() => setIsWizardOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderMainContent()}
        </main>
      </div>

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
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <SportOSApp />
    </AppProvider>
  );
}
