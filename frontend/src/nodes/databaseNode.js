import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, inputStyle, selectStyle } from './BaseNode';

export const DatabaseNode = ({ id, data }) => {
  const [host,   setHost]   = useState(data?.host   || 'localhost');
  const [table,  setTable]  = useState(data?.table  || '');
  const [dbType, setDbType] = useState(data?.dbType || 'PostgreSQL');

  const handles = [
    { id: `${id}-query`,  type: 'target', position: Position.Left },
    { id: `${id}-result`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode label="🗄  Database" id={id} handles={handles} headerColor="#0984e3">
      <NodeField label="DB Type">
        <select
          className="nodrag"
          style={selectStyle}
          value={dbType}
          onChange={(e) => setDbType(e.target.value)}
        >
          <option value="PostgreSQL">PostgreSQL</option>
          <option value="MySQL">MySQL</option>
          <option value="SQLite">SQLite</option>
          <option value="MongoDB">MongoDB</option>
        </select>
      </NodeField>
      <NodeField label="Host">
        <input
          className="nodrag"
          style={inputStyle}
          type="text"
          placeholder="localhost:5432"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
      </NodeField>
      <NodeField label="Table / Collection">
        <input
          className="nodrag"
          style={inputStyle}
          type="text"
          placeholder="my_table"
          value={table}
          onChange={(e) => setTable(e.target.value)}
        />
      </NodeField>
    </BaseNode>
  );
};
