"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Plus, Download, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { AssetRecord, getAssetRecords } from "@/lib/services";
import { getSettings, AppSettings } from "@/lib/settings";
import DataEntryForm from "./DataEntryForm";
import SettingsPanel from "./SettingsPanel";
import Charts from "./Charts";
import Papa from "papaparse";

export function Dashboard() {
  const { logout } = useAuth();
  const [records, setRecords] = useState<AssetRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [now] = useState(new Date().toISOString().replace("T", " ").slice(0, 19));

  const fetchAll = () => {
    setRecords(getAssetRecords());
    setSettings(getSettings());
  };

  useEffect(() => { fetchAll(); }, []);

  const handleExportCSV = () => {
    const csv = Papa.unparse(records.map(r => ({
      month: r.month,
      ...Object.fromEntries(settings.categories.map(c => [c, r.values?.[c] || 0])),
      total: r.total
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `edgeledger_${settings.currency.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "0.6rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Logo width={140} />
          <span className="t-tag hide-mobile">v1.0</span>
          <span className="hide-mobile" style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{now}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => setShowSettings(true)} className="t-btn">
            <Settings size={12} /> <span className="hide-mobile">CONFIG</span>
          </button>
          <button onClick={handleExportCSV} className="t-btn">
            <Download size={12} /> <span className="hide-mobile">EXPORT</span>
          </button>
          <button onClick={() => setShowForm(true)} className="t-btn primary">
            <Plus size={12} /> <span className="hide-mobile">NEW_RECORD</span>
          </button>
          <button onClick={logout} className="t-btn danger">
            <LogOut size={12} /> <span className="hide-mobile">LOCK</span>
          </button>
        </div>
      </header>

      {/* Shell info bar */}
      <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "0.4rem 1.25rem", display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.68rem", color: "var(--muted)" }}>
        <span><span style={{ color: "var(--green-text)" }}>currency:</span> {settings.currency.symbol} {settings.currency.code}</span>
        <span><span style={{ color: "var(--green-text)" }}>categories:</span> {settings.categories.length}</span>
        <span><span style={{ color: "var(--green-text)" }}>entries:</span> {records.length}</span>
        <span className="blink">_</span>
      </div>

      {/* Main content grid */}
      <main style={{ flex: 1, padding: "1.25rem", maxWidth: "1600px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {records.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 1rem", border: "1px solid var(--border)", borderRadius: "var(--panel-radius)", background: "var(--bg2)" }}>
            <div className="glow-green text-lg mb-3" style={{ letterSpacing: "0.1em" }}>$ ls records/</div>
            <div style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>No filesystem records found. System initialized.</div>
            <button onClick={() => setShowForm(true)} className="t-btn primary" style={{ padding: "8px 16px" }}>$ init new_entry</button>
          </div>
        ) : (
          <Charts records={records} settings={settings} />
        )}
      </main>

      {showForm && (
        <DataEntryForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchAll(); }}
        />
      )}
      {showSettings && (
        <SettingsPanel
          onClose={() => { setShowSettings(false); fetchAll(); }}
        />
      )}
    </div>
  );
}
