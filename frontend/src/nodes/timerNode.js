import { useState, useEffect, useRef } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, inputStyle } from './BaseNode';

// Extracted outside the component so it's not recreated on every render
const btnStyle = (active) => ({
  flex: 1,
  padding: '3px 0',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 11,
  background: active ? '#d63031' : '#00b894',
  color: '#fff',
});

const MS = { seconds: 1000, minutes: 60_000, hours: 3_600_000 };

export const TimerNode = ({ id, data }) => {
  const [interval,  setIntervalVal] = useState(data?.interval || 5);
  const [unit,      setUnit]        = useState(data?.unit     || 'seconds');
  const [running,   setRunning]     = useState(false);
  const [tickCount, setTickCount]   = useState(0);
  const timerRef = useRef(null);

  const handles = [
    { id: `${id}-trigger`, type: 'source', position: Position.Right },
  ];

  const startTimer = () => {
    if (timerRef.current) return;
    setRunning(true);
    timerRef.current = setInterval(() => setTickCount((n) => n + 1), interval * (MS[unit] || 1000));
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  return (
    <BaseNode label="⏱  Timer" id={id} handles={handles} headerColor="#d63031">
      <NodeField label="Interval">
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            style={{ ...inputStyle, width: 60 }}
            className="nodrag"
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setIntervalVal(Number(e.target.value))}
          />
          <select
            style={{ ...inputStyle, flex: 1 }}
            className="nodrag"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="seconds">sec</option>
            <option value="minutes">min</option>
            <option value="hours">hr</option>
          </select>
        </div>
      </NodeField>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button style={btnStyle(false)} onClick={startTimer} disabled={running}>▶ Start</button>
        <button style={btnStyle(true)}  onClick={stopTimer}  disabled={!running}>■ Stop</button>
      </div>
      <div style={{ fontSize: 10, color: '#525a6a', marginTop: 4 }}>
        Ticks: <strong style={{ color: '#e6edf3' }}>{tickCount}</strong>{running && ' 🟢'}
      </div>
    </BaseNode>
  );
};
