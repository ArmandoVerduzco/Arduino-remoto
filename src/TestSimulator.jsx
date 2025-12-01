import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

// 🔌 IMPORTA TU HOOK REAL
// import useTemperature from './hooks/useTemperature';

// ⚠️ HOOK TEMPORAL - Reemplaza esto con tu import real
function useTemperature({ mode, url, pollingInterval }) {
  const [temperature, setTemperature] = useState(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!mode) return;
    
    let cleanup;

    if (mode === "websocket") {
      console.log('WebSocket mode - esperando conexión real');
    }

    if (mode === "sse") {
      try {
        const eventSource = new EventSource(url);
        eventSource.onopen = () => setConnected(true);
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const temp = data.temperature || data.temp || data;
            setTemperature(temp);
            setHistory(prev => [...prev, temp]);
          } catch (err) {
            console.error('Error parseando SSE:', err);
          }
        };
        eventSource.onerror = () => {
          setConnected(false);
          eventSource.close();
        };
        cleanup = () => eventSource.close();
      } catch (error) {
        console.error('Error SSE:', error);
      }
    }

    if (mode === "polling") {
      const fetchTemperature = async () => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Error HTTP: ' + response.status);
          const data = await response.json();
          const temp = data.temperature || data.temp || data.value;
          setTemperature(temp);
          setHistory(prev => [...prev, temp]);
          setConnected(true);
        } catch (error) {
          console.error('Error fetching:', error);
          setConnected(false);
        }
      };
      fetchTemperature();
      const interval = setInterval(fetchTemperature, pollingInterval);
      cleanup = () => clearInterval(interval);
    }

    return () => {
      if (cleanup) cleanup();
      setConnected(false);
    };
  }, [mode, url, pollingInterval]);

  return { temperature, connected, history };
}

// 📦 COMPONENTE 1: TemperatureWidget
// Reemplaza con: import TemperatureWidget from './components/TemperatureWidget';
function TemperatureWidget({ temperature, isConnected }) {
  const t = typeof temperature === "number" && !isNaN(temperature) ? temperature : null;
  const minTemp = -10;
  const maxTemp = 50;
  const liquidHeight = t !== null 
    ? Math.min(Math.max(((t - minTemp) / (maxTemp - minTemp)) * 100, 0), 100)
    : 0;

  const getColor = (temp) => {
    if (temp === null) return '#9ca3af';
    if (temp < 15) return '#3b82f6';
    if (temp < 25) return '#10b981';
    if (temp < 35) return '#f59e0b';
    return '#ef4444';
  };

  const getStatus = (temp) => {
    if (temp === null) return "Sin datos";
    if (temp < 15) return "Muy Frío";
    if (temp < 20) return "Frío";
    if (temp < 25) return "Agradable";
    if (temp < 30) return "Templado";
    if (temp < 35) return "Caliente";
    return "Muy Caliente";
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      {/* Indicador de conexión */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 ${
        isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {isConnected ? (
          <>
            <Wifi size={16} />
            <span className="text-sm font-medium">Conectado</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span className="text-sm font-medium">Desconectado</span>
          </>
        )}
      </div>
      
      <div className="flex items-center justify-center gap-8 flex-wrap">
        {/* Termómetro SVG */}
        <div className="relative">
          <svg width="120" height="280" viewBox="0 0 120 280">
            <defs>
              <linearGradient id="liquidGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={getColor(t)} stopOpacity="1"/>
                <stop offset="100%" stopColor={getColor(t)} stopOpacity="0.8"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Tubo */}
            <rect x="35" y="20" width="50" height="180" rx="25" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
            
            {/* Bulbo inferior */}
            <circle cx="60" cy="235" r="35" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
            <circle cx="60" cy="235" r="28" fill={getColor(t)} className="transition-all duration-700">
              <animate attributeName="r" values="28;29;28" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="52" cy="227" r="10" fill="white" opacity="0.3"/>
            
            {/* Líquido que sube */}
            <rect 
              x="45" 
              y={200 - (liquidHeight * 1.6)} 
              width="30" 
              height={liquidHeight * 1.6} 
              rx="15"
              fill="url(#liquidGradient)"
              filter="url(#glow)"
              className="transition-all duration-1000 ease-out"
            />
            
            {/* Marcas de escala */}
            {[0, 10, 20, 30, 40].map((temp, i) => {
              const y = 190 - (i * 40);
              return (
                <g key={temp}>
                  <line x1="20" y1={y} x2="30" y2={y} stroke="#64748b" strokeWidth="2"/>
                  <line x1="90" y1={y} x2="100" y2={y} stroke="#64748b" strokeWidth="2"/>
                  <text x="10" y={y + 5} fill="#94a3b8" fontSize="12" textAnchor="end">{temp}</text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Display de temperatura */}
        <div className="text-center">
          <div 
            className="text-7xl font-bold mb-3 transition-all duration-500 drop-shadow-lg" 
            style={{ color: getColor(t) }}
          >
            {t !== null ? `${t.toFixed(1)}°` : "--.-°"}
          </div>
          <div 
            className="text-xl font-semibold px-6 py-3 rounded-xl transition-all duration-500 shadow-lg" 
            style={{ 
              color: getColor(t), 
              backgroundColor: `${getColor(t)}20`,
              border: `2px solid ${getColor(t)}40`
            }}
          >
            {getStatus(t)}
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-6 w-full max-w-[200px] mx-auto">
            <div className="bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="h-full transition-all duration-1000 ease-out rounded-full"
                style={{ 
                  width: `${liquidHeight}%`, 
                  backgroundColor: getColor(t)
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>{minTemp}°C</span>
              <span>{maxTemp}°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 📦 COMPONENTE 2: TemperatureHistory
// Reemplaza con: import TemperatureHistory from './components/TemperatureHistory';
function TemperatureHistory({ history }) {
  if (history.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
        <p className="text-slate-400">📊 Esperando datos para mostrar historial...</p>
      </div>
    );
  }
  
  const displayHistory = history.slice(-30);
  const maxTemp = Math.max(...displayHistory);
  const minTemp = Math.min(...displayHistory);
  const avgTemp = displayHistory.reduce((a, b) => a + b, 0) / displayHistory.length;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        📊 Historial de Temperatura
        <span className="text-sm font-normal text-slate-400">
          (últimas {displayHistory.length} lecturas)
        </span>
      </h3>
      
      {/* Gráfico de barras */}
      <div className="flex items-end gap-1 h-40 mb-6 bg-slate-900/50 rounded-lg p-4">
        {displayHistory.map((temp, i) => {
          const height = ((temp - minTemp) / (maxTemp - minTemp || 1)) * 100 || 50;
          const color = temp < 20 ? '#3b82f6' : temp < 30 ? '#10b981' : temp < 40 ? '#f59e0b' : '#ef4444';
          return (
            <div key={i} className="flex-1 bg-slate-700/30 rounded-t relative group min-w-[4px]">
              <div 
                className="rounded-t transition-all duration-300 hover:opacity-80"
                style={{ height: `${height}%`, backgroundColor: color }}
              />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                {temp.toFixed(1)}°C
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="text-slate-400 text-xs mb-1">📈 Lecturas</div>
          <div className="text-white font-bold text-xl">{displayHistory.length}</div>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <div className="text-blue-400 text-xs mb-1">❄️ Mínima</div>
          <div className="text-blue-400 font-bold text-xl">{minTemp.toFixed(1)}°C</div>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
          <div className="text-green-400 text-xs mb-1">📊 Promedio</div>
          <div className="text-green-400 font-bold text-xl">{avgTemp.toFixed(1)}°C</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
          <div className="text-red-400 text-xs mb-1">🔥 Máxima</div>
          <div className="text-red-400 font-bold text-xl">{maxTemp.toFixed(1)}°C</div>
        </div>
      </div>
    </div>
  );
}

// 📦 COMPONENTE 3: ConnectionControls
// Reemplaza con: import ConnectionControls from './components/ConnectionControls';
function ConnectionControls({ 
  mode, setMode, url, setUrl, pollingInterval, setPollingInterval, onConnect, isConnected 
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        ⚙️ Configuración de Conexión
      </h3>
      
      <div className="space-y-5">
        {/* Modo de conexión */}
        <div>
          <label className="block text-slate-300 mb-2 text-sm font-medium">
            Modo de conexión
          </label>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)} 
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="websocket">🔌 WebSocket (socket.io)</option>
            <option value="sse">📡 SSE (EventSource)</option>
            <option value="polling">🔄 Polling HTTP</option>
          </select>
        </div>

        {/* URL del servidor */}
        <div>
          <label className="block text-slate-300 mb-2 text-sm font-medium">
            URL del servidor
          </label>
          <input 
            type="text"
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            placeholder="http://192.168.1.100:8000" 
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500" 
          />
        </div>

        {/* Intervalo de polling */}
        {mode === "polling" && (
          <div>
            <label className="block text-slate-300 mb-3 text-sm font-medium">
              Intervalo de actualización: <span className="text-blue-400">{pollingInterval}ms</span>
            </label>
            <input 
              type="range" 
              min="500" 
              max="5000" 
              step="100" 
              value={pollingInterval} 
              onChange={(e) => setPollingInterval(Number(e.target.value))} 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>0.5s</span>
              <span>2.5s</span>
              <span>5s</span>
            </div>
          </div>
        )}

        {/* Botón de conexión */}
        <button 
          onClick={onConnect} 
          className={`w-full py-3 rounded-lg font-bold text-white transition-all transform active:scale-95 shadow-lg ${
            isConnected 
              ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/50' 
              : 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/50'
          }`}
        >
          {isConnected ? '🔌 Desconectar' : '⚡ Conectar'}
        </button>
      </div>
    </div>
  );
}

// 🎯 COMPONENTE PRINCIPAL
export default function App() {
  // Estados de configuración
  const [mode, setMode] = useState('polling');
  const [url, setUrl] = useState('http://192.168.1.100:8000');
  const [pollingInterval, setPollingInterval] = useState(1000);
  const [isActive, setIsActive] = useState(false);
  
  // Simulador de datos de prueba
  const [testScenario, setTestScenario] = useState('grua_operando');
  const [simulatedTemp, setSimulatedTemp] = useState(null);
  const [simulatedHistory, setSimulatedHistory] = useState([]);

  // Tu hook real (se activará cuando tengas servidor)
  const { temperature: realTemp, connected: realConnected, history: realHistory } = useTemperature({
    mode: isActive && !realConnected ? mode : null, // Solo activa si no hay conexión real
    url,
    pollingInterval
  });

  // Escenarios de prueba para maquinaria portuaria
  const SCENARIOS = {
    grua_operando: { 
      name: "🏗️ Grúa Pórtico en Operación", 
      base: 38, 
      variance: 6, 
      trend: 0.05,
      description: "Motor principal trabajando"
    },
    reach_stacker: { 
      name: "🚜 Reach Stacker - Carga Pesada", 
      base: 45, 
      variance: 8, 
      trend: 0.08,
      description: "Sistema hidráulico bajo presión"
    },
    montacargas: { 
      name: "🔶 Montacargas Operación Normal", 
      base: 32, 
      variance: 4, 
      trend: 0,
      description: "Motor diésel estándar"
    },
    banda: { 
      name: "⚙️ Banda Transportadora", 
      base: 28, 
      variance: 3, 
      trend: 0,
      description: "Rodamientos en funcionamiento"
    },
    bomba: { 
      name: "💧 Bomba Hidráulica Alta Demanda", 
      base: 48, 
      variance: 10, 
      trend: 0.1,
      description: "Sistema de presión crítico"
    },
    reposo: { 
      name: "😴 Motor en Reposo/Enfriamiento", 
      base: 22, 
      variance: 2, 
      trend: -0.03,
      description: "Equipo apagado"
    }
  };

  // Simulador de datos
  useEffect(() => {
    if (!isActive || realConnected) return;

    const scenario = SCENARIOS[testScenario];
    let currentTemp = simulatedTemp || scenario.base;
    let trendAccumulator = 0;

    const interval = setInterval(() => {
      // Generar variación natural
      const random = (Math.random() - 0.5) * scenario.variance;
      const wave = Math.sin(Date.now() / 5000) * 2;
      
      trendAccumulator += scenario.trend;
      let newTemp = scenario.base + random + wave + trendAccumulator;
      
      // Suavizar cambios (inercia térmica)
      newTemp = currentTemp * 0.7 + newTemp * 0.3;
      
      // Limitar rango realista
      newTemp = Math.max(15, Math.min(70, newTemp));
      
      currentTemp = newTemp;
      setSimulatedTemp(newTemp);
      setSimulatedHistory(prev => [...prev, newTemp]);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, testScenario, realConnected]);

  // Decidir qué datos mostrar
  const displayTemp = realConnected ? realTemp : simulatedTemp;
  const displayHistory = realConnected ? realHistory : simulatedHistory;
  const displayConnected = realConnected || (isActive && simulatedTemp !== null);

  const handleToggle = () => {
    if (!isActive) {
      setSimulatedHistory([]);
      setSimulatedTemp(SCENARIOS[testScenario].base);
    }
    setIsActive(!isActive);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/90 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🏗️ Monitor Arduino - Puerto Industrial
          </h1>
          <p className="text-slate-300">
            Sistema de monitoreo de temperatura para maquinaria portuaria
          </p>
        </div>

        {/* Panel de Control de Prueba */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 mb-6 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧪</span>
            <div className="flex-1">
              <h3 className="text-yellow-400 font-bold mb-3 text-lg">
                Modo de Prueba con Datos Simulados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2 font-medium">
                    Seleccionar Maquinaria:
                  </label>
                  <select 
                    value={testScenario} 
                    onChange={(e) => {
                      setTestScenario(e.target.value);
                      if (isActive && !realConnected) {
                        setSimulatedTemp(SCENARIOS[e.target.value].base);
                        setSimulatedHistory([]);
                      }
                    }}
                    disabled={!isActive || realConnected}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {Object.entries(SCENARIOS).map(([key, data]) => (
                      <option key={key} value={key}>{data.name}</option>
                    ))}
                  </select>
                  <p className="text-slate-400 text-xs mt-1">
                    {SCENARIOS[testScenario].description}
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="text-slate-400 text-xs mb-2 font-medium">Estado del Sistema</div>
                    <div className="text-white font-mono text-sm">
                      {realConnected ? '🟢 Servidor Real Conectado' : 
                       isActive ? '🟡 Simulador Activo' : 
                       '⚪ Sistema Desconectado'}
                    </div>
                    {isActive && !realConnected && (
                      <div className="text-slate-400 text-xs mt-2">
                        Base: {SCENARIOS[testScenario].base}°C | 
                        Variación: ±{SCENARIOS[testScenario].variance}°C
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <p className="text-slate-300 text-xs">
                  💡 <strong>Instrucciones:</strong> Este simulador genera datos realistas mientras pruebas la interfaz. 
                  Cuando conectes tu Arduino real al servidor, el sistema detectará automáticamente la conexión y 
                  cambiará a mostrar los datos reales del sensor.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Widget e Historial */}
          <div className="lg:col-span-2 space-y-6">
            <TemperatureWidget 
              temperature={displayTemp} 
              isConnected={displayConnected} 
            />
            <TemperatureHistory history={displayHistory} />
          </div>

          {/* Columna lateral - Controles e Info */}
          <div className="space-y-6">
            <ConnectionControls 
              mode={mode}
              setMode={setMode}
              url={url}
              setUrl={setUrl}
              pollingInterval={pollingInterval}
              setPollingInterval={setPollingInterval}
              onConnect={handleToggle}
              isConnected={isActive}
            />
            
            {/* Panel de información adicional */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-xl">
              <h4 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
                📌 Información del Sistema
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Lecturas totales:</span>
                  <span className="text-white font-mono font-bold">{displayHistory.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Modo de conexión:</span>
                  <span className="text-blue-400 font-medium uppercase">{mode}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Escenario activo:</span>
                  <span className="text-green-400 font-medium text-xs">{SCENARIOS[testScenario].name.slice(3)}</span>
                </div>
                {mode === 'polling' && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Intervalo:</span>
                    <span className="text-purple-400 font-mono">{pollingInterval}ms</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}