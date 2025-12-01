import React, { useState } from "react";
import TemperatureWidget from "./components/TemperatureWidget";
import ConnectionControls from "./components/ConnectionControls";
import TemperatureHistory from "./components/TemperatureHistory";
import useTemperature from "./hooks/useTemperature";



export default function App() {
  // Valores por defecto
  const [mode, setMode] = useState("polling");
  const [url, setUrl] = useState("http://localhost:8000/api/temperature/latest/");
  const [pollingInterval, setPollingInterval] = useState(1000);

  // Hook personalizado que maneja la conexión
  const { temperature, connected, history } = useTemperature({ 
    mode, 
    url, 
    pollingInterval 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            🌡️ Monitor de Temperatura
          </h1>
          <p className="text-slate-400">Sistema de monitoreo Arduino en tiempo real</p>
        </div>

        {/* Grid Layout Principal */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Columna Izquierda: Termómetro */}
          <div className="flex justify-center items-start">
            <TemperatureWidget 
              temperature={temperature} 
              isConnected={connected} 
            />
          </div>

          {/* Columna Derecha: Controles */}
          <div className="space-y-6">
            <ConnectionControls
              mode={mode}
              setMode={setMode}
              url={url}
              setUrl={setUrl}
              pollingInterval={pollingInterval}
              setPollingInterval={setPollingInterval}
              isConnected={connected}
            />

            {/* Info de Estado */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Estado de conexión:</span>
                <span className={`font-semibold ${
                  connected ? "text-green-400" : "text-amber-400"
                }`}>
                  {connected ? "✅ Conectado" : "⏳ Esperando..."}
                </span>
              </div>
              
              <div className="mt-3 text-xs text-slate-400 space-y-1">
                <p>💡 <strong>WebSocket:</strong> Requiere servidor socket.io</p>
                <p>📡 <strong>SSE:</strong> Endpoint de eventos del servidor</p>
                <p>🔄 <strong>Polling:</strong> Endpoint JSON simple (recomendado para Arduino)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de temperaturas */}
        {connected && history && history.length > 0 && (
          <TemperatureHistory history={history} />
        )}
      </div>
    </div>
  );
}