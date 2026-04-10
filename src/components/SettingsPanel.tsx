"use client";

import { useState, useEffect } from "react";
import { getSettings, saveSettings, CURRENCIES, AppSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import { X, Plus, Trash2 } from "lucide-react";

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
    setSettings(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }));
  };

  const handleCurrencyChange = (code: string) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) setSettings(prev => ({ ...prev, currency: { code: found.code, symbol: found.symbol } }));
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="term-panel" style={{ width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="term-panel-header" style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className="dot" />
            CONFIG.SYS
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Currency */}
          <section>
            <div className="text-xs mb-2" style={{ color: "var(--green-text)", letterSpacing: "0.1em" }}>
              // CURRENCY
            </div>
            <select
              value={settings.currency.code}
              onChange={e => handleCurrencyChange(e.target.value)}
              className="term-input"
              style={{ width: "100%", appearance: "none" }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} style={{ background: "var(--bg2)" }}>
                  {c.symbol} — {c.name} ({c.code})
                </option>
              ))}
            </select>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Selected: <span style={{ color: "var(--amber)" }}>{settings.currency.symbol} ({settings.currency.code})</span>
            </div>
          </section>

          {/* Categories */}
          <section>
            <div className="text-xs mb-2" style={{ color: "var(--green-text)", letterSpacing: "0.1em" }}>
              // ASSET CATEGORIES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {settings.categories.map(cat => (
                <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.4rem 0.75rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px" }}>
                  <span className="glow-green text-xs">&gt; {cat}</span>
                  <button
                    onClick={() => handleRemoveCategory(cat)}
                    className="term-btn danger"
                    style={{ padding: "0.1rem 0.4rem", fontSize: "0.65rem" }}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                placeholder="new_category"
                className="term-input"
                style={{ flex: 1 }}
              />
              <button onClick={handleAddCategory} className="term-btn" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Plus size={12} /> ADD
              </button>
            </div>
          </section>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <button onClick={onClose} className="term-btn">DISCARD</button>
            <button onClick={handleSave} className="term-btn primary">
              {saved ? "✓ SAVED" : "$ SAVE CONFIG"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
