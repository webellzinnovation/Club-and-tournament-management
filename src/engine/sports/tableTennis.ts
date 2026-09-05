import { TableTennisScoreData, Match } from '../../types';

export interface TTMatchResult {
  p1GamesWon: number;
  p2GamesWon: number;
  isMatchOver: boolean;
  winnerParticipantId?: string;
}

export const initialTTScore = (p1Id: string, p2Id: string): TableTennisScoreData => ({
  sets: [],
  currentSetP1: 0,
  currentSetP2: 0,
  currentSetIndex: 1,
  p1TimeoutsLeft: 1,
  p2TimeoutsLeft: 1,
  serverParticipantId: p1Id,
  isDeuce: false,
  isGameOver: false,
  history: [],
});

export const addPointTT = (
  score: TableTennisScoreData,
  player: 'p1' | 'p2',
  bestOf: number = 5,
  p1Id: string,
  p2Id: string,
  p1Name: string = 'Player 1',
  p2Name: string = 'Player 2'
): { updatedScore: TableTennisScoreData; matchResult: TTMatchResult } => {
  if (score.isGameOver) return { updatedScore: score, matchResult: checkTTMatchStatus(score, bestOf, p1Id, p2Id) };

  const newP1 = player === 'p1' ? score.currentSetP1 + 1 : score.currentSetP1;
  const newP2 = player === 'p2' ? score.currentSetP2 + 1 : score.currentSetP2;
  const isDeuce = newP1 >= 10 && newP2 >= 10;

  // Server alternation: Every 2 points, or every 1 point in deuce
  const totalPoints = newP1 + newP2;
  let nextServer = score.serverParticipantId;
  if (isDeuce) {
    nextServer = nextServer === p1Id ? p2Id : p1Id;
  } else if (totalPoints % 2 === 0) {
    nextServer = nextServer === p1Id ? p2Id : p1Id;
  }

  const pointDesc = `Point to ${player === 'p1' ? p1Name : p2Name} (${newP1}-${newP2})`;
  const newHistory = [
    ...score.history,
    { p1: newP1, p2: newP2, desc: pointDesc, timestamp: new Date().toLocaleTimeString() }
  ];

  // Check if current set is won
  let setWonBy: 'p1' | 'p2' | null = null;
  if (newP1 >= 11 && newP1 - newP2 >= 2) {
    setWonBy = 'p1';
  } else if (newP2 >= 11 && newP2 - newP1 >= 2) {
    setWonBy = 'p2';
  }

  if (setWonBy) {
    const updatedSets = [...score.sets, { p1: newP1, p2: newP2 }];
    const targetWins = Math.ceil(bestOf / 2);
    const p1Wins = updatedSets.filter(s => s.p1 > s.p2).length;
    const p2Wins = updatedSets.filter(s => s.p2 > s.p1).length;
    const isMatchOver = p1Wins >= targetWins || p2Wins >= targetWins;

    const updatedScore: TableTennisScoreData = {
      sets: updatedSets,
      currentSetP1: isMatchOver ? newP1 : 0,
      currentSetP2: isMatchOver ? newP2 : 0,
      currentSetIndex: isMatchOver ? score.currentSetIndex : score.currentSetIndex + 1,
      p1TimeoutsLeft: score.p1TimeoutsLeft,
      p2TimeoutsLeft: score.p2TimeoutsLeft,
      serverParticipantId: nextServer,
      isDeuce: false,
      isGameOver: isMatchOver,
      history: [
        ...newHistory,
        {
          p1: newP1,
          p2: newP2,
          desc: `Game ${score.currentSetIndex} won by ${setWonBy === 'p1' ? p1Name : p2Name} (${newP1}-${newP2})`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };

    return {
      updatedScore,
      matchResult: {
        p1GamesWon: p1Wins,
        p2GamesWon: p2Wins,
        isMatchOver,
        winnerParticipantId: isMatchOver ? (p1Wins >= targetWins ? p1Id : p2Id) : undefined
      }
    };
  }

  const updatedScore: TableTennisScoreData = {
    ...score,
    currentSetP1: newP1,
    currentSetP2: newP2,
    isDeuce,
    serverParticipantId: nextServer,
    history: newHistory
  };

  return {
    updatedScore,
    matchResult: checkTTMatchStatus(updatedScore, bestOf, p1Id, p2Id)
  };
};

export const checkTTMatchStatus = (
  score: TableTennisScoreData,
  bestOf: number,
  p1Id: string,
  p2Id: string
): TTMatchResult => {
  const targetWins = Math.ceil(bestOf / 2);
  const p1Wins = score.sets.filter(s => s.p1 > s.p2).length;
  const p2Wins = score.sets.filter(s => s.p2 > s.p1).length;
  const isMatchOver = p1Wins >= targetWins || p2Wins >= targetWins;

  return {
    p1GamesWon: p1Wins,
    p2GamesWon: p2Wins,
    isMatchOver,
    winnerParticipantId: isMatchOver ? (p1Wins >= targetWins ? p1Id : p2Id) : undefined
  };
};

export const undoPointTT = (score: TableTennisScoreData): TableTennisScoreData => {
  if (score.history.length === 0) return score;
  const newHistory = score.history.slice(0, -1);
  const lastState = newHistory[newHistory.length - 1];

  return {
    ...score,
    currentSetP1: lastState ? lastState.p1 : 0,
    currentSetP2: lastState ? lastState.p2 : 0,
    isDeuce: lastState ? lastState.p1 >= 10 && lastState.p2 >= 10 : false,
    isGameOver: false,
    history: newHistory
  };
};
