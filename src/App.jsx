
import React, { useState, useEffect } from 'react';
import './App.css';

const STORAGE_KEY = 'e4_tally_data';

function App() {
  const [mergeCount, setMergeCount] = useState(0);
  const [nmrCount, setNmrCount] = useState(0);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [ticketsCompleted, setTicketsCompleted] = useState(0);
  const [logs, setLogs] = useState([]);

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
        timestamp: outTime.toLocaleString(),
        mergeCount,
        nmrCount,
        ticketsCompleted,
        timeSpent: duration.toFixed(2),
        timeLogged: Math.max(loggedTime, duration).toFixed(2)
      };
      setLogs([...logs, record]);
      setCheckIn(null);
      setTicketsCompleted(0);
    }
  };

  return (
    <div className="tracker">
      <h1>E4 Tally Tracker</h1>

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
        <button onClick={handleCheckIn} disabled={!!checkIn}>Check In</button>
        <button onClick={handleCheckOut} disabled={!checkIn}>Check Out</button>
        <div>
          <p>Total Tickets: {mergeCount + nmrCount}</p>
        </div>
      </div>


      <h2>Logs</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            [{log.timestamp}] Merge: {log.mergeCount}, NMR: {log.nmrCount},
            Tickets: {log.ticketsCompleted}, Time Spent: {log.timeSpent}h,
            Time Logged: {log.timeLogged}h
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
