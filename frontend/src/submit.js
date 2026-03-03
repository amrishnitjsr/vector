import { useState } from 'react';
import { useStore }   from './store';
import { useShallow } from 'zustand/react/shallow';
import { api }        from './api';
import { useToast }   from './hooks/useToast';

const selector = (state) => ({ nodes: state.nodes, edges: state.edges });

export const SubmitButton = () => {
  const { nodes, edges } = useStore(useShallow(selector));
  const { toast }        = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // ── Client-side validation ─────────────────────────────────────
    if (nodes.length === 0) {
      toast.warn('Canvas is empty. Add at least one node before running.');
      return;
    }

    const inputNodes  = nodes.filter((n) => n.type === 'customInput');
    const outputNodes = nodes.filter((n) => n.type === 'customOutput');
    if (inputNodes.length === 0)  { toast.warn('Pipeline needs at least one Input node.'); return; }
    if (outputNodes.length === 0) { toast.warn('Pipeline needs at least one Output node.'); return; }

    // ── API call ──────────────────────────────────────────────────
    setLoading(true);
    try {
      const result = await api.parsePipeline({ nodes, edges });

      if (result.is_dag) {
        toast.success(
          `✓ Valid DAG  ·  ${result.num_nodes} nodes  ·  ${result.num_edges} edges`
        );
      } else {
        toast.error(
          `Cycle detected  ·  ${result.num_nodes} nodes  ·  ${result.num_edges} edges — fix loops before running.`
        );
      }
    } catch (err) {
      toast.error(`Backend error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`submit-btn${loading ? ' submit-btn--loading' : ''}`}
      onClick={handleSubmit}
      disabled={loading}
      title="Run pipeline analysis (validates DAG)  [Ctrl + Enter]"
    >
      {loading
        ? <><span className="spinner" /> Analyzing…</>
        : <><span>▶</span> Run Pipeline</>}
    </button>
  );
}
