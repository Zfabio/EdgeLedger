"use client";

import { useAuth } from "@/context/AuthContext";
import { Dashboard } from "@/components/Dashboard";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const { isAuthenticated, loading, hasPassword, login, setPassword } = useAuth();
  const [password, setPass] = useState("");
  const [confirmPassword, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [typing, setTyping] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="glow-green text-lg">INITIALIZING SYSTEM<span className="cursor" /></span>
      </div>
    );
  }

  if (isAuthenticated) return <Dashboard />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!hasPassword) {
      if (password.length < 4) { setError("ERR: Passphrase too short (min 4 chars)"); return; }
      if (password !== confirmPassword) { setError("ERR: Passphrases do not match"); return; }
      setPassword(password);
    } else {
      const ok = login(password);
      if (!ok) setError("ERR: Authentication failed — incorrect passphrase");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-6">
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Header */}
        <div className="mb-8" style={{ textAlign: "center" }}>
          <div style={{ color: "var(--muted)", fontSize: "0.65rem", marginBottom: "1rem", letterSpacing: "0.1em" }}>
            // SECURE TERMINAL v1.0.0
          </div>
          <Image src="/logo.png" alt="EdgeLedger" width={220} height={60} style={{ objectFit: "contain", imageRendering: "pixelated", margin: "0 auto", filter: "drop-shadow(0 0 12px rgba(57,255,20,0.4))" }} />
          <div className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
            {hasPassword ? (
              <><span style={{ color: "var(--green)" }}>[LOCKED]</span> — Enter passphrase to authenticate</>
            ) : (
              <><span style={{ color: "var(--amber)" }}>[SETUP]</span> — Create a master passphrase</>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="term-panel">
          <div className="term-panel-header">
            <div className="dot" />
            {hasPassword ? "AUTH REQUIRED" : "INITIAL SETUP"}
          </div>
          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div className="text-xs mb-1 prompt" style={{ color: "var(--muted)" }}>
                passphrase
              </div>
              <input
                type="password"
                required
                className="term-input w-full"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPass(e.target.value); setTyping(true); }}
                onFocus={() => setTyping(true)}
                onBlur={() => setTyping(false)}
                style={{ width: "100%" }}
              />
            </div>
            {!hasPassword && (
              <div>
                <div className="text-xs mb-1 prompt" style={{ color: "var(--muted)" }}>
                  confirm passphrase
                </div>
                <input
                  type="password"
                  required
                  className="term-input w-full"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPass(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            )}
            {error && (
              <div style={{ color: "var(--red)", fontSize: "0.75rem", fontFamily: "inherit", padding: "0.5rem", border: "1px solid var(--red)", borderRadius: "4px", background: "rgba(248,113,113,0.05)" }}>
                {error}
              </div>
            )}
            <button type="submit" className="term-btn primary" style={{ width: "100%", padding: "0.6rem" }}>
              {hasPassword ? "$ AUTHENTICATE" : "$ CREATE VAULT"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-center" style={{ color: "var(--text-dim)" }}>
          Data stored locally on this device. No cloud services.
        </div>
      </div>
    </main>
  );
}
