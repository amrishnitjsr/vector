import { create }   from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

const EDGE_DEFAULTS = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: '#334268', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#4f8ef7' },
};

// Debounce localStorage writes so continuous drag updates don’t block the main thread.
const debouncedLocalStorage = (() => {
  let timer;
  return {
    getItem:    (key)        => localStorage.getItem(key),
    setItem:    (key, value) => { clearTimeout(timer); timer = setTimeout(() => localStorage.setItem(key, value), 800); },
    removeItem: (key)        => localStorage.removeItem(key),
  };
})();

export const useStore = create(
  persist(
    (set, get) => ({
      nodes:   [],
      edges:   [],
      nodeIDs: {},

      getNodeID: (type) => {
        const ids = { ...get().nodeIDs };
        ids[type] = (ids[type] ?? 0) + 1;
        set({ nodeIDs: ids });
        return `${type}-${ids[type]}`;
      },

      addNode: (node) => set({ nodes: [...get().nodes, node] }),

      removeNode: (nodeId) =>
        set({
          nodes: get().nodes.filter((n) => n.id !== nodeId),
          edges: get().edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          ),
        }),

      clearCanvas: () => set({ nodes: [], edges: [] }),

      onNodesChange: (changes) =>
        set({ nodes: applyNodeChanges(changes, get().nodes) }),

      onEdgesChange: (changes) =>
        set({ edges: applyEdgeChanges(changes, get().edges) }),

      onConnect: (connection) => {
        const exists = get().edges.some(
          (e) => e.source === connection.source &&
                  e.target === connection.target &&
                  e.sourceHandle === connection.sourceHandle &&
                  e.targetHandle === connection.targetHandle
        );
        if (exists) return;
        set({ edges: addEdge({ ...connection, ...EDGE_DEFAULTS }, get().edges) });
      },

      updateNodeField: (nodeId, fieldName, fieldValue) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, [fieldName]: fieldValue } } : n
          ),
        }),
    }),
    {
      name:    'vectorflow-pipeline',
      storage: createJSONStorage(() => debouncedLocalStorage),
      partialize: (s) => ({ nodes: s.nodes, edges: s.edges, nodeIDs: s.nodeIDs }),
    }
  )
);
