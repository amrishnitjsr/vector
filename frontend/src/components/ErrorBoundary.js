import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0d1117', color: '#e6edf3', fontFamily: 'Inter, sans-serif',
          gap: 20, padding: 40, textAlign: 'center',
        }}>
          <span style={{ fontSize: 48 }}>⚠</span>
          <h2 style={{ margin: 0, fontSize: 20, color: '#f75f5f' }}>Something went wrong</h2>
          <pre style={{
            background: '#161b27', padding: '12px 18px', borderRadius: 8,
            border: '1px solid #2a3352', fontSize: 12, color: '#f75f5f',
            maxWidth: 560, overflow: 'auto', textAlign: 'left',
          }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              padding: '8px 20px', background: '#4f8ef7', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
            }}
          >
            Try to recover
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
