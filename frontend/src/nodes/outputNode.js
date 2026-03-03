import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, inputStyle, selectStyle } from './BaseNode';

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(
    data?.outputName || id.replace('customOutput-', 'output_')
  );
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');

  const handles = [
    { id: `${id}-value`, type: 'target', position: Position.Left },
  ];

  return (
    <BaseNode label="Output" id={id} handles={handles} headerColor="#10ac84">
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
          value={outputType}
          onChange={(e) => setOutputType(e.target.value)}
        >
          <option value="Text">Text</option>
          <option value="Image">Image</option>
        </select>
      </NodeField>
    </BaseNode>
  );
}
