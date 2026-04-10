"use client";

import { useState } from "react";
import { addAssetRecord } from "@/lib/services";
import { getSettings } from "@/lib/settings";
import { X } from "lucide-react";

export default function DataEntryForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const settings = getSettings();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.categories.map(c => [c, ""]))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValues = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, Number(v) || 0])
    );
    addAssetRecord(month, numericValues);
    onSuccess();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="term-panel" style={{ width: "100%", maxWidth: "480px" }}>
        <div className="term-panel-header" style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className="dot" />
            NEW_RECORD.JSON
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "0" }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <div className="prompt text-xs mb-1" style={{ color: "var(--muted)" }}>month</div>
            <input
              type="month"
              required
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="term-input"
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {settings.categories.map(cat => (
              <div key={cat} style={{ gridColumn: settings.categories.length % 2 !== 0 && cat === settings.categories[settings.categories.length - 1] ? "span 2" : undefined }}>
                <div className="prompt text-xs mb-1" style={{ color: "var(--muted)" }}>
                  {cat.toLowerCase()} ({settings.currency.symbol})
                </div>
                <input
                  type="number"
                  value={values[cat] || ""}
                  onChange={e => setValues(prev => ({ ...prev, [cat]: e.target.value }))}
                  placeholder="0.00"
                  className="term-input"
                  style={{ width: "100%" }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="term-btn">CANCEL</button>
            <button type="submit" className="term-btn primary">$ COMMIT RECORD</button>
          </div>
        </form>
      </div>
    </div>
  );
}
