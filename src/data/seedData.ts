import {
  Organization,
  Club,
  Coach,
  Batch,
  AttendanceRecord,
  MembershipPlan,
  PaymentRecord,
  PlayerProfile,
  Referee,
  CompetitionResource,
  Tournament,
  TournamentEvent,
  TournamentParticipant,
  Match,
  Announcement,
  WebNotification,
  AuditLog,
  UserAccount,
  PlayerClubMembership,
  TrainingSession,
  TournamentRegistration,
  TournamentStaff
} from '../types';

export const SEED_USERS: UserAccount[] = [
  {
    id: 'user-org-dir',
    name: 'Anand Natarajan',
    email: 'organizer@sportos.io',
    mobile: '+91 98400 12345',
    roles: ['TOURNAMENT_ORGANIZER', 'CLUB_ADMIN'],
    currentRole: 'TOURNAMENT_ORGANIZER',
    orgId: 'org-1',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-ref-suresh',
    name: 'Suresh Iyer',
    email: 'referee.suresh@sportos.io',
    mobile: '+91 98401 23456',
    roles: ['REFEREE'],
    currentRole: 'REFEREE',
    orgId: 'org-1',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-player-rahul',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@gmail.com',
    mobile: '+91 98402 34567',
    roles: ['PLAYER'],
    currentRole: 'PLAYER',
    orgId: 'org-1',
    linkedPlayerId: 'TT-00184',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-owner-vikram',
    name: 'Vikram Sethi',
    email: 'vikram.sethi@chennaitt.com',
    mobile: '+91 98403 45678',
    roles: ['CLUB_OWNER'],
    currentRole: 'CLUB_OWNER',
    orgId: 'org-1',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-coach-rajesh',
    name: 'Coach Rajesh Kannan',
    email: 'coach.rajesh@chennaitt.com',
    mobile: '+91 98404 56789',
    roles: ['COACH'],
    currentRole: 'COACH',
    orgId: 'org-1',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-super-admin',
    name: 'Alexander Vance',
    email: 'alex@sportos.io',
    mobile: '+1 415 555 0199',
    roles: ['SUPER_ADMIN'],
    currentRole: 'SUPER_ADMIN',
    orgId: 'org-global',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  }
];

export const SEED_ORGANIZATION: Organization = {
  id: 'org-1',
  name: 'Tamil Nadu Table Tennis & Sports Federation',
  type: 'FEDERATION',
  tier: 'ENTERPRISE',
  activeClubs: 8,
  activeTournaments: 4,
  createdAt: '2025-01-15'
};

export const SEED_CLUBS: Club[] = [
  {
    id: 'club-1',
    orgId: 'org-1',
    name: 'Chennai Table Tennis Academy',
    code: 'CTTA',
    city: 'Chennai',
    address: '14 Sports Complex Road, Nungambakkam, Chennai 600034',
    phone: '+91 44 2827 0099',
    email: 'info@chennaitt.com',
    sportsSupported: ['TABLE_TENNIS', 'BADMINTON'],
    branchesCount: 3
  },
  {
    id: 'club-2',
    orgId: 'org-1',
    name: 'Marina Smashers Club',
    code: 'MSC',
    city: 'Chennai',
    address: 'Beach Road, Mylapore, Chennai 600004',
    phone: '+91 44 2498 1122',
    email: 'contact@marinasmashers.in',
    sportsSupported: ['TABLE_TENNIS', 'BADMINTON', 'FOOTBALL'],
    branchesCount: 2
  },
  {
    id: 'club-3',
    orgId: 'org-1',
    name: 'Madras Cricket & Sports Guild',
    code: 'MCSG',
    city: 'Chennai',
    address: 'Chepauk Stadium Enclave, Chennai 600005',
    phone: '+91 44 2854 3344',
    email: 'secretary@mcsg.org',
    sportsSupported: ['CRICKET', 'FOOTBALL'],
    branchesCount: 1
  }
];

export const SEED_COACHES: Coach[] = [
  {
    id: 'coach-1',
    clubId: 'club-1',
    name: 'Coach Rajesh Kannan',
    sport: 'TABLE_TENNIS',
    specialization: 'High Performance & Topspin Attack',
    phone: '+91 98404 56789',
    email: 'coach.rajesh@chennaitt.com',
    experienceYears: 14,
    activeBatchesCount: 3
  },
  {
    id: 'coach-2',
    clubId: 'club-1',
    name: 'Coach Meenakshi Sundaram',
    sport: 'TABLE_TENNIS',
    specialization: 'Junior Development & Footwork Fundamentals',
    phone: '+91 98405 67890',
    email: 'meenakshi@chennaitt.com',
    experienceYears: 9,
    activeBatchesCount: 2
  },
  {
    id: 'coach-3',
    clubId: 'club-2',
    name: 'Coach Arvind Subramanian',
    sport: 'BADMINTON',
    specialization: 'Singles Tactical Movement',
    phone: '+91 98406 78901',
    email: 'arvind@marinasmashers.in',
    experienceYears: 11,
    activeBatchesCount: 2
  }
];

export const SEED_BATCHES: Batch[] = [
  {
    id: 'batch-1',
    clubId: 'club-1',
    name: 'Morning Elite TT Squad',
    sport: 'TABLE_TENNIS',
    coachId: 'coach-1',
    coachName: 'Coach Rajesh Kannan',
    timing: '06:00 AM - 08:00 AM',
    days: ['Mon', 'Wed', 'Fri', 'Sat'],
    playerIds: ['p-1', 'p-2', 'p-3', 'p-4', 'p-5'],
    maxCapacity: 12
  },
  {
    id: 'batch-2',
    clubId: 'club-1',
    name: 'Junior Prospects TT',
    sport: 'TABLE_TENNIS',
    coachId: 'coach-2',
    coachName: 'Coach Meenakshi Sundaram',
    timing: '04:30 PM - 06:30 PM',
    days: ['Tue', 'Thu', 'Sat'],
    playerIds: ['p-6', 'p-7', 'p-8', 'p-9', 'p-10'],
    maxCapacity: 16
  },
  {
    id: 'batch-3',
    clubId: 'club-2',
    name: 'Advanced Badminton Drills',
    sport: 'BADMINTON',
    coachId: 'coach-3',
    coachName: 'Coach Arvind Subramanian',
    timing: '05:30 PM - 07:30 PM',
    days: ['Mon', 'Wed', 'Fri'],
    playerIds: ['p-11', 'p-12'],
    maxCapacity: 10
  }
];

export const SEED_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    batchId: 'batch-1',
    date: '2026-09-05',
    records: [
      { playerId: 'p-1', playerName: 'Arjun Kumar', status: 'PRESENT' },
      { playerId: 'p-2', playerName: 'Rahul Kumar', status: 'PRESENT' },
      { playerId: 'p-3', playerName: 'Karthik Subramanian', status: 'PRESENT' },
      { playerId: 'p-4', playerName: 'Aditya Narayan', status: 'LATE', notes: 'Arrived 15m late due to traffic' },
      { playerId: 'p-5', playerName: 'Rohan Deshmukh', status: 'EXCUSED', notes: 'School midterm exam' }
    ]
  },
  {
    id: 'att-2',
    batchId: 'batch-1',
    date: '2026-09-03',
    records: [
      { playerId: 'p-1', playerName: 'Arjun Kumar', status: 'PRESENT' },
      { playerId: 'p-2', playerName: 'Rahul Kumar', status: 'PRESENT' },
      { playerId: 'p-3', playerName: 'Karthik Subramanian', status: 'PRESENT' },
      { playerId: 'p-4', playerName: 'Aditya Narayan', status: 'PRESENT' },
      { playerId: 'p-5', playerName: 'Rohan Deshmukh', status: 'PRESENT' }
    ]
  }
];

export const SEED_MEMBERSHIPS: MembershipPlan[] = [
  {
    id: 'plan-1',
    clubId: 'club-1',
    name: 'Annual High-Performance TT',
    sport: 'TABLE_TENNIS',
    billingCycle: 'ANNUAL',
    price: 36000,
    currency: 'INR',
    benefits: ['Unlimited Table Access', '4x Weekly Coaching', 'Video Analysis', 'Tournament Entry Discount 20%'],
    activeSubscribersCount: 28
  },
  {
    id: 'plan-2',
    clubId: 'club-1',
    name: 'Quarterly TT Academy Pack',
    sport: 'TABLE_TENNIS',
    billingCycle: 'QUARTERLY',
    price: 10500,
    currency: 'INR',
    benefits: ['3x Weekly Coaching', 'Weekend Practice Matches', 'Locker Facility'],
    activeSubscribersCount: 42
  },
  {
    id: 'plan-3',
    clubId: 'club-1',
    name: 'Monthly Junior Development',
    sport: 'TABLE_TENNIS',
    billingCycle: 'MONTHLY',
    price: 3800,
    currency: 'INR',
    benefits: ['2x Weekly Coaching Sessions', 'Fitness Conditioning'],
    activeSubscribersCount: 35
  }
];

export const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    orgId: 'org-1',
    clubId: 'club-1',
    playerId: 'p-2',
    payerName: 'Rahul Kumar',
    payerEmail: 'rahul.kumar@gmail.com',
    amount: 10500,
    currency: 'INR',
    type: 'MEMBERSHIP',
    status: 'PAID',
    date: '2026-09-01',
    receiptNumber: 'REC-2026-0901',
    notes: 'Q3 Academy Subscription'
  },
  {
    id: 'pay-2',
    orgId: 'org-1',
    tournamentId: 't-1',
    playerId: 'p-1',
    payerName: 'Arjun Kumar',
    payerEmail: 'arjun@gmail.com',
    amount: 1200,
    currency: 'INR',
    type: 'TOURNAMENT_REGISTRATION',
    status: 'PAID',
    date: '2026-09-02',
    receiptNumber: 'REC-2026-0902',
    notes: 'Chennai Open 2026 Men\'s Singles Entry'
  },
  {
    id: 'pay-3',
    orgId: 'org-1',
    clubId: 'club-1',
    playerId: 'p-4',
    payerName: 'Aditya Narayan',
    payerEmail: 'aditya@narayan.in',
    amount: 3800,
    currency: 'INR',
    type: 'MEMBERSHIP',
    status: 'PENDING',
    date: '2026-09-04',
    receiptNumber: 'REC-2026-0903',
    notes: 'September Monthly Renewal'
  }
];

export const SEED_PLAYERS: PlayerProfile[] = [
  {
    id: 'p-1',
    playerId: 'TT-00101',
    name: 'Arjun Kumar',
    dateOfBirth: '2001-04-12',
    gender: 'MALE',
    mobile: '+91 98410 11111',
    email: 'arjun.tt@gmail.com',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    sport: 'TABLE_TENNIS',
    category: 'Open Men',
    hand: 'RIGHT',
    playingStyle: 'Offensive Forehand Looper',
    status: 'ACTIVE',
    createdAt: '2024-02-10',
    rating: 2140,
    tournamentPoints: 850,
    rankings: { clubRank: 1, cityRank: 2, nationalRank: 14 },
    matchesPlayed: 48,
    wins: 41,
    losses: 7
  },
  {
    id: 'p-2',
    playerId: 'TT-00184',
    name: 'Rahul Kumar',
    dateOfBirth: '2003-08-22',
    gender: 'MALE',
    mobile: '+91 98402 34567',
    email: 'rahul.kumar@gmail.com',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    sport: 'TABLE_TENNIS',
    category: 'Open Men',
    hand: 'RIGHT',
    playingStyle: 'All-round Fast Attack',
    status: 'ACTIVE',
    createdAt: '2024-03-01',
    rating: 2085,
    tournamentPoints: 720,
    rankings: { clubRank: 2, cityRank: 4, nationalRank: 22 },
    matchesPlayed: 42,
    wins: 34,
    losses: 8
  },
  {
    id: 'p-3',
    playerId: 'TT-00185',
    name: 'Karthik Subramanian',
    dateOfBirth: '1999-11-05',
    gender: 'MALE',
    clubId: 'club-2',
    clubName: 'Marina Smashers Club',
    sport: 'TABLE_TENNIS',
    category: 'Open Men',
    hand: 'LEFT',
    playingStyle: 'Penhold Aggressive Push-Block',
    status: 'ACTIVE',
    createdAt: '2024-01-18',
    rating: 1990,
    tournamentPoints: 610,
    rankings: { clubRank: 1, cityRank: 6, nationalRank: 38 },
    matchesPlayed: 36,
    wins: 27,
    losses: 9
  },
  {
    id: 'p-4',
    playerId: 'TT-00186',
    name: 'Aditya Narayan',
    dateOfBirth: '2004-03-15',
    gender: 'MALE',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    sport: 'TABLE_TENNIS',
    category: 'Open Men',
    hand: 'RIGHT',
    playingStyle: 'Modern Defender',
    status: 'ACTIVE',
    createdAt: '2024-04-10',
    rating: 1945,
    tournamentPoints: 540,
    rankings: { clubRank: 3, cityRank: 9, nationalRank: 46 },
    matchesPlayed: 30,
    wins: 21,
    losses: 9
  },
  {
    id: 'p-5',
    playerId: 'TT-00187',
    name: 'Priya Sundararajan',
    dateOfBirth: '2002-09-18',
    gender: 'FEMALE',
    mobile: '+91 98408 22222',
    email: 'priya.sundar@gmail.com',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    sport: 'TABLE_TENNIS',
    category: 'Open Women',
    hand: 'RIGHT',
    playingStyle: 'Quick Counter-Puncher',
    status: 'ACTIVE',
    createdAt: '2024-02-14',
    rating: 2010,
    tournamentPoints: 690,
    rankings: { clubRank: 1, cityRank: 1, nationalRank: 11 },
    matchesPlayed: 38,
    wins: 32,
    losses: 6
  },
  {
    id: 'p-6',
    playerId: 'TT-00188',
    name: 'Ananya Ramesh',
    dateOfBirth: '2005-01-30',
    gender: 'FEMALE',
    clubId: 'club-2',
    clubName: 'Marina Smashers Club',
    sport: 'TABLE_TENNIS',
    category: 'Open Women',
    hand: 'RIGHT',
    playingStyle: 'Topspin Attacker',
    status: 'ACTIVE',
    createdAt: '2024-05-12',
    rating: 1880,
    tournamentPoints: 480,
    rankings: { clubRank: 2, cityRank: 3, nationalRank: 29 },
    matchesPlayed: 28,
    wins: 20,
    losses: 8
  },
  {
    id: 'p-7',
    playerId: 'TT-00189',
    name: 'Divya Vijay',
    dateOfBirth: '2003-12-14',
    gender: 'FEMALE',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    sport: 'TABLE_TENNIS',
    category: 'Open Women',
    hand: 'LEFT',
    playingStyle: 'Two-Wing Looper',
    status: 'ACTIVE',
    createdAt: '2024-06-01',
    rating: 1820,
    tournamentPoints: 410,
    rankings: { clubRank: 2, cityRank: 5, nationalRank: 35 },
    matchesPlayed: 24,
    wins: 16,
    losses: 8
  },
  {
    id: 'p-8',
    playerId: 'TT-00190',
    name: 'Sneha Balaji',
    dateOfBirth: '2004-07-09',
    gender: 'FEMALE',
    clubId: 'club-2',
    clubName: 'Marina Smashers Club',
    sport: 'TABLE_TENNIS',
    category: 'Open Women',
    hand: 'RIGHT',
    playingStyle: 'Close-Table Blocker',
    status: 'ACTIVE',
    createdAt: '2024-06-18',
    rating: 1760,
    tournamentPoints: 350,
    rankings: { clubRank: 3, cityRank: 8, nationalRank: 52 },
    matchesPlayed: 20,
    wins: 12,
    losses: 8
  },
  // U17 Boys and remaining 24 players
  {
    id: 'p-9',
    playerId: 'TT-00191',
    name: 'Naveen Vignesh',
    dateOfBirth: '2010-02-11',
    gender: 'MALE',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    sport: 'TABLE_TENNIS',
    category: 'Under-17 Boys',
    hand: 'RIGHT',
    playingStyle: 'Fast Attack',
    status: 'ACTIVE',
    createdAt: '2024-07-01',
    rating: 1620,
    tournamentPoints: 310,
    rankings: { clubRank: 1, cityRank: 2 },
    matchesPlayed: 18,
    wins: 14,
    losses: 4
  },
  {
    id: 'p-10',
    playerId: 'TT-00192',
    name: 'Tarun Venkat',
    dateOfBirth: '2010-09-04',
    gender: 'MALE',
    clubId: 'club-2',
    clubName: 'Marina Smashers Club',
    sport: 'TABLE_TENNIS',
    category: 'Under-17 Boys',
    hand: 'LEFT',
    playingStyle: 'Loop-Drive',
    status: 'ACTIVE',
    createdAt: '2024-07-15',
    rating: 1580,
    tournamentPoints: 280,
    rankings: { clubRank: 1, cityRank: 3 },
    matchesPlayed: 16,
    wins: 11,
    losses: 5
  },
  {
    id: 'p-11',
    playerId: 'TT-00193',
    name: 'Siddharth Iyer',
    dateOfBirth: '2002-05-19',
    gender: 'MALE',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    sport: 'TABLE_TENNIS',
    category: 'Open Men',
    hand: 'RIGHT',
    playingStyle: 'Offensive',
    status: 'ACTIVE',
    createdAt: '2024-04-20',
    rating: 1910,
    tournamentPoints: 490,
    rankings: { clubRank: 4, cityRank: 11 },
    matchesPlayed: 25,
    wins: 17,
    losses: 8
  },
  {
    id: 'p-12',
    playerId: 'TT-00194',
    name: 'Vikramaditya Rao',
    dateOfBirth: '2001-08-30',
    gender: 'MALE',
    clubId: 'club-2',
    clubName: 'Marina Smashers Club',
    sport: 'TABLE_TENNIS',
    category: 'Open Men',
    hand: 'RIGHT',
    playingStyle: 'Counter Drive',
    status: 'ACTIVE',
    createdAt: '2024-05-02',
    rating: 1870,
    tournamentPoints: 440,
    rankings: { clubRank: 3, cityRank: 14 },
    matchesPlayed: 22,
    wins: 14,
    losses: 8
  },
  {
    id: 'p-13',
    playerId: 'TT-00195',
    name: 'Manoj Krishnan',
    dateOfBirth: '2000-10-12',
    gender: 'MALE',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    sport: 'TABLE_TENNIS',
    category: 'Open Men',
    hand: 'RIGHT',
    playingStyle: 'All-round',
    status: 'ACTIVE',
    createdAt: '2024-05-10',
    rating: 1840,
    tournamentPoints: 390,
    rankings: { clubRank: 5, cityRank: 16 },
    matchesPlayed: 20,
    wins: 12,
    losses: 8
  },
  {
    id: 'p-14',
    playerId: 'TT-00196',
    name: 'Ganesh Shankaran',
    dateOfBirth: '2003-01-25',
    gender: 'MALE',
    clubId: 'club-2',
    clubName: 'Marina Smashers Club',
    sport: 'TABLE_TENNIS',
    category: 'Open Men',
    hand: 'LEFT',
    playingStyle: 'Power Spin',
    status: 'ACTIVE',
    createdAt: '2024-05-15',
    rating: 1810,
    tournamentPoints: 360,
    rankings: { clubRank: 4, cityRank: 18 },
    matchesPlayed: 19,
    wins: 11,
    losses: 8
  },
  {
    id: 'p-15',
    playerId: 'TT-00197',
    name: 'Pranav Murthy',
    dateOfBirth: '2004-11-02',
    gender: 'MALE',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    sport: 'TABLE_TENNIS',
    category: 'Open Men',
    hand: 'RIGHT',
    playingStyle: 'Fast Attack',
    status: 'ACTIVE',
    createdAt: '2024-06-01',
    rating: 1780,
    tournamentPoints: 320,
    rankings: { clubRank: 6, cityRank: 21 },
    matchesPlayed: 16,
    wins: 9,
    losses: 7
  },
  {
    id: 'p-16',
    playerId: 'TT-00198',
    name: 'Sanjay Natarajan',
    dateOfBirth: '2002-07-17',
    gender: 'MALE',
    clubId: 'club-2',
    clubName: 'Marina Smashers Club',
    sport: 'TABLE_TENNIS',
    category: 'Open Men',
    hand: 'RIGHT',
    playingStyle: 'Modern Defense',
    status: 'ACTIVE',
    createdAt: '2024-06-05',
    rating: 1750,
    tournamentPoints: 290,
    rankings: { clubRank: 5, cityRank: 24 },
    matchesPlayed: 15,
    wins: 8,
    losses: 7
  },
  // Players 17 to 32
  ...Array.from({ length: 16 }, (_, idx) => {
    const num = 17 + idx;
    const names = [
      'Varun Chander', 'Harish Babu', 'Rishi Koushik', 'Vijay Dev',
      'Ashwin Raghav', 'Kishore Kumar', 'Surya Prakash', 'Deepak Sen',
      'Lokesh Rahul', 'Tanmay Roy', 'Gautam Menon', 'Saurabh Bose',
      'Nitin Chandran', 'Yuvraj Patel', 'Kunal Shah', 'Vikas Sharma'
    ];
    return {
      id: `p-${num}`,
      playerId: `TT-00${200 + idx}`,
      name: names[idx],
      dateOfBirth: '2002-04-10',
      gender: 'MALE' as const,
      clubId: idx % 2 === 0 ? 'club-1' : 'club-2',
      clubName: idx % 2 === 0 ? 'Chennai TT Academy' : 'Marina Smashers Club',
      sport: 'TABLE_TENNIS' as const,
      category: 'Open Men',
      hand: idx % 4 === 0 ? 'LEFT' as const : 'RIGHT' as const,
      playingStyle: 'Offensive Attack',
      status: 'ACTIVE' as const,
      createdAt: '2024-06-10',
      rating: 1700 - idx * 15,
      tournamentPoints: 260 - idx * 10,
      rankings: { clubRank: 6 + Math.floor(idx / 2), cityRank: 25 + idx },
      matchesPlayed: 12 + (idx % 5),
      wins: 6 + (idx % 4),
      losses: 6 + (idx % 3)
    };
  })
];

export const SEED_REFEREES: Referee[] = [
  {
    id: 'ref-1',
    name: 'Suresh Iyer',
    sport: 'TABLE_TENNIS',
    certificationLevel: 'International ITTF Blue Badge',
    phone: '+91 98401 23456',
    email: 'referee.suresh@sportos.io',
    status: 'AVAILABLE'
  },
  {
    id: 'ref-2',
    name: 'K. Parthasarathy',
    sport: 'TABLE_TENNIS',
    certificationLevel: 'National Grade 1',
    phone: '+91 98409 33333',
    status: 'AVAILABLE'
  },
  {
    id: 'ref-3',
    name: 'R. Soundararajan',
    sport: 'TABLE_TENNIS',
    certificationLevel: 'National Grade 1',
    phone: '+91 98409 44444',
    status: 'AVAILABLE'
  },
  {
    id: 'ref-4',
    name: 'Kavitha Radhakrishnan',
    sport: 'TABLE_TENNIS',
    certificationLevel: 'State Certified Official',
    phone: '+91 98409 55555',
    status: 'AVAILABLE'
  },
  {
    id: 'ref-5',
    name: 'B. Muthukumar',
    sport: 'TABLE_TENNIS',
    certificationLevel: 'State Certified Official',
    phone: '+91 98409 66666',
    status: 'AVAILABLE'
  },
  {
    id: 'ref-6',
    name: 'M. Jayanthi',
    sport: 'TABLE_TENNIS',
    certificationLevel: 'State Certified Official',
    phone: '+91 98409 77777',
    status: 'AVAILABLE'
  }
];

export const SEED_RESOURCES: CompetitionResource[] = [
  { id: 'res-t1', name: 'Table 1', sport: 'TABLE_TENNIS', type: 'TABLE', venueName: 'SDAT Indoor Arena, Center Court', status: 'OCCUPIED' },
  { id: 'res-t2', name: 'Table 2', sport: 'TABLE_TENNIS', type: 'TABLE', venueName: 'SDAT Indoor Arena, Center Court', status: 'OCCUPIED' },
  { id: 'res-t3', name: 'Table 3', sport: 'TABLE_TENNIS', type: 'TABLE', venueName: 'SDAT Indoor Arena, Hall A', status: 'AVAILABLE' },
  { id: 'res-t4', name: 'Table 4', sport: 'TABLE_TENNIS', type: 'TABLE', venueName: 'SDAT Indoor Arena, Hall A', status: 'AVAILABLE' },
  { id: 'res-t5', name: 'Table 5', sport: 'TABLE_TENNIS', type: 'TABLE', venueName: 'SDAT Indoor Arena, Hall B', status: 'AVAILABLE' },
  { id: 'res-t6', name: 'Table 6', sport: 'TABLE_TENNIS', type: 'TABLE', venueName: 'SDAT Indoor Arena, Hall B', status: 'AVAILABLE' },
  // Badminton Courts
  { id: 'res-c1', name: 'Court 1', sport: 'BADMINTON', type: 'COURT', venueName: 'Marina Indoor Stadium', status: 'AVAILABLE' },
  { id: 'res-c2', name: 'Court 2', sport: 'BADMINTON', type: 'COURT', venueName: 'Marina Indoor Stadium', status: 'AVAILABLE' },
  // Football Ground
  { id: 'res-g1', name: 'Main Pitch', sport: 'FOOTBALL', type: 'GROUND', venueName: 'Nehru Stadium Grounds', status: 'AVAILABLE' },
  // Cricket Ground
  { id: 'res-cr1', name: 'Center Ground', sport: 'CRICKET', type: 'GROUND', venueName: 'Chepauk Turf Ground', status: 'AVAILABLE' }
];

export const SEED_TOURNAMENTS: Tournament[] = [
  {
    id: 't-1',
    slug: 'chennai-open-2026',
    title: 'Chennai Open Table Tennis Championship 2026',
    subtitle: 'State Ranking Tournament & National Qualifier',
    type: 'ONE_TIME',
    sport: 'TABLE_TENNIS',
    orgId: 'org-1',
    clubId: 'club-1',
    ownerUserId: 'user-organizer-anand',
    createdByUserId: 'user-organizer-anand',
    status: 'ACTIVE',
    startDate: '2026-09-05',
    endDate: '2026-09-08',
    venueName: 'SDAT Indoor Stadium, Nungambakkam, Chennai',
    city: 'Chennai',
    bannerUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=1200&auto=format&fit=crop&q=80',
    isPublic: true,
    registrationOpen: false,
    eventsCount: 3,
    totalMatchesCount: 38,
    pointsTableConfig: {
      winnerPoints: 300,
      finalistPoints: 200,
      semiFinalPoints: 120,
      quarterFinalPoints: 70
    }
  },
  {
    id: 't-2',
    slug: 'metro-badminton-masters-2026',
    title: 'Metro Badminton Masters 2026',
    subtitle: 'Grand Prix Circuit Season Opening',
    type: 'ONE_TIME',
    sport: 'BADMINTON',
    orgId: 'org-1',
    clubId: 'club-2',
    ownerUserId: 'user-organizer-anand',
    createdByUserId: 'user-organizer-anand',
    status: 'REGISTRATION',
    startDate: '2026-09-20',
    endDate: '2026-09-23',
    venueName: 'Marina Indoor Stadium, Mylapore',
    city: 'Chennai',
    bannerUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&auto=format&fit=crop&q=80',
    isPublic: true,
    registrationOpen: true,
    eventsCount: 2,
    totalMatchesCount: 16,
    pointsTableConfig: {
      winnerPoints: 250,
      finalistPoints: 160,
      semiFinalPoints: 90,
      quarterFinalPoints: 50
    }
  },
  {
    id: 't-3',
    slug: 'chennai-premier-t20-league',
    title: 'Chennai Premier T20 League 2026',
    subtitle: 'Inter-Club Weekend Championship',
    type: 'SEASON',
    sport: 'CRICKET',
    orgId: 'org-1',
    clubId: 'club-3',
    ownerUserId: 'user-organizer-anand',
    createdByUserId: 'user-organizer-anand',
    status: 'ACTIVE',
    startDate: '2026-08-15',
    endDate: '2026-10-10',
    venueName: 'Chepauk Turf Ground',
    city: 'Chennai',
    bannerUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80',
    isPublic: true,
    registrationOpen: false,
    eventsCount: 1,
    totalMatchesCount: 24,
    pointsTableConfig: {
      winnerPoints: 400,
      finalistPoints: 250,
      semiFinalPoints: 150,
      quarterFinalPoints: 80
    }
  },
  {
    id: 't-4',
    slug: 'south-zone-football-cup',
    title: 'South Zone Club Football Championship 2026',
    subtitle: 'Invitational Corporate & Club Cup',
    type: 'ONE_TIME',
    sport: 'FOOTBALL',
    orgId: 'org-1',
    clubId: 'club-2',
    ownerUserId: 'user-organizer-anand',
    createdByUserId: 'user-organizer-anand',
    status: 'ACTIVE',
    startDate: '2026-09-01',
    endDate: '2026-09-12',
    venueName: 'Nehru Stadium Main Pitch',
    city: 'Chennai',
    bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    isPublic: true,
    registrationOpen: false,
    eventsCount: 1,
    totalMatchesCount: 15,
    pointsTableConfig: {
      winnerPoints: 500,
      finalistPoints: 300,
      semiFinalPoints: 180,
      quarterFinalPoints: 100
    }
  }
];

export const SEED_EVENTS: TournamentEvent[] = [
  {
    id: 'ev-1',
    tournamentId: 't-1',
    name: "Men's Singles",
    sport: 'TABLE_TENNIS',
    format: 'GROUPS_KNOCKOUT',
    category: 'Open Men',
    isDoubles: false,
    qualifiersPerGroup: 2,
    participantIds: ['part-1', 'part-2', 'part-3', 'part-4', 'part-5', 'part-6', 'part-7', 'part-8', 'part-9', 'part-10', 'part-11', 'part-12', 'part-13', 'part-14', 'part-15', 'part-16'],
    rules: {
      sport: 'TABLE_TENNIS',
      bestOfSets: 5,
      bestOfGroup: 3,
      bestOfKnockout: 5,
      bestOfFinal: 7,
      pointsPerGame: 11,
      winByMargin: 2,
      pointsForWin: 2,
      pointsForDraw: 0,
      pointsForLoss: 0,
      tieBreakerPriority: ['POINTS', 'GAMES_DIFF', 'POINTS_DIFF', 'HEAD_TO_HEAD']
    },
    status: 'IN_PROGRESS'
  },
  {
    id: 'ev-2',
    tournamentId: 't-1',
    name: "Women's Singles",
    sport: 'TABLE_TENNIS',
    format: 'KNOCKOUT',
    category: 'Open Women',
    isDoubles: false,
    participantIds: ['part-w1', 'part-w2', 'part-w3', 'part-w4'],
    rules: {
      sport: 'TABLE_TENNIS',
      bestOfSets: 5,
      bestOfKnockout: 5,
      bestOfFinal: 7,
      pointsPerGame: 11,
      winByMargin: 2,
      pointsForWin: 2,
      pointsForDraw: 0,
      pointsForLoss: 0,
      tieBreakerPriority: ['POINTS', 'GAMES_DIFF']
    },
    status: 'IN_PROGRESS'
  },
  {
    id: 'ev-3',
    tournamentId: 't-1',
    name: "Under-17 Boys Singles",
    sport: 'TABLE_TENNIS',
    format: 'ROUND_ROBIN',
    category: 'Under-17',
    isDoubles: false,
    participantIds: ['part-u1', 'part-u2', 'part-u3', 'part-u4'],
    rules: {
      sport: 'TABLE_TENNIS',
      bestOfSets: 3,
      bestOfGroup: 3,
      pointsPerGame: 11,
      winByMargin: 2,
      pointsForWin: 2,
      pointsForDraw: 0,
      pointsForLoss: 0,
      tieBreakerPriority: ['POINTS', 'GAMES_DIFF']
    },
    status: 'IN_PROGRESS'
  }
];

export const SEED_PARTICIPANTS: TournamentParticipant[] = [
  // Group A
  {
    id: 'part-1',
    eventId: 'ev-1',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-1',
    primaryPlayerName: 'Arjun Kumar',
    displayName: 'Arjun Kumar',
    clubName: 'Chennai TT Academy',
    seed: 1,
    groupName: 'Group A',
    stats: { matchesPlayed: 2, wins: 2, losses: 0, draws: 0, scoreFor: 6, scoreAgainst: 2, points: 4 }
  },
  {
    id: 'part-2',
    eventId: 'ev-1',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-2',
    primaryPlayerName: 'Rahul Kumar',
    displayName: 'Rahul Kumar',
    clubName: 'Chennai TT Academy',
    seed: 2,
    groupName: 'Group A',
    stats: { matchesPlayed: 2, wins: 1, losses: 1, draws: 0, scoreFor: 4, scoreAgainst: 3, points: 2 }
  },
  {
    id: 'part-3',
    eventId: 'ev-1',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-11',
    primaryPlayerName: 'Siddharth Iyer',
    displayName: 'Siddharth Iyer',
    clubName: 'Chennai TT Academy',
    groupName: 'Group A',
    stats: { matchesPlayed: 2, wins: 1, losses: 1, draws: 0, scoreFor: 3, scoreAgainst: 4, points: 2 }
  },
  {
    id: 'part-4',
    eventId: 'ev-1',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-13',
    primaryPlayerName: 'Manoj Krishnan',
    displayName: 'Manoj Krishnan',
    clubName: 'Chennai TT Academy',
    groupName: 'Group A',
    stats: { matchesPlayed: 2, wins: 0, losses: 2, draws: 0, scoreFor: 1, scoreAgainst: 6, points: 0 }
  },
  // Group B
  {
    id: 'part-5',
    eventId: 'ev-1',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-3',
    primaryPlayerName: 'Karthik Subramanian',
    displayName: 'Karthik Subramanian',
    clubName: 'Marina Smashers Club',
    seed: 3,
    groupName: 'Group B',
    stats: { matchesPlayed: 2, wins: 2, losses: 0, draws: 0, scoreFor: 6, scoreAgainst: 1, points: 4 }
  },
  {
    id: 'part-6',
    eventId: 'ev-1',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-4',
    primaryPlayerName: 'Aditya Narayan',
    displayName: 'Aditya Narayan',
    clubName: 'Chennai TT Academy',
    seed: 4,
    groupName: 'Group B',
    stats: { matchesPlayed: 2, wins: 1, losses: 1, draws: 0, scoreFor: 4, scoreAgainst: 4, points: 2 }
  },
  {
    id: 'part-7',
    eventId: 'ev-1',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-12',
    primaryPlayerName: 'Vikramaditya Rao',
    displayName: 'Vikramaditya Rao',
    clubName: 'Marina Smashers Club',
    groupName: 'Group B',
    stats: { matchesPlayed: 2, wins: 1, losses: 1, draws: 0, scoreFor: 3, scoreAgainst: 4, points: 2 }
  },
  {
    id: 'part-8',
    eventId: 'ev-1',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-14',
    primaryPlayerName: 'Ganesh Shankaran',
    displayName: 'Ganesh Shankaran',
    clubName: 'Marina Smashers Club',
    groupName: 'Group B',
    stats: { matchesPlayed: 2, wins: 0, losses: 2, draws: 0, scoreFor: 1, scoreAgainst: 6, points: 0 }
  },
  // Women's Singles
  {
    id: 'part-w1',
    eventId: 'ev-2',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-5',
    primaryPlayerName: 'Priya Sundararajan',
    displayName: 'Priya Sundararajan',
    clubName: 'Chennai TT Academy',
    seed: 1,
    stats: { matchesPlayed: 1, wins: 1, losses: 0, draws: 0, scoreFor: 3, scoreAgainst: 0, points: 2 }
  },
  {
    id: 'part-w2',
    eventId: 'ev-2',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-6',
    primaryPlayerName: 'Ananya Ramesh',
    displayName: 'Ananya Ramesh',
    clubName: 'Marina Smashers Club',
    seed: 2,
    stats: { matchesPlayed: 1, wins: 1, losses: 0, draws: 0, scoreFor: 3, scoreAgainst: 1, points: 2 }
  },
  {
    id: 'part-w3',
    eventId: 'ev-2',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-7',
    primaryPlayerName: 'Divya Vijay',
    displayName: 'Divya Vijay',
    clubName: 'Chennai TT Academy',
    seed: 3,
    stats: { matchesPlayed: 1, wins: 0, losses: 1, draws: 0, scoreFor: 1, scoreAgainst: 3, points: 0 }
  },
  {
    id: 'part-w4',
    eventId: 'ev-2',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-8',
    primaryPlayerName: 'Sneha Balaji',
    displayName: 'Sneha Balaji',
    clubName: 'Marina Smashers Club',
    seed: 4,
    stats: { matchesPlayed: 1, wins: 0, losses: 1, draws: 0, scoreFor: 0, scoreAgainst: 3, points: 0 }
  },
  // U17 Boys
  {
    id: 'part-u1',
    eventId: 'ev-3',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-9',
    primaryPlayerName: 'Naveen Vignesh',
    displayName: 'Naveen Vignesh',
    clubName: 'Chennai TT Academy',
    seed: 1,
    stats: { matchesPlayed: 1, wins: 1, losses: 0, draws: 0, scoreFor: 2, scoreAgainst: 0, points: 2 }
  },
  {
    id: 'part-u2',
    eventId: 'ev-3',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-10',
    primaryPlayerName: 'Tarun Venkat',
    displayName: 'Tarun Venkat',
    clubName: 'Marina Smashers Club',
    seed: 2,
    stats: { matchesPlayed: 1, wins: 1, losses: 0, draws: 0, scoreFor: 2, scoreAgainst: 1, points: 2 }
  },
  {
    id: 'part-u3',
    eventId: 'ev-3',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-15',
    primaryPlayerName: 'Pranav Murthy',
    displayName: 'Pranav Murthy',
    clubName: 'Chennai TT Academy',
    stats: { matchesPlayed: 1, wins: 0, losses: 1, draws: 0, scoreFor: 1, scoreAgainst: 2, points: 0 }
  },
  {
    id: 'part-u4',
    eventId: 'ev-3',
    type: 'INDIVIDUAL',
    primaryPlayerId: 'p-16',
    primaryPlayerName: 'Sanjay Natarajan',
    displayName: 'Sanjay Natarajan',
    clubName: 'Marina Smashers Club',
    stats: { matchesPlayed: 1, wins: 0, losses: 1, draws: 0, scoreFor: 0, scoreAgainst: 2, points: 0 }
  }
];

export const SEED_MATCHES: Match[] = [
  // Live Match 1: Arjun Kumar vs Rahul Kumar on Table 1
  {
    id: 'match-101',
    tournamentId: 't-1',
    eventId: 'ev-1',
    stageName: 'Group A - Round 3',
    roundNumber: 3,
    matchNumber: 1,
    participant1Id: 'part-1',
    participant2Id: 'part-2',
    participant1Name: 'Arjun Kumar',
    participant2Name: 'Rahul Kumar',
    status: 'LIVE',
    scheduledDate: '2026-09-05',
    scheduledTime: '10:30',
    estimatedDurationMinutes: 35,
    resourceId: 'res-t1',
    resourceName: 'Table 1',
    refereeId: 'ref-1',
    refereeName: 'Suresh Iyer',
    groupName: 'Group A',
    score: {
      sport: 'TABLE_TENNIS',
      data: {
        sets: [
          { p1: 11, p2: 8 },
          { p1: 9, p2: 11 },
          { p1: 11, p2: 7 }
        ],
        currentSetP1: 7,
        currentSetP2: 6,
        currentSetIndex: 4,
        p1TimeoutsLeft: 1,
        p2TimeoutsLeft: 0,
        serverParticipantId: 'part-1',
        isDeuce: false,
        isGameOver: false,
        history: [
          { p1: 1, p2: 0, desc: 'Point to Arjun Kumar (1-0)', timestamp: '10:48:10' },
          { p1: 1, p2: 1, desc: 'Point to Rahul Kumar (1-1)', timestamp: '10:48:40' },
          { p1: 2, p2: 1, desc: 'Point to Arjun Kumar (2-1)', timestamp: '10:49:12' },
          { p1: 3, p2: 1, desc: 'Point to Arjun Kumar (3-1)', timestamp: '10:49:45' },
          { p1: 3, p2: 2, desc: 'Point to Rahul Kumar (3-2)', timestamp: '10:50:20' },
          { p1: 4, p2: 2, desc: 'Point to Arjun Kumar (4-2)', timestamp: '10:50:55' },
          { p1: 5, p2: 2, desc: 'Point to Arjun Kumar (5-2)', timestamp: '10:51:30' },
          { p1: 5, p2: 3, desc: 'Point to Rahul Kumar (5-3)', timestamp: '10:52:00' },
          { p1: 5, p2: 4, desc: 'Point to Rahul Kumar (5-4)', timestamp: '10:52:35' },
          { p1: 6, p2: 4, desc: 'Point to Arjun Kumar (6-4)', timestamp: '10:53:10' },
          { p1: 6, p2: 5, desc: 'Point to Rahul Kumar (6-5)', timestamp: '10:53:45' },
          { p1: 6, p2: 6, desc: 'Point to Rahul Kumar (6-6)', timestamp: '10:54:20' },
          { p1: 7, p2: 6, desc: 'Point to Arjun Kumar (7-6)', timestamp: '10:55:00' }
        ]
      }
    }
  },
  // Live Match 2: Karthik Subramanian vs Aditya Narayan on Table 2
  {
    id: 'match-102',
    tournamentId: 't-1',
    eventId: 'ev-1',
    stageName: 'Group B - Round 3',
    roundNumber: 3,
    matchNumber: 2,
    participant1Id: 'part-5',
    participant2Id: 'part-6',
    participant1Name: 'Karthik Subramanian',
    participant2Name: 'Aditya Narayan',
    status: 'LIVE',
    scheduledDate: '2026-09-05',
    scheduledTime: '10:45',
    estimatedDurationMinutes: 35,
    resourceId: 'res-t2',
    resourceName: 'Table 2',
    refereeId: 'ref-2',
    refereeName: 'K. Parthasarathy',
    groupName: 'Group B',
    score: {
      sport: 'TABLE_TENNIS',
      data: {
        sets: [
          { p1: 11, p2: 6 },
          { p1: 8, p2: 11 }
        ],
        currentSetP1: 5,
        currentSetP2: 4,
        currentSetIndex: 3,
        p1TimeoutsLeft: 1,
        p2TimeoutsLeft: 1,
        serverParticipantId: 'part-6',
        isDeuce: false,
        isGameOver: false,
        history: [
          { p1: 1, p2: 0, desc: 'Point to Karthik Subramanian', timestamp: '10:50:00' }
        ]
      }
    }
  },
  // Upcoming Match Called: Table 3 Priya Sundararajan vs Ananya Ramesh
  {
    id: 'match-103',
    tournamentId: 't-1',
    eventId: 'ev-2',
    stageName: "Women's Singles - Semi Final 1",
    roundNumber: 2,
    matchNumber: 3,
    participant1Id: 'part-w1',
    participant2Id: 'part-w2',
    participant1Name: 'Priya Sundararajan',
    participant2Name: 'Ananya Ramesh',
    status: 'CALLED',
    scheduledDate: '2026-09-05',
    scheduledTime: '11:15',
    estimatedDurationMinutes: 35,
    resourceId: 'res-t3',
    resourceName: 'Table 3',
    refereeId: 'ref-3',
    refereeName: 'R. Soundararajan',
    calledAt: '11:05',
    score: {
      sport: 'TABLE_TENNIS',
      data: {
        sets: [],
        currentSetP1: 0,
        currentSetP2: 0,
        currentSetIndex: 1,
        p1TimeoutsLeft: 1,
        p2TimeoutsLeft: 1,
        serverParticipantId: 'part-w1',
        isDeuce: false,
        isGameOver: false,
        history: []
      }
    }
  },
  // Upcoming Scheduled Match 4: Table 4
  {
    id: 'match-104',
    tournamentId: 't-1',
    eventId: 'ev-3',
    stageName: 'U17 Boys - Round 2',
    roundNumber: 2,
    matchNumber: 4,
    participant1Id: 'part-u1',
    participant2Id: 'part-u2',
    participant1Name: 'Naveen Vignesh',
    participant2Name: 'Tarun Venkat',
    status: 'SCHEDULED',
    scheduledDate: '2026-09-05',
    scheduledTime: '11:30',
    estimatedDurationMinutes: 30,
    resourceId: 'res-t4',
    resourceName: 'Table 4',
    refereeId: 'ref-4',
    refereeName: 'Kavitha Radhakrishnan',
    score: {
      sport: 'TABLE_TENNIS',
      data: {
        sets: [],
        currentSetP1: 0,
        currentSetP2: 0,
        currentSetIndex: 1,
        p1TimeoutsLeft: 1,
        p2TimeoutsLeft: 1,
        serverParticipantId: 'part-u1',
        isDeuce: false,
        isGameOver: false,
        history: []
      }
    }
  },
  // Completed & Verified Match 5: Arjun Kumar vs Siddharth Iyer
  {
    id: 'match-105',
    tournamentId: 't-1',
    eventId: 'ev-1',
    stageName: 'Group A - Round 1',
    roundNumber: 1,
    matchNumber: 5,
    participant1Id: 'part-1',
    participant2Id: 'part-3',
    participant1Name: 'Arjun Kumar',
    participant2Name: 'Siddharth Iyer',
    winnerId: 'part-1',
    status: 'VERIFIED',
    scheduledDate: '2026-09-05',
    scheduledTime: '09:00',
    estimatedDurationMinutes: 30,
    resourceId: 'res-t1',
    resourceName: 'Table 1',
    refereeId: 'ref-1',
    refereeName: 'Suresh Iyer',
    verifiedBy: 'Anand Natarajan',
    verifiedAt: '09:42',
    groupName: 'Group A',
    score: {
      sport: 'TABLE_TENNIS',
      data: {
        sets: [
          { p1: 11, p2: 5 },
          { p1: 11, p2: 8 },
          { p1: 11, p2: 6 }
        ],
        currentSetP1: 11,
        currentSetP2: 6,
        currentSetIndex: 3,
        p1TimeoutsLeft: 1,
        p2TimeoutsLeft: 1,
        serverParticipantId: 'part-1',
        isDeuce: false,
        isGameOver: true,
        history: []
      }
    }
  },
  // Completed Match 6: Rahul Kumar vs Manoj Krishnan
  {
    id: 'match-106',
    tournamentId: 't-1',
    eventId: 'ev-1',
    stageName: 'Group A - Round 2',
    roundNumber: 2,
    matchNumber: 6,
    participant1Id: 'part-2',
    participant2Id: 'part-4',
    participant1Name: 'Rahul Kumar',
    participant2Name: 'Manoj Krishnan',
    winnerId: 'part-2',
    status: 'VERIFIED',
    scheduledDate: '2026-09-05',
    scheduledTime: '09:45',
    estimatedDurationMinutes: 30,
    resourceId: 'res-t2',
    resourceName: 'Table 2',
    refereeId: 'ref-2',
    refereeName: 'K. Parthasarathy',
    verifiedBy: 'Anand Natarajan',
    verifiedAt: '10:20',
    groupName: 'Group A',
    score: {
      sport: 'TABLE_TENNIS',
      data: {
        sets: [
          { p1: 11, p2: 4 },
          { p1: 9, p2: 11 },
          { p1: 11, p2: 6 },
          { p1: 11, p2: 8 }
        ],
        currentSetP1: 11,
        currentSetP2: 8,
        currentSetIndex: 4,
        p1TimeoutsLeft: 1,
        p2TimeoutsLeft: 0,
        serverParticipantId: 'part-2',
        isDeuce: false,
        isGameOver: true,
        history: []
      }
    }
  },
  // Unassigned match waiting for table / court
  {
    id: 'match-107',
    tournamentId: 't-1',
    eventId: 'ev-1',
    stageName: 'Group B - Round 2',
    roundNumber: 2,
    matchNumber: 7,
    participant1Id: 'part-7',
    participant2Id: 'part-8',
    participant1Name: 'Vikramaditya Rao',
    participant2Name: 'Ganesh Shankaran',
    status: 'SCHEDULED',
    scheduledDate: '2026-09-05',
    scheduledTime: '12:00',
    estimatedDurationMinutes: 30,
    groupName: 'Group B',
    score: {
      sport: 'TABLE_TENNIS',
      data: {
        sets: [],
        currentSetP1: 0,
        currentSetP2: 0,
        currentSetIndex: 1,
        p1TimeoutsLeft: 1,
        p2TimeoutsLeft: 1,
        serverParticipantId: 'part-7',
        isDeuce: false,
        isGameOver: false,
        history: []
      }
    }
  },
  // Knockout Quarter Final (TBD progression)
  {
    id: 'match-qf-1',
    tournamentId: 't-1',
    eventId: 'ev-1',
    stageName: 'Quarter Final 1',
    roundNumber: 4,
    matchNumber: 8,
    participant1Name: 'Winner Group A',
    participant2Name: 'Runner-up Group B',
    status: 'SCHEDULED',
    scheduledDate: '2026-09-06',
    scheduledTime: '14:00',
    estimatedDurationMinutes: 40,
    resourceId: 'res-t1',
    resourceName: 'Table 1',
    refereeId: 'ref-1',
    refereeName: 'Suresh Iyer',
    bracketPosition: {
      roundIndex: 0,
      matchIndex: 0,
      nextMatchId: 'match-sf-1',
      nextMatchSlot: 1
    },
    score: {
      sport: 'TABLE_TENNIS',
      data: {
        sets: [],
        currentSetP1: 0,
        currentSetP2: 0,
        currentSetIndex: 1,
        p1TimeoutsLeft: 1,
        p2TimeoutsLeft: 1,
        serverParticipantId: 'p1',
        isDeuce: false,
        isGameOver: false,
        history: []
      }
    }
  }
];

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    tournamentId: 't-1',
    title: 'Match Call: Arjun Kumar vs Rahul Kumar on Table 1',
    message: 'Match #1 is live on Center Court Table 1. Players are requested to adhere to ITTF two-minute warm up protocol.',
    authorName: 'Anand Natarajan (Director)',
    audience: 'ALL',
    priority: 'URGENT',
    createdAt: '2026-09-05T10:45:00Z',
    isPublic: true
  },
  {
    id: 'ann-2',
    tournamentId: 't-1',
    title: 'Quarter Finals Draw Released',
    message: 'Knockout progression for Top 2 from Group A & B will commence Sunday at 2:00 PM on Tables 1-4.',
    authorName: 'Anand Natarajan (Director)',
    audience: 'ALL',
    priority: 'NORMAL',
    createdAt: '2026-09-05T09:30:00Z',
    isPublic: true
  },
  {
    id: 'ann-3',
    clubId: 'club-1',
    title: 'Weekend High Performance Training Schedule',
    message: 'Fitness drills begin at 6:00 AM sharp on Saturday. All batch athletes must report in standard academy kit.',
    authorName: 'Coach Rajesh Kannan',
    audience: 'PLAYERS',
    priority: 'NORMAL',
    createdAt: '2026-09-04T16:00:00Z',
    isPublic: false
  }
];

export const SEED_NOTIFICATIONS: WebNotification[] = [
  {
    id: 'notif-1',
    recipientUserId: 'user-player-rahul',
    recipientPlayerId: 'p-2',
    type: 'MATCH_CALLED',
    title: 'Match Call: Please Report to Table 1',
    message: 'Your match vs Arjun Kumar has started on Table 1. Please report immediately.',
    tournamentId: 't-1',
    matchId: 'match-101',
    eventId: 'ev-1',
    isRead: false,
    createdAt: '2026-09-05T10:35:00Z'
  },
  {
    id: 'notif-2',
    recipientUserId: 'user-ref-suresh',
    type: 'REFEREE_ASSIGNED',
    title: 'Assigned as Chief Referee: Table 1',
    message: 'You have been assigned to officiate Match #1: Arjun Kumar vs Rahul Kumar.',
    tournamentId: 't-1',
    matchId: 'match-101',
    isRead: false,
    createdAt: '2026-09-05T10:15:00Z'
  },
  {
    id: 'notif-3',
    recipientUserId: 'user-player-rahul',
    recipientPlayerId: 'p-2',
    type: 'RESULT_PUBLISHED',
    title: 'Official Result Verified: Win vs Manoj Krishnan',
    message: 'Your victory (3-1) in Group A Round 2 has been verified by Director Anand Natarajan.',
    tournamentId: 't-1',
    matchId: 'match-106',
    isRead: true,
    createdAt: '2026-09-05T10:22:00Z'
  },
  {
    id: 'notif-4',
    recipientUserId: 'user-org-dir',
    type: 'TOURNAMENT_ANNOUNCEMENT',
    title: 'SDAT Stadium Doors Open',
    message: 'Arena inspection complete. All 6 tables calibrated and ready for competition.',
    tournamentId: 't-1',
    isRead: true,
    createdAt: '2026-09-05T08:00:00Z'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    actor: 'Anand Natarajan',
    actorRole: 'TOURNAMENT_ORGANIZER',
    action: 'MATCH_VERIFIED',
    entity: 'Match',
    entityId: 'match-106',
    details: 'Verified Match #6 result: Rahul Kumar defeated Manoj Krishnan 3-1 (11-4, 9-11, 11-6, 11-8). Standings recalculated.',
    timestamp: '2026-09-05T10:20:14Z'
  },
  {
    id: 'aud-2',
    actor: 'Anand Natarajan',
    actorRole: 'TOURNAMENT_ORGANIZER',
    action: 'TABLE_ASSIGNED',
    entity: 'Match',
    entityId: 'match-101',
    details: 'Assigned Match #1 to Table 1 (Center Court) and allocated Referee Suresh Iyer.',
    timestamp: '2026-09-05T10:15:00Z'
  },
  {
    id: 'aud-3',
    actor: 'Vikram Sethi',
    actorRole: 'CLUB_OWNER',
    action: 'PAYMENT_RECORDED',
    entity: 'Payment',
    entityId: 'pay-1',
    details: 'Recorded quarterly academy fee payment of ₹10,500 from player Rahul Kumar.',
    timestamp: '2026-09-01T14:32:00Z'
  },
  {
    id: 'aud-4',
    actor: 'Alexander Vance',
    actorRole: 'SUPER_ADMIN',
    action: 'ORGANIZATION_APPROVED',
    entity: 'Organization',
    entityId: 'org-1',
    details: 'Upgraded Tamil Nadu Table Tennis & Sports Federation to Enterprise Tier.',
    timestamp: '2025-01-15T09:00:00Z'
  }
];

export const SEED_PLAYER_CLUB_MEMBERSHIPS: PlayerClubMembership[] = [
  {
    id: 'pcm-1',
    playerId: 'p-1',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    organizationId: 'org-1',
    status: 'ACTIVE',
    role: 'CAPTAIN',
    joinedAt: '2024-02-10'
  },
  {
    id: 'pcm-2',
    playerId: 'p-2',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    organizationId: 'org-1',
    status: 'ACTIVE',
    role: 'PLAYER',
    joinedAt: '2024-03-01'
  },
  {
    id: 'pcm-3',
    playerId: 'p-2',
    clubId: 'club-2',
    clubName: 'Marina Smashers Club',
    organizationId: 'org-1',
    status: 'ACTIVE',
    role: 'TRAINEE',
    joinedAt: '2024-05-15'
  },
  {
    id: 'pcm-4',
    playerId: 'p-3',
    clubId: 'club-2',
    clubName: 'Marina Smashers Club',
    organizationId: 'org-1',
    status: 'ACTIVE',
    role: 'PLAYER',
    joinedAt: '2024-01-18'
  },
  {
    id: 'pcm-5',
    playerId: 'p-4',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    organizationId: 'org-1',
    status: 'ACTIVE',
    role: 'PLAYER',
    joinedAt: '2024-04-10'
  },
  {
    id: 'pcm-6',
    playerId: 'p-5',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    organizationId: 'org-1',
    status: 'ACTIVE',
    role: 'PLAYER',
    joinedAt: '2024-03-20'
  }
];

export const SEED_TRAINING_SESSIONS: TrainingSession[] = [
  {
    id: 'ts-1',
    batchId: 'batch-1',
    batchName: 'Morning Elite TT Batch',
    clubId: 'club-1',
    coachId: 'coach-1',
    coachName: 'Coach Rajesh Kannan',
    date: '2026-09-06',
    startTime: '06:00 AM',
    endTime: '08:00 AM',
    focusArea: 'Forehand Topspin vs Backspin & Third-Ball Attack Drills',
    status: 'SCHEDULED',
    attendanceCount: 5
  },
  {
    id: 'ts-2',
    batchId: 'batch-1',
    batchName: 'Morning Elite TT Batch',
    clubId: 'club-1',
    coachId: 'coach-1',
    coachName: 'Coach Rajesh Kannan',
    date: '2026-09-05',
    startTime: '06:00 AM',
    endTime: '08:00 AM',
    focusArea: 'Footwork Transition & Middle-Table Defense Drills',
    status: 'COMPLETED',
    attendanceCount: 5
  },
  {
    id: 'ts-3',
    batchId: 'batch-2',
    batchName: 'Evening Junior Development',
    clubId: 'club-1',
    coachId: 'coach-2',
    coachName: 'Coach Priya Sundaram',
    date: '2026-09-06',
    startTime: '04:30 PM',
    endTime: '06:30 PM',
    focusArea: 'Basic Push, Block, and Consistent Rally Length',
    status: 'SCHEDULED',
    attendanceCount: 4
  }
];

export const SEED_REGISTRATIONS: TournamentRegistration[] = [
  {
    id: 'reg-1',
    tournamentId: 't-1',
    eventId: 'evt-1',
    eventName: "Men's Singles Open",
    playerId: 'p-1',
    playerName: 'Arjun Kumar',
    playerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    type: 'INDIVIDUAL',
    source: 'CLUB_NOMINATION',
    status: 'FINALIZED',
    seed: 1,
    feePaid: true,
    registeredAt: '2026-08-25'
  },
  {
    id: 'reg-2',
    tournamentId: 't-1',
    eventId: 'evt-1',
    eventName: "Men's Singles Open",
    playerId: 'p-2',
    playerName: 'Rahul Kumar',
    playerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    type: 'INDIVIDUAL',
    source: 'PLAYER_SELF',
    status: 'FINALIZED',
    seed: 2,
    feePaid: true,
    registeredAt: '2026-08-26'
  },
  {
    id: 'reg-3',
    tournamentId: 't-1',
    eventId: 'evt-1',
    eventName: "Men's Singles Open",
    playerId: 'p-3',
    playerName: 'Karthik Subramanian',
    clubId: 'club-2',
    clubName: 'Marina Smashers Club',
    type: 'INDIVIDUAL',
    source: 'CLUB_NOMINATION',
    status: 'FINALIZED',
    seed: 3,
    feePaid: true,
    registeredAt: '2026-08-27'
  },
  {
    id: 'reg-4',
    tournamentId: 't-1',
    eventId: 'evt-1',
    eventName: "Men's Singles Open",
    playerId: 'p-4',
    playerName: 'Aditya Narayan',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    type: 'INDIVIDUAL',
    source: 'ORGANIZER_INVITE',
    status: 'FINALIZED',
    seed: 4,
    feePaid: true,
    registeredAt: '2026-08-28'
  },
  {
    id: 'reg-5',
    tournamentId: 't-2',
    eventId: 'evt-4',
    eventName: "Men's Singles Badminton",
    playerId: 'p-2',
    playerName: 'Rahul Kumar',
    playerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    type: 'INDIVIDUAL',
    source: 'PLAYER_SELF',
    status: 'APPROVED',
    feePaid: true,
    registeredAt: '2026-09-02'
  },
  {
    id: 'reg-6',
    tournamentId: 't-2',
    eventId: 'evt-4',
    eventName: "Men's Singles Badminton",
    playerId: 'p-1',
    playerName: 'Arjun Kumar',
    clubId: 'club-1',
    clubName: 'Chennai TT Academy',
    type: 'INDIVIDUAL',
    source: 'ORGANIZER_INVITE',
    status: 'PENDING',
    feePaid: false,
    registeredAt: '2026-09-04'
  }
];

export const SEED_TOURNAMENT_STAFF: TournamentStaff[] = [
  {
    id: 'st-1',
    tournamentId: 't-1',
    userId: 'user-org-dir',
    name: 'Anand Natarajan',
    role: 'OWNER'
  },
  {
    id: 'st-2',
    tournamentId: 't-1',
    userId: 'user-ref-suresh',
    name: 'Suresh Iyer',
    role: 'REFEREE',
    assignedEvents: ['evt-1', 'evt-2']
  }
];
