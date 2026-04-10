"use client";

import { useAuth } from "@/context/AuthContext";
import { Dashboard } from "@/components/Dashboard";
import { useState } from "react";
import Logo from "@/components/Logo";

export default function Home() {
  const { isAuthenticated, loading, hasPassword, login, setPassword } = useAuth();
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span className="glow-green" style={{ fontSize: "0.85rem", letterSpacing: "0.15em" }}>
          BOOTING<span className="blink">_</span>
        </span>
      </div>
    );
  }

  if (isAuthenticated) return <Dashboard />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    if (!hasPassword) {
      if (password.length < 4) { setError("ERR: passphrase too short (min 4)"); setBusy(false); return; }
      if (password !== confirm) { setError("ERR: passphrases do not match"); setBusy(false); return; }
      setPassword(password);
    } else {
      const ok = login(password);
      if (!ok) setError("ERR: authentication failed");
    }
    setBusy(false);
  };

  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Logo block */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-block", marginBottom: "8px" }}>
            <Logo width={220} />
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.12em" }}>
            // SECURE TERMINAL v1.0.0
          </div>
        </div>

        {/* Auth panel */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-dot" />
            {hasPassword ? "AUTH_REQUIRED" : "INIT_VAULT"}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <div className="prompt" style={{ color: "var(--muted)", fontSize: "0.68rem", marginBottom: "4px" }}>
                passphrase
              </div>
              <input
                type="password"
                required
                autoFocus
                className="t-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPass(e.target.value)}
              />
            </div>

            {!hasPassword && (
              <div>
                <div className="prompt" style={{ color: "var(--muted)", fontSize: "0.68rem", marginBottom: "4px" }}>
                  confirm
                </div>
                <input
                  type="password"
                  required
                  className="t-input"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div style={{ fontSize: "0.72rem", color: "var(--red)", padding: "6px 10px", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "3px", background: "rgba(248,113,113,0.05)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={busy} className="t-btn primary" style={{ width: "100%", justifyContent: "center", padding: "8px", fontSize: "0.78rem" }}>
              {hasPassword ? "$ AUTHENTICATE" : "$ INITIALIZE VAULT"}
            </button>
          </form>
        </div>

        <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", textAlign: "center", letterSpacing: "0.06em" }}>
          DATA STORED LOCALLY — NO ACCOUNTS, NO CLOUD
        </div>
      </div>
    </main>
  );
}
