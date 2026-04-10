"use client";

import { useAuth } from "@/context/AuthContext";
import { Dashboard } from "@/components/Dashboard";
import { Lock, KeyRound } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { isAuthenticated, loading, hasPassword, login, setPassword } = useAuth();

  const [password, setPass] = useState("");
  const [confirmPassword, setConfirmPass] = useState("");
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) return <Dashboard />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hasPassword) {
      // First time — create password
      if (password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setPassword(password);
    } else {
      // Returning user — check password
      const ok = login(password);
      if (!ok) setError("Incorrect password. Please try again.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-[0_0_20px_rgba(37,99,235,0.5)]">
            E
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">EdgeLedger</h1>
          <p className="text-slate-400 mt-2 text-sm">
            {hasPassword ? "Enter your master password to unlock." : "Create a master password to protect your data."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {hasPassword ? "Master Password" : "Create Password"}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white tracking-widest text-lg"
            />
          </div>

          {!hasPassword && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white tracking-widest text-lg"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors mt-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            {hasPassword ? "Unlock" : "Create & Enter"}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-6">
          Your data stays on this device. No accounts or cloud setup required.
        </p>
      </div>
    </main>
  );
}
