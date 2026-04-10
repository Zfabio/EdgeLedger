"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { AssetRecord } from "@/lib/services";
import { AppSettings } from "@/lib/settings";
import * as ss from "simple-statistics";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const COLORS = ["#39ff14", "#22d3ee", "#fbbf24", "#f87171", "#a78bfa", "#34d399", "#fb7185", "#818cf8"];

const layout = {
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  font: { color: "#4a6568", family: "JetBrains Mono, monospace", size: 11 },
  margin: { t: 20, r: 20, l: 55, b: 50 },
  xaxis: { gridcolor: "#1e2d30", zerolinecolor: "#1e2d30", tickfont: { color: "#3d5a5e" } },
  yaxis: { gridcolor: "#1e2d30", zerolinecolor: "#1e2d30", tickfont: { color: "#3d5a5e" } },
  legend: { orientation: "h" as const, y: -0.25, font: { color: "#4a6568" } },
  autosize: true,
};

export default function Charts({ records, settings }: { records: AssetRecord[]; settings: AppSettings }) {
  const { sym } = useMemo(() => ({ sym: settings.currency.symbol }), [settings]);

  const x = records.map(r => r.month);
  const totals = records.map(r => r.total || 0);

  // Forecast
  const forecastTrace = useMemo(() => {
    if (records.length < 2) return null;
    const data = records.map((_, i) => [i, records[i].total || 0] as [number, number]);
    const reg = ss.linearRegressionLine(ss.linearRegression(data));
    const extended = records.length + 3;
    const fx: string[] = [];
    const fy: number[] = [];
    for (let i = 0; i < extended; i++) {
      if (i < records.length) {
        fx.push(records[i].month);
      } else {
        const d = new Date(records[records.length - 1].month + "-01");
        d.setMonth(d.getMonth() + (i - records.length + 1));
        fx.push(d.toISOString().slice(0, 7) + "~");
      }
      fy.push(Math.max(0, reg(i)));
    }
    return { x: fx, y: fy, type: "scatter" as const, mode: "lines" as const, name: "FORECAST", line: { color: "#f87171", dash: "dot" as const, width: 1.5 } };
  }, [records]);

  // Net worth line
  const lineTrace = {
    x, y: totals, type: "scatter" as const, mode: "lines+markers" as const,
    name: "NET_WORTH", line: { color: "#39ff14", width: 2, shape: "spline" as const },
    marker: { size: 6, color: "#1a7a08" },
    fill: "tozeroy" as const, fillcolor: "rgba(57,255,20,0.05)",
  };

  // Category bar traces
  const cats = settings.categories;
  const barTraces = cats.map((cat, i) => ({
    x,
    y: records.map(r => r.values?.[cat] || 0),
    type: "bar" as const,
    name: cat.toUpperCase(),
    marker: { color: COLORS[i % COLORS.length], opacity: 0.8 },
  }));

  // Pie (latest record)
  const latest = records[records.length - 1];
  const pieTrace = {
    values: cats.map(c => latest?.values?.[c] || 0),
    labels: cats.map(c => c.toUpperCase()),
    type: "pie" as const,
    hole: 0.5,
    marker: { colors: COLORS },
    textinfo: "label+percent" as const,
    textfont: { family: "JetBrains Mono", size: 10, color: "#0a0e0f" },
    hoverinfo: "label+value" as const,
  };

  const totalNow = totals[totals.length - 1] || 0;
  const totalPrev = totals.length > 1 ? totals[totals.length - 2] : totalNow;
  const change = totalNow - totalPrev;
  const changePct = totalPrev > 0 ? (change / totalPrev) * 100 : 0;

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

      {/* Line Chart + Pie */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
        <div className="term-panel">
          <div className="term-panel-header"><div className="dot" />NET_WORTH.LOG</div>
          <div style={{ height: "300px" }}>
            <Plot data={forecastTrace ? [lineTrace, forecastTrace] : [lineTrace]}
              layout={{ ...layout, yaxis: { ...layout.yaxis, tickprefix: sym } }}
              useResizeHandler config={{ displayModeBar: false, responsive: true }}
              className="w-full h-full" />
          </div>
        </div>
        <div className="term-panel">
          <div className="term-panel-header"><div className="dot" />ALLOCATION.PIE</div>
          <div style={{ height: "300px" }}>
            <Plot data={[pieTrace]}
              layout={{ ...layout, margin: { t: 10, b: 10, l: 10, r: 10 }, showlegend: false }}
              useResizeHandler config={{ displayModeBar: false, responsive: true }}
              className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="term-panel">
        <div className="term-panel-header"><div className="dot" />CATEGORY_HISTORY.BAR</div>
        <div style={{ height: "280px" }}>
          <Plot data={barTraces}
            layout={{ ...layout, barmode: "stack", yaxis: { ...layout.yaxis, tickprefix: sym } }}
            useResizeHandler config={{ displayModeBar: false, responsive: true }}
            className="w-full h-full" />
        </div>
      </div>

      {/* Data table */}
      <div className="term-panel">
        <div className="term-panel-header"><div className="dot" />RECORDS.TABLE</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "0.5rem 1rem", color: "var(--muted)", fontWeight: 400, letterSpacing: "0.08em" }}>MONTH</th>
                {cats.map(c => <th key={c} style={{ textAlign: "right", padding: "0.5rem 0.75rem", color: "var(--muted)", fontWeight: 400, letterSpacing: "0.08em" }}>{c.toUpperCase()}</th>)}
                <th style={{ textAlign: "right", padding: "0.5rem 1rem", color: "var(--green-text)", fontWeight: 600, letterSpacing: "0.08em" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {[...records].reverse().map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "0.5rem 1rem", color: "var(--amber)" }}>{r.month}</td>
                  {cats.map(c => (
                    <td key={c} style={{ textAlign: "right", padding: "0.5rem 0.75rem", color: "var(--text)" }}>
                      {sym}{(r.values?.[c] || 0).toLocaleString()}
                    </td>
                  ))}
                  <td style={{ textAlign: "right", padding: "0.5rem 1rem", color: "var(--green-text)", fontWeight: 600 }}>
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
