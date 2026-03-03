export const EmptyCanvas = () => (
  <div style={{
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none', userSelect: 'none', zIndex: 1,
  }}>
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      padding: '40px 48px',
      background: 'rgba(22,27,39,0.85)',
      border: '1.5px dashed #2a3352',
      borderRadius: 16,
      backdropFilter: 'blur(6px)',
    }}>
      <span style={{ fontSize: 48, opacity: 0.25 }}>⬡</span>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', margin: '0 0 6px' }}>
          Your canvas is empty
        </p>
        <p style={{ fontSize: 13, color: '#525a6a', margin: 0, lineHeight: 1.6 }}>
          Drag a component from the left panel<br />to start building your pipeline.
        </p>
      </div>
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {['Drag nodes', 'Connect handles', 'Run Pipeline'].map((step, i) => (
          <span key={step} style={{
            fontSize: 11, color: '#4f8ef7',
            background: 'rgba(79,142,247,0.1)',
            border: '1px solid rgba(79,142,247,0.2)',
            borderRadius: 99, padding: '3px 10px',
          }}>
            {i + 1}. {step}
          </span>
        ))}
      </div>
    </div>
  </div>
);
