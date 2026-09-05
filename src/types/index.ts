export type SportType = 'TABLE_TENNIS' | 'BADMINTON' | 'CRICKET' | 'FOOTBALL' | 'TENNIS';

export type TournamentType = 'ONE_TIME' | 'SEASON';

export type TournamentFormat = 'ROUND_ROBIN' | 'GROUPS_KNOCKOUT' | 'KNOCKOUT';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'CLUB_OWNER'
  | 'CLUB_ADMIN'
  | 'COACH'
  | 'PLAYER'
  | 'TOURNAMENT_ORGANIZER'
  | 'REFEREE';

export type MatchStatus = 
  | 'SCHEDULED'
  | 'READY'
  | 'CALLED'
  | 'LIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'AWAITING_VERIFICATION'
  | 'VERIFIED'
  | 'PUBLISHED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type ResourceType = 'TABLE' | 'COURT' | 'GROUND' | 'PITCH';

export type NotificationType =
  | 'MATCH_ASSIGNED'
  | 'MATCH_RESCHEDULED'
  | 'RESOURCE_CHANGED'
  | 'REFEREE_ASSIGNED'
  | 'MATCH_CALLED'
  | 'MATCH_STARTED'
  | 'MATCH_PAUSED'
  | 'MATCH_COMPLETED'
  | 'RESULT_PUBLISHED'
  | 'ADVANCED_TO_NEXT_ROUND'
  | 'TOURNAMENT_ANNOUNCEMENT'
  | 'REGISTRATION_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'STANDINGS_UPDATED'
  | 'RANKING_UPDATED'
  | 'CLUB_ANNOUNCEMENT'
  | 'MEMBERSHIP_RENEWAL'
  | 'PAYMENT_DUE'
  | 'GENERAL_SYSTEM_NOTIFICATION';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  roles: UserRole[];
  currentRole: UserRole;
  orgId: string;
  avatarUrl?: string;
  linkedPlayerId?: string;
}

export interface PlayerProfile {
  id: string;
  playerId: string; // e.g. "TT-00184"
  name: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  mobile?: string;
  email?: string;
  clubId?: string;
  clubName?: string;
  profilePhoto?: string;
  sport: SportType;
  category?: string; // U15, U17, Open, Senior
  hand?: 'LEFT' | 'RIGHT';
  playingStyle?: string; // Offensive, Defensive, All-round, Fast Bowler, etc.
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  rating: number;
  tournamentPoints: number;
  rankings: {
    clubRank?: number;
    cityRank?: number;
    nationalRank?: number;
  };
  matchesPlayed: number;
  wins: number;
  losses: number;
}

export type Player = PlayerProfile;

export interface PlayerAccountLink {
  userId: string;
  playerId: string;
  isVerified: boolean;
  claimedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'CLUB_CHAIN' | 'FEDERATION' | 'ACADEMY' | 'INDEPENDENT';
  tier: 'FREE' | 'STARTER' | 'ENTERPRISE';
  activeClubs: number;
  activeTournaments: number;
  createdAt: string;
}

export interface OrganizationMembership {
  id: string;
  orgId: string;
  userId: string;
  roles: UserRole[];
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  joinedAt: string;
}

export interface Club {
  id: string;
  orgId: string;
  name: string;
  code: string;
  logoUrl?: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  sportsSupported: SportType[];
  branchesCount: number;
}

export interface Coach {
  id: string;
  clubId: string;
  name: string;
  sport: SportType;
  specialization: string;
  phone?: string;
  email?: string;
  experienceYears: number;
  activeBatchesCount: number;
}

export interface Batch {
  id: string;
  clubId: string;
  name: string;
  sport: SportType;
  coachId: string;
  coachName: string;
  timing: string;
  days: string[];
  playerIds: string[];
  maxCapacity: number;
}

export interface AttendanceRecord {
  id: string;
  batchId: string;
  date: string;
  records: {
    playerId: string;
    playerName: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    notes?: string;
  }[];
}

export interface MembershipPlan {
  id: string;
  clubId: string;
  name: string;
  sport: SportType;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'PACKAGE';
  price: number;
  currency: string;
  benefits: string[];
  features?: string[];
  activeSubscribersCount: number;
}

export interface PaymentRecord {
  id: string;
  orgId: string;
  clubId?: string;
  tournamentId?: string;
  playerId?: string;
  payerName: string;
  payerEmail?: string;
  amount: number;
  currency: string;
  type: 'MEMBERSHIP' | 'TOURNAMENT_REGISTRATION' | 'COACHING_FEE';
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  date: string;
  receiptNumber: string;
  notes?: string;
}

export interface CompetitionResource {
  id: string;
  name: string; // e.g. "Table 1", "Court 3", "Ground 1"
  sport: SportType;
  type: ResourceType;
  venueName: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  currentMatchId?: string;
}

export interface Referee {
  id: string;
  name: string;
  sport: SportType;
  certificationLevel: string; // National, State, Club
  phone?: string;
  email?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'OFFLINE';
}

export type TieBreakerCriterion = 
  | 'POINTS' 
  | 'HEAD_TO_HEAD' 
  | 'SETS_DIFFERENCE' 
  | 'POINTS_DIFFERENCE' 
  | 'GOAL_DIFFERENCE' 
  | 'GOALS_SCORED' 
  | 'NET_RUN_RATE' 
  | 'GAMES_DIFF';

export interface SportRulesConfig {
  sport: SportType;
  // Table Tennis & Badminton
  bestOfSets?: number; // 1, 3, 5, 7
  pointsPerGame?: number; // 11 for TT, 21 for Badminton
  winByMargin?: number; // 2
  maxPointCap?: number; // 30 for Badminton
  timeoutsPerPlayer?: number; // e.g. 1
  // Football
  matchDurationMinutes?: number; // 90, 80, 60
  halfDurationMinutes?: number; // 45, 40, 30
  stoppageTimeEnabled?: boolean;
  extraTimeEnabled?: boolean;
  penaltiesEnabled?: boolean;
  // Cricket
  overs?: number; // 10, 20, 50
  ballsPerOver?: number; // 6
  powerplayOvers?: number;
  inningsCount?: number;
  superOverEnabled?: boolean;
  // Standings & Points
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  tieBreakerPriority: (TieBreakerCriterion | string)[];
}

export interface TournamentStage {
  id: string;
  eventId: string;
  name: string; // e.g. "Group Stage", "Knockout Stage"
  stageType: 'GROUP' | 'KNOCKOUT';
  order: number;
}

export interface TournamentRound {
  id: string;
  stageId?: string;
  eventId: string;
  roundNumber: number;
  name: string; // e.g. "Round of 16", "Quarter Finals", "Semi Finals", "Final"
}

export interface TournamentGroup {
  id: string;
  stageId?: string;
  eventId: string;
  name: string; // e.g. "Group A", "Group B"
  participantIds: string[];
}

export interface Fixture {
  id: string;
  tournamentId: string;
  eventId: string;
  stageName: string;
  roundNumber: number;
  matchNumber: number;
  groupName?: string;
  participant1Id?: string;
  participant2Id?: string;
  scheduledDate: string;
  scheduledTime: string;
  resourceId?: string;
  status: MatchStatus;
}

export interface TournamentEvent {
  id: string;
  tournamentId: string;
  name: string; // "Men's Singles", "Under-17 Boys", "Open Football"
  sport: SportType;
  format: TournamentFormat;
  category: string;
  isDoubles: boolean;
  qualifiersPerGroup?: number;
  participantIds: string[];
  rules: SportRulesConfig;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface TournamentParticipant {
  id: string;
  eventId: string;
  type: 'INDIVIDUAL' | 'TEAM';
  primaryPlayerId: string;
  primaryPlayerName: string;
  partnerPlayerId?: string;
  partnerPlayerName?: string;
  displayName: string;
  clubName?: string;
  seed?: number;
  groupName?: string; // 'Group A', 'Group B'
  stats: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    scoreFor: number;
    scoreAgainst: number;
    points: number;
    netRunRate?: number;
  };
}

export interface TableTennisScoreData {
  sets: { p1: number; p2: number }[];
  currentSetP1: number;
  currentSetP2: number;
  currentSetIndex: number;
  p1TimeoutsLeft: number;
  p2TimeoutsLeft: number;
  serverParticipantId: string;
  isDeuce: boolean;
  isGameOver: boolean;
  history: { p1: number; p2: number; desc: string; timestamp: string }[];
}

export interface BadmintonScoreData {
  sets: { p1: number; p2: number }[];
  currentSetP1: number;
  currentSetP2: number;
  currentSetIndex: number;
  serverParticipantId: string;
  isDeuce: boolean;
  isGameOver: boolean;
  history: { p1: number; p2: number; desc: string; timestamp: string }[];
}

export interface FootballScoreData {
  team1Goals: number;
  team2Goals: number;
  currentHalf: 1 | 2 | 'EXTRA_1' | 'EXTRA_2' | 'PENALTIES' | 'FULL_TIME';
  elapsedMinutes: number;
  isRunning: boolean;
  penaltiesTeam1?: number;
  penaltiesTeam2?: number;
  events: {
    id: string;
    minute: number;
    type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'PENALTY_GOAL';
    team: 1 | 2;
    playerName: string;
    assistPlayerName?: string;
  }[];
}

export interface CricketScoreData {
  innings: 1 | 2;
  currentInnings: {
    battingTeam: 1 | 2;
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    extras: { wides: number; noBalls: number; byes: number; legByes: number };
    currentStriker: string;
    currentNonStriker: string;
    currentBowler: string;
    recentBalls: string[]; // e.g. ["1", "4", "W", "0", "wd", "6"]
  };
  firstInningsSummary?: {
    team: 1 | 2;
    runs: number;
    wickets: number;
    overs: string;
  };
  targetRuns?: number;
}

export type SportScoreData = 
  | { sport: 'TABLE_TENNIS'; data: TableTennisScoreData }
  | { sport: 'BADMINTON'; data: BadmintonScoreData }
  | { sport: 'FOOTBALL'; data: FootballScoreData }
  | { sport: 'CRICKET'; data: CricketScoreData };

export interface Match {
  id: string;
  tournamentId: string;
  eventId: string;
  stageName: string; // e.g. "Group Stage", "Round of 16", "Quarter Final", "Semi Final", "Final"
  roundNumber: number;
  matchNumber: number;
  participant1Id?: string;
  participant2Id?: string;
  participant1Name?: string;
  participant2Name?: string;
  participant1ScoreText?: string;
  participant2ScoreText?: string;
  winnerId?: string;
  status: MatchStatus;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDurationMinutes: number;
  resourceId?: string;
  resourceName?: string;
  refereeId?: string;
  refereeName?: string;
  score: SportScoreData;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  bracketPosition?: {
    roundIndex: number;
    matchIndex: number;
    nextMatchId?: string;
    nextMatchSlot?: 1 | 2;
  };
  groupName?: string; // e.g. 'Group A'
}

export interface Tournament {
  id: string;
  slug: string; // e.g. "chennai-open-2026"
  title: string;
  subtitle?: string;
  type: TournamentType;
  sport: SportType;
  orgId: string;
  clubId?: string;
  status: 'DRAFT' | 'REGISTRATION' | 'ACTIVE' | 'COMPLETED';
  startDate: string;
  endDate: string;
  venueName: string;
  city: string;
  bannerUrl?: string;
  isPublic: boolean;
  registrationOpen: boolean;
  eventsCount: number;
  totalMatchesCount: number;
  pointsTableConfig: {
    winnerPoints: number;
    finalistPoints: number;
    semiFinalPoints: number;
    quarterFinalPoints: number;
  };
}

export interface StandingRow {
  rank: number;
  participantId: string;
  displayName: string;
  participantName?: string;
  clubName?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scoreFor: number;
  scoreAgainst: number;
  scoreDiff: number;
  setsWon?: number;
  setsLost?: number;
  setDifference?: number;
  points: number;
  streak?: string;
}

export type AnnouncementPriority = 'NORMAL' | 'URGENT' | 'CRITICAL' | 'EMERGENCY';

export interface Announcement {
  id: string;
  tournamentId?: string;
  clubId?: string;
  title: string;
  message: string;
  authorName: string;
  audience: 'ALL' | 'PLAYERS' | 'COACHES' | 'REFEREES' | 'EVENT' | 'ROUND';
  eventId?: string;
  priority: AnnouncementPriority;
  createdAt: string;
  isPublic: boolean;
}

export interface WebNotification {
  id: string;
  recipientUserId?: string;
  recipientPlayerId?: string;
  type: NotificationType;
  title: string;
  message: string;
  tournamentId?: string;
  matchId?: string;
  eventId?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface MatchResult {
  id: string;
  matchId: string;
  winnerId?: string;
  loserId?: string;
  isDraw?: boolean;
  score: SportScoreData;
  submittedByRefereeId?: string;
  submittedAt: string;
  verifiedByUserId?: string;
  verifiedAt?: string;
  isOfficial: boolean;
}

export interface Ranking {
  id: string;
  sport: SportType;
  category: string;
  playerId: string;
  playerName: string;
  clubName?: string;
  rank: number;
  points: number;
  tournamentsPlayed: number;
  updatedAt: string;
}

export interface CreateTournamentInput {
  title: string;
  type: TournamentType;
  sport: SportType;
  format?: TournamentFormat;
  orgId: string;
  clubId?: string;
  startDate: string;
  endDate: string;
  venueName: string;
  city: string;
  bannerUrl?: string;
  isPublic: boolean;
  registrationOpen: boolean;
  pointsTableConfig?: {
    winnerPoints: number;
    finalistPoints: number;
    semiFinalPoints: number;
    quarterFinalPoints: number;
  };
  events?: Partial<TournamentEvent>[];
}

export interface BroadcastAnnouncementInput {
  title: string;
  content?: string;
  message?: string;
  target?: 'ALL' | 'PLAYERS' | 'COACHES' | 'REFEREES' | 'EVENT' | 'ROUND';
  audience?: 'ALL' | 'PLAYERS' | 'COACHES' | 'REFEREES' | 'EVENT' | 'ROUND';
  priority?: AnnouncementPriority;
  channels?: string[];
  tournamentId?: string;
  eventId?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}
