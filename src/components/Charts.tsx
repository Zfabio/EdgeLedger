"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AssetRecord } from "@/lib/services";
import { AppSettings } from "@/lib/settings";
import * as ss from "simple-statistics";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const COLORS = ["#39ff14", "#22d3ee", "#fbbf24", "#f87171", "#a78bfa", "#34d399", "#fb7185", "#818cf8"];

const CHART_TYPES = [
  { id: "overview",   label: "OVERVIEW",    desc: "Net worth + allocation" },
  { id: "line",       label: "LINE",         desc: "Net worth over time" },
  { id: "area",       label: "AREA",         desc: "Stacked area by category" },
  { id: "bar_stack",  label: "BAR_STACK",    desc: "Stacked bars by category" },
  { id: "bar_group",  label: "BAR_GROUP",    desc: "Grouped bars by category" },
  { id: "pie",        label: "PIE",          desc: "Latest allocation pie" },
  { id: "scatter",    label: "SCATTER",      desc: "Category scatter plot" },
  { id: "table",      label: "TABLE",        desc: "Raw data table" },
] as const;

type ChartId = typeof CHART_TYPES[number]["id"];

const layoutBase = (sym: string) => ({
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  font: { color: "#4a6568", family: "JetBrains Mono, monospace", size: 11 },
  margin: { t: 20, r: 20, l: 60, b: 55 },
  xaxis: { gridcolor: "#1e2d30", zerolinecolor: "#1e2d30", tickfont: { color: "#3d5a5e" } },
  yaxis: { gridcolor: "#1e2d30", zerolinecolor: "#1e2d30", tickfont: { color: "#3d5a5e" }, tickprefix: sym },
  legend: { orientation: "h" as const, y: -0.28, font: { color: "#4a6568" } },
  autosize: true,
});

export default function Charts({ records, settings }: { records: AssetRecord[]; settings: AppSettings }) {
  const [activeChart, setActiveChart] = useState<ChartId>("overview");
  const sym = settings.currency.symbol;
  const cats = settings.categories;

  const x = records.map(r => r.month);
  const totals = records.map(r => r.total || 0);

  const forecastTrace = useMemo(() => {
    if (records.length < 2) return null;
    const data = records.map((_, i) => [i, records[i].total || 0] as [number, number]);
    const reg = ss.linearRegressionLine(ss.linearRegression(data));
    const extended = records.length + 3;
    const fx: string[] = [], fy: number[] = [];
    for (let i = 0; i < extended; i++) {
      if (i < records.length) { fx.push(records[i].month); }
      else {
        const d = new Date(records[records.length - 1].month + "-01");
        d.setMonth(d.getMonth() + (i - records.length + 1));
        fx.push(d.toISOString().slice(0, 7) + "~");
      }
      fy.push(Math.max(0, reg(i)));
    }
    return { x: fx, y: fy, type: "scatter" as const, mode: "lines" as const, name: "FORECAST", line: { color: "#f87171", dash: "dot" as const, width: 1.5 } };
  }, [records]);

  const lineTrace = {
    x, y: totals, type: "scatter" as const, mode: "lines+markers" as const,
    name: "NET_WORTH", line: { color: "#39ff14", width: 2, shape: "spline" as const },
    marker: { size: 5, color: "#1a7a08" },
    fill: "tozeroy" as const, fillcolor: "rgba(57,255,20,0.05)",
  };

  const areaTraces = cats.map((cat, i) => ({
    x, y: records.map(r => r.values?.[cat] || 0),
    type: "scatter" as const, mode: "lines" as const,
    name: cat.toUpperCase(), stackgroup: "one",
    line: { color: COLORS[i % COLORS.length], width: 1 },
    fillcolor: COLORS[i % COLORS.length] + "40",
  }));

  const barStackTraces = cats.map((cat, i) => ({
    x, y: records.map(r => r.values?.[cat] || 0),
    type: "bar" as const, name: cat.toUpperCase(),
    marker: { color: COLORS[i % COLORS.length], opacity: 0.85 },
  }));

  const barGroupTraces = cats.map((cat, i) => ({
    x, y: records.map(r => r.values?.[cat] || 0),
    type: "bar" as const, name: cat.toUpperCase(),
    marker: { color: COLORS[i % COLORS.length], opacity: 0.85 },
  }));

  const scatterTraces = cats.map((cat, i) => ({
    x, y: records.map(r => r.values?.[cat] || 0),
    type: "scatter" as const, mode: "markers" as const,
    name: cat.toUpperCase(),
    marker: { color: COLORS[i % COLORS.length], size: 10, opacity: 0.9 },
  }));

  const latest = records[records.length - 1];
  const pieTrace = {
    values: cats.map(c => latest?.values?.[c] || 0),
    labels: cats.map(c => c.toUpperCase()),
    type: "pie" as const, hole: 0.5,
    marker: { colors: COLORS },
    textinfo: "label+percent" as const,
    textfont: { family: "JetBrains Mono", size: 10 },
    hoverinfo: "label+value" as const,
  };

  const totalNow = totals[totals.length - 1] || 0;
  const totalPrev = totals.length > 1 ? totals[totals.length - 2] : totalNow;
  const change = totalNow - totalPrev;
  const changePct = totalPrev > 0 ? (change / totalPrev) * 100 : 0;

  const plotConfig = { displayModeBar: false, responsive: true };
  const plotStyle = { height: "300px" };

  const renderChart = () => {
    const base = layoutBase(sym);
    switch (activeChart) {
      case "line":
        return (
          <div className="term-panel">
            <div className="term-panel-header"><div className="dot" /> NET_WORTH.LINE</div>
            <div style={plotStyle}>
              <Plot data={forecastTrace ? [lineTrace, forecastTrace] : [lineTrace]}
                layout={base} useResizeHandler config={plotConfig} className="w-full h-full" />
            </div>
          </div>
        );
      case "area":
        return (
          <div className="term-panel">
            <div className="term-panel-header"><div className="dot" /> CATEGORY_HISTORY.AREA</div>
            <div style={plotStyle}>
              <Plot data={areaTraces} layout={base} useResizeHandler config={plotConfig} className="w-full h-full" />
            </div>
          </div>
        );
      case "bar_stack":
        return (
          <div className="term-panel">
            <div className="term-panel-header"><div className="dot" /> CATEGORY_HISTORY.BAR_STACK</div>
            <div style={plotStyle}>
              <Plot data={barStackTraces} layout={{ ...base, barmode: "stack" }}
                useResizeHandler config={plotConfig} className="w-full h-full" />
            </div>
          </div>
        );
      case "bar_group":
        return (
          <div className="term-panel">
            <div className="term-panel-header"><div className="dot" /> CATEGORY_HISTORY.BAR_GROUP</div>
            <div style={plotStyle}>
              <Plot data={barGroupTraces} layout={{ ...base, barmode: "group" }}
                useResizeHandler config={plotConfig} className="w-full h-full" />
            </div>
          </div>
        );
      case "pie":
        return (
          <div className="term-panel">
            <div className="term-panel-header"><div className="dot" /> ALLOCATION.PIE</div>
            <div style={plotStyle}>
              <Plot data={[pieTrace]} layout={{ ...base, margin: { t: 10, b: 30, l: 10, r: 10 }, showlegend: true }}
                useResizeHandler config={plotConfig} className="w-full h-full" />
            </div>
          </div>
        );
      case "scatter":
        return (
          <div className="term-panel">
            <div className="term-panel-header"><div className="dot" /> CATEGORY_SCATTER</div>
            <div style={plotStyle}>
              <Plot data={scatterTraces} layout={base} useResizeHandler config={plotConfig} className="w-full h-full" />
            </div>
          </div>
        );
      case "table":
        return null;
      case "overview":
      default:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
              <div className="term-panel">
                <div className="term-panel-header"><div className="dot" /> NET_WORTH.LOG</div>
                <div style={plotStyle}>
                  <Plot data={forecastTrace ? [lineTrace, forecastTrace] : [lineTrace]}
                    layout={base} useResizeHandler config={plotConfig} className="w-full h-full" />
                </div>
              </div>
              <div className="term-panel">
                <div className="term-panel-header"><div className="dot" /> ALLOCATION.PIE</div>
                <div style={plotStyle}>
                  <Plot data={[pieTrace]} layout={{ ...base, margin: { t: 10, b: 10, l: 10, r: 10 }, showlegend: false }}
                    useResizeHandler config={plotConfig} className="w-full h-full" />
                </div>
              </div>
            </div>
            <div className="term-panel">
              <div className="term-panel-header"><div className="dot" /> CATEGORY_HISTORY.BAR</div>
              <div style={{ height: "260px" }}>
                <Plot data={barStackTraces} layout={{ ...base, barmode: "stack" }}
                  useResizeHandler config={plotConfig} className="w-full h-full" />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* Stat bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
        {[
          { label: "TOTAL_NET_WORTH", value: `${sym}${totalNow.toLocaleString()}`, color: "var(--green-text)" },
          { label: "MOM_CHANGE", value: `${change >= 0 ? "+" : ""}${sym}${change.toLocaleString()}`, color: change >= 0 ? "var(--green-text)" : "var(--red)" },
          { label: "MOM_PCT", value: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`, color: changePct >= 0 ? "var(--green-text)" : "var(--red)" },
        ].map(stat => (
          <div key={stat.label} className="term-panel" style={{ padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>{stat.label}</div>
            <div style={{ fontSize: "1.1rem", color: stat.color, fontWeight: 600 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Chart type selector */}
      <div className="term-panel">
        <div className="term-panel-header"><div className="dot" /> SELECT_CHART_TYPE</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.75rem" }}>
          {CHART_TYPES.map(ct => (
            <button
              key={ct.id}
              onClick={() => setActiveChart(ct.id)}
              title={ct.desc}
              className="term-btn"
              style={{
                fontSize: "0.7rem",
                padding: "0.25rem 0.6rem",
                background: activeChart === ct.id ? "var(--green-dim)" : "transparent",
                color: activeChart === ct.id ? "#000" : "var(--green-text)",
                boxShadow: activeChart === ct.id ? "0 0 10px rgba(57,255,20,0.3)" : "none",
              }}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active chart */}
      {renderChart()}

      {/* Data table always visible */}
      <div className="term-panel">
        <div className="term-panel-header"><div className="dot" /> RECORDS.TABLE</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "0.5rem 1rem", color: "var(--muted)", fontWeight: 400, letterSpacing: "0.08em" }}>MONTH</th>
                {cats.map(c => <th key={c} style={{ textAlign: "right", padding: "0.5rem 0.75rem", color: "var(--muted)", fontWeight: 400, letterSpacing: "0.06em" }}>{c.toUpperCase()}</th>)}
                <th style={{ textAlign: "right", padding: "0.5rem 1rem", color: "var(--green-text)", fontWeight: 600, letterSpacing: "0.08em" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {[...records].reverse().map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "0.45rem 1rem", color: "var(--amber)" }}>{r.month}</td>
                  {cats.map(c => (
                    <td key={c} style={{ textAlign: "right", padding: "0.45rem 0.75rem", color: "var(--text)" }}>
                      {sym}{(r.values?.[c] || 0).toLocaleString()}
                    </td>
                  ))}
                  <td style={{ textAlign: "right", padding: "0.45rem 1rem", color: "var(--green-text)", fontWeight: 600 }}>
                    {sym}{(r.total || 0).toLocaleString()}
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
