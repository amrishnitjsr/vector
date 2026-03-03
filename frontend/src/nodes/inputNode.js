import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, inputStyle, selectStyle } from './BaseNode';

export const InputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(
    data?.inputName || id.replace('customInput-', 'input_')
  );
  const [inputType, setInputType] = useState(data?.inputType || 'Text');

  const handles = [
    { id: `${id}-value`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode label="Input" id={id} handles={handles} headerColor="#2e86de">
      <NodeField label="Name">
        <input
          className="nodrag"
          style={inputStyle}
          type="text"
          value={currName}
          onChange={(e) => setCurrName(e.target.value)}
        />
      </NodeField>
      <NodeField label="Type">
        <select
          className="nodrag"
          style={selectStyle}
          value={inputType}
          onChange={(e) => setInputType(e.target.value)}
        >
          <option value="Text">Text</option>
          <option value="File">File</option>
        </select>
      </NodeField>
    </BaseNode>
  );
}
