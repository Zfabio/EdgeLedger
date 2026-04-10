"use client";

import { useState, useMemo } from "react";
import { AssetRecord, saveBatchAssetRecords } from "@/lib/services";
import { AppSettings } from "@/lib/settings";
import { X, ChevronRight, ChevronLeft, Database, CheckSquare } from "lucide-react";

interface ImportWizardProps {
  data: { headers: string[]; rows: any[] };
  settings: AppSettings;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportWizard({ data, settings, onClose, onSuccess }: ImportWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mapping, setMapping] = useState<Record<string, string>>(() => {
    // Attempt auto-mapping
    const initial: Record<string, string> = {};
    const lowerHeaders = data.headers.map(h => h.toLowerCase().trim());
    
    // Find month
    const monthIdx = lowerHeaders.findIndex(h => h === "month" || h === "date" || h === "period");
    if (monthIdx !== -1) initial["month"] = data.headers[monthIdx];

    // Find categories
    settings.categories.forEach(cat => {
      const idx = lowerHeaders.findIndex(h => h === cat.toLowerCase().trim());
      if (idx !== -1) initial[cat] = data.headers[idx];
    });

    return initial;
  });

  const previewData = useMemo(() => {
    return data.rows.slice(0, 5).map(row => {
      const month = row[mapping["month"]] || "ERR_NO_DATE";
      const vals: Record<string, number> = {};
      settings.categories.forEach(cat => {
        const raw = row[mapping[cat]];
        // Clean numeric value: remove commas, currency symbols, etc.
        const clean = typeof raw === "string" ? raw.replace(/[^0-9.-]/g, "") : raw;
        vals[cat] = Number(clean) || 0;
      });
      return { month, values: vals };
    });
  }, [data.rows, mapping, settings.categories]);

  const handleExecute = () => {
    if (!mapping["month"]) {
      alert("ERR: MONTH_COLUMN_MAPPING_REQUIRED");
      return;
    }

    const imported: AssetRecord[] = data.rows.map(row => {
      const month = row[mapping["month"]];
      if (!month) return null;
      
      const vals: Record<string, number> = {};
      settings.categories.forEach(cat => {
        const raw = row[mapping[cat]];
        const clean = typeof raw === "string" ? raw.replace(/[^0-9.-]/g, "") : raw;
        vals[cat] = Number(clean) || 0;
      });
      return { month, values: vals } as AssetRecord;
    }).filter(r => r !== null) as AssetRecord[];

    if (imported.length > 0) {
      saveBatchAssetRecords(imported);
      onSuccess();
    } else {
      alert("ERR: ZERO_VALID_RECORDS_PROCESSED");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className="panel" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div className="panel-header" style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="panel-dot" />
            IMPORT_WIZARD.EXE [STEP_0{step}/02]
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {step === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <div className="prompt" style={{ fontSize: "0.8rem", color: "var(--green-text)", marginBottom: "1rem" }}>// 01_COLUMN_MAPPING_PROTOCOL</div>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1.5rem" }}>Map internal system parameters to detected CSV headers.</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Month Mapping */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: "10px" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--amber)" }}>&gt; REQUIRED: month_id</div>
                    <select 
                      className="t-input" 
                      value={mapping["month"] || ""} 
                      onChange={e => setMapping(prev => ({ ...prev, month: e.target.value }))}
                    >
                      <option value="">-- SELECT HEADER --</option>
                      {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div style={{ height: "1px", background: "var(--border)", margin: "8px 0" }} />

                  {/* Category Mappings */}
                  {settings.categories.map(cat => (
                    <div key={cat} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: "10px" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text)" }}>&gt; category: {cat.toLowerCase()}</div>
                      <select 
                        className="t-input" 
                        value={mapping[cat] || ""} 
                        onChange={e => setMapping(prev => ({ ...prev, [cat]: e.target.value }))}
                      >
                        <option value="">-- IGNORE / NONE --</option>
                        {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <div className="prompt" style={{ fontSize: "0.8rem", color: "var(--green-text)", marginBottom: "1rem" }}>// 02_DATA_INTEGRITY_PREVIEW</div>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1.5rem" }}>Reviewing head_of_buffer (first 5 records). Confirming alignment.</p>
                
                <div className="panel" style={{ background: "var(--bg)", overflowX: "auto" }}>
                  <table className="t-table">
                    <thead>
                      <tr>
                        <th>MONTH</th>
                        {settings.categories.map(c => <th key={c}>{c.slice(0, 4).toUpperCase()}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i}>
                          <td>{row.month}</td>
                          {settings.categories.map(c => <td key={c}>{row.values[c].toLocaleString()}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: "10px", fontSize: "0.65rem", color: "var(--muted)", textAlign: "center" }}>
                  TOTAL_LOAD_RECORDS: {data.rows.length}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: "12px" }}>
          <button onClick={onClose} className="t-btn danger">TERMINATE</button>
          
          <div style={{ display: "flex", gap: "12px" }}>
            {step === 2 && (
              <button onClick={() => setStep(1)} className="t-btn">
                <ChevronLeft size={14} /> BACK
              </button>
            )}
            
            {step === 1 ? (
              <button 
                onClick={() => setStep(2)} 
                disabled={!mapping["month"]}
                className="t-btn primary"
              >
                PROCEED <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={handleExecute} className="t-btn primary" style={{ background: "var(--green-dim)", color: "#000" }}>
                <Database size={14} /> EXECUTE_IMPORT
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
