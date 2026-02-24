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

      <div className="main-score">
        <div className="score-big">{scoreText}</div>
        <div className="overs">{overText}</div>
        <div className="extras">Extras: {extrasTotal} (w{battingTeam.extras.wide} nb{battingTeam.extras.noball} b{battingTeam.extras.bye} lb{battingTeam.extras.legbye})</div>
      </div>

      <div className="current">
        <div>
          <strong>Striker:</strong> {striker?.name || '—'} 
          {/* You can add runs/balls faced later */}
        </div>
        <div>
          <strong>Non-striker:</strong> {nonStriker?.name || '—'}
        </div>
        <div>
          <strong>Bowler:</strong> {bowler?.name || '—'}
        </div>
      </div>

      <div className="controls">
        <h3>Update Ball</h3>

        <div className="run-buttons">
          {[0,1,2,3,4,6].map(r => (
            <button key={r} onClick={() => addRun(r)}>{r}</button>
          ))}
        </div>

        <div className="extras-buttons">
          <button onClick={() => addRun(1, true, 'wide')}>Wide (+1)</button>
          <button onClick={() => addRun(1, true, 'noball')}>No-ball (+1)</button>
          <button onClick={() => addRun(0, true, 'bye')}>Bye (run separately)</button>
          <button onClick={() => addRun(0, true, 'legbye')}>Leg-bye</button>
        </div>

        <div className="wicket-buttons">
          <button className="danger" onClick={() => addRun(0, false, null, true, 'Bowled')}>Bowled</button>
          <button className="danger" onClick={() => addRun(0, false, null, true, 'Caught')}>Caught</button>
          <button className="danger" onClick={() => addRun(0, false, null, true, 'LBW')}>LBW</button>
          <button className="danger" onClick={() => addRun(0, false, null, true, 'Run out')}>Run out</button>
          <button className="danger" onClick={() => addRun(0, false, null, true, 'Stumped')}>Stumped</button>
        </div>
      </div>

      {/* You can add batting order / fall of wickets / bowler figures tables later */}
    </div>
  );
}