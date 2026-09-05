import { FootballScoreData } from '../../types';

export const initialFootballScore = (): FootballScoreData => ({
  team1Goals: 0,
  team2Goals: 0,
  currentHalf: 1,
  elapsedMinutes: 0,
  isRunning: false,
  events: []
});

export const addFootballGoal = (
  score: FootballScoreData,
  team: 1 | 2,
  playerName: string,
  assistPlayerName?: string
): FootballScoreData => {
  return {
    ...score,
    team1Goals: team === 1 ? score.team1Goals + 1 : score.team1Goals,
    team2Goals: team === 2 ? score.team2Goals + 1 : score.team2Goals,
    events: [
      ...score.events,
      {
        id: `ev-${Date.now()}`,
        minute: score.elapsedMinutes,
        type: 'GOAL',
        team,
        playerName,
        assistPlayerName
      }
    ]
  };
};

export const addFootballCard = (
  score: FootballScoreData,
  team: 1 | 2,
  type: 'YELLOW_CARD' | 'RED_CARD',
  playerName: string
): FootballScoreData => {
  return {
    ...score,
    events: [
      ...score.events,
      {
        id: `ev-${Date.now()}`,
        minute: score.elapsedMinutes,
        type,
        team,
        playerName
      }
    ]
  };
};
