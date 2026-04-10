"use client";

import { useAuth } from "@/context/AuthContext";
import { Dashboard } from "@/components/Dashboard";
import { LogIn } from "lucide-react";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center p-24 h-full">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 text-center">
          <h1 className="text-3xl font-bold mb-6 text-white tracking-tight">EdgeLedger Portfolio</h1>
          <p className="text-slate-400 mb-8">
            Track your financial assets, visualize growth, and forecast trends.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </main>
    );
  }

  return <Dashboard />;
}
