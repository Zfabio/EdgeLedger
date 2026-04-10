"use client";

import { useState, useEffect } from "react";
import { addAssetRecord, updateAssetRecord, deleteAssetRecord, AssetRecord } from "@/lib/services";
import { getSettings } from "@/lib/settings";
import { X, Save, AlertCircle, Trash2 } from "lucide-react";

export default function DataEntryForm({ 
  onClose, 
  onSuccess, 
  editRecord 
}: { 
  onClose: () => void; 
  onSuccess: () => void;
  editRecord?: AssetRecord | null;
}) {
  const settings = getSettings();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.categories.map(c => [c, ""]))
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (editRecord) {
      setMonth(editRecord.month);
      setValues(Object.fromEntries(
        settings.categories.map(c => [c, String(editRecord.values?.[c] || "")])
      ));
    }
  }, [editRecord, settings.categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numericValues = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, Number(v) || 0])
    );
    
    const total = Object.values(numericValues).reduce((a, b) => a + b, 0);
    // Allowing zero if editing (maybe they want to zero it out?), but usually should have some value
    if (total === 0 && !editRecord) {
      setError("ERR: ENTRY_TOTAL_MUST_EXCEED_ZERO");
      return;
    }

    try {
      if (editRecord?.id) {
        updateAssetRecord(editRecord.id, month, numericValues);
      } else {
        addAssetRecord(month, numericValues);
      }
      onSuccess();
    } catch {
      setError("ERR: FS_WRITE_FAILURE");
    }
  };

  const handleDelete = () => {
    if (editRecord?.id && confirm("CONFIRM_PERMANENT_DELETE?")) {
      deleteAssetRecord(editRecord.id);
      onSuccess();
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="panel" style={{ width: "100%", maxWidth: "440px" }}>
        <div className="panel-header" style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div className="panel-dot" />
            {editRecord ? "EDIT_RECORD_DATA" : "INIT_NEW_RECORD.EXE"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <div className="prompt" style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: "4px" }}>target_month</div>
            <input
              type="month"
              required
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="t-input"
            />
          </div>

          <div className="grid-2">
            {settings.categories.map(cat => (
              <div key={cat}>
                <div className="prompt" style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: "4px" }}>{cat.toLowerCase()}</div>
                <input
                  type="number"
                  step="any"
                  value={values[cat] || ""}
                  onChange={e => setValues(prev => ({ ...prev, [cat]: e.target.value }))}
                  placeholder="0.00"
                  className="t-input"
                />
              </div>
            ))}
          </div>

          {error && (
            <div style={{ fontSize: "0.7rem", color: "var(--red)", padding: "8px", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "3px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={12} /> {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "10px" }}>
            {editRecord ? (
              <button type="button" onClick={handleDelete} className="t-btn danger" style={{ borderColor: "#6b3030" }}>
                <Trash2 size={12} /> DELETE
              </button>
            ) : <div />}
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={onClose} className="t-btn">DISCARD</button>
              <button type="submit" className="t-btn primary">
                <Save size={12} /> {editRecord ? "$ COMMIT_CHANGE" : "$ COMMIT_RECORD"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
