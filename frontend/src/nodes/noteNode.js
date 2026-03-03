import { useState } from 'react';
import { BaseNode } from './BaseNode';

const NOTE_COLORS = ['#fdfd96', '#c8f7c5', '#c6e2ff', '#ffc8c8', '#e8daff'];

export const NoteNode = ({ id, data }) => {
  const [text,  setText]  = useState(data?.text  || 'Add a note...');
  const [color, setColor] = useState(data?.color || NOTE_COLORS[0]);

  return (
    <BaseNode
      label="📝 Note"
      id={id}
      handles={[]}
      headerColor="#374151"
      style={{ background: color, border: `1.5px solid #2a3352` }}
      bodyStyle={{ padding: '6px 8px' }}
    >
      <textarea
        className="nodrag"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Type a note..."
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          fontSize: 12,
          resize: 'vertical',
          fontFamily: 'Georgia, serif',
          outline: 'none',
          boxSizing: 'border-box',
          lineHeight: 1.5,
          color: '#1a1d27',
        }}
      />
      <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
        {NOTE_COLORS.map((c) => (
          <button
            key={c}
            title={c}
            onClick={() => setColor(c)}
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: c,
              border: color === c ? '2px solid #333' : '1px solid #bbb',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>
    </BaseNode>
  );
};
