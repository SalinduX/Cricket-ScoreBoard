export default function BallUpdate({ addRun }) {
  const handleRun = (runs, isExtra = false, extraType = null, wicket = false, wicketType = '') => {
    addRun(runs, isExtra, extraType, wicket, wicketType);
  };

  return (
    <div className="ball-update">
      <h3>Next Ball</h3>

      {/* Normal runs */}
      <div className="run-group">
        <h4>Runs</h4>
        <div className="run-buttons">
          {[0, 1, 2, 3, 4, 6].map((r) => (
            <button
              key={r}
              className={`run-btn ${r === 4 || r === 6 ? 'highlight' : ''}`}
              onClick={() => handleRun(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div className="extras-group">
        <h4>Extras</h4>
        <div className="extra-buttons">
          <button onClick={() => handleRun(1, true, 'wide')}>Wide +1</button>
          <button onClick={() => handleRun(1, true, 'noball')}>No Ball +1</button>
          <button onClick={() => handleRun(0, true, 'bye')}>Bye</button>
          <button onClick={() => handleRun(0, true, 'legbye')}>Leg Bye</button>
          <button onClick={() => handleRun(2, true, 'bye')}>Bye +2</button>
          <button onClick={() => handleRun(2, true, 'legbye')}>Leg Bye +2</button>
        </div>
      </div>

      {/* Wickets */}
      <div className="wicket-group">
        <h4>Wicket</h4>
        <div className="wicket-buttons">
          <button className="wicket-btn" onClick={() => handleRun(0, false, null, true, 'Bowled')}>
            Bowled
          </button>
          <button className="wicket-btn" onClick={() => handleRun(0, false, null, true, 'Caught')}>
            Caught
          </button>
          <button className="wicket-btn" onClick={() => handleRun(0, false, null, true, 'LBW')}>
            LBW
          </button>
          <button className="wicket-btn" onClick={() => handleRun(0, false, null, true, 'Run Out')}>
            Run Out
          </button>
          <button className="wicket-btn" onClick={() => handleRun(0, false, null, true, 'Stumped')}>
            Stumped
          </button>
          <button className="wicket-btn" onClick={() => handleRun(0, false, null, true, 'Hit Wicket')}>
            Hit Wicket
          </button>
        </div>
      </div>
    </div>
  );
}