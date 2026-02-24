import { useState } from 'react';

export default function TeamSetup({
  teamAName, setTeamAName,
  teamBName, setTeamBName,
  totalOvers, setTotalOvers,
  battingTeam, setBattingTeam,
  bowlingTeam, setBowlingTeam,
  startMatch
}) {
  const [newPlayer, setNewPlayer] = useState({ name: '', role: 'Batsman', isCaptain: false, isKeeper: false });

  const addPlayer = (teamSetter) => {
    if (!newPlayer.name.trim()) return;
    const player = {
      id: Date.now(),
      name: newPlayer.name.trim(),
      role: newPlayer.role,
      isCaptain: newPlayer.isCaptain,
      isKeeper: newPlayer.isKeeper,
      runs: 0,
      balls: 0,
      wickets: 0, // for bowlers
      overs: 0,
    };
    teamSetter(prev => ({
      ...prev,
      players: [...prev.players, player]
    }));
    setNewPlayer({ name: '', role: 'Batsman', isCaptain: false, isKeeper: false });
  };

  return (
    <div className="setup">
      <h2>Match Setup</h2>

      <div className="teams">
        <div>
          <h3>Batting First: {teamAName}</h3>
          <input
            value={teamAName}
            onChange={e => setTeamAName(e.target.value)}
            placeholder="Team A name"
          />
        </div>

        <div>
          <h3>Bowling First: {teamBName}</h3>
          <input
            value={teamBName}
            onChange={e => setTeamBName(e.target.value)}
            placeholder="Team B name"
          />
        </div>
      </div>

      <div>
        <label>Total Overs: </label>
        <input
          type="number"
          value={totalOvers}
          onChange={e => setTotalOvers(Number(e.target.value))}
          min="1"
          max="50"
        />
      </div>

      <div className="add-player">
        <h3>Add Player (to batting team first)</h3>
        <input
          value={newPlayer.name}
          onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
          placeholder="Player name"
        />
        <select
          value={newPlayer.role}
          onChange={e => setNewPlayer({...newPlayer, role: e.target.value})}
        >
          <option>Batsman</option>
          <option>Bowler</option>
          <option>All-rounder</option>
          <option>Wicketkeeper</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={newPlayer.isCaptain}
            onChange={e => setNewPlayer({...newPlayer, isCaptain: e.target.checked})}
          /> Captain
        </label>

        <label>
          <input
            type="checkbox"
            checked={newPlayer.isKeeper}
            onChange={e => setNewPlayer({...newPlayer, isKeeper: e.target.checked})}
          /> Wicketkeeper
        </label>

        <button onClick={() => addPlayer(setBattingTeam)}>Add to Batting Team</button>
        <button onClick={() => addPlayer(setBowlingTeam)}>Add to Bowling Team</button>
      </div>

      <PlayerList title="Batting Team" players={battingTeam.players} />
      <PlayerList title="Bowling Team" players={bowlingTeam.players} />

      <button className="start-btn" onClick={startMatch}>
        Start Match →
      </button>
    </div>
  );
}

function PlayerList({ title, players }) {
  return (
    <div className="player-list">
      <h4>{title} ({players.length} players)</h4>
      <ul>
        {players.map(p => (
          <li key={p.id}>
            {p.name} • {p.role}
            {p.isCaptain && ' (C)'}
            {p.isKeeper && ' (WK)'}
          </li>
        ))}
      </ul>
    </div>
  );
}