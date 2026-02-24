import { useState } from 'react';

export default function TeamSetup(props) {
  const {
    teamAName, setTeamAName,
    teamBName, setTeamBName,
    totalOvers, setTotalOvers,
    teamA, setTeamA,
    teamB, setTeamB,
    startToss
  } = props;

  const [newPlayer, setNewPlayer] = useState({
    name: '', role: 'Batsman', isCaptain: false, isKeeper: false
  });

  const addPlayer = (teamSetter) => {
    if (!newPlayer.name.trim()) return alert('Name required');
    const player = {
      id: Date.now(),
      name: newPlayer.name.trim(),
      role: newPlayer.role,
      isCaptain: newPlayer.isCaptain,
      isKeeper: newPlayer.isKeeper,
      runs: 0,
      ballsFaced: 0,
      out: false,
      oversBowled: 0,
      runsConceded: 0,
      wickets: 0,
    };
    teamSetter(prev => ({ ...prev, players: [...prev.players, player] }));
    setNewPlayer({ name: '', role: 'Batsman', isCaptain: false, isKeeper: false });
  };

  return (
    <div className="setup">
      <h2>Match Setup</h2>

      <div className="team-names">
        <input value={teamAName} onChange={e => { setTeamAName(e.target.value); setTeamA(p => ({...p, name: e.target.value})); }} placeholder="Team A" />
        <input value={teamBName} onChange={e => { setTeamBName(e.target.value); setTeamB(p => ({...p, name: e.target.value})); }} placeholder="Team B" />
      </div>

      <label>Overs: <input type="number" value={totalOvers} onChange={e => setTotalOvers(+e.target.value)} min="1" max="50" /></label>

      <div className="player-input">
        <input value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} placeholder="Name" />
        <select value={newPlayer.role} onChange={e => setNewPlayer({...newPlayer, role: e.target.value})}>
          <option>Batsman</option>
          <option>Bowler</option>
          <option>All-rounder</option>
          <option>Wicketkeeper</option>
        </select>
        <label><input type="checkbox" checked={newPlayer.isCaptain} onChange={e => setNewPlayer({...newPlayer, isCaptain: e.target.checked})} /> Captain</label>
        <label><input type="checkbox" checked={newPlayer.isKeeper} onChange={e => setNewPlayer({...newPlayer, isKeeper: e.target.checked})} /> †</label>
        <button onClick={() => addPlayer(setTeamA)}>Add → Team A</button>
        <button onClick={() => addPlayer(setTeamB)}>Add → Team B</button>
      </div>

      <div className="team-lists">
        <div>
          <h4>{teamA.name} ({teamA.players.length})</h4>
          <ul>{teamA.players.map(p => <li key={p.id}>{p.name} – {p.role}</li>)}</ul>
        </div>
        <div>
          <h4>{teamB.name} ({teamB.players.length})</h4>
          <ul>{teamB.players.map(p => <li key={p.id}>{p.name} – {p.role}</li>)}</ul>
        </div>
      </div>

      <button className="big-btn" onClick={startToss}>Proceed to Toss</button>
    </div>
  );
}