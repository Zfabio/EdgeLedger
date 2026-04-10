"use client";

import { useAuth } from "@/context/AuthContext";
import { Dashboard } from "@/components/Dashboard";
import { Github, Database } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { token, gistId, loading, login } = useAuth();
  
  const [inputToken, setInputToken] = useState("");
  const [inputGist, setInputGist] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // If loading local credentials, show spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no credentials, show connect screen
  if (!token || !gistId) {
    const handleConnect = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setIsConnecting(true);
      const success = await login(inputToken.trim(), inputGist.trim());
      if (!success) {
        setError("Connection failed. Check that: (1) your token has 'gist' scope, (2) the Gist ID and token belong to the same GitHub account.");
      }
      setIsConnecting(false);
    };

    return (
      <main className="flex items-center justify-center p-6 h-full min-h-screen">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">EdgeLedger</h1>
            <p className="text-slate-400">
              Bring your own database using GitHub Gists.
            </p>
          </div>
          
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Personal Access Token
              </label>
              <input
                type="password"
                required
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Requires the "gist" scope permission.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Secret Gist ID
              </label>
              <input
                type="text"
                required
                value={inputGist}
                onChange={(e) => setInputGist(e.target.value)}
                placeholder="e.g. 8f2a3c7b..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Found in the URL of your created Gist.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 mt-4"
            >
              {isConnecting ? "Validating & Connecting..." : "Connect Database"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return <Dashboard />;
}
