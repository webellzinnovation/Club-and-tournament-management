import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserAccount,
  UserRole,
  Organization,
  Club,
  Coach,
  Batch,
  AttendanceRecord,
  AttendanceStatus,
  MembershipPlan,
  PaymentRecord,
  PlayerProfile,
  Referee,
  CompetitionResource,
  Tournament,
  TournamentEvent,
  TournamentParticipant,
  Match,
  MatchResult,
  Announcement,
  WebNotification,
  AuditLog,
  SportType,
  TournamentFormat,
  SportScoreData,
  StandingRow,
  CreateTournamentInput,
  BroadcastAnnouncementInput,
  OrganizationMembership,
  ClubMembership
} from '../types';
import {
  calculateStandings,
  generateKnockoutBracket,
  generateRoundRobinFixtures,
  advanceWinnerInBracket,
  detectSchedulingConflicts,
  SchedulingConflict
} from '../engine/competitionEngine';
import { dbService, SEED_ORG_2, SEED_CLUB_3 } from '../services/dbService';
import { authService, SessionState } from '../services/authService';
import { authorizationService, AuthContext } from '../services/authorizationService';
import { SEED_ORGANIZATION, SEED_CLUBS } from '../data/seedData';

interface AppContextType {
  // Auth & RBAC
  authLoading: boolean;
  currentUser: UserAccount | null;
  authContext: AuthContext | null;
  orgMemberships: OrganizationMembership[];
  clubMemberships: ClubMembership[];
  loginWithEmail: (email: string, password: string) => Promise<UserAccount>;
  loginWithGoogle: (preferredRole?: UserRole) => Promise<UserAccount>;
  loginAsDemoUser: (role: UserRole, email: string, name: string, orgId?: string, clubId?: string) => Promise<UserAccount>;
  registerWithEmail: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    organizationId?: string,
    clubId?: string,
    sport?: string
  ) => Promise<UserAccount>;
  logout: () => Promise<void>;
  
  // Authorization check delegates
  canViewUser: (user: UserAccount) => boolean;
  canViewPlayer: (player: PlayerProfile) => boolean;
  canEditPlayer: (player: PlayerProfile) => boolean;
  canViewClub: (club: { id: string; orgId: string }) => boolean;
  canManageClub: (club: { id: string; orgId: string }) => boolean;
  canViewTournament: (tournament: Tournament) => boolean;
  canManageTournament: (tournament: Tournament) => boolean;
  canViewMatch: (match: Match) => boolean;
  canScoreMatch: (match: Match) => boolean;
  canVerifyResult: (match: Match) => boolean;
  canViewAttendance: (record: AttendanceRecord, batch?: Batch) => boolean;
  canEditAttendance: (record: AttendanceRecord, batch?: Batch) => boolean;
  canViewPayment: (payment: PaymentRecord) => boolean;
  canRecordPayment: (clubId?: string) => boolean;
  canViewAuditLog: (log: AuditLog) => boolean;
  canViewAnnouncement: (announcement: Announcement) => boolean;
  canPostAnnouncement: (scope: { clubId?: string; tournamentId?: string }) => boolean;

  // Organizations & Multi-tenancy
  organizations: Organization[];
  organization: Organization;
  activeOrgId: string;
  setActiveOrgId: (orgId: string) => boolean;
  clubs: Club[];
  activeClub: Club | undefined;
  setActiveClubId: (clubId: string) => boolean;

  // Players & Claiming
  players: PlayerProfile[];
  addPlayer: (data: Partial<PlayerProfile>) => Promise<PlayerProfile>;
  updatePlayer: (id: string, data: Partial<PlayerProfile>) => Promise<void>;
  claimPlayerProfile: (playerId: string, verificationValue?: string, method?: 'EMAIL_OTP' | 'MOBILE_OTP' | 'FEDERATION_ID') => Promise<{ success: boolean; message: string }>;

  // Club Operations
  coaches: Coach[];
  batches: Batch[];
  attendanceRecords: AttendanceRecord[];
  membershipPlans: MembershipPlan[];
  payments: PaymentRecord[];
  addCoach: (coach: Omit<Coach, 'id'>) => void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  recordAttendance: (batchId: string, date: string, records: AttendanceRecord['records']) => Promise<void>;
  markAttendance: (batchId: string, playerId: string, date: string, status: AttendanceStatus) => Promise<void>;
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'receiptNumber'>) => Promise<void>;
  addMembershipPlan: (plan: Omit<MembershipPlan, 'id' | 'activeSubscribersCount'>) => void;

  // Tournaments & Events
  tournaments: Tournament[];
  activeTournament: Tournament | undefined;
  setActiveTournamentId: (id: string) => void;
  events: TournamentEvent[];
  participants: TournamentParticipant[];
  matches: Match[];
  resources: CompetitionResource[];
  referees: Referee[];
  standings: StandingRow[];
  addTournament: (tournament: Omit<Tournament, 'id' | 'slug' | 'eventsCount' | 'totalMatchesCount' | 'ownerUserId' | 'createdByUserId'>, events: Partial<TournamentEvent>[]) => Promise<Tournament>;
  createTournament: (data: CreateTournamentInput) => Promise<Tournament>;
  generateDraw: (eventId: string, format: TournamentFormat) => Promise<void>;
  assignMatch: (matchId: string, resourceId?: string, refereeId?: string, date?: string, time?: string) => Promise<{ success: boolean; conflicts: SchedulingConflict[] }>;
  callPlayers: (matchId: string, leadMinutes?: number) => Promise<void>;
  updateMatchScore: (matchId: string, score: SportScoreData, status?: Match['status']) => Promise<void>;
  submitMatchResult: (matchId: string, result: Omit<MatchResult, 'id'>) => Promise<void>;
  verifyMatchResult: (matchId: string) => Promise<void>;
  schedulingConflicts: SchedulingConflict[];

  // Announcements & Notifications
  announcements: Announcement[];
  notifications: WebNotification[];
  unreadNotificationsCount: number;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  broadcastAnnouncement: (data: BroadcastAnnouncementInput) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addNotification: (notif: Omit<WebNotification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (action: string, entity: string, entityId: string, details: string) => Promise<void>;

  // Global Search & Live Sync Status
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isFirestoreLive: boolean;

  // Explicit admin-only seed tool (NEVER runs automatically)
  seedDemoData: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Real Auth Session State
  const [authState, setAuthState] = useState<SessionState>(() => authService.getState());
  const authLoading = authState.loading;
  const currentUser = authState.user;
  const orgMemberships = authState.orgMemberships;
  const clubMemberships = authState.clubMemberships;
  const activeOrgId = authState.activeOrgId;
  const activeClubId = authState.activeClubId;

  // Platform Organizations and Clubs
  const allOrganizations = useMemo(() => [SEED_ORGANIZATION, SEED_ORG_2], []);
  const allClubs = useMemo(() => [...SEED_CLUBS, SEED_CLUB_3], []);

  // Filter organizations by user's actual active memberships
  const organizations = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.currentRole === 'SUPER_ADMIN') {
      return allOrganizations;
    }
    return allOrganizations.filter(org => orgMemberships.some(m => m.orgId === org.id || m.organizationId === org.id));
  }, [allOrganizations, currentUser, orgMemberships]);

  const organization = useMemo(() => {
    return organizations.find(o => o.id === activeOrgId) || organizations[0] || SEED_ORGANIZATION;
  }, [organizations, activeOrgId]);

  // Filter clubs by active organization and user's club memberships
  const clubs = useMemo(() => {
    if (!currentUser) return [];
    const orgClubs = allClubs.filter(c => c.orgId === activeOrgId);
    if (currentUser.currentRole === 'SUPER_ADMIN') {
      return orgClubs;
    }
    // Filter to clubs the user is a member of (or all in org if club owner/admin)
    return orgClubs.filter(c => clubMemberships.some(cm => cm.clubId === c.id));
  }, [allClubs, activeOrgId, currentUser, clubMemberships]);

  const activeClub = useMemo(() => {
    return clubs.find(c => c.id === activeClubId) || clubs[0];
  }, [clubs, activeClubId]);

  // AuthContext for Authorization Service
  const authContext: AuthContext | null = useMemo(() => {
    if (!currentUser) return null;
    return {
      currentUser,
      activeOrgId,
      activeClubId,
      orgMemberships,
      clubMemberships
    };
  }, [currentUser, activeOrgId, activeClubId, orgMemberships, clubMemberships]);

  // Authoritative Workspace State (NO seed defaults - real database persistence)
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournamentId, setActiveTournamentIdState] = useState<string>('');
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [resources, setResources] = useState<CompetitionResource[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<WebNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFirestoreLive, setIsFirestoreLive] = useState<boolean>(true);

  // Subscribe to auth service state changes
  useEffect(() => {
    return authService.subscribe((state) => {
      setAuthState(state);
    });
  }, []);

  // When active tournament ID is changed or list of tournaments changes, ensure valid selection
  const activeTournament = useMemo(() => {
    return tournaments.find(t => t.id === activeTournamentId) || tournaments[0];
  }, [tournaments, activeTournamentId]);

  const setActiveTournamentId = useCallback((id: string) => {
    setActiveTournamentIdState(id);
  }, []);

  // Realtime Scoped Subscriptions
  useEffect(() => {
    if (!authContext) {
      // Clear data on logout
      setTournaments([]);
      setPlayers([]);
      setCoaches([]);
      setBatches([]);
      setAttendanceRecords([]);
      setMembershipPlans([]);
      setPayments([]);
      setMatches([]);
      setAnnouncements([]);
      setNotifications([]);
      setAuditLogs([]);
      return;
    }

    const unsubs: (() => void)[] = [];

    // 1. Tournaments
    const unsubTourneys = dbService.subscribeToTournaments(authContext, (liveTourneys) => {
      setTournaments(liveTourneys);
      if (liveTourneys.length > 0 && !liveTourneys.some(t => t.id === activeTournamentId)) {
        setActiveTournamentIdState(liveTourneys[0].id);
      }
    });
    unsubs.push(unsubTourneys);

    // 2. Players
    const unsubPlayers = dbService.subscribeToPlayers(authContext, (livePlayers) => {
      setPlayers(livePlayers);
    });
    unsubs.push(unsubPlayers);

    // 3. Batches
    const unsubBatches = dbService.subscribeToBatches(activeClubId, authContext, (liveBatches) => {
      setBatches(liveBatches);
    });
    unsubs.push(unsubBatches);

    // 4. Coaches
    const unsubCoaches = dbService.subscribeToCoaches(activeClubId, authContext, (liveCoaches) => {
      setCoaches(liveCoaches);
    });
    unsubs.push(unsubCoaches);

    // 5. Membership Plans
    const unsubPlans = dbService.subscribeToMembershipPlans(activeClubId, (livePlans) => {
      setMembershipPlans(livePlans);
    });
    unsubs.push(unsubPlans);

    // 6. Payments
    const unsubPayments = dbService.subscribeToPayments(authContext, (livePayments) => {
      setPayments(livePayments);
    });
    unsubs.push(unsubPayments);

    // 7. Announcements
    const unsubAnnounce = dbService.subscribeToAnnouncements(authContext, (liveAnnounce) => {
      setAnnouncements(liveAnnounce);
    });
    unsubs.push(unsubAnnounce);

    // 8. Notifications
    const unsubNotifs = dbService.subscribeToNotifications(currentUser?.id, (liveNotifs) => {
      setNotifications(liveNotifs);
    });
    unsubs.push(unsubNotifs);

    // 9. Audit Logs
    const unsubLogs = dbService.subscribeToAuditLogs(authContext, activeTournamentId, (liveLogs) => {
      setAuditLogs(liveLogs);
    });
    unsubs.push(unsubLogs);

    return () => {
      unsubs.forEach(unsub => {
        try { unsub(); } catch {}
      });
    };
  }, [authContext, activeClubId, activeTournamentId, currentUser?.id]);

  // Realtime Matches Subscription (depends on activeTournamentId)
  useEffect(() => {
    if (!authContext || !activeTournamentId) {
      setMatches([]);
      return;
    }

    const unsubMatches = dbService.subscribeToMatches(activeTournamentId, authContext, (liveMatches) => {
      setMatches(liveMatches);
    });

    return () => {
      try { unsubMatches(); } catch {}
    };
  }, [authContext, activeTournamentId]);

  // Audio chime
  const playNotificationSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }, []);

  // --- Auth Handlers ---

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    return await authService.loginWithEmail(email, pass);
  }, []);

  const loginWithGoogle = useCallback(async (preferredRole?: UserRole) => {
    return await authService.loginWithGoogle(preferredRole);
  }, []);

  const loginAsDemoUser = useCallback(async (role: UserRole, email: string, name: string, orgId?: string, clubId?: string) => {
    return await authService.loginAsDemoUser(role, email, name, orgId, clubId);
  }, []);

  const registerWithEmail = useCallback(async (
    name: string,
    email: string,
    pass: string,
    role: UserRole,
    orgId?: string,
    clubId?: string,
    sport?: string
  ) => {
    return await authService.registerWithEmail(name, email, pass, role, orgId, clubId, sport);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  const setActiveOrgId = useCallback((orgId: string): boolean => {
    const success = authService.switchActiveOrganization(orgId);
    if (success) {
      // Clear tournament selection to avoid cross-tenant contamination
      setActiveTournamentIdState('');
    }
    return success;
  }, []);

  const setActiveClubId = useCallback((clubId: string): boolean => {
    return authService.switchActiveClub(clubId);
  }, []);

  // --- Centralized Authorization Checkers ---

  const canViewUser = useCallback((u: UserAccount) => {
    return authContext ? authorizationService.canViewUser(u, authContext) : false;
  }, [authContext]);

  const canViewPlayer = useCallback((p: PlayerProfile) => {
    return authContext ? authorizationService.canViewPlayer(p, authContext) : false;
  }, [authContext]);

  const canEditPlayer = useCallback((p: PlayerProfile) => {
    return authContext ? authorizationService.canEditPlayer(p, authContext) : false;
  }, [authContext]);

  const canViewClub = useCallback((c: { id: string; orgId: string }) => {
    return authContext ? authorizationService.canViewClub(c, authContext) : false;
  }, [authContext]);

  const canManageClub = useCallback((c: { id: string; orgId: string }) => {
    return authContext ? authorizationService.canManageClub(c, authContext) : false;
  }, [authContext]);

  const canViewTournament = useCallback((t: Tournament) => {
    return authContext ? authorizationService.canViewTournament(t, authContext) : false;
  }, [authContext]);

  const canManageTournament = useCallback((t: Tournament) => {
    return authContext ? authorizationService.canManageTournament(t, authContext) : false;
  }, [authContext]);

  const canViewMatch = useCallback((m: Match) => {
    return authContext ? authorizationService.canViewMatch(m, activeTournament, authContext) : false;
  }, [authContext, activeTournament]);

  const canScoreMatch = useCallback((m: Match) => {
    return authContext ? authorizationService.canScoreMatch(m, activeTournament, authContext) : false;
  }, [authContext, activeTournament]);

  const canVerifyResult = useCallback((m: Match) => {
    return authContext ? authorizationService.canVerifyResult(m, activeTournament, authContext) : false;
  }, [authContext, activeTournament]);

  const canViewAttendance = useCallback((r: AttendanceRecord, b?: Batch) => {
    return authContext ? authorizationService.canViewAttendance(r, b, authContext) : false;
  }, [authContext]);

  const canEditAttendance = useCallback((r: AttendanceRecord, b?: Batch) => {
    return authContext ? authorizationService.canEditAttendance(r, b, authContext) : false;
  }, [authContext]);

  const canViewPayment = useCallback((p: PaymentRecord) => {
    return authContext ? authorizationService.canViewPayment(p, authContext) : false;
  }, [authContext]);

  const canRecordPayment = useCallback((clubId?: string) => {
    return authContext ? authorizationService.canRecordPayment(clubId, authContext) : false;
  }, [authContext]);

  const canViewAuditLog = useCallback((l: AuditLog) => {
    return authContext ? authorizationService.canViewAuditLog(l, authContext) : false;
  }, [authContext]);

  const canViewAnnouncement = useCallback((a: Announcement) => {
    return authContext ? authorizationService.canViewAnnouncement(a, authContext) : false;
  }, [authContext]);

  const canPostAnnouncement = useCallback((scope: { clubId?: string; tournamentId?: string }) => {
    return authContext ? authorizationService.canPostAnnouncement(authContext, scope) : false;
  }, [authContext]);

  // --- Audit Logging ---

  const logAction = useCallback(async (action: string, entity: string, entityId: string, details: string) => {
    if (!authContext) return;
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: currentUser?.id,
      actor: currentUser?.name || 'Unknown',
      actorRole: currentUser?.currentRole || 'PLAYER',
      tournamentId: activeTournamentId || undefined,
      clubId: activeClubId || undefined,
      organizationId: activeOrgId || undefined,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
    await dbService.createAuditLog(newLog, authContext);
  }, [authContext, currentUser, activeTournamentId, activeClubId, activeOrgId]);

  // --- Notification Actions ---

  const addNotification = useCallback(async (notifData: Omit<WebNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif = await dbService.createNotification({
      ...notifData,
      isRead: false
    });
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();
  }, [playNotificationSound]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await dbService.markNotificationRead(id);
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (currentUser?.id) {
      await dbService.markNotificationRead(currentUser.id);
    }
  }, [currentUser?.id]);

  // --- Player Management ---

  const addPlayer = useCallback(async (data: Partial<PlayerProfile>): Promise<PlayerProfile> => {
    if (!authContext) throw new Error('Unauthenticated');
    const count = players.length + 1;
    const prefix = data.sport === 'TABLE_TENNIS' ? 'TT' : data.sport === 'BADMINTON' ? 'BD' : data.sport === 'CRICKET' ? 'CR' : 'FB';

    const newPlayerInput: Omit<PlayerProfile, 'id'> = {
      playerId: `${prefix}-${String(180 + count).padStart(5, '0')}`,
      name: data.name || 'Anonymous Player',
      gender: data.gender || 'MALE',
      dateOfBirth: data.dateOfBirth,
      mobile: data.mobile,
      email: data.email,
      clubId: data.clubId || activeClubId,
      clubName: data.clubName || (clubs.find(c => c.id === activeClubId)?.name || 'Club Academy'),
      sport: data.sport || 'TABLE_TENNIS',
      category: data.category || 'Open',
      hand: data.hand || 'RIGHT',
      playingStyle: data.playingStyle || 'Offensive',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      rating: data.rating ?? 1500,
      tournamentPoints: data.tournamentPoints ?? 0,
      rankings: data.rankings || {},
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      ...data
    };

    const created = await dbService.createPlayer(newPlayerInput, authContext);
    setPlayers(prev => [created, ...prev]);
    await logAction('PLAYER_CREATED', 'PlayerProfile', created.playerId, `Created player profile for ${created.name} (${created.playerId}).`);
    return created;
  }, [authContext, players.length, activeClubId, clubs, logAction]);

  const updatePlayer = useCallback(async (id: string, data: Partial<PlayerProfile>) => {
    if (!authContext) throw new Error('Unauthenticated');
    const existing = players.find(p => p.id === id);
    if (!existing) return;
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    await dbService.updatePlayer(id, data, authContext, existing);
  }, [authContext, players]);

  const claimPlayerProfile = useCallback(async (
    playerId: string,
    verificationValue?: string,
    method: 'EMAIL_OTP' | 'MOBILE_OTP' | 'FEDERATION_ID' = 'EMAIL_OTP'
  ): Promise<{ success: boolean; message: string }> => {
    if (!authContext || !currentUser) throw new Error('Unauthenticated');
    const player = players.find(p => p.playerId === playerId || p.id === playerId);
    if (!player) {
      return { success: false, message: `Player profile "${playerId}" not found.` };
    }

    const val = verificationValue || player.email || player.mobile || 'VERIFIED-TOKEN';
    const result = await dbService.claimPlayerProfile(currentUser.id, player.playerId, val, authContext, method);

    if (result.success) {
      await addNotification({
        recipientUserId: currentUser.id,
        recipientPlayerId: player.id,
        type: 'GENERAL_SYSTEM_NOTIFICATION',
        title: 'Profile Claim Verified',
        message: `Successfully linked your account with Player ID ${player.playerId} (${player.name}).`
      });
    }

    return result;
  }, [authContext, currentUser, players, addNotification]);

  // --- Club Management ---

  const addCoach = useCallback((coach: Omit<Coach, 'id'>) => {
    const newCoach: Coach = { ...coach, id: `coach-${Date.now()}` };
    setCoaches(prev => [...prev, newCoach]);
    logAction('COACH_ADDED', 'Coach', newCoach.id, `Added coach ${newCoach.name}`);
  }, [logAction]);

  const addBatch = useCallback((batch: Omit<Batch, 'id'>) => {
    const newBatch: Batch = { ...batch, id: `batch-${Date.now()}` };
    setBatches(prev => [...prev, newBatch]);
    logAction('BATCH_CREATED', 'Batch', newBatch.id, `Created batch ${newBatch.name}`);
  }, [logAction]);

  const recordAttendance = useCallback(async (batchId: string, date: string, records: AttendanceRecord['records']) => {
    if (!authContext) throw new Error('Unauthenticated');
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      batchId,
      date,
      records
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    await dbService.recordAttendance(newRecord, batch, authContext);
    await logAction('ATTENDANCE_MARKED', 'AttendanceRecord', newRecord.id, `Marked attendance for batch ${batchId} on ${date}`);
  }, [authContext, batches, logAction]);

  const markAttendance = useCallback(async (batchId: string, playerId: string, date: string, status: AttendanceStatus) => {
    if (!authContext) throw new Error('Unauthenticated');
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const player = players.find(p => p.id === playerId);
    const playerName = player?.name || 'Player';

    let targetRecord: AttendanceRecord | undefined;
    setAttendanceRecords(prev => {
      const existingRecordIndex = prev.findIndex(r => r.batchId === batchId && r.date === date);
      if (existingRecordIndex >= 0) {
        const existing = prev[existingRecordIndex];
        const studentIndex = existing.records.findIndex(rec => rec.playerId === playerId);
        const updatedRecords = [...existing.records];
        if (studentIndex >= 0) {
          updatedRecords[studentIndex] = { ...updatedRecords[studentIndex], status };
        } else {
          updatedRecords.push({ playerId, playerName, status });
        }
        const updated = [...prev];
        targetRecord = { ...existing, records: updatedRecords };
        updated[existingRecordIndex] = targetRecord;
        return updated;
      } else {
        targetRecord = {
          id: `att-${Date.now()}`,
          batchId,
          date,
          records: [{ playerId, playerName, status }]
        };
        return [targetRecord, ...prev];
      }
    });

    if (targetRecord) {
      await dbService.recordAttendance(targetRecord, batch, authContext);
    }
  }, [authContext, batches, players]);

  const recordPayment = useCallback(async (payment: Omit<PaymentRecord, 'id' | 'receiptNumber'>) => {
    if (!authContext) throw new Error('Unauthenticated');
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}`,
      receiptNumber
    };
    setPayments(prev => [newPayment, ...prev]);
    await dbService.recordPayment(newPayment, authContext);
    await logAction('PAYMENT_RECORDED', 'PaymentRecord', newPayment.id, `Recorded ${payment.currency} ${payment.amount} from ${payment.payerName} (${receiptNumber})`);
  }, [authContext, logAction]);

  const addMembershipPlan = useCallback((plan: Omit<MembershipPlan, 'id' | 'activeSubscribersCount'>) => {
    const newPlan: MembershipPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      activeSubscribersCount: 0
    };
    setMembershipPlans(prev => [...prev, newPlan]);
  }, []);

  // --- Tournament & Draws Management ---

  const addTournament = useCallback(async (
    tournamentData: Omit<Tournament, 'id' | 'slug' | 'eventsCount' | 'totalMatchesCount' | 'ownerUserId' | 'createdByUserId'>,
    eventsData: Partial<TournamentEvent>[]
  ): Promise<Tournament> => {
    if (!authContext || !currentUser) throw new Error('Unauthenticated');
    const id = `t-${Date.now()}`;
    const slug = tournamentData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newTournament: Tournament = {
      ...tournamentData,
      id,
      slug,
      ownerUserId: currentUser.id,
      createdByUserId: currentUser.id,
      organizationId: tournamentData.orgId,
      eventsCount: eventsData.length,
      totalMatchesCount: 0
    };

    const newEvents: TournamentEvent[] = eventsData.map((ev, idx) => ({
      id: `ev-${Date.now()}-${idx}`,
      tournamentId: id,
      name: ev.name || "Men's Singles",
      sport: tournamentData.sport,
      format: ev.format || 'GROUPS_KNOCKOUT',
      category: ev.category || 'Open',
      isDoubles: ev.isDoubles || false,
      participantIds: [],
      rules: ev.rules || {
        sport: tournamentData.sport,
        bestOfSets: 5,
        pointsPerGame: 11,
        winByMargin: 2,
        pointsForWin: 2,
        pointsForDraw: 0,
        pointsForLoss: 0,
        tieBreakerPriority: ['POINTS', 'GAMES_DIFF']
      },
      status: 'UPCOMING'
    }));

    setTournaments(prev => [newTournament, ...prev]);
    setEvents(prev => [...prev, ...newEvents]);

    await dbService.saveTournamentHierarchy(newTournament, newEvents, authContext);
    await logAction('TOURNAMENT_CREATED', 'Tournament', id, `Created tournament: ${tournamentData.title}`);
    return newTournament;
  }, [authContext, currentUser, logAction]);

  const createTournament = useCallback(async (data: CreateTournamentInput) => {
    const defaultGroupBestOf = data.bestOfGroup ?? (data.sport === 'BADMINTON' ? 3 : 5);
    const defaultKnockoutBestOf = data.bestOfKnockout ?? (data.sport === 'BADMINTON' ? 3 : 5);
    const defaultFinalBestOf = data.bestOfFinal ?? (data.sport === 'TABLE_TENNIS' ? 7 : defaultKnockoutBestOf);

    return await addTournament(data, data.events || [
      {
        name: `${(data.sport || 'TABLE_TENNIS').replace(/_/g, ' ')} Championship`,
        sport: data.sport || 'TABLE_TENNIS',
        format: data.format || 'GROUPS_KNOCKOUT',
        category: 'Open',
        rules: {
          sport: data.sport || 'TABLE_TENNIS',
          bestOfSets: defaultKnockoutBestOf,
          bestOfGroup: defaultGroupBestOf,
          bestOfKnockout: defaultKnockoutBestOf,
          bestOfFinal: defaultFinalBestOf,
          pointsPerGame: data.sport === 'BADMINTON' ? 21 : 11,
          winByMargin: 2,
          pointsForWin: 2,
          pointsForDraw: 0,
          pointsForLoss: 0,
          tieBreakerPriority: ['POINTS', 'GAMES_DIFF']
        }
      }
    ]);
  }, [addTournament]);

  const generateDraw = useCallback(async (eventId: string, format: TournamentFormat) => {
    if (!authContext) throw new Error('Unauthenticated');
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    const eventParticipants = participants.filter(p => p.eventId === eventId);
    if (eventParticipants.length < 2) {
      alert('At least 2 participants are required to generate draws.');
      return;
    }

    let generatedMatches: Match[] = [];

    if (format === 'ROUND_ROBIN') {
      generatedMatches = generateRoundRobinFixtures(ev.tournamentId, ev.id, ev.sport, eventParticipants, undefined, undefined, undefined, ev.rules);
    } else if (format === 'KNOCKOUT') {
      generatedMatches = generateKnockoutBracket(ev.tournamentId, ev.id, ev.sport, eventParticipants, undefined, ev.rules);
    } else if (format === 'GROUPS_KNOCKOUT' || (format as string) === 'GROUPS_THEN_KNOCKOUT') {
      const mid = Math.ceil(eventParticipants.length / 2);
      const groupA = eventParticipants.slice(0, mid).map(p => ({ ...p, groupName: 'Group A' }));
      const groupB = eventParticipants.slice(mid).map(p => ({ ...p, groupName: 'Group B' }));

      const fixturesA = generateRoundRobinFixtures(ev.tournamentId, ev.id, ev.sport, groupA, 'Group A', undefined, undefined, ev.rules);
      const fixturesB = generateRoundRobinFixtures(ev.tournamentId, ev.id, ev.sport, groupB, 'Group B', undefined, undefined, ev.rules);
      generatedMatches = [...fixturesA, ...fixturesB];
    }

    setMatches(prev => {
      const remaining = prev.filter(m => m.eventId !== eventId);
      return [...remaining, ...generatedMatches];
    });

    const targetTourney = tournaments.find(t => t.id === ev.tournamentId);
    if (targetTourney) {
      await dbService.saveTournamentHierarchy(targetTourney, [ev], authContext, undefined, undefined, undefined, undefined, generatedMatches);
    }

    await logAction('DRAW_GENERATED', 'TournamentEvent', eventId, `Generated ${format} draw for ${ev.name}.`);
  }, [authContext, events, participants, tournaments, logAction]);

  const assignMatch = useCallback(async (
    matchId: string,
    resourceId?: string,
    refereeId?: string,
    date?: string,
    time?: string
  ) => {
    if (!authContext) throw new Error('Unauthenticated');
    const match = matches.find(m => m.id === matchId);
    if (!match) return { success: false, conflicts: [] };

    const tournament = tournaments.find(t => t.id === match.tournamentId);
    if (!tournament) return { success: false, conflicts: [] };

    const resource = resources.find(r => r.id === resourceId);
    const referee = referees.find(r => r.id === refereeId);

    const updatedMatch: Match = {
      ...match,
      resourceId: resourceId ?? match.resourceId,
      resourceName: resource ? resource.name : match.resourceName,
      refereeId: refereeId ?? match.refereeId,
      assignedRefereeId: refereeId ?? match.assignedRefereeId,
      refereeName: referee ? referee.name : match.refereeName,
      scheduledDate: date ?? match.scheduledDate,
      scheduledTime: time ?? match.scheduledTime,
      status: match.status === 'SCHEDULED' && resourceId ? 'READY' : match.status
    };

    const nextMatches = matches.map(m => m.id === matchId ? updatedMatch : m);
    const conflicts = detectSchedulingConflicts(nextMatches);
    setMatches(nextMatches);

    await dbService.assignMatch(matchId, tournament, authContext, resourceId, refereeId, date, time);

    await logAction('MATCH_ASSIGNED', 'Match', matchId, `Assigned Match #${match.matchNumber} to ${updatedMatch.resourceName || 'Unassigned'}`);
    return { success: true, conflicts };
  }, [authContext, matches, tournaments, resources, referees, logAction]);

  const callPlayers = useCallback(async (matchId: string, leadMinutes: number = 0) => {
    if (!authContext) throw new Error('Unauthenticated');
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'CALLED', calledAt: timeStr } : m));

    await dbService.updateMatchScore(matchId, match.score, match, activeTournament, authContext, 'CALLED');

    await createAnnouncement({
      tournamentId: match.tournamentId,
      title: `Match Call: ${match.participant1Name} vs ${match.participant2Name}`,
      message: `Match #${match.matchNumber} called to ${match.resourceName || 'court/table'}. Report ${leadMinutes > 0 ? `in ${leadMinutes}m` : 'immediately'}.`,
      authorName: currentUser?.name || 'Organizer',
      audience: 'ALL',
      priority: 'URGENT',
      isPublic: true
    });

    await logAction('PLAYER_CALLED', 'Match', matchId, `Called Match #${match.matchNumber}`);
  }, [authContext, matches, activeTournament, currentUser, logAction]);

  const updateMatchScore = useCallback(async (matchId: string, score: SportScoreData, status?: Match['status']) => {
    if (!authContext) throw new Error('Unauthenticated');
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const nextStatus = status ?? 'LIVE';
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        score,
        status: nextStatus,
        startedAt: m.startedAt ?? new Date().toLocaleTimeString()
      };
    }));

    await dbService.updateMatchScore(matchId, score, match, activeTournament, authContext, nextStatus);
  }, [authContext, matches, activeTournament]);

  const submitMatchResult = useCallback(async (matchId: string, result: Omit<MatchResult, 'id'>) => {
    if (!authContext) throw new Error('Unauthenticated');
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'AWAITING_VERIFICATION', winnerId: result.winnerId } : m));
    await dbService.submitMatchResult(matchId, result, match, activeTournament, authContext);
    await logAction('RESULT_SUBMITTED', 'Match', matchId, `Result submitted for match ${matchId}.`);
  }, [authContext, matches, activeTournament, logAction]);

  const verifyMatchResult = useCallback(async (matchId: string) => {
    if (!authContext || !currentUser) throw new Error('Unauthenticated');
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    let winnerId = match.winnerId;
    if (match.score.sport === 'TABLE_TENNIS' || match.score.sport === 'BADMINTON') {
      const s1 = match.score.data.sets.filter(s => s.p1 > s.p2).length;
      const s2 = match.score.data.sets.filter(s => s.p2 > s.p1).length;
      winnerId = s1 > s2 ? match.participant1Id : match.participant2Id;
    }

    const winnerName = winnerId === match.participant1Id ? match.participant1Name : match.participant2Name;

    let updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'VERIFIED' as const,
          winnerId,
          verifiedBy: currentUser.name,
          verifiedAt: new Date().toLocaleTimeString(),
          completedAt: m.completedAt ?? new Date().toLocaleTimeString()
        };
      }
      return m;
    });

    if (winnerId && winnerName) {
      updatedMatches = advanceWinnerInBracket(updatedMatches, matchId, winnerId, winnerName);
    }

    setMatches(updatedMatches);
    await dbService.verifyMatchResult(matchId, match, activeTournament, authContext, winnerId);
  }, [authContext, currentUser, matches, activeTournament]);

  const createAnnouncement = useCallback(async (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    if (!authContext) throw new Error('Unauthenticated');
    const newAnn = await dbService.createAnnouncement(announcementData, authContext);
    setAnnouncements(prev => [newAnn, ...prev]);
    await logAction('ANNOUNCEMENT_PUBLISHED', 'Announcement', newAnn.id, `Published announcement: "${newAnn.title}"`);
  }, [authContext, logAction]);

  const broadcastAnnouncement = useCallback(async (data: BroadcastAnnouncementInput) => {
    await createAnnouncement({
      title: data.title || 'Announcement',
      message: data.content || data.message || '',
      audience: data.target || data.audience || 'ALL',
      priority: data.priority || 'NORMAL',
      tournamentId: data.tournamentId,
      authorName: currentUser?.name || 'Administrator',
      isPublic: true
    });
  }, [createAnnouncement, currentUser]);

  // Admin seed helper
  const seedDemoData = useCallback(async () => {
    if (!authContext) throw new Error('Unauthenticated');
    return await dbService.seedDemoDataToFirestore(authContext);
  }, [authContext]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const schedulingConflicts = useMemo(() => {
    return detectSchedulingConflicts(matches);
  }, [matches]);

  const standings = useMemo(() => {
    const currentEvent = events.find(e => e.tournamentId === activeTournament?.id);
    return calculateStandings(participants, matches, currentEvent?.rules);
  }, [participants, matches, events, activeTournament]);

  return (
    <AppContext.Provider
      value={{
        authLoading,
        currentUser,
        authContext,
        orgMemberships,
        clubMemberships,
        loginWithEmail,
        loginWithGoogle,
        loginAsDemoUser,
        registerWithEmail,
        logout,
        canViewUser,
        canViewPlayer,
        canEditPlayer,
        canViewClub,
        canManageClub,
        canViewTournament,
        canManageTournament,
        canViewMatch,
        canScoreMatch,
        canVerifyResult,
        canViewAttendance,
        canEditAttendance,
        canViewPayment,
        canRecordPayment,
        canViewAuditLog,
        canViewAnnouncement,
        canPostAnnouncement,
        organizations,
        organization,
        activeOrgId,
        setActiveOrgId,
        clubs,
        activeClub,
        setActiveClubId,
        players,
        addPlayer,
        updatePlayer,
        claimPlayerProfile,
        coaches,
        batches,
        attendanceRecords,
        membershipPlans,
        payments,
        addCoach,
        addBatch,
        recordAttendance,
        markAttendance,
        recordPayment,
        addMembershipPlan,
        tournaments,
        activeTournament,
        setActiveTournamentId,
        events,
        participants,
        matches,
        resources,
        referees,
        standings,
        addTournament,
        createTournament,
        generateDraw,
        assignMatch,
        callPlayers,
        updateMatchScore,
        submitMatchResult,
        verifyMatchResult,
        schedulingConflicts,
        announcements,
        notifications,
        unreadNotificationsCount,
        createAnnouncement,
        broadcastAnnouncement,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        auditLogs,
        logAction,
        searchQuery,
        setSearchQuery,
        isFirestoreLive,
        seedDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
