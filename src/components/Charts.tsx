"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { AssetRecord } from "@/lib/services";
import * as ss from "simple-statistics";
import { TrendingUp, PieChart as PieChartIcon, BarChart2 } from "lucide-react";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Charts({ records }: { records: AssetRecord[] }) {
  const { lineData, pieData, barData, forecastData } = useMemo(() => {
    if (!records || records.length === 0) {
      return { lineData: [], pieData: [], barData: [], forecastData: null };
    }

    const sortedRecords = [...records].sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    const x = sortedRecords.map((r) => r.month);
    const yTotal = sortedRecords.map((r) => r.total || 0);

    const lineData = [
      {
        x,
        y: yTotal,
        type: "scatter" as const,
        mode: "lines+markers" as const,
        name: "Total Net Worth",
        line: { color: "#3b82f6", width: 3, shape: "spline" as const },
        marker: { size: 8, color: "#2563eb" },
        fill: "tozeroy" as const,
        fillcolor: "rgba(59, 130, 246, 0.1)",
      },
    ];

    const latest = sortedRecords[sortedRecords.length - 1];
    const pieData = [
      {
        values: [latest.stocks, latest.crypto, latest.cash, latest.realEstate, latest.other],
        labels: ["Stocks", "Crypto", "Cash", "Real Estate", "Other"],
        type: "pie" as const,
        hole: 0.4,
        marker: { 
          colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#64748b"] 
        },
        textinfo: "label+percent" as const,
        hoverinfo: "label+value" as const,
      },
    ];

    const barData = [
      { x, y: sortedRecords.map(r => r.stocks), type: "bar" as const, name: "Stocks", marker: { color: "#3b82f6" } },
      { x, y: sortedRecords.map(r => r.crypto), type: "bar" as const, name: "Crypto", marker: { color: "#8b5cf6" } },
      { x, y: sortedRecords.map(r => r.cash), type: "bar" as const, name: "Cash", marker: { color: "#10b981" } },
      { x, y: sortedRecords.map(r => r.realEstate), type: "bar" as const, name: "Real Estate", marker: { color: "#f59e0b" } },
      { x, y: sortedRecords.map(r => r.other), type: "bar" as const, name: "Other", marker: { color: "#64748b" } },
    ];

    // Linear regression forecast mapping 'time' to 'total'
    let forecastLine = null;
    if (sortedRecords.length >= 2) {
      const dataForReg = sortedRecords.map((r, idx) => [idx, r.total || 0] as [number, number]);
      const l = ss.linearRegression(dataForReg);
      const func = ss.linearRegressionLine(l);
      
      const forecastX = [];
      const forecastY = [];
      const numMonths = sortedRecords.length + 3; // Forecast next 3 months
      
      for (let i = 0; i < numMonths; i++) {
        let label = "";
        if (i < sortedRecords.length) {
          label = sortedRecords[i].month;
        } else {
          // Estimate future month label
          const lastDate = new Date(sortedRecords[sortedRecords.length - 1].month);
          lastDate.setMonth(lastDate.getMonth() + (i - sortedRecords.length) + 1);
          label = lastDate.toISOString().slice(0, 7) + " (Est)";
        }
        forecastX.push(label);
        forecastY.push(func(i));
      }
      
      forecastLine = {
        x: forecastX,
        y: forecastY,
        type: "scatter" as const,
        mode: "lines" as const,
        name: "Trend (Forecast)",
        line: { color: "#ef4444", dash: "dashdot" as const, width: 2 },
      };
    }

    const finalLineData = forecastLine ? [...lineData, forecastLine] : lineData;

    return { lineData: finalLineData, pieData, barData, forecastData: forecastLine };
  }, [records]);

  const layoutBase = {
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: "#94a3b8", family: "inherit" },
    margin: { t: 30, r: 20, l: 50, b: 40 },
    xaxis: { gridcolor: "#334155", zerolinecolor: "#334155" },
    yaxis: { gridcolor: "#334155", zerolinecolor: "#334155" },
    legend: { orientation: "h" as const, y: -0.2 },
    autosize: true,
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Worth Growth */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 w-full">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Net Worth Growth</h3>
          </div>
          <div className="w-full relative h-[350px]">
             {lineData.length > 0 && (
              <Plot
                data={lineData}
                layout={{ ...layoutBase, hovermode: "x unified" }}
                useResizeHandler={true}
                className="w-full h-full"
                config={{ displayModeBar: false, responsive: true }}
              />
            )}
          </div>
        </div>

        {/* Allocation */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 w-full">
            <PieChartIcon className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-white">Current Allocation</h3>
          </div>
          <div className="w-full relative h-[350px]">
            {pieData[0]?.values?.reduce((a, b) => a + (b as number), 0) > 0 ? (
              <Plot
                data={pieData}
                layout={{ ...layoutBase, margin: { t: 10, b: 10, l: 10, r: 10 }, showlegend: false }}
                useResizeHandler={true}
                className="w-full h-full"
                config={{ displayModeBar: false, responsive: true }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No asset data to show allocation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Composition Trends */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4 w-full">
          <BarChart2 className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-white">Asset Composition History</h3>
        </div>
        <div className="w-full relative h-[350px]">
           {barData.length > 0 && (
            <Plot
              data={barData}
              layout={{ ...layoutBase, barmode: "stack" }}
              useResizeHandler={true}
              className="w-full h-full"
              config={{ displayModeBar: false, responsive: true }}
            />
          )}
        </div>
      </div>

    </div>
  );
}
