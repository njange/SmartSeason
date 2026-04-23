import { AdminDashboard } from './pages/AdminDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './state/auth';

function App() {
  const { token, user, logout } = useAuth();

  if (!token || !user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f6f7eb,_#e8efe2_50%,_#dce5db)] text-slate-900">
      <header className="border-b border-slate-300/70 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Shamba Monitor</p>
            <h1 className="text-2xl font-bold tracking-tight">Crop Field Tracking</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-600">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-medium transition hover:border-slate-500 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {user.role === 'ADMIN' ? <AdminDashboard /> : <AgentDashboard />}
      </main>
    </div>
  );
}

export default App;
