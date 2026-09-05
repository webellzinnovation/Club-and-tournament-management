import { 
  TournamentFormat, 
  TournamentParticipant, 
  Match, 
  StandingRow, 
  SportType, 
  SportRulesConfig 
} from '../types';
import { initialTTScore } from './sports/tableTennis';
import { initialBadmintonScore } from './sports/badminton';
import { initialFootballScore } from './sports/football';
import { initialCricketScore } from './sports/cricket';

export interface SchedulingConflict {
  type: 'PLAYER_OVERLAP' | 'REFEREE_OVERLAP' | 'RESOURCE_OVERLAP';
  message: string;
  matchIdA: string;
  matchIdB: string;
  resourceOrPersonName: string;
}

export const createInitialScoreForSport = (sport: SportType, p1Id: string = 'p1', p2Id: string = 'p2') => {
  switch (sport) {
    case 'TABLE_TENNIS':
      return { sport: 'TABLE_TENNIS' as const, data: initialTTScore(p1Id, p2Id) };
    case 'BADMINTON':
      return { sport: 'BADMINTON' as const, data: initialBadmintonScore(p1Id, p2Id) };
    case 'FOOTBALL':
      return { sport: 'FOOTBALL' as const, data: initialFootballScore() };
    case 'CRICKET':
      return { sport: 'CRICKET' as const, data: initialCricketScore() };
    default:
      return { sport: 'TABLE_TENNIS' as const, data: initialTTScore(p1Id, p2Id) };
  }
};

/**
 * Generate Round Robin fixtures for a list of participants
 */
export const generateRoundRobinFixtures = (
  tournamentId: string,
  eventId: string,
  sport: SportType,
  participants: TournamentParticipant[],
  groupName?: string
): Match[] => {
  if (participants.length < 2) return [];

  const list = [...participants];
  // If odd, add a dummy BYE participant
  const hasBye = list.length % 2 !== 0;
  if (hasBye) {
    list.push({
      id: 'BYE',
      eventId,
      type: 'INDIVIDUAL',
      primaryPlayerId: 'BYE',
      primaryPlayerName: 'BYE',
      displayName: 'BYE',
      stats: { matchesPlayed: 0, wins: 0, losses: 0, draws: 0, scoreFor: 0, scoreAgainst: 0, points: 0 }
    });
  }

  const n = list.length;
  const totalRounds = n - 1;
  const matchesPerRound = n / 2;
  const matches: Match[] = [];
  let matchNumber = 1;

  for (let round = 0; round < totalRounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const p1 = list[i];
      const p2 = list[n - 1 - i];

      // Skip bye matches
      if (p1.id === 'BYE' || p2.id === 'BYE') continue;

      matches.push({
        id: `match-${eventId}-${groupName ? groupName.replace(/\s+/g, '') + '-' : ''}${matchNumber}`,
        tournamentId,
        eventId,
        stageName: groupName ? `${groupName} Round ${round + 1}` : `Round ${round + 1}`,
        roundNumber: round + 1,
        matchNumber,
        participant1Id: p1.id,
        participant2Id: p2.id,
        participant1Name: p1.displayName,
        participant2Name: p2.displayName,
        status: 'SCHEDULED',
        scheduledDate: '2026-09-06',
        scheduledTime: `${10 + Math.floor(matchNumber / 4)}:${(matchNumber % 4) * 15 === 0 ? '00' : (matchNumber % 4) * 15}`,
        estimatedDurationMinutes: sport === 'FOOTBALL' ? 90 : sport === 'CRICKET' ? 120 : 30,
        score: createInitialScoreForSport(sport, p1.id, p2.id),
        groupName
      });
      matchNumber++;
    }

    // Rotate elements except index 0 (Circle method)
    const fixed = list[0];
    const rest = list.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    list.splice(0, list.length, fixed, ...rest);
  }

  return matches;
};

/**
 * Generate Single Elimination Knockout bracket with seeded placement
 */
export const generateKnockoutBracket = (
  tournamentId: string,
  eventId: string,
  sport: SportType,
  participants: TournamentParticipant[]
): Match[] => {
  const count = participants.length;
  if (count < 2) return [];

  // Determine bracket size: power of 2 (2, 4, 8, 16, 32)
  let bracketSize = 2;
  while (bracketSize < count) {
    bracketSize *= 2;
  }

  // Sort participants by seed (or rating)
  const sorted = [...participants].sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));

  // Build standard seeded pairings
  const seedsOrder: number[] = getSeededOrder(bracketSize);
  const slots: (TournamentParticipant | null)[] = new Array(bracketSize).fill(null);

  for (let i = 0; i < bracketSize; i++) {
    const seedIndex = seedsOrder[i] - 1;
    if (seedIndex < sorted.length) {
      slots[i] = sorted[seedIndex];
    }
  }

  const matches: Match[] = [];
  let matchCounter = 1;
  const totalRounds = Math.log2(bracketSize);

  // Round 1 matches
  const round1Matches: Match[] = [];
  const round1Name = getRoundName(bracketSize, 0);

  for (let i = 0; i < bracketSize; i += 2) {
    const p1 = slots[i];
    const p2 = slots[i + 1];

    const match: Match = {
      id: `ko-${eventId}-r0-m${i / 2}`,
      tournamentId,
      eventId,
      stageName: round1Name,
      roundNumber: 1,
      matchNumber: matchCounter++,
      participant1Id: p1?.id,
      participant2Id: p2?.id,
      participant1Name: p1?.displayName ?? 'TBD',
      participant2Name: p2?.displayName ?? 'TBD',
      status: p1 && !p2 ? 'COMPLETED' : 'SCHEDULED',
      winnerId: p1 && !p2 ? p1.id : undefined, // Automatic BYE advancement
      scheduledDate: '2026-09-06',
      scheduledTime: '11:00',
      estimatedDurationMinutes: sport === 'FOOTBALL' ? 90 : 30,
      score: createInitialScoreForSport(sport, p1?.id ?? 'p1', p2?.id ?? 'p2'),
      bracketPosition: {
        roundIndex: 0,
        matchIndex: i / 2,
        nextMatchId: `ko-${eventId}-r1-m${Math.floor(i / 4)}`,
        nextMatchSlot: ((i / 2) % 2 === 0 ? 1 : 2) as 1 | 2
      }
    };
    round1Matches.push(match);
  }
  matches.push(...round1Matches);

  // Subsequent rounds until final
  for (let r = 1; r < totalRounds; r++) {
    const roundMatchesCount = bracketSize / Math.pow(2, r + 1);
    const roundName = getRoundName(bracketSize, r);

    for (let m = 0; m < roundMatchesCount; m++) {
      const matchId = `ko-${eventId}-r${r}-m${m}`;
      const isFinal = r === totalRounds - 1;
      const nextRound = r + 1;
      const nextMatchIndex = Math.floor(m / 2);

      matches.push({
        id: matchId,
        tournamentId,
        eventId,
        stageName: roundName,
        roundNumber: r + 1,
        matchNumber: matchCounter++,
        participant1Name: 'TBD',
        participant2Name: 'TBD',
        status: 'SCHEDULED',
        scheduledDate: '2026-09-07',
        scheduledTime: '14:00',
        estimatedDurationMinutes: sport === 'FOOTBALL' ? 90 : 35,
        score: createInitialScoreForSport(sport),
        bracketPosition: isFinal
          ? { roundIndex: r, matchIndex: m }
          : {
              roundIndex: r,
              matchIndex: m,
              nextMatchId: `ko-${eventId}-r${nextRound}-m${nextMatchIndex}`,
              nextMatchSlot: (m % 2 === 0 ? 1 : 2) as 1 | 2
            }
      });
    }
  }

  // Fill in automatic byes for Round 2
  for (const r1 of round1Matches) {
    if (r1.winnerId && r1.bracketPosition?.nextMatchId) {
      const targetMatch = matches.find(m => m.id === r1.bracketPosition!.nextMatchId);
      if (targetMatch) {
        if (r1.bracketPosition.nextMatchSlot === 1) {
          targetMatch.participant1Id = r1.winnerId;
          targetMatch.participant1Name = r1.participant1Name;
        } else {
          targetMatch.participant2Id = r1.winnerId;
          targetMatch.participant2Name = r1.participant1Name;
        }
      }
    }
  }

  return matches;
};

const getRoundName = (bracketSize: number, roundIndex: number): string => {
  const remainingTeams = bracketSize / Math.pow(2, roundIndex);
  if (remainingTeams === 2) return 'Final';
  if (remainingTeams === 4) return 'Semi Final';
  if (remainingTeams === 8) return 'Quarter Final';
  if (remainingTeams === 16) return 'Round of 16';
  if (remainingTeams === 32) return 'Round of 32';
  return `Round of ${remainingTeams}`;
};

const getSeededOrder = (size: number): number[] => {
  let order = [1, 2];
  while (order.length < size) {
    const nextOrder: number[] = [];
    const currentMax = order.length * 2 + 1;
    for (const item of order) {
      nextOrder.push(item);
      nextOrder.push(currentMax - item);
    }
    order = nextOrder;
  }
  return order;
};

/**
 * Calculate Standings for Round Robin groups
 */
export const calculateStandings = (
  participants: TournamentParticipant[],
  matches: Match[],
  rules?: SportRulesConfig
): StandingRow[] => {
  const statsMap = new Map<string, StandingRow>();

  for (const p of participants) {
    statsMap.set(p.id, {
      rank: 0,
      participantId: p.id,
      displayName: p.displayName,
      clubName: p.clubName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      scoreFor: 0,
      scoreAgainst: 0,
      scoreDiff: 0,
      points: 0
    });
  }

  for (const m of matches) {
    if (m.status !== 'VERIFIED' && m.status !== 'PUBLISHED' && m.status !== 'COMPLETED') {
      continue;
    }
    if (!m.participant1Id || !m.participant2Id) continue;

    const row1 = statsMap.get(m.participant1Id);
    const row2 = statsMap.get(m.participant2Id);
    if (!row1 || !row2) continue;

    row1.played += 1;
    row2.played += 1;

    let s1 = 0;
    let s2 = 0;

    if (m.score.sport === 'TABLE_TENNIS' || m.score.sport === 'BADMINTON') {
      s1 = m.score.data.sets.filter(s => s.p1 > s.p2).length;
      s2 = m.score.data.sets.filter(s => s.p2 > s.p1).length;
    } else if (m.score.sport === 'FOOTBALL') {
      s1 = m.score.data.team1Goals;
      s2 = m.score.data.team2Goals;
    } else if (m.score.sport === 'CRICKET') {
      s1 = m.score.data.currentInnings.runs;
      s2 = m.score.data.firstInningsSummary?.runs ?? 0;
    }

    row1.scoreFor += s1;
    row1.scoreAgainst += s2;
    row1.scoreDiff = row1.scoreFor - row1.scoreAgainst;

    row2.scoreFor += s2;
    row2.scoreAgainst += s1;
    row2.scoreDiff = row2.scoreFor - row2.scoreAgainst;

    const winPoints = rules?.pointsForWin ?? 2;
    const drawPoints = rules?.pointsForDraw ?? 1;
    const lossPoints = rules?.pointsForLoss ?? 0;

    if (m.winnerId === m.participant1Id || s1 > s2) {
      row1.won += 1;
      row1.points += winPoints;
      row2.lost += 1;
      row2.points += lossPoints;
    } else if (m.winnerId === m.participant2Id || s2 > s1) {
      row2.won += 1;
      row2.points += winPoints;
      row1.lost += 1;
      row1.points += lossPoints;
    } else {
      row1.drawn += 1;
      row2.drawn += 1;
      row1.points += drawPoints;
      row2.points += drawPoints;
    }
  }

  const rows = Array.from(statsMap.values()).sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) return b.points - a.points;
    // 2. Score Difference
    if (b.scoreDiff !== a.scoreDiff) return b.scoreDiff - a.scoreDiff;
    // 3. Score For
    return b.scoreFor - a.scoreFor;
  });

  return rows.map((r, idx) => ({ ...r, rank: idx + 1 }));
};

/**
 * Detect scheduling conflicts
 */
export const detectSchedulingConflicts = (matches: Match[]): SchedulingConflict[] => {
  const conflicts: SchedulingConflict[] = [];

  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const mA = matches[i];
      const mB = matches[j];

      // Only check if scheduled on the same date and same time
      if (mA.scheduledDate !== mB.scheduledDate || mA.scheduledTime !== mB.scheduledTime) {
        continue;
      }

      // 1. Resource Overlap (e.g. Table 1 assigned to both)
      if (mA.resourceId && mB.resourceId && mA.resourceId === mB.resourceId) {
        conflicts.push({
          type: 'RESOURCE_OVERLAP',
          message: `${mA.resourceName || 'Resource'} is assigned to Match #${mA.matchNumber} and Match #${mB.matchNumber} at ${mA.scheduledTime}`,
          matchIdA: mA.id,
          matchIdB: mB.id,
          resourceOrPersonName: mA.resourceName || 'Resource'
        });
      }

      // 2. Referee Overlap
      if (mA.refereeId && mB.refereeId && mA.refereeId === mB.refereeId) {
        conflicts.push({
          type: 'REFEREE_OVERLAP',
          message: `Referee ${mA.refereeName || 'Referee'} is assigned to both Match #${mA.matchNumber} and Match #${mB.matchNumber} at ${mA.scheduledTime}`,
          matchIdA: mA.id,
          matchIdB: mB.id,
          resourceOrPersonName: mA.refereeName || 'Referee'
        });
      }

      // 3. Player Overlap
      const playersA = [mA.participant1Id, mA.participant2Id].filter(Boolean);
      const playersB = [mB.participant1Id, mB.participant2Id].filter(Boolean);

      for (const p of playersA) {
        if (playersB.includes(p)) {
          const playerName = p === mA.participant1Id ? mA.participant1Name : mA.participant2Name;
          conflicts.push({
            type: 'PLAYER_OVERLAP',
            message: `Player ${playerName} is scheduled in overlapping matches #${mA.matchNumber} and #${mB.matchNumber} at ${mA.scheduledTime}`,
            matchIdA: mA.id,
            matchIdB: mB.id,
            resourceOrPersonName: playerName || 'Player'
          });
        }
      }
    }
  }

  return conflicts;
};
