'use client';

import { useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple password check (in production, use proper authentication)
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (password === ADMIN_PASSWORD) {
      // Set admin session cookie
      document.cookie = 'admin_session=true; path=/; max-age=86400'; // 24 hours
      window.location.href = '/admin/cars';
    } else {
      setError('Invalid password');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-[#1a1a1a] p-8">
          <h1 className="mb-6 text-3xl font-black text-yellow-300 text-center">
            Admin Login
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border border-white/10 bg-[#1a1a1a] px-4 text-white outline-none focus:border-yellow-400/50"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 py-4 font-black text-slate-950 shadow-lg hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-slate-400 hover:text-white transition"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
