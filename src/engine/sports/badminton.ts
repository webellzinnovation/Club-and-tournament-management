import { BadmintonScoreData } from '../../types';

export interface BadmintonMatchResult {
  p1GamesWon: number;
  p2GamesWon: number;
  isMatchOver: boolean;
  winnerParticipantId?: string;
}

export const initialBadmintonScore = (p1Id: string, p2Id: string): BadmintonScoreData => ({
  sets: [],
  currentSetP1: 0,
  currentSetP2: 0,
  currentSetIndex: 1,
  serverParticipantId: p1Id,
  isDeuce: false,
  isGameOver: false,
  history: [],
});

export const addPointBadminton = (
  score: BadmintonScoreData,
  player: 'p1' | 'p2',
  bestOf: number = 3,
  p1Id: string,
  p2Id: string,
  p1Name: string = 'Team 1',
  p2Name: string = 'Team 2'
): { updatedScore: BadmintonScoreData; matchResult: BadmintonMatchResult } => {
  if (score.isGameOver) return { updatedScore: score, matchResult: checkBadmintonMatchStatus(score, bestOf, p1Id, p2Id) };

  const newP1 = player === 'p1' ? score.currentSetP1 + 1 : score.currentSetP1;
  const newP2 = player === 'p2' ? score.currentSetP2 + 1 : score.currentSetP2;
  const isDeuce = newP1 >= 20 && newP2 >= 20;

  // In badminton, winner of rally serves next
  const nextServer = player === 'p1' ? p1Id : p2Id;
  const pointDesc = `Point to ${player === 'p1' ? p1Name : p2Name} (${newP1}-${newP2})`;
  const newHistory = [
    ...score.history,
    { p1: newP1, p2: newP2, desc: pointDesc, timestamp: new Date().toLocaleTimeString() }
  ];

  // In badminton, game ends at 21 with lead of 2, OR sudden death cap at 30
  let setWonBy: 'p1' | 'p2' | null = null;
  if (newP1 === 30) {
    setWonBy = 'p1';
  } else if (newP2 === 30) {
    setWonBy = 'p2';
  } else if (newP1 >= 21 && newP1 - newP2 >= 2) {
    setWonBy = 'p1';
  } else if (newP2 >= 21 && newP2 - newP1 >= 2) {
    setWonBy = 'p2';
  }

  if (setWonBy) {
    const updatedSets = [...score.sets, { p1: newP1, p2: newP2 }];
    const targetWins = Math.ceil(bestOf / 2);
    const p1Wins = updatedSets.filter(s => s.p1 > s.p2).length;
    const p2Wins = updatedSets.filter(s => s.p2 > s.p1).length;
    const isMatchOver = p1Wins >= targetWins || p2Wins >= targetWins;

    const updatedScore: BadmintonScoreData = {
      sets: updatedSets,
      currentSetP1: isMatchOver ? newP1 : 0,
      currentSetP2: isMatchOver ? newP2 : 0,
      currentSetIndex: isMatchOver ? score.currentSetIndex : score.currentSetIndex + 1,
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

  const updatedScore: BadmintonScoreData = {
    ...score,
    currentSetP1: newP1,
    currentSetP2: newP2,
    isDeuce,
    serverParticipantId: nextServer,
    history: newHistory
  };

  return {
    updatedScore,
    matchResult: checkBadmintonMatchStatus(updatedScore, bestOf, p1Id, p2Id)
  };
};

export const checkBadmintonMatchStatus = (
  score: BadmintonScoreData,
  bestOf: number,
  p1Id: string,
  p2Id: string
): BadmintonMatchResult => {
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
