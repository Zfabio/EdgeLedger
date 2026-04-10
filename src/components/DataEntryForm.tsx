"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addAssetRecord } from "@/lib/services";
import { X } from "lucide-react";

export default function DataEntryForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7),
    stocks: "",
    crypto: "",
    cash: "",
    realEstate: "",
    other: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await addAssetRecord(user.uid, {
        month: formData.month,
        stocks: Number(formData.stocks) || 0,
        crypto: Number(formData.crypto) || 0,
        cash: Number(formData.cash) || 0,
        realEstate: Number(formData.realEstate) || 0,
        other: Number(formData.other) || 0,
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding record", error);
      alert("Failed to save record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h3 className="font-bold text-lg">Add Monthly Data</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Month</label>
            <input 
              type="month" 
              name="month" 
              value={formData.month} 
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Stocks ($)</label>
              <input 
                type="number" 
                name="stocks" 
                value={formData.stocks} 
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Crypto ($)</label>
              <input 
                type="number" 
                name="crypto" 
                value={formData.crypto} 
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cash ($)</label>
              <input 
                type="number" 
                name="cash" 
                value={formData.cash} 
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Real Estate ($)</label>
              <input 
                type="number" 
                name="realEstate" 
                value={formData.realEstate} 
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Other Assets ($)</label>
              <input 
                type="number" 
                name="other" 
                value={formData.other} 
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              className="py-2 px-4 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
