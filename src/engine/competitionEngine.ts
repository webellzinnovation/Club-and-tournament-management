/**
 * Competition Engine & Domain Hierarchy
 *
 * ARCHITECTURAL DESIGN NOTE:
 * - Fixture: Represents the structural pairing/slot in the competition calendar/draw
 *   (stage, round, group, scheduled resource, pairing).
 * - Match: Represents the active execution of a fixture (live point-by-point scoring,
 *   referee officiating, state transitions, results, and verification).
 */

import { 
  TournamentFormat, 
  TournamentParticipant, 
  Match, 
  Fixture,
  TournamentStage,
  TournamentRound,
  TournamentGroup,
  TournamentEvent,
  Tournament,
  MatchResult,
  StandingRow, 
  SportType, 
  SportRulesConfig,
  MatchStatus,
  TieBreakerCriterion
} from '../types';
import { initialTTScore } from './sports/tableTennis';
import { initialBadmintonScore } from './sports/badminton';
import { initialFootballScore } from './sports/football';
import { initialCricketScore } from './sports/cricket';

export interface SchedulingConflict {
  type: 'PLAYER_OVERLAP' | 'REFEREE_OVERLAP' | 'RESOURCE_OVERLAP' | 'VENUE_OVERLAP';
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
 * Parses "HH:MM" (24hr or 12hr) into minutes from midnight
 */
export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(/[: ]/);
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const ampm = parts[2]?.toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

/**
 * Real interval-based scheduling conflict detection
 * Checks for overlaps: startA < endB && startB < endA
 * Supports configurable buffer time (default 10 minutes)
 */
export const detectSchedulingConflicts = (
  matches: Match[],
  bufferMinutes: number = 10
): SchedulingConflict[] => {
  const conflicts: SchedulingConflict[] = [];

  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const mA = matches[i];
      const mB = matches[j];

      // Must be on the same calendar date
      if (mA.scheduledDate !== mB.scheduledDate) continue;
      if (!mA.scheduledTime || !mB.scheduledTime) continue;

      const startA = parseTimeToMinutes(mA.scheduledTime);
      const durationA = mA.estimatedDurationMinutes || 30;
      const endA = startA + durationA + bufferMinutes;

      const startB = parseTimeToMinutes(mB.scheduledTime);
      const durationB = mB.estimatedDurationMinutes || 30;
      const endB = startB + durationB + bufferMinutes;

      // Check interval overlap
      const isOverlapping = startA < endB && startB < endA;
      if (!isOverlapping) continue;

      const timeSlotA = `${mA.scheduledTime} (${durationA}m)`;
      const timeSlotB = `${mB.scheduledTime} (${durationB}m)`;

      // 1. Resource Overlap (e.g. Table 1 or Court 2 assigned to both simultaneously)
      if (mA.resourceId && mB.resourceId && mA.resourceId === mB.resourceId) {
        conflicts.push({
          type: 'RESOURCE_OVERLAP',
          message: `${mA.resourceName || 'Resource'} has an interval conflict between Match #${mA.matchNumber} [${timeSlotA}] and Match #${mB.matchNumber} [${timeSlotB}].`,
          matchIdA: mA.id,
          matchIdB: mB.id,
          resourceOrPersonName: mA.resourceName || 'Resource'
        });
      }

      // 2. Referee Overlap
      if (mA.refereeId && mB.refereeId && mA.refereeId === mB.refereeId) {
        conflicts.push({
          type: 'REFEREE_OVERLAP',
          message: `Referee ${mA.refereeName || 'Referee'} is double-booked between Match #${mA.matchNumber} [${timeSlotA}] and Match #${mB.matchNumber} [${timeSlotB}].`,
          matchIdA: mA.id,
          matchIdB: mB.id,
          resourceOrPersonName: mA.refereeName || 'Referee'
        });
      }

      // 3. Player Overlap
      const playersA = [mA.participant1Id, mA.participant2Id].filter(Boolean) as string[];
      const playersB = [mB.participant1Id, mB.participant2Id].filter(Boolean) as string[];

      for (const p of playersA) {
        if (playersB.includes(p)) {
          const playerName = p === mA.participant1Id ? mA.participant1Name : mA.participant2Name;
          conflicts.push({
            type: 'PLAYER_OVERLAP',
            message: `Player "${playerName}" is scheduled in overlapping matches: #${mA.matchNumber} [${timeSlotA}] and #${mB.matchNumber} [${timeSlotB}].`,
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

/**
 * Generate Round Robin fixtures for a list of participants
 */
export const generateRoundRobinFixtures = (
  tournamentId: string,
  eventId: string,
  sport: SportType,
  participants: TournamentParticipant[],
  groupName?: string,
  stageId?: string,
  groupId?: string,
  rules?: SportRulesConfig
): Match[] => {
  if (participants.length < 2) return [];

  const list = [...participants];
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
  const groupBestOf = rules?.bestOfGroup ?? rules?.bestOfSets ?? (sport === 'BADMINTON' ? 3 : 5);

  for (let round = 0; round < totalRounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const p1 = list[i];
      const p2 = list[n - 1 - i];

      if (p1.id === 'BYE' || p2.id === 'BYE') continue;

      const fixtureId = `fix-${eventId}-${groupName ? groupName.replace(/\s+/g, '') + '-' : ''}${matchNumber}`;
      const matchId = `match-${eventId}-${groupName ? groupName.replace(/\s+/g, '') + '-' : ''}${matchNumber}`;

      matches.push({
        id: matchId,
        fixtureId,
        stageId,
        groupId,
        stageType: groupName ? 'GROUP' : 'ROUND_ROBIN',
        tournamentId,
        eventId,
        stageName: groupName ? `${groupName} Round ${round + 1}` : `Round ${round + 1}`,
        roundIndex: round,
        roundNumber: round + 1,
        matchNumber,
        bestOfSets: groupBestOf,
        participant1Id: p1.id,
        participant2Id: p2.id,
        participant1Name: p1.displayName,
        participant2Name: p2.displayName,
        status: 'SCHEDULED',
        scheduledDate: '2026-09-06',
        scheduledTime: `${10 + Math.floor(matchNumber / 4)}:${(matchNumber % 4) * 15 === 0 ? '00' : (matchNumber % 4) * 15}`,
        estimatedDurationMinutes: sport === 'FOOTBALL' ? 90 : sport === 'CRICKET' ? 120 : (groupBestOf > 5 ? 45 : 30),
        score: createInitialScoreForSport(sport, p1.id, p2.id),
        groupName
      });
      matchNumber++;
    }

    // Circle method rotation
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
  participants: TournamentParticipant[],
  stageId?: string,
  rules?: SportRulesConfig
): Match[] => {
  const count = participants.length;
  if (count < 2) return [];

  let bracketSize = 2;
  while (bracketSize < count) {
    bracketSize *= 2;
  }

  const sorted = [...participants].sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));
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

  const round1Matches: Match[] = [];
  const round1Name = getRoundName(bracketSize, 0);
  const isRound1Championship = (round1Name === 'Final' || round1Name === 'Semi Final');
  const round1BestOf = isRound1Championship && rules?.bestOfFinal
    ? rules.bestOfFinal
    : (rules?.bestOfKnockout ?? rules?.bestOfSets ?? (sport === 'BADMINTON' ? 3 : 5));

  for (let i = 0; i < bracketSize; i += 2) {
    const p1 = slots[i];
    const p2 = slots[i + 1];
    const matchId = `ko-${eventId}-r0-m${i / 2}`;
    const fixtureId = `fix-${eventId}-r0-m${i / 2}`;

    const match: Match = {
      id: matchId,
      fixtureId,
      stageId,
      stageType: 'KNOCKOUT',
      tournamentId,
      eventId,
      stageName: round1Name,
      roundIndex: 0,
      roundNumber: 1,
      matchNumber: matchCounter++,
      bestOfSets: round1BestOf,
      participant1Id: p1?.id,
      participant2Id: p2?.id,
      participant1Name: p1?.displayName ?? 'TBD',
      participant2Name: p2?.displayName ?? 'TBD',
      status: p1 && !p2 ? 'COMPLETED' : 'SCHEDULED',
      winnerId: p1 && !p2 ? p1.id : undefined,
      scheduledDate: '2026-09-06',
      scheduledTime: '11:00',
      estimatedDurationMinutes: sport === 'FOOTBALL' ? 90 : (round1BestOf > 5 ? 45 : 30),
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
    const isFinal = r === totalRounds - 1;
    const isSemi = r === totalRounds - 2;
    const subsequentBestOf = (isFinal || isSemi) && rules?.bestOfFinal
      ? rules.bestOfFinal
      : (rules?.bestOfKnockout ?? rules?.bestOfSets ?? (sport === 'BADMINTON' ? 3 : 5));

    for (let m = 0; m < roundMatchesCount; m++) {
      const matchId = `ko-${eventId}-r${r}-m${m}`;
      const fixtureId = `fix-${eventId}-r${r}-m${m}`;
      const nextRound = r + 1;
      const nextMatchIndex = Math.floor(m / 2);

      matches.push({
        id: matchId,
        fixtureId,
        stageId,
        stageType: 'KNOCKOUT',
        tournamentId,
        eventId,
        stageName: roundName,
        roundIndex: r,
        roundNumber: r + 1,
        matchNumber: matchCounter++,
        bestOfSets: subsequentBestOf,
        participant1Name: 'TBD',
        participant2Name: 'TBD',
        status: 'SCHEDULED',
        scheduledDate: '2026-09-07',
        scheduledTime: '14:00',
        estimatedDurationMinutes: sport === 'FOOTBALL' ? 90 : (subsequentBestOf > 5 ? 45 : 35),
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

  // Populate byes into next round
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

/**
 * Advances the verified winner of a completed match to the subsequent bracket match slot
 */
export const advanceWinnerInBracket = (
  matches: Match[],
  completedMatchId: string,
  winnerId: string,
  winnerName: string
): Match[] => {
  const current = matches.find(m => m.id === completedMatchId);
  if (!current || !current.bracketPosition?.nextMatchId) {
    return matches;
  }

  const nextId = current.bracketPosition.nextMatchId;
  const slot = current.bracketPosition.nextMatchSlot;

  return matches.map(m => {
    if (m.id !== nextId) return m;
    const updated = { ...m };
    if (slot === 1) {
      updated.participant1Id = winnerId;
      updated.participant1Name = winnerName;
    } else {
      updated.participant2Id = winnerId;
      updated.participant2Name = winnerName;
    }
    // If both slots are now filled, mark ready
    if (updated.participant1Id && updated.participant2Id) {
      updated.status = 'READY';
    }
    return updated;
  });
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
 * Calculate Standings using sport-specific rules and configured tie-breaker priorities
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
      participantName: p.displayName,
      clubName: p.clubName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      scoreFor: 0,
      scoreAgainst: 0,
      scoreDiff: 0,
      setsWon: 0,
      setsLost: 0,
      setDifference: 0,
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
    row1.setsWon = (row1.setsWon || 0) + s1;
    row1.setsLost = (row1.setsLost || 0) + s2;
    row1.setDifference = row1.setsWon - row1.setsLost;

    row2.scoreFor += s2;
    row2.scoreAgainst += s1;
    row2.scoreDiff = row2.scoreFor - row2.scoreAgainst;
    row2.setsWon = (row2.setsWon || 0) + s2;
    row2.setsLost = (row2.setsLost || 0) + s1;
    row2.setDifference = row2.setsWon - row2.setsLost;

    const winPoints = rules?.pointsForWin ?? (rules?.sport === 'FOOTBALL' ? 3 : 2);
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

  // Sort based on rules priority or default sports hierarchy
  const tieBreakers: (TieBreakerCriterion | string)[] = rules?.tieBreakerPriority && rules.tieBreakerPriority.length > 0
    ? rules.tieBreakerPriority
    : ['POINTS', 'SETS_DIFFERENCE', 'POINTS_DIFFERENCE'];

  const rows = Array.from(statsMap.values()).sort((a, b) => {
    for (const criterion of tieBreakers) {
      if (criterion === 'POINTS' && b.points !== a.points) {
        return b.points - a.points;
      }
      if ((criterion === 'SETS_DIFFERENCE' || criterion === 'GAMES_DIFF') && (b.setDifference ?? 0) !== (a.setDifference ?? 0)) {
        return (b.setDifference ?? 0) - (a.setDifference ?? 0);
      }
      if ((criterion === 'POINTS_DIFFERENCE' || criterion === 'GOAL_DIFFERENCE') && b.scoreDiff !== a.scoreDiff) {
        return b.scoreDiff - a.scoreDiff;
      }
      if (criterion === 'GOALS_SCORED' && b.scoreFor !== a.scoreFor) {
        return b.scoreFor - a.scoreFor;
      }
    }
    // Fallback: points then score difference
    if (b.points !== a.points) return b.points - a.points;
    return b.scoreDiff - a.scoreDiff;
  });

  return rows.map((r, idx) => ({ ...r, rank: idx + 1 }));
};
