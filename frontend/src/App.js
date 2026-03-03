import { PipelineToolbar }  from './toolbar';
import { PipelineUI }       from './ui';
import { SubmitButton }     from './submit';
import { ToastContainer }   from './components/ToastContainer';
import { ErrorBoundary }    from './components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="app-shell">
        {/* ── Top header bar ── */}
        <header className="app-header">
          <div className="app-logo">
            <span className="app-logo-icon">⬡</span>
            <span className="app-logo-text">VectorFlow</span>
            <span className="app-logo-badge">beta</span>
          </div>
          <div className="app-header-actions">
            <SubmitButton />
          </div>
        </header>

        {/* ── Sidebar + Canvas ── */}
        <div className="app-body">
          <aside className="app-sidebar">
            <PipelineToolbar />
          </aside>
          <main className="app-canvas">
            <PipelineUI />
          </main>
        </div>

        {/* ── Global toast overlay ── */}
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
