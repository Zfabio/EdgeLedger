"use client";

import { useState, useEffect } from "react";
import { getSettings, saveSettings, CURRENCIES, AppSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import { X, Plus, Trash2, ShieldCheck } from "lucide-react";

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [newCat, setNewCat] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddCategory = () => {
    const trimmed = newCat.trim();
    if (!trimmed || settings.categories.includes(trimmed)) return;
    setSettings(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    setNewCat("");
  };

  const handleRemoveCategory = (cat: string) => {
    if (settings.categories.length <= 1) return;
    setSettings(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }));
  };

  const handleCurrencyChange = (code: string) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) setSettings(prev => ({ ...prev, currency: { code: found.code, symbol: found.symbol } }));
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="panel" style={{ width: "100%", maxWidth: "500px", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div className="panel-header" style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div className="panel-dot" />
            SYSTEM_CONFIG.SYS
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto" }}>

          {/* Currency Section */}
          <div>
            <div className="prompt" style={{ fontSize: "0.68rem", color: "var(--green-text)", marginBottom: "8px", letterSpacing: "0.1em" }}>// SYSTEM_CURRENCY</div>
            <div style={{ position: "relative" }}>
              <select
                value={settings.currency.code}
                onChange={e => handleCurrencyChange(e.target.value)}
                className="t-input"
                style={{ appearance: "none", paddingRight: "30px" }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} — {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)", fontSize: "0.6rem" }}>▼</div>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <div className="prompt" style={{ fontSize: "0.68rem", color: "var(--green-text)", marginBottom: "8px", letterSpacing: "0.1em" }}>// DATA_CATEGORIES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
              {settings.categories.map(cat => (
                <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "3px" }}>
                  <span style={{ color: "var(--amber)", fontSize: "0.72rem" }}># {cat}</span>
                  {settings.categories.length > 1 && (
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      title="Remove category"
                      style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                placeholder="label_entry"
                className="t-input"
                style={{ flex: 1 }}
              />
              <button onClick={handleAddCategory} className="t-btn" style={{ padding: "0 12px" }}>
                <Plus size={12} /> ADD
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
            <button onClick={onClose} className="t-btn">DISCARD</button>
            <button onClick={handleSave} className="t-btn primary">
              <ShieldCheck size={12} /> {saved ? "CONFIG_SAVED" : "$ SAVE_SYS_CONFIG"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
