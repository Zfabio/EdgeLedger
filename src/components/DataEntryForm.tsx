"use client";

import { useState, useEffect } from "react";
import { addAssetRecord, updateAssetRecord, deleteAssetRecord, AssetRecord } from "@/lib/services";
import { getSettings, saveSettings } from "@/lib/settings";
import { X, Save, AlertCircle, Trash2, Plus } from "lucide-react";

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
  const [categories, setCategories] = useState<string[]>(settings.categories);
  const [values, setValues] = useState<Record<string, string>>({});
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Initial values based on current categories
    const initialValues: Record<string, string> = {};
    categories.forEach(c => {
      initialValues[c] = editRecord?.values?.[c] ? String(editRecord.values[c]) : "";
    });
    
    if (editRecord) {
      setMonth(editRecord.month);
    }
    setValues(initialValues);
  }, [editRecord, categories]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories(prev => [...prev, trimmed]);
    setValues(prev => ({ ...prev, [trimmed]: "" }));
    setNewCategory("");
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(prev => prev.filter(c => c !== cat));
    setValues(prev => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numericValues = Object.fromEntries(
      categories.map(cat => [cat, Number(values[cat]) || 0])
    );
    
    const total = Object.values(numericValues).reduce((a, b) => a + b, 0);
    if (total === 0 && !editRecord) {
      setError("ERR: ENTRY_TOTAL_MUST_EXCEED_ZERO");
      return;
    }

    try {
      // Persist the current categories list to settings
      saveSettings({ ...settings, categories });

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
      <div className="panel" style={{ width: "100%", maxWidth: "480px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div className="panel-header" style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div className="panel-dot" />
            {editRecord ? "EDIT_RECORD_DATA" : "INIT_NEW_RECORD.EXE"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
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

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="prompt" style={{ fontSize: "0.68rem", color: "var(--green-text)", letterSpacing: "0.05em" }}>// DATA_INPUT_CHANNELS</div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {categories.map(cat => (
                <div key={cat} style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div className="prompt" style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{cat.toLowerCase()}</div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCategory(cat)}
                      style={{ background: "none", border: "none", color: "var(--red)", opacity: 0.5, cursor: "pointer", padding: "2px" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
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

            <div style={{ display: "flex", gap: "8px", marginTop: "8px", borderTop: "1px dashed var(--border)", paddingTop: "12px" }}>
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                placeholder="new_category_label"
                className="t-input"
                style={{ flex: 1, fontSize: "0.75rem" }}
              />
              <button type="button" onClick={handleAddCategory} className="t-btn" style={{ padding: "0 10px" }}>
                <Plus size={12} /> ADD
              </button>
            </div>
          </div>

          {error && (
            <div style={{ fontSize: "0.7rem", color: "var(--red)", padding: "8px", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "3px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={12} /> {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
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

