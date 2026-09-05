import { CricketScoreData } from '../../types';

export const initialCricketScore = (): CricketScoreData => ({
  innings: 1,
  currentInnings: {
    battingTeam: 1,
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    currentStriker: 'Batter 1',
    currentNonStriker: 'Batter 2',
    currentBowler: 'Bowler 1',
    recentBalls: []
  },
  targetRuns: undefined
});

export const addCricketDelivery = (
  score: CricketScoreData,
  deliveryType: 'RUNS' | 'WICKET' | 'WIDE' | 'NO_BALL',
  runs: number = 0
): CricketScoreData => {
  const current = score.currentInnings;
  let newRuns = current.runs;
  let newWickets = current.wickets;
  let newOvers = current.overs;
  let newBalls = current.balls;
  const newExtras = { ...current.extras };
  let symbol = `${runs}`;

  if (deliveryType === 'RUNS') {
    newRuns += runs;
    newBalls += 1;
  } else if (deliveryType === 'WICKET') {
    newWickets += 1;
    newBalls += 1;
    symbol = 'W';
  } else if (deliveryType === 'WIDE') {
    newRuns += 1 + runs;
    newExtras.wides += 1 + runs;
    symbol = runs > 0 ? `${runs + 1}wd` : 'wd';
    // Wides do not count toward valid 6 balls
  } else if (deliveryType === 'NO_BALL') {
    newRuns += 1 + runs;
    newExtras.noBalls += 1;
    symbol = runs > 0 ? `${runs + 1}nb` : 'nb';
  }

  if (newBalls >= 6) {
    newOvers += 1;
    newBalls = 0;
  }

  const updatedRecent = [...current.recentBalls, symbol].slice(-12);

  return {
    ...score,
    currentInnings: {
      ...current,
      runs: newRuns,
      wickets: newWickets,
      overs: newOvers,
      balls: newBalls,
      extras: newExtras,
      recentBalls: updatedRecent
    }
  };
};
