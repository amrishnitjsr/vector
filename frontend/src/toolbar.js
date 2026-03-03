// toolbar.js

import { DraggableNode } from './draggableNode';

const NODE_GROUPS = [
  {
    label: 'I / O',
    nodes: [
      { type: 'customInput',  label: 'Input',    icon: '▶' },
      { type: 'customOutput', label: 'Output',   icon: '◀' },
    ],
  },
  {
    label: 'AI',
    nodes: [
      { type: 'llm',          label: 'LLM',      icon: '◈' },
    ],
  },
  {
    label: 'Data',
    nodes: [
      { type: 'text',         label: 'Text',     icon: 'T' },
      { type: 'image',        label: 'Image',    icon: '⬜' },
      { type: 'database',     label: 'Database', icon: '⬡' },
    ],
  },
  {
    label: 'Logic',
    nodes: [
      { type: 'filter',       label: 'Filter',   icon: '⊗' },
      { type: 'timer',        label: 'Timer',    icon: '◷' },
    ],
  },
  {
    label: 'Utils',
    nodes: [
      { type: 'note',         label: 'Note',     icon: '☰' },
    ],
  },
];

export const PipelineToolbar = () => (
  <div className="toolbar">
    <div className="toolbar-title">Components</div>
    {NODE_GROUPS.map((group) => (
      <div key={group.label} className="toolbar-group">
        <div className="toolbar-group-label">{group.label}</div>
        {group.nodes.map((n) => (
          <DraggableNode key={n.type} type={n.type} label={n.label} icon={n.icon} />
        ))}
      </div>
    ))}
  </div>
);
