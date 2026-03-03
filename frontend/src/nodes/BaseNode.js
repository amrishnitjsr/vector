import { Handle, useReactFlow } from 'reactflow';
import { useStore } from '../store';

const HeaderBtn = ({ onClick, title, hoverBg, children }) => (
  <button
    className="nodrag"
    title={title}
    onClick={onClick}
    style={{
      background: 'rgba(0,0,0,0.25)',
      border: 'none',
      color: 'rgba(255,255,255,0.6)',
      cursor: 'pointer',
      borderRadius: 4,
      width: 18, height: 18,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, lineHeight: 1,
      padding: 0, flexShrink: 0,
      transition: 'background 0.15s, color 0.15s',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = '#fff'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
  >
    {children}
  </button>
);

export const BaseNode = ({
  id,
  label,
  handles = [],
  children,
  headerColor = '#4f8ef7',
  style = {},
  bodyStyle = {},
}) => {
  const removeNode = useStore((s) => s.removeNode);
  const { fitView } = useReactFlow();

  return (
    <div style={{
      minWidth: 220,
      minHeight: 80,
      border: '1px solid #2a3352',
      borderRadius: 10,
      background: '#161b27',
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      fontSize: 12,
      overflow: 'visible',
      transition: 'box-shadow 0.15s ease',
      ...style,
    }}>
      {handles.map((h, i) => (
        <Handle
          key={h.id || `${h.type}-${String(h.position)}-${i}`}
          type={h.type}
          position={h.position}
          id={h.id}
          style={h.style}
        />
      ))}

      <div style={{
        background: headerColor,
        color: '#fff',
        padding: '7px 12px',
        borderRadius: '9px 9px 0 0',
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: 0.5,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        borderBottom: '1px solid rgba(0,0,0,0.25)',
        justifyContent: 'space-between',
      }}>
        <span style={{ flex: 1 }}>{label}</span>
        <HeaderBtn
          title="Zoom to node"
          hoverBg="rgba(79,142,247,0.7)"
          onClick={() => fitView({ nodes: [{ id }], duration: 400, padding: 0.35, maxZoom: 1.8 })}
        >
          &#x2315;
        </HeaderBtn>
        <HeaderBtn
          title="Remove node"
          hoverBg="rgba(220,50,50,0.8)"
          onClick={() => removeNode(id)}
        >
          &times;
        </HeaderBtn>
      </div>

      <div style={{
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        ...bodyStyle,
      }}>
        {children}
      </div>
    </div>
  );
};

/**
 * Small helper: a standard label + control row used inside node bodies.
 */
export const NodeField = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <span style={
      { fontSize: 9, fontWeight: 700, color: '#525a6a', textTransform: 'uppercase', letterSpacing: 0.6 }
    }>
      {label}
    </span>
    {children}
  </div>
);

/** Shared input style */
export const inputStyle = {
  width: '100%',
  padding: '4px 7px',
  border: '1px solid #2a3352',
  borderRadius: 5,
  fontSize: 12,
  background: '#0d1117',
  color: '#e6edf3',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: "'Inter', system-ui, sans-serif",
};

/** Shared select style */
export const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};
