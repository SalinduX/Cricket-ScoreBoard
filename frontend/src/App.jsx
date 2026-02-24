import { useState } from 'react';
import TeamSetup from './components/TeamSetup';
import Scoreboard from './components/Scoreboard';
import './index.css';

function App() {
  const [matchStarted, setMatchStarted] = useState(false);
  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [totalOvers, setTotalOvers] = useState(20);

  const [battingTeam, setBattingTeam] = useState({
    name: teamAName,
    players: [],
    runs: 0,
    wickets: 0,
    extras: { wide: 0, noball: 0, bye: 0, legbye: 0, penalty: 0 },
    overs: 0,
    balls: 0,
    fallOfWickets: [], // array of { wicket: number, score: number, over: number.x, batsmanId: number }
  });

  const [bowlingTeam, setBowlingTeam] = useState({
    name: teamBName,
    players: [],
  });

  const [currentBatsmen, setCurrentBatsmen] = useState({ striker: null, nonStriker: null });
  const [currentBowler, setCurrentBowler] = useState(null);

  const startMatch = () => {
    if (battingTeam.players.length < 11 || bowlingTeam.players.length < 1) {
      alert('Need at least 11 players in batting team and 1 bowler to start');
      return;
    }

    const batsmen = battingTeam.players.filter(
      (p) => p.role.includes('Batsman') || p.role.includes('All-rounder') || p.role.includes('Wicketkeeper')
    );

    if (batsmen.length < 2) {
      alert('Need at least 2 batting-capable players (Batsman / All-rounder / WK)');
      return;
    }

    setCurrentBatsmen({
      striker: batsmen[0].id,
      nonStriker: batsmen[1].id,
    });

    const bowlers = bowlingTeam.players.filter(
      (p) => p.role.includes('Bowler') || p.role.includes('All-rounder')
    );

    if (bowlers.length === 0) {
      alert('Need at least one bowler or all-rounder');
      return;
    }

    setCurrentBowler(bowlers[0].id);
    setMatchStarted(true);
  };

  const addRun = (
    runs,
    isExtra = false,
    extraType = null,
    wicket = false,
    wicketType = ''
  ) => {
    if (!matchStarted) return;

    setBattingTeam((prev) => {
      let newBalls = prev.balls + 1;
      let newOvers = prev.overs;
      let newRuns = prev.runs + runs;
      let newExtras = { ...prev.extras };
      let legalDelivery = true;

      if (isExtra) {
        newRuns += runs;
        newExtras[extraType] = (newExtras[extraType] || 0) + runs;

        // Wide & No-ball are not legal deliveries
        if (extraType === 'wide' || extraType === 'noball') {
          legalDelivery = false;
          newBalls -= 1;
        }
      }

      // Count only legal deliveries toward overs
      if (legalDelivery && newBalls >= 6) {
        newOvers += 1;
        newBalls -= 6;
      }

      // Wicket
      let newWickets = prev.wickets;
      let outBatsmanId = null;
      if (wicket) {
        newWickets += 1;
        outBatsmanId = currentBatsmen.striker; // default: striker out
        // You can later improve for run-out (non-striker) etc.
      }

      // Update players
      const updatedPlayers = prev.players.map((player) => {
        if (player.id === currentBatsmen.striker) {
          return {
            ...player,
            runs: (player.runs || 0) + (isExtra ? 0 : runs), // extras not credited to batsman
            balls: (player.balls || 0) + (legalDelivery ? 1 : 0),
          };
        }
        if (player.id === currentBowler) {
          return {
            ...player,
            runsConceded: (player.runsConceded || 0) + runs,
            ballsBowled: (player.ballsBowled || 0) + (legalDelivery ? 1 : 0),
            wickets: (player.wickets || 0) + (wicket ? 1 : 0),
          };
        }
        return player;
      });

      // Strike rotation
      let newStriker = currentBatsmen.striker;
      let newNonStriker = currentBatsmen.nonStriker;

      // Rotate on odd runs (including byes/leg byes)
      const effectiveRunsForRotation = isExtra && (extraType === 'bye' || extraType === 'legbye')
        ? runs
        : runs;

      if (effectiveRunsForRotation % 2 === 1) {
        [newStriker, newNonStriker] = [newNonStriker, newStriker];
      }

      // After wicket → new batsman to striker's end
      if (wicket) {
        const outPlayers = prev.fallOfWickets.map((w) => w.batsmanId);
        const nextBatsman = prev.players.find(
          (p) =>
            !outPlayers.includes(p.id) &&
            p.id !== currentBatsmen.striker &&
            p.id !== currentBatsmen.nonStriker
        );

        if (nextBatsman) {
          newStriker = nextBatsman.id;
          // non-striker stays (unless run out, but we simplify)
        }
      }

      // Record fall of wicket
      let newFallOfWickets = [...prev.fallOfWickets];
      if (wicket) {
        newFallOfWickets.push({
          wicket: newWickets,
          score: newRuns,
          over: `${newOvers}.${newBalls}`,
          batsmanId: outBatsmanId,
          type: wicketType,
        });
      }

      return {
        ...prev,
        players: updatedPlayers,
        runs: newRuns,
        wickets: newWickets,
        extras: newExtras,
        overs: newOvers,
        balls: newBalls,
        fallOfWickets: newFallOfWickets,
      };
    });

    // Change bowler at end of over
    if (battingTeam.balls + 1 >= 6 && !isExtra) { // simplified – only on legal delivery
      setCurrentBatsmen((prevState) => {
        // Cross batsmen at end of over
        return {
          striker: prevState.nonStriker,
          nonStriker: prevState.striker,
        };
      });

      setBowlingTeam((prevTeam) => {
        const bowlers = prevTeam.players.filter(
          (p) => p.role.includes('Bowler') || p.role.includes('All-rounder')
        );
        const currentIdx = bowlers.findIndex((b) => b.id === currentBowler);
        const nextIdx = (currentIdx + 1) % bowlers.length;
        setCurrentBowler(bowlers[nextIdx]?.id || currentBowler);
        return prevTeam;
      });
    }
  };

  return (
    <div className="app">
      <h1>Cricket Scorer (Frontend Only)</h1>

      {!matchStarted ? (
        <TeamSetup
          teamAName={teamAName}
          setTeamAName={setTeamAName}
          teamBName={teamBName}
          setTeamBName={setTeamBName}
          totalOvers={totalOvers}
          setTotalOvers={setTotalOvers}
          battingTeam={battingTeam}
          setBattingTeam={setBattingTeam}
          bowlingTeam={bowlingTeam}
          setBowlingTeam={setBowlingTeam}
          startMatch={startMatch}
        />
      ) : (
        <Scoreboard
          battingTeam={battingTeam}
          bowlingTeam={bowlingTeam}
          currentBatsmen={currentBatsmen}
          currentBowler={currentBowler}
          addRun={addRun}
          totalOvers={totalOvers}
        />
      )}
    </div>
  );
}

export default App;