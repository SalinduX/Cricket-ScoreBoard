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
    extras: { wide: 0, noball: 0, bye: 0, legbye: 0 },
    overs: 0,
    balls: 0,
  });

  const [bowlingTeam, setBowlingTeam] = useState({
    name: teamBName,
    players: [],
  });

  const [currentBatsmen, setCurrentBatsmen] = useState({ striker: null, nonStriker: null });
  const [currentBowler, setCurrentBowler] = useState(null);

  const startMatch = () => {
    if (battingTeam.players.length < 2 || bowlingTeam.players.length < 1) {
      alert('Need at least 2 batsmen and 1 bowler to start');
      return;
    }

    // Pick first two batsmen and first bowler
    const batsmen = battingTeam.players.filter(p => p.role.includes('Batsman') || p.role.includes('All-rounder'));
    if (batsmen.length < 2) {
      alert('Need at least 2 batting players (Batsman/All-rounder)');
      return;
    }

    setCurrentBatsmen({
      striker: batsmen[0].id,
      nonStriker: batsmen[1].id,
    });

    setCurrentBowler(bowlingTeam.players[0].id);

    setMatchStarted(true);
  };

  const addRun = (runs, isExtra = false, extraType = null, wicket = false, wicketType = '') => {
    if (!matchStarted) return;

    let newBalls = battingTeam.balls + 1;
    let newOvers = battingTeam.overs;
    let newRuns = battingTeam.runs + runs;
    let newExtras = { ...battingTeam.extras };

    if (isExtra) {
      newRuns += runs;
      newExtras[extraType] += runs;
      // Extras usually don't count as legal ball except for some cases
      if (extraType !== 'bye' && extraType !== 'legbye') {
        newBalls -= 1; // Wide / Noball not counted as legal delivery
      }
    }

    // Update overs
    if (newBalls >= 6) {
      newOvers += 1;
      newBalls -= 6;
    }

    // Wicket?
    let newWickets = battingTeam.wickets;
    let outPlayerId = null;
    if (wicket) {
      newWickets += 1;
      outPlayerId = currentBatsmen.striker;
      // For simplicity: striker is out (can improve later for run-out etc.)
    }

    // Rotate strike on odd runs or wicket (if not run-out of non-striker)
    let newStriker = currentBatsmen.striker;
    let newNonStriker = currentBatsmen.nonStriker;

    if (!wicket || wicketType !== 'Run out') {
      if (runs % 2 === 1) {
        [newStriker, newNonStriker] = [newNonStriker, newStriker];
      }
    }

    // After wicket, new batsman comes to striker end (simplified)
    if (wicket) {
      // Find next available batsman who is not out
      const outIds = []; // you'd track fallen players in real app
      const nextBatsman = battingTeam.players.find(
        p => !outIds.includes(p.id) && p.id !== currentBatsmen.striker && p.id !== currentBatsmen.nonStriker
      );
      if (nextBatsman) {
        newStriker = nextBatsman.id;
      }
    }

    setBattingTeam(prev => ({
      ...prev,
      runs: newRuns,
      wickets: newWickets,
      extras: newExtras,
      overs: newOvers,
      balls: newBalls,
    }));

    setCurrentBatsmen({ striker: newStriker, nonStriker: newNonStriker });

    // Rotate bowler every over (simplified)
    if (newBalls === 0 && newOvers > battingTeam.overs) {
      const bowlers = bowlingTeam.players.filter(p => p.role.includes('Bowler') || p.role.includes('All-rounder'));
      const currentIdx = bowlers.findIndex(b => b.id === currentBowler);
      const nextIdx = (currentIdx + 1) % bowlers.length;
      setCurrentBowler(bowlers[nextIdx]?.id || currentBowler);
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