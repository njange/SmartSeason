import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../state/auth';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#f5f7ea,_#dce8d6)] p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Shamba Monitor</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Use demo credentials or your own account.</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-300 focus:ring"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-300 focus:ring"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
          type="submit"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <div className="mt-6 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
          <p>Admin: admin@example.com / Admin123!</p>
          <p>Agent: agent@example.com / Agent123!</p>
        </div>
      </form>
    </div>
  );
}
