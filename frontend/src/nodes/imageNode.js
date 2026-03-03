import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, inputStyle, selectStyle } from './BaseNode';

export const ImageNode = ({ id, data }) => {
  const [url, setUrl] = useState(data?.url || '');
  const [format, setFormat] = useState(data?.format || 'PNG');

  const handles = [
    { id: `${id}-src`,    type: 'target', position: Position.Left },
    { id: `${id}-output`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode label="🖼  Image" id={id} handles={handles} headerColor="#e17055">
      <NodeField label="URL">
        <input
          className="nodrag"
          style={inputStyle}
          type="text"
          placeholder="https://example.com/image.png"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </NodeField>
      <NodeField label="Output Format">
        <select
          className="nodrag"
          style={selectStyle}
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="PNG">PNG</option>
          <option value="JPEG">JPEG</option>
          <option value="WEBP">WEBP</option>
          <option value="GIF">GIF</option>
        </select>
      </NodeField>
      {url && (
        <img
          src={url}
          alt="preview"
          style={{ width: '100%', borderRadius: 4, marginTop: 4, objectFit: 'cover', maxHeight: 80 }}
          onError={(e) => { e.target.style.display = 'none'; }}
          onLoad={(e)  => { e.target.style.display = 'block'; }}
        />
      )}
    </BaseNode>
  );
};
