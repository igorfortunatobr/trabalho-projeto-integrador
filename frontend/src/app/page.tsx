"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("Carregando...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        const response = await fetch(`${apiUrl}/health`);
        const data = await response.json();
        setStatus(data.status);
      } catch (err) {
        setStatus("Indisponível");
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    fetchHealth();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white font-sans">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex-col space-y-8">
        <h1 className="text-4xl font-bold text-center">Autoescola - Autecno</h1>
        
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 w-full max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Status do Sistema</h2>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Backend API:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                status === 'ok' ? 'bg-green-500/20 text-green-400' : 
                status === 'Carregando...' ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'
              }`}>
                {status.toUpperCase()}
              </span>
            </div>

            {error && (
              <p className="text-red-400 text-xs mt-2 break-all">{error}</p>
            )}
            
          </div>
        </div>
      </div>
    </main>
  );
}
