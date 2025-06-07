import React, { useState, useEffect } from 'react';
import './App.css';

const STORAGE_KEY = 'e4_tally_data';

function App() {
  const [mergeCount, setMergeCount] = useState(0);
  const [nmrCount, setNmrCount] = useState(0);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [logs, setLogs] = useState([]);
  const [resetConfirm, setResetConfirm] = useState('');
  const [expandedWeeks, setExpandedWeeks] = useState({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      setMergeCount(saved.mergeCount || 0);
      setNmrCount(saved.nmrCount || 0);
      setLogs(saved.logs || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mergeCount, nmrCount, logs })
    );
  }, [mergeCount, nmrCount, logs]);

  const handleCheckIn = () => setCheckIn(new Date());

  const handleCheckOut = () => {
    const outTime = new Date();
    setCheckOut(outTime);
    if (checkIn) {
      const duration = (outTime - new Date(checkIn)) / 3600000;
      const totalTickets = mergeCount + nmrCount;
      const loggedTime = totalTickets / 12;

      const record = {
        id: Date.now(),
        timestamp: outTime.toLocaleString(),
        week: getWeekKey(outTime),
        checkInTime: new Date(checkIn).toLocaleString(),
        mergeCount,
        nmrCount,
        ticketsCompleted: totalTickets,
        timeSpent: duration.toFixed(2),
        timeLogged: Math.max(loggedTime, duration).toFixed(2)
      };

      setLogs([...logs, record]);
      setCheckIn(null);
      setMergeCount(0);
      setNmrCount(0);
    }
  };

  const handleReset = () => {
    if (resetConfirm === 'e4') {
      setMergeCount(0);
      setNmrCount(0);
      setLogs([]);
      setResetConfirm('');
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleDeleteLog = (id) => {
    setLogs(logs.filter((log) => log.id !== id));
  };

  const toggleWeek = (week) => {
    setExpandedWeeks((prev) => ({ ...prev, [week]: !prev[week] }));
  };

  const getWeekKey = (date) => {
    const d = new Date(date);
    const start = new Date(d.setDate(d.getDate() - d.getDay()));
    return start.toLocaleDateString();
  };

  const logsByWeek = logs.reduce((acc, log) => {
    const week = log.week;
    if (!acc[week]) acc[week] = [];
    acc[week].push(log);
    return acc;
  }, {});

  return (
    <div className="tracker">
      <h1>E4 Tally Tracker</h1>

      {!checkIn ? (
        <div className="check">
          <button onClick={handleCheckIn}>Check In</button>
        </div>
      ) : (
        <>
          <div className="counts">
            <div>
              <button onClick={() => setMergeCount(mergeCount + 1)}>+ Merge</button>
              <p>Merge Count: {mergeCount}</p>
            </div>
            <div>
              <button onClick={() => setNmrCount(nmrCount + 1)}>+ NMR</button>
              <p>NMR Count: {nmrCount}</p>
            </div>
          </div>

          <div className="check">
            <button onClick={handleCheckOut}>Check Out</button>
            <div>
              <p>Total Tickets: {mergeCount + nmrCount}</p>
            </div>
          </div>
        </>
      )}

      <h2>Logs</h2>
      {Object.keys(logsByWeek).length === 0 ? (
        <p>No logs yet.</p>
      ) : (
        Object.entries(logsByWeek).map(([week, weekLogs]) => (
          <div key={week} style={{ marginBottom: '1.5rem' }}>
            <button onClick={() => toggleWeek(week)} style={{ marginBottom: '0.5rem' }}>
              {expandedWeeks[week] ? '▼' : '▶'} Week of {week}
            </button>
            {expandedWeeks[week] && (
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Merge</th>
                    <th>NMR</th>
                    <th>Tickets</th>
                    <th>Time Spent (h)</th>
                    <th>Time Prod (h)</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {weekLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.checkInTime}</td>
                      <td>{log.timestamp}</td>
                      <td>{log.mergeCount}</td>
                      <td>{log.nmrCount}</td>
                      <td>{log.ticketsCompleted}</td>
                      <td>{log.timeSpent}</td>
                      <td>{log.timeLogged}</td>
                      <td>
                        <button onClick={() => handleDeleteLog(log.id)} style={{ color: 'red' }}>✖</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}

      <div style={{ marginTop: '2rem' }}>
        <input
          type="text"
          placeholder="Type 'e4' to confirm reset"
          value={resetConfirm}
          onChange={(e) => setResetConfirm(e.target.value)}
          style={{ padding: '0.5rem', marginRight: '0.5rem' }}
        />
        <button
          onClick={handleReset}
          disabled={resetConfirm !== 'e4'}
          style={{
            background: resetConfirm === 'e4' ? '#ff4d4f' : '#ccc',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: resetConfirm === 'e4' ? 'pointer' : 'not-allowed'
          }}
        >
          Reset Logs
        </button>
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Type <strong>e4</strong> to confirm and wipe all local tracking data.
        </p>
      </div>
    </div>
  );
}

export default App;
