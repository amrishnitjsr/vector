import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore }      from './store';
import { useShallow }    from 'zustand/react/shallow';
import { EmptyCanvas }   from './components/EmptyCanvas';
import { InputNode }    from './nodes/inputNode';
import { LLMNode }      from './nodes/llmNode';
import { OutputNode }   from './nodes/outputNode';
import { TextNode }     from './nodes/textNode';
import { ImageNode }    from './nodes/imageNode';
import { DatabaseNode } from './nodes/databaseNode';
import { FilterNode }   from './nodes/filterNode';
import { NoteNode }     from './nodes/noteNode';
import { TimerNode }    from './nodes/timerNode';

import 'reactflow/dist/style.css';

const GRID = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput:  InputNode,
  llm:          LLMNode,
  customOutput: OutputNode,
  text:         TextNode,
  image:        ImageNode,
  database:     DatabaseNode,
  filter:       FilterNode,
  note:         NoteNode,
  timer:        TimerNode,
};

const CanvasActions = ({ rfInstance, clearCanvas, visible }) => {
  if (!visible) return null;
  return (
    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', gap: 8 }}>
      <button
        onClick={() => rfInstance?.fitView({ padding: 0.2, duration: 300 })}
        className="canvas-action-btn" title="Fit view"
      >⊞ Fit</button>
      <button
        onClick={() => { if (window.confirm('Clear the entire canvas?')) clearCanvas(); }}
        className="canvas-action-btn canvas-action-btn--danger" title="Clear canvas"
      >✕ Clear</button>
    </div>
  );
};

const selector = (state) => ({
  nodes:         state.nodes,
  edges:         state.edges,
  getNodeID:     state.getNodeID,
  addNode:       state.addNode,
  clearCanvas:   state.clearCanvas,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect:     state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);
  const {
    nodes, edges, getNodeID, addNode, clearCanvas,
    onNodesChange, onEdgesChange, onConnect,
  } = useStore(useShallow(selector));

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.submit-btn')?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData('application/reactflow');
    if (!raw) return;
    const { nodeType: type } = JSON.parse(raw);
    if (!type) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = rfInstance.project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    const nodeID = getNodeID(type);
    addNode({ id: nodeID, type, position, data: { id: nodeID, nodeType: type } });
  }, [rfInstance, getNodeID, addNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep', animated: true,
    style: { stroke: '#334268', strokeWidth: 2 },
  }), []);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {nodes.length === 0 && <EmptyCanvas />}
      <CanvasActions rfInstance={rfInstance} clearCanvas={clearCanvas} visible={nodes.length > 0} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[GRID, GRID]}
        snapToGrid
        connectionLineType="smoothstep"
        connectionLineStyle={{ stroke: '#4f8ef7', strokeWidth: 2 }}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background color="#1e2535" gap={GRID} variant="dots" size={1.5} />
        <Controls showInteractive={false} />
        <MiniMap nodeColor={() => '#252d40'} maskColor="rgba(13,17,23,0.75)" style={{ background: '#161b27', border: '1px solid #2a3352' }} />
      </ReactFlow>
    </div>
  );
}
