"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Plus, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { AssetRecord, getAssetRecords } from "@/lib/services";
import DataEntryForm from "./DataEntryForm";
import Charts from "./Charts";
import Papa from "papaparse";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [records, setRecords] = useState<AssetRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAssetRecords(user.uid);
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch records", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const handleExportCSV = () => {
    const csv = Papa.unparse(records.map(({ id, userId, ...rest }) => rest));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "financial_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
            F
          </div>
          <h1 className="text-xl font-bold">EdgeLedger</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300 hidden md:block">
            {user?.email}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row shadow-sm justify-between gap-4 items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Portfolio Overview</h2>
            <p className="text-slate-400 text-sm">Visualize your wealth growth</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            >
              <Plus className="w-4 h-4" />
              Add Data
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="mb-4">No financial data found.</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-500 hover:text-blue-400 font-medium underline"
            >
              Add your first record
            </button>
          </div>
        ) : (
          <Charts records={records} />
        )}
      </main>

      {/* Modal */}
      {showForm && (
        <DataEntryForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchRecords();
          }}
        />
      )}
    </div>
  );
}
