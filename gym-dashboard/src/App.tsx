import { Routes, Route, Link } from 'react-router-dom';

// Placeholder Pages
const Dashboard = () => (
  <div className="animate-fade-in">
    <h1 style={{ marginBottom: '16px' }}>Dashboard Overview</h1>
    <p style={{ color: 'var(--text-secondary)' }}>Overall user status and gym metrics.</p>
  </div>
);

const UserIntelligence = () => (
  <div className="animate-fade-in">
    <h1 style={{ marginBottom: '16px' }}>User Intelligence</h1>
    <p style={{ color: 'var(--text-secondary)' }}>Individual user statuses, streaks, and progress.</p>
  </div>
);

const MissionCentral = () => (
  <div className="animate-fade-in">
    <h1 style={{ marginBottom: '16px' }}>Mission Central</h1>
    <p style={{ color: 'var(--text-secondary)' }}>Create, edit, and control custom habits and missions.</p>
  </div>
);

function App() {
  return (
    <div className="app-container animate-fade-in">
      <aside className="glass-panel" style={{ width: '260px', margin: '24px 0 24px 24px', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '40px', letterSpacing: '1px' }}>
          ALTER<span style={{ color: 'var(--accent-cyan)' }}>EGO</span>
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
          <Link to="/users" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>User Intelligence</Link>
          <Link to="/missions" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Mission Central</Link>
        </nav>
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
          <button className="btn-secondary" style={{ width: '100%' }}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '16px 32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontWeight: 500, fontSize: '1.2rem' }}>Trainer Portal</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn-secondary">Settings</button>
            <button className="btn-primary">Profile</button>
          </div>
        </header>

        <section className="glass-panel" style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UserIntelligence />} />
            <Route path="/missions" element={<MissionCentral />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default App;
