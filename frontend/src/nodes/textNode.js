import { useState, useEffect, useRef, useMemo } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField } from './BaseNode';

const VAR_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

const measureMaxLineWidth = (text, font = '12px monospace') => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = font;
  const lines = text.split('\n');
  return Math.max(...lines.map((line) => ctx.measureText(line).width));
};

const MIN_WIDTH  = 220;
const MAX_WIDTH  = 600;
const H_PADDING  = 52;
const LINE_HEIGHT = 18;

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const textareaRef = useRef(null);

  const variables = useMemo(() => {
    const matches = [...currText.matchAll(VAR_REGEX)];
    return [...new Set(matches.map((m) => m[1]))];
  }, [currText]);

  const handles = useMemo(() => {
    const total = variables.length;
    const targetHandles = variables.map((varName, i) => ({
      id:       `${id}-${varName}`,
      type:     'target',
      position: Position.Left,
      style:    { top: total === 1 ? '50%' : `${((i + 1) / (total + 1)) * 100}%` },
    }));
    return [
      ...targetHandles,
      { id: `${id}-output`, type: 'source', position: Position.Right },
    ];
  }, [id, variables]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [currText]);

  const nodeWidth = useMemo(() => {
    const contentWidth = measureMaxLineWidth(currText) + H_PADDING;
    return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.ceil(contentWidth)));
  }, [currText]);

  return (
    <BaseNode
      label="Text"
      id={id}
      handles={handles}
      headerColor="#f39c12"
      style={{ width: nodeWidth, transition: 'width 0.1s ease' }}
    >
      <NodeField label="Content">
        <textarea
          ref={textareaRef}
          className="nodrag"
          value={currText}
          onChange={(e) => setCurrText(e.target.value)}
          rows={1}
          style={{
            width: '100%',
            padding: '4px 7px',
            border: '1px solid #2a3352',
            borderRadius: 5,
            fontSize: 12,
            resize: 'none',
            overflow: 'hidden',
            boxSizing: 'border-box',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: `${LINE_HEIGHT}px`,
            background: '#0d1117',
            color: '#e6edf3',
            outline: 'none',
          }}
        />
      </NodeField>

      {variables.length > 0 && (
        <div style={{ marginTop: 4, borderTop: '1px dashed #2a3352', paddingTop: 4 }}>
          {variables.map((v) => (
            <div
              key={v}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 10,
                color: '#8b949e',
                lineHeight: '16px',
              }}
            >
              <span style={{ color: '#f7a44f', fontSize: 8 }}>◀</span>
              <code style={{ background: '#1e2535', padding: '0 4px', borderRadius: 3, border: '1px solid #2a3352', color: '#e6edf3' }}>
                {`{{${v}}}`}
              </code>
            </div>
          ))}
        </div>
      )}
    </BaseNode>
  );
}
