"use client";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white">
            <Image src="/logo.png" alt="Apna Blood Centre" width={54} height={54} priority />
          </div>
          <h1 className="text-[22px] font-semibold text-white">Login to Admin Panel</h1>
          <p className="mt-2 text-[12px] font-semibold tracking-[0.08em] text-white/40">
            LOGIN WITH EMAIL
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bloodcenter.in"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/30 focus:bg-white/8 focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/30 focus:bg-white/8 focus:ring-1 focus:ring-white/20"
            />
          </div>

          <label className="flex items-center gap-2 pt-0.5 text-sm text-white/40 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/20"
            />
            Remember Me
          </label>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}