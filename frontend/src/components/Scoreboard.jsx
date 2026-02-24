export default function Scoreboard({
  battingTeam, bowlingTeam,
  currentStriker, currentNonStriker, currentBowler,
  addBall, changeBowler, changeStriker, changeNonStriker,
  totalOvers, runRate, requiredRR,
  matchEnded, result,
  saveMatch, loadMatch
}) {
  const striker = battingTeam?.players.find(p => p.id === currentStriker);
  const nonStriker = battingTeam?.players.find(p => p.id === currentNonStriker);
  const bowler = bowlingTeam?.players.find(p => p.id === currentBowler);

  const notOutBatsmen = battingTeam?.players.filter(p => !p.out) || [];

  return (
    <div className="scoreboard">
      <div className="header">
        <h2>
          {battingTeam?.name} Innings {battingTeam?.innings === 2 ? '(Chasing)' : '(1st)'}
        </h2>
        <div className="save-load">
          <button onClick={saveMatch}>Save Match</button>
          <button onClick={loadMatch}>Load Match</button>
        </div>
      </div>

      <div className="main-score">
        <div className="runs-wkts">
          {battingTeam?.runs || 0} / {battingTeam?.wickets || 0}
        </div>
        <div className="overs">
          {battingTeam?.overs || 0}.{String(battingTeam?.balls || 0).padStart(1, '0')} / {totalOvers}
        </div>
        <div className="rates">
          RR: {runRate} {requiredRR && <><br/>Req RR: {requiredRR}</>}
        </div>
      </div>

      <div className="current-players">
        <div>
          <label>Striker: </label>
          <select value={currentStriker || ''} onChange={e => changeStriker(Number(e.target.value))}>
            {notOutBatsmen.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isKeeper ? '†' : ''} {p.isCaptain ? '(c)' : ''} ({p.runs || 0} off {p.ballsFaced || 0})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Non-striker: </label>
          <select value={currentNonStriker || ''} onChange={e => changeNonStriker(Number(e.target.value))}>
            {notOutBatsmen
              .filter(p => p.id !== currentStriker)
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isKeeper ? '†' : ''} {p.isCaptain ? '(c)' : ''} ({p.runs || 0} off {p.ballsFaced || 0})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label>Bowler: </label>
          <select value={currentBowler || ''} onChange={e => changeBowler(Number(e.target.value))}>
            {bowlingTeam?.players.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({(p.oversBowled || 0).toFixed(1)}-{p.runsConceded || 0}-{p.wickets || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!matchEnded ? (
        <div className="ball-controls">
          <h3>Next Delivery</h3>
          <div className="run-buttons">
            {[0,1,2,3,4,6].map(r => (
              <button key={r} onClick={() => addBall(r)}>{r}</button>
            ))}
          </div>
          <div className="extra-buttons">
            <button onClick={() => addBall(1, true, 'wide')}>Wide +1</button>
            <button onClick={() => addBall(1, true, 'noball')}>No-ball +1</button>
            <button onClick={() => addBall(0, true, 'bye')}>Bye</button>
            <button onClick={() => addBall(0, true, 'legbye')}>Leg-bye</button>
          </div>
          <div className="wicket-buttons">
            <button className="wkt-btn" onClick={() => addBall(0, false, null, true, 'Bowled')}>Bowled</button>
            <button className="wkt-btn" onClick={() => addBall(0, false, null, true, 'Caught')}>Caught</button>
            <button className="wkt-btn" onClick={() => addBall(0, false, null, true, 'LBW')}>LBW</button>
            <button className="wkt-btn" onClick={() => addBall(0, false, null, true, 'Run out')}>Run out</button>
            <button className="wkt-btn" onClick={() => addBall(0, false, null, true, 'Stumped')}>Stumped</button>
          </div>
        </div>
      ) : (
        <div className="match-result">
          <h2>Match Ended</h2>
          <div className="result-text">{result || 'No result yet'}</div>
        </div>
      )}

      {/* Batting Table */}
      <div className="scorecard">
        <h3>Batting</h3>
        <table>
          <thead>
            <tr>
              <th>Batsman</th>
              <th>R</th>
              <th>B</th>
              <th>SR</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {battingTeam?.players.map(p => {
              const sr = p.ballsFaced > 0 ? ((p.runs / p.ballsFaced) * 100).toFixed(1) : '-';
              return (
                <tr key={p.id} className={p.out ? 'out-row' : ''}>
                  <td>{p.name} {p.isKeeper ? '†' : ''} {p.isCaptain ? '(c)' : ''}</td>
                  <td>{p.runs || 0}</td>
                  <td>{p.ballsFaced || 0}</td>
                  <td>{sr}</td>
                  <td>{p.out ? `Out (${p.out})` : 'Not out'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bowling Table */}
      <div className="scorecard">
        <h3>Bowling</h3>
        <table>
          <thead>
            <tr>
              <th>Bowler</th>
              <th>O</th>
              <th>R</th>
              <th>W</th>
              <th>Econ</th>
            </tr>
          </thead>
          <tbody>
            {bowlingTeam?.players.map(p => {
              const overs = p.oversBowled?.toFixed(1) || '0.0';
              const econ = p.oversBowled > 0 ? (p.runsConceded / p.oversBowled).toFixed(2) : '-';
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{overs}</td>
                  <td>{p.runsConceded || 0}</td>
                  <td>{p.wickets || 0}</td>
                  <td>{econ}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fall of Wickets */}
      <div className="fow">
        <h3>Fall of Wickets</h3>
        <ul>
          {battingTeam?.fallOfWickets?.length > 0 ? (
            battingTeam.fallOfWickets.map((f, i) => {
              const name = battingTeam.players.find(p => p.id === f.batsmanId)?.name || '—';
              return (
                <li key={i}>
                  {f.wicketNum}-{f.score} ({f.overBall}) {name} ({f.type})
                </li>
              );
            })
          ) : (
            <li>No wickets yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}