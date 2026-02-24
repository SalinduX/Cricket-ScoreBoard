import BallUpdate from './BallUpdate'; // ← Make sure this import is correct

export default function Scoreboard({
  battingTeam,
  bowlingTeam,
  currentBatsmen,
  currentBowler,
  addRun,
  totalOvers
}) {
  const striker = battingTeam.players.find(p => p.id === currentBatsmen.striker);
  const nonStriker = battingTeam.players.find(p => p.id === currentBatsmen.nonStriker);
  const bowler = bowlingTeam.players.find(p => p.id === currentBowler);

  const extrasTotal = Object.values(battingTeam.extras).reduce((a, b) => a + b, 0);
  const scoreText = `${battingTeam.runs}/${battingTeam.wickets}`;
  const overText = `${battingTeam.overs}.${battingTeam.balls} / ${totalOvers}`;

  return (
    <div className="scoreboard">
      <h2>{battingTeam.name} Innings</h2>

      {/* Main Score Display */}
      <div className="main-score">
        <div className="score-big">{scoreText}</div>
        <div className="overs">{overText}</div>
        <div className="extras">
          Extras: {extrasTotal} 
          (w{battingTeam.extras.wide} nb{battingTeam.extras.noball} 
          b{battingTeam.extras.bye} lb{battingTeam.extras.legbye})
        </div>
      </div>

      {/* Current Players */}
      <div className="current-players">
        <div className="batsman-info">
          <strong>Striker:</strong> {striker?.name || '—'}
          {striker && (
            <span className="stats">
              {' '}({striker.runs || 0} runs, {striker.balls || 0} balls)
            </span>
          )}
        </div>
        <div className="batsman-info">
          <strong>Non-striker:</strong> {nonStriker?.name || '—'}
          {nonStriker && (
            <span className="stats">
              {' '}({nonStriker.runs || 0} runs, {nonStriker.balls || 0} balls)
            </span>
          )}
        </div>
        <div className="bowler-info">
          <strong>Bowler:</strong> {bowler?.name || '—'}
          {bowler && (
            <span className="stats">
              {' '}(O: {bowler.overs || 0}, R: {bowler.runsConceded || 0}, W: {bowler.wickets || 0})
            </span>
          )}
        </div>
      </div>

      {/* Ball Update Controls */}
      <div className="controls-section">
        <BallUpdate addRun={addRun} />
      </div>

      {/* Future sections - you can expand these later */}
      {/* 
      <div className="fall-of-wickets">...</div>
      <div className="batting-order">...</div>
      <div className="bowling-figures">...</div>
      */}
    </div>
  );
}