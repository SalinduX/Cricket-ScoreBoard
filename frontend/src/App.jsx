// src/App.jsx
import { useState, useEffect } from 'react';
import TeamSetup from './components/TeamSetup';
import Scoreboard from './components/Scoreboard';
import './index.css';

function App() {
  const [phase, setPhase] = useState('setup');
  const [tossWinner, setTossWinner] = useState(null);
  const [tossChoice, setTossChoice] = useState(null);

  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [totalOvers, setTotalOvers] = useState(20);

  const [teamA, setTeamA] = useState({ name: teamAName, players: [] });
  const [teamB, setTeamB] = useState({ name: teamBName, players: [] });

  const [battingTeam, setBattingTeam] = useState(null);
  const [bowlingTeam, setBowlingTeam] = useState(null);

  const [currentStriker, setCurrentStriker] = useState(null);
  const [currentNonStriker, setCurrentNonStriker] = useState(null);
  const [currentBowler, setCurrentBowler] = useState(null);
  const [lastBowler, setLastBowler] = useState(null); // for consecutive over rule

  const [currentInnings, setCurrentInnings] = useState(0);
  const [matchEnded, setMatchEnded] = useState(false);

  // Save / Load
  const saveMatch = () => {
    const state = {
      phase, tossWinner, tossChoice,
      teamAName, teamBName, totalOvers,
      teamA, teamB,
      battingTeam, bowlingTeam,
      currentStriker, currentNonStriker, currentBowler, lastBowler,
      currentInnings, matchEnded
    };
    localStorage.setItem('cricketMatchState', JSON.stringify(state));
    alert('Match state saved!');
  };

  const loadMatch = () => {
    const saved = localStorage.getItem('cricketMatchState');
    if (saved) {
      const state = JSON.parse(saved);
      setPhase(state.phase);
      setTossWinner(state.tossWinner);
      setTossChoice(state.tossChoice);
      setTeamAName(state.teamAName);
      setTeamBName(state.teamBName);
      setTotalOvers(state.totalOvers);
      setTeamA(state.teamA);
      setTeamB(state.teamB);
      setBattingTeam(state.battingTeam);
      setBowlingTeam(state.bowlingTeam);
      setCurrentStriker(state.currentStriker);
      setCurrentNonStriker(state.currentNonStriker);
      setCurrentBowler(state.currentBowler);
      setLastBowler(state.lastBowler);
      setCurrentInnings(state.currentInnings);
      setMatchEnded(state.matchEnded);
      alert('Match state loaded!');
    } else {
      alert('No saved match found');
    }
  };

  // Toss logic (unchanged)
  const startToss = () => {
    if (teamA.players.length < 4 || teamB.players.length < 4) {
      alert('Each team needs at least 4 players');
      return;
    }
    setPhase('toss');
  };

  const simulateToss = (call) => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    setTossWinner(call === result ? teamAName : teamBName);
  };

  const handleTossChoice = (choice) => {
    setTossChoice(choice);

    let batTeam, bowlTeam;

    if (tossWinner === teamAName) {
      batTeam = choice === 'bat' ? teamA : teamB;
      bowlTeam = choice === 'bat' ? teamB : teamA;
    } else {
      batTeam = choice === 'bat' ? teamB : teamA;
      bowlTeam = choice === 'bat' ? teamA : teamB;
    }

    const possibleOpeners = batTeam.players.filter(p => !p.out);

    if (possibleOpeners.length < 2) {
      alert(`Not enough opening batsmen in ${batTeam.name}`);
      return;
    }

    setBattingTeam({
      ...batTeam,
      runs: 0,
      wickets: 0,
      extras: { wide: 0, noball: 0, bye: 0, legbye: 0 },
      overs: 0,
      balls: 0,
      fallOfWickets: [],
      innings: 1,
    });

    setBowlingTeam(bowlTeam);

    setCurrentStriker(possibleOpeners[0].id);
    setCurrentNonStriker(possibleOpeners[1].id);

    const possibleBowlers = bowlTeam.players.filter(p => {
      const r = (p.role || '').toLowerCase();
      return r.includes('bowler') || r.includes('all-rounder');
    });

    if (possibleBowlers.length === 0) {
      alert('No bowlers available');
      return;
    }

    setCurrentBowler(possibleBowlers[0].id);
    setLastBowler(null);
    setCurrentInnings(1);
    setPhase('match');
  };

  // ────────────────────────────────────────────────
  // Ball logic – with out player protection
  // ────────────────────────────────────────────────

  const addBall = (runs, isExtra = false, extraType = null, wicket = false, wicketType = '') => {
    if (matchEnded) return;

    setBattingTeam(prev => {
      let newBalls = prev.balls + 1;
      let newOvers = prev.overs;
      let newRuns = prev.runs + runs;
      let newExtras = { ...prev.extras };
      let legal = true;

      if (isExtra) {
        newRuns += runs;
        newExtras[extraType] = (newExtras[extraType] || 0) + runs;
        if (extraType === 'wide' || extraType === 'noball') legal = false, newBalls -= 1;
      }

      if (legal && newBalls >= 6) {
        newOvers += 1;
        newBalls -= 6;
      }

      let newWickets = prev.wickets;
      let outId = null;
      if (wicket) {
        newWickets += 1;
        outId = currentStriker;
      }

      const updatedPlayers = prev.players.map(p => {
        if (p.id === currentStriker) {
          return {
            ...p,
            runs: (p.runs || 0) + (isExtra ? 0 : runs),
            ballsFaced: (p.ballsFaced || 0) + (legal ? 1 : 0),
            out: p.out || (wicket ? (wicketType || 'out') : p.out),
          };
        }
        if (p.id === currentBowler) {
          return {
            ...p,
            oversBowled: (p.oversBowled || 0) + (legal ? 1/6 : 0),
            runsConceded: (p.runsConceded || 0) + runs,
            wickets: (p.wickets || 0) + (wicket ? 1 : 0),
          };
        }
        return p;
      });

      let newStriker = currentStriker;
      let newNonStriker = currentNonStriker;
      const effRuns = isExtra && (extraType === 'bye' || extraType === 'legbye') ? runs : runs;
      if (effRuns % 2 === 1) {
        [newStriker, newNonStriker] = [newNonStriker, newStriker];
      }

      // End of over: swap + remember last bowler
      if (legal && newBalls === 0 && newOvers > prev.overs) {
        [newStriker, newNonStriker] = [newNonStriker, newStriker];
        setLastBowler(currentBowler);
      }

      if (wicket) {
        const remaining = updatedPlayers.filter(p => !p.out);
        const eligible = remaining.filter(p => p.id !== outId && p.id !== currentNonStriker);
        if (eligible.length === 0) {
          setMatchEnded(true);
          return prev;
        }
        newStriker = eligible[0].id;
      }

      let newFow = [...prev.fallOfWickets];
      if (wicket) {
        newFow.push({
          wicketNum: newWickets,
          score: newRuns,
          overBall: `${newOvers}.${newBalls}`,
          batsmanId: outId,
          type: wicketType || 'out',
        });
      }

      const updated = {
        ...prev,
        players: updatedPlayers,
        runs: newRuns,
        wickets: newWickets,
        extras: newExtras,
        overs: newOvers,
        balls: newBalls,
        fallOfWickets: newFow,
      };

      // Innings / match end
      const allOut = newWickets >= 10 || updated.players.filter(p => !p.out).length < 2;
      const oversDone = newOvers >= totalOvers && newBalls === 0;

      if (allOut || oversDone) {
        if (currentInnings === 1) {
          const newBatting = bowlingTeam;
          const newBowling = battingTeam;

          const newOpeners = newBatting.players.filter(p => !p.out);
          if (newOpeners.length >= 2) {
            setCurrentStriker(newOpeners[0].id);
            setCurrentNonStriker(newOpeners[1].id);
          }

          const newBowlers = newBowling.players.filter(p => {
            const r = (p.role || '').toLowerCase();
            return (r.includes('bowler') || r.includes('all-rounder')) && p.id !== currentBowler;
          });

          setCurrentBowler(newBowlers.length > 0 ? newBowlers[0].id : null);
          setLastBowler(null);

          setBattingTeam({
            ...newBatting,
            runs: 0,
            wickets: 0,
            extras: { wide: 0, noball: 0, bye: 0, legbye: 0 },
            overs: 0,
            balls: 0,
            fallOfWickets: [],
            innings: 2,
          });

          setBowlingTeam(newBowling);
          setCurrentInnings(2);
        } else {
          setMatchEnded(true);
        }
      }

      return updated;
    });
  };

  const changeBowler = (bowlerId) => {
    if (bowlerId === lastBowler) {
      alert("Cannot bowl consecutive overs (real cricket rule)");
      return;
    }
    setCurrentBowler(bowlerId);
    setLastBowler(currentBowler);
  };

  const changeStriker = (id) => {
    if (id === currentNonStriker) return alert("Cannot select same player");
    setCurrentStriker(id);
  };

  const changeNonStriker = (id) => {
    if (id === currentStriker) return alert("Cannot select same player");
    setCurrentNonStriker(id);
  };

  const getRunRate = () => {
    if (!battingTeam) return '0.00';
    const balls = battingTeam.overs * 6 + battingTeam.balls;
    return balls > 0 ? (battingTeam.runs / (balls / 6)).toFixed(2) : '0.00';
  };

  const getRequiredRR = () => {
    if (currentInnings !== 2 || !battingTeam?.innings === 1) return null;
    const target = battingTeam.runs + 1;
    const remaining = target - battingTeam.runs;
    const ballsLeft = totalOvers * 6 - (battingTeam.overs * 6 + battingTeam.balls);
    if (ballsLeft <= 0) return remaining > 0 ? '∞' : '0.00';
    return (remaining / (ballsLeft / 6)).toFixed(2);
  };

  const getResult = () => {
    if (!matchEnded) return null;
    const score1 = battingTeam.innings === 1 ? battingTeam.runs : bowlingTeam?.runs || 0;
    const score2 = battingTeam.innings === 2 ? battingTeam.runs : 0;

    if (score2 > score1) return `${battingTeam.name} won by ${10 - battingTeam.wickets} wickets`;
    if (score1 > score2) return `${bowlingTeam.name} won by ${score1 - score2} runs`;
    return 'Match Tied';
  };

  return (
    <div className="app">
      <h1>Cricket Scorer</h1>

      {phase === 'setup' && (
        <TeamSetup {...{
          teamAName, setTeamAName, teamBName, setTeamBName,
          totalOvers, setTotalOvers, teamA, setTeamA, teamB, setTeamB,
          startToss
        }} />
      )}

      {phase === 'toss' && (
        <div className="toss">
          <h2>Toss</h2>
          {!tossWinner ? (
            <>
              <p>Team A calls:</p>
              <button onClick={() => simulateToss('Heads')}>Heads</button>
              <button onClick={() => simulateToss('Tails')}>Tails</button>
            </>
          ) : (
            <>
              <p style={{color:'#ffd700'}}>{tossWinner} won the toss!</p>
              <button onClick={() => handleTossChoice('bat')}>Bat first</button>
              <button onClick={() => handleTossChoice('bowl')}>Bowl first</button>
            </>
          )}
        </div>
      )}

      {phase === 'match' && (
        <Scoreboard {...{
          battingTeam, bowlingTeam,
          currentStriker, currentNonStriker, currentBowler,
          addBall, changeBowler, changeStriker, changeNonStriker,
          totalOvers, runRate: getRunRate(), requiredRR: getRequiredRR(),
          matchEnded, result: getResult(),
          saveMatch, loadMatch
        }} />
      )}
    </div>
  );
}

export default App;