import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, inputStyle, selectStyle } from './BaseNode';

export const FilterNode = ({ id, data }) => {
  const [field,     setField]     = useState(data?.field     || '');
  const [operator,  setOperator]  = useState(data?.operator  || 'equals');
  const [threshold, setThreshold] = useState(data?.threshold || '');

  const handles = [
    { id: `${id}-input`, type: 'target', position: Position.Left },
    { id: `${id}-pass`,  type: 'source', position: Position.Right, style: { top: '35%' } },
    { id: `${id}-fail`,  type: 'source', position: Position.Right, style: { top: '70%' } },
  ];

  return (
    <BaseNode label="🔍 Filter" id={id} handles={handles} headerColor="#6c5ce7">
      <NodeField label="Field">
        <input
          className="nodrag"
          style={inputStyle}
          type="text"
          placeholder="e.g. score"
          value={field}
          onChange={(e) => setField(e.target.value)}
        />
      </NodeField>
      <NodeField label="Operator">
        <select
          className="nodrag"
          style={selectStyle}
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
        >
          <option value="equals">equals</option>
          <option value="not_equals">not equals</option>
          <option value="greater_than">greater than</option>
          <option value="less_than">less than</option>
          <option value="contains">contains</option>
        </select>
      </NodeField>
      <NodeField label="Value">
        <input
          className="nodrag"
          style={inputStyle}
          type="text"
          placeholder="threshold"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
      </NodeField>
      <div style={{ fontSize: 10, color: '#525a6a', marginTop: 4 }}>
        ✅ pass (top) &nbsp;|&nbsp; ❌ fail (bottom)
      </div>
    </BaseNode>
  );
};
