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
    <div className="min-h-screen flex items-center justify-center bg-[#f1f3f7] px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-[#dfe3ea] bg-white px-7 py-8 shadow-[0_16px_40px_rgba(20,27,45,0.08)]">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#e8ebf1] bg-white">
            <Image src="/logo.png" alt="Apna Blood Centre" width={54} height={54} priority />
          </div>
          <h1 className="text-[22px] font-semibold text-[#233248]">Login to Admin Panel</h1>
          <p className="mt-2 text-[12px] font-semibold tracking-[0.08em] text-[#8590a3]">
            LOGIN WITH EMAIL
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#30425e]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bloodcenter.in"
              required
              className="w-full rounded-md border border-[#d5dbe5] px-3.5 py-2.5 text-sm text-[#243550] outline-none transition focus:border-[#7f8da3] focus:ring-2 focus:ring-[#e8edf5]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#30425e]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full rounded-md border border-[#d5dbe5] px-3.5 py-2.5 text-sm text-[#243550] outline-none transition focus:border-[#7f8da3] focus:ring-2 focus:ring-[#e8edf5]"
            />
          </div>

          <label className="flex items-center gap-2 pt-0.5 text-sm text-[#51607a]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[#c7cfdd] text-[#2f4f84] focus:ring-[#2f4f84]"
            />
            Remember Me
          </label>

          {error && (
            <p className="rounded-md border border-[#f4c7ca] bg-[#fff4f5] px-3 py-2 text-xs text-[#a24049]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#2f4f84] py-2.5 text-sm font-semibold text-white transition hover:bg-[#284575] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}