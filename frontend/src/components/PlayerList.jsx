export default function PlayerList({ title, players }) {
  if (!players || players.length === 0) {
    return null;
  }

  return (
    <div className="player-list">
      <h4>{title} ({players.length} players)</h4>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.name} • {player.role}
            {player.isCaptain && <span className="captain"> (C)</span>}
            {player.isKeeper && <span className="keeper"> (WK)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}