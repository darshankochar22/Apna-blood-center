"use client";
import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const ok = login(email, password);
      if (!ok) setError("Invalid email or password.");
      setLoading(false);
    }, 600); 
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-white">Apna Blood Center</h1>
          <p className="text-sm text-white/30 mt-1">Sign in to your CRM</p>
        </div>

        <div className="border border-white/10 rounded-2xl p-6">

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bloodcenter.in"
                required
                className="w-full border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/10 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/10 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            
          </form>
        </div>

      </div>
    </div>
  );
}