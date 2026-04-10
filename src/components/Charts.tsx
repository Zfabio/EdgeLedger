"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AssetRecord, deleteAssetRecord } from "@/lib/services";
import { AppSettings } from "@/lib/settings";
import * as ss from "simple-statistics";
import { Edit2, Trash2 } from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// Using shades of green + one amber for highlight as requested
const COLORS = ["#39ff14", "#32ff7e", "#2ecc71", "#27ae60", "#16a085", "#1abc9c", "#fbbf24"];

const CHART_TYPES = [
  { id: "overview",   label: "OVERVIEW",    desc: "Main system summary" },
  { id: "line",       label: "TREND",       desc: "Temporal performance" },
  { id: "area",       label: "STACKED",     desc: "Aggregate composition" },
  { id: "bar",        label: "DISTRO",      desc: "Categorical delta" },
  { id: "pie",        label: "ALLOC",       desc: "Static composition" },
  { id: "table",      label: "FS_VIEW",     desc: "Raw filesystem data" },
] as const;

type ChartId = typeof CHART_TYPES[number]["id"];

const layoutBase = (sym: string) => ({
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  font: { color: "#4a6567", family: "'JetBrains Mono', monospace", size: 10 },
  margin: { t: 10, r: 10, l: 45, b: 35 },
  xaxis: { 
    gridcolor: "#1a2c30", zerolinecolor: "#1a2c30", 
    tickfont: { color: "#3a5558" },
    linecolor: "#1a2c30"
  },
  yaxis: { 
    gridcolor: "#1a2c30", zerolinecolor: "#1a2c30", 
    tickfont: { color: "#3a5558" }, 
    tickprefix: sym,
    linecolor: "#1a2c30"
  },
  legend: { orientation: "h" as const, y: -0.2, font: { color: "#4a6567", size: 9 } },
  autosize: true,
});

export default function Charts({ records, settings, onEditRecord, onDeleteRecord }: { records: AssetRecord[]; settings: AppSettings; onEditRecord: (r: AssetRecord) => void; onDeleteRecord: () => void }) {
  const [activeChart, setActiveChart] = useState<ChartId>("overview");
  const sym = settings.currency.symbol;
  const cats = settings.categories;

  const x = records.map(r => r.month);
  const totals = records.map(r => r.total || 0);

  const forecastTrace = useMemo(() => {
    if (records.length < 2) return null;
    try {
      const data = records.map((_, i) => [i, records[i].total || 0] as [number, number]);
      const reg = ss.linearRegressionLine(ss.linearRegression(data));
      const extended = records.length + 3;
      const fx: string[] = [], fy: number[] = [];
      for (let i = 0; i < extended; i++) {
        if (i < records.length) { fx.push(records[i].month); }
        else {
          const d = new Date(records[records.length - 1].month + "-01");
          d.setMonth(d.getMonth() + (i - records.length + 1));
          fx.push(d.toISOString().slice(0, 7));
        }
        fy.push(Math.max(0, reg(i)));
      }
      return { x: fx, y: fy, type: "scatter" as const, mode: "lines" as const, name: "FORECAST", line: { color: "#f87171", dash: "dot" as const, width: 1 } };
    } catch { return null; }
  }, [records]);

  const lineTrace = {
    x, y: totals, type: "scatter" as const, mode: "lines+markers" as const,
    name: "NET_WORTH", line: { color: "#39ff14", width: 1.5, shape: "spline" as const },
    marker: { size: 4, color: "#39ff14" },
    fill: "tozeroy" as const, fillcolor: "rgba(57,255,20,0.03)",
  };

  const areaTraces = cats.map((cat, i) => ({
    x, y: records.map(r => r.values?.[cat] || 0),
    type: "scatter" as const, mode: "lines" as const,
    name: cat.toUpperCase(), stackgroup: "one",
    line: { color: COLORS[i % COLORS.length], width: 1 },
    fillcolor: COLORS[i % COLORS.length] + "30",
  }));

  const barTraces = cats.map((cat, i) => ({
    x, y: records.map(r => r.values?.[cat] || 0),
    type: "bar" as const, name: cat.toUpperCase(),
    marker: { color: COLORS[i % COLORS.length], opacity: 0.7 },
  }));

  const latest = records[records.length - 1];
  const pieTrace = {
    values: cats.map(c => latest?.values?.[c] || 0),
    labels: cats.map(c => c.toUpperCase()),
    type: "pie" as const, hole: 0.6,
    marker: { colors: COLORS, line: { color: "var(--bg2)", width: 2 } },
    textinfo: "none" as const,
    hoverinfo: "label+value+percent" as const,
    domain: { x: [0, 1], y: [0, 1] }
  };

  const totalNow = totals[totals.length - 1] || 0;
  const totalPrev = totals.length > 1 ? totals[totals.length - 2] : totalNow;
  const change = totalNow - totalPrev;
  const changePct = totalPrev > 0 ? (change / totalPrev) * 100 : 0;

  const plotConfig = { displayModeBar: false, responsive: true };

  const handleDelete = (id: string) => {
    if (confirm("CONFIRM_DELETE_RECORD?")) {
      deleteAssetRecord(id);
      onDeleteRecord();
    }
  };

  const renderView = () => {
    const base = layoutBase(sym);
    switch (activeChart) {
      case "line":
        return (
          <div className="panel" style={{ height: "400px" }}>
            <div className="panel-header"><div className="panel-dot" /> TREND_ANALYSIS.LOG</div>
            <Plot data={forecastTrace ? [lineTrace, forecastTrace] : [lineTrace]} layout={{ ...base, margin: { t: 30, r: 20, l: 60, b: 50 } }} useResizeHandler config={plotConfig} className="w-full h-full" />
          </div>
        );
      case "area":
        return (
          <div className="panel" style={{ height: "400px" }}>
            <div className="panel-header"><div className="panel-dot" /> COMPOSITION_TIME_SERIES.LOG</div>
            <Plot data={areaTraces} layout={{ ...base, margin: { t: 30, r: 20, l: 60, b: 50 } }} useResizeHandler config={plotConfig} className="w-full h-full" />
          </div>
        );
      case "bar":
        return (
          <div className="panel" style={{ height: "400px" }}>
            <div className="panel-header"><div className="panel-dot" /> DELTA_DISTRIBUTION.LOG</div>
            <Plot data={barTraces} layout={{ ...base, barmode: "stack", margin: { t: 30, r: 20, l: 60, b: 50 } }} useResizeHandler config={plotConfig} className="w-full h-full" />
          </div>
        );
      case "pie":
        return (
          <div className="panel" style={{ height: "400px" }}>
            <div className="panel-header"><div className="panel-dot" /> INSTANT_ALLOCATION.MAP</div>
            <Plot data={[pieTrace]} layout={{ ...base, showlegend: true, margin: { t: 20, r: 20, l: 20, b: 60 } }} useResizeHandler config={plotConfig} className="w-full h-full" />
          </div>
        );
      case "table":
        return null;
      case "overview":
      default:
        return (
          <div className="grid-2">
            <div className="panel" style={{ height: "320px" }}>
              <div className="panel-header"><div className="panel-dot" /> PERFORMANCE.LOG</div>
              <Plot data={forecastTrace ? [lineTrace, forecastTrace] : [lineTrace]} layout={base} useResizeHandler config={plotConfig} className="w-full h-full" />
            </div>
            <div className="panel" style={{ height: "320px" }}>
              <div className="panel-header"><div className="panel-dot" /> ALLOCATION.MAP</div>
              <Plot data={[pieTrace]} layout={{ ...base, showlegend: true, margin: { t: 15, r: 15, l: 15, b: 40 } }} useResizeHandler config={plotConfig} className="w-full h-full" />
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      
      {/* System Summary Bar */}
      <div className="grid-3">
        {[
          { label: "NET_WORTH_TOTAL", value: `${sym}${totalNow.toLocaleString()}`, color: "var(--green-text)" },
          { label: "DELTA_MOM", value: `${change >= 0 ? "+" : ""}${sym}${change.toLocaleString()}`, color: change >= 0 ? "var(--green-text)" : "var(--red)" },
          { label: "CHANGE_PCT", value: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`, color: changePct >= 0 ? "var(--green-text)" : "var(--red)" },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* View Selector */}
      <div className="panel">
        <div className="panel-header"><div className="panel-dot" /> SELECT_SYSTEM_VIEW</div>
        <div style={{ padding: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {CHART_TYPES.map(ct => (
            <button
              key={ct.id}
              onClick={() => setActiveChart(ct.id)}
              className={`t-btn ${activeChart === ct.id ? "active" : ""}`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Display */}
      {renderView()}

      {/* Filesystem Table View */}
      <div className="panel">
        <div className="panel-header"><div className="panel-dot" /> DATABASE_FS_WALK</div>
        <div style={{ overflowX: "auto" }}>
          <table className="t-table">
            <thead>
              <tr>
                <th>MONTH</th>
                {cats.map(c => <th key={c}>{c.toUpperCase()}</th>)}
                <th style={{ color: "var(--green-text)" }}>TOTAL</th>
                <th style={{ textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {[...records].reverse().map(r => (
                <tr key={r.id}>
                  <td>{r.month}</td>
                  {cats.map(c => (
                    <td key={c}>
                      {sym}{(r.values?.[c] || 0).toLocaleString()}
                    </td>
                  ))}
                  <td style={{ color: "var(--green-text)", fontWeight: 600 }}>
                    {sym}{(r.total || 0).toLocaleString()}
                  </td>
                  <td style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                    <button 
                      onClick={() => onEditRecord(r)} 
                      className="t-btn" 
                      style={{ padding: "2px 6px", borderColor: "var(--muted)" }}
                      title="EDIT_RECORD"
                    >
                      <Edit2 size={10} />
                    </button>
                    <button 
                      onClick={() => r.id && handleDelete(r.id)} 
                      className="t-btn danger" 
                      style={{ padding: "2px 6px" }}
                      title="DELETE_RECORD"
                    >
                      <Trash2 size={10} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
