"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Plus, Download, Settings } from "lucide-react";
import { useEffect, useState } from "react";
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
      <header style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "0.6rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="glow-green" style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "0.05em" }}>EDGE_LEDGER</span>
          <span className="term-tag">v1.0</span>
          <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{now}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => { setShowSettings(true); }} className="term-btn" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}>
            <Settings size={12} /> CONFIG
          </button>
          <button onClick={handleExportCSV} className="term-btn" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}>
            <Download size={12} /> EXPORT
          </button>
          <button onClick={() => setShowForm(true)} className="term-btn primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}>
            <Plus size={12} /> NEW_RECORD
          </button>
          <button onClick={logout} className="term-btn danger" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}>
            <LogOut size={12} /> LOCK
          </button>
        </div>
      </header>

      {/* Shell info bar */}
      <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "0.35rem 1.25rem", display: "flex", gap: "1.5rem", fontSize: "0.65rem", color: "var(--muted)" }}>
        <span><span style={{ color: "var(--green-text)" }}>currency:</span> {settings.currency.symbol} {settings.currency.code}</span>
        <span><span style={{ color: "var(--green-text)" }}>categories:</span> {settings.categories.length}</span>
        <span><span style={{ color: "var(--green-text)" }}>records:</span> {records.length}</span>
        <span className="cursor" />
      </div>

      {/* Main */}
      <main style={{ flex: 1, padding: "1.25rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {records.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: "4px" }}>
            <div className="glow-green text-lg mb-3">$ ls records/</div>
            <div style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>No records found. Initialize your first entry.</div>
            <button onClick={() => setShowForm(true)} className="term-btn primary">$ init new_record</button>
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
