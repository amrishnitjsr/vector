const NODE_COLORS = {
  customInput:  '#4f8ef7',
  customOutput: '#00d68f',
  llm:          '#9b72f7',
  text:         '#f7a44f',
  image:        '#f75f5f',
  database:     '#00b4d8',
  filter:       '#a855f7',
  note:         '#6b7280',
  timer:        '#ef4444',
};

export const DraggableNode = ({ type, label, icon }) => {
  const color = NODE_COLORS[type] || '#4f8ef7';

  const onDragStart = (event) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ nodeType: type })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="draggable-node"
      style={{ '--node-color': color }}
      onDragStart={onDragStart}
      draggable
    >
      <span className="draggable-node-icon">{icon}</span>
      <span className="draggable-node-label">{label}</span>
    </div>
  );
};
  