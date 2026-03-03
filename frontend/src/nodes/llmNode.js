import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const LLMNode = ({ id }) => {
  const handles = [
    { id: `${id}-system`,   type: 'target', position: Position.Left,  style: { top: `${100 / 3}%` } },
    { id: `${id}-prompt`,   type: 'target', position: Position.Left,  style: { top: `${200 / 3}%` } },
    { id: `${id}-response`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode label="LLM" id={id} handles={handles} headerColor="#8e44ad">
      <div style={{ fontSize: 11, color: '#8b949e' }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontWeight: 600, color: '#e6edf3' }}>System</span>
          <span style={{ color: '#525a6a', marginLeft: 4 }}>← left top</span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: '#e6edf3' }}>Prompt</span>
          <span style={{ color: '#525a6a', marginLeft: 4 }}>← left bottom</span>
        </div>
        <div style={{ marginTop: 6, color: '#525a6a', fontStyle: 'italic' }}>Sends response →</div>
      </div>
    </BaseNode>
  );
};
