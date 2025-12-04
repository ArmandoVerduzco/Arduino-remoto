import React, { useState, useMemo, useEffect, useRef } from "react";
import ConnectionControls from "./components/ConnectionControls";
import SensorWidget from "./components/SensorWidget";
import SensorHistory from "./components/SensorHistory";

export default function App() {
  const [mode, setMode] = useState("polling");
  const [pollingInterval] = useState(1000);
  
  // Estados para los sensores
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [distance, setDistance] = useState(null);
  
  // Historiales
  const [temperatureHistory, setTemperatureHistory] = useState([]);
  const [humidityHistory, setHumidityHistory] = useState([]);
  const [distanceHistory, setDistanceHistory] = useState([]);
  
  // Estados de conexión
  const [isConnected, setIsConnected] = useState(false);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  
  const [tempConnected, setTempConnected] = useState(false);
  const [humConnected, setHumConnected] = useState(false);
  const [distConnected, setDistConnected] = useState(false);

  // 🚀 ENDPOINTS OPTIMIZADOS
  const [endpoints, setEndpoints] = useState({
    sensores: "http://192.168.1.78:8002/api/sensores/ultimos/",
    control: "https://unanimous-postretinal-quincy.ngrok-free.dev/arduino/comando/"
  });

  // 🔥 REF para evitar peticiones concurrentes
  const isFetchingRef = useRef(false);

  // 🚀 FUNCIÓN OPTIMIZADA CON LOCK
  const fetchSensorData = async () => {
    // ✅ Si ya hay una petición en curso, salir
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(endpoints.sensores, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (typeof data.temperatura === 'number' && !isNaN(data.temperatura)) {
        setTemperature(data.temperatura);
        setTemperatureHistory(prev => [...prev.slice(-19), data.temperatura]);
        setTempConnected(true);
      }
      
      if (typeof data.humedad === 'number' && !isNaN(data.humedad)) {
        setHumidity(data.humedad);
        setHumidityHistory(prev => [...prev.slice(-19), data.humedad]);
        setHumConnected(true);
      }
      
      if (typeof data.distancia === 'number' && !isNaN(data.distancia)) {
        setDistance(data.distancia);
        setDistanceHistory(prev => [...prev.slice(-19), data.distancia]);
        setDistConnected(true);
      }
      
      setIsConnected(true);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⏰ Timeout: petición > 5s');
      } else {
        console.error('❌ Error:', error.message);
      }
      setIsConnected(false);
      setTempConnected(false);
      setHumConnected(false);
      setDistConnected(false);
    } finally {
      isFetchingRef.current = false;
    }
  };

  // 🔥 USEEFFECT CORREGIDO - CON CLEANUP APROPIADO
  useEffect(() => {
    // Si no está activo, resetear todo
    if (!isMonitoringActive) {
      setIsConnected(false);
      setTempConnected(false);
      setHumConnected(false);
      setDistConnected(false);
      return; // ✅ Sale ANTES de crear interval
    }

    console.log('✅ Creando interval de polling');
    
    // Primera llamada inmediata
    fetchSensorData();
    
    // Crear interval
    const interval = setInterval(fetchSensorData, pollingInterval);
    
    // 🔥 CLEANUP - CRÍTICO
    return () => {
      console.log('🧹 LIMPIANDO interval');
      clearInterval(interval);
    };
  }, [isMonitoringActive, endpoints.sensores]); // ⚠️ Dependencias correctas

  const handleStartMonitoring = () => {
    console.log('🟢 Iniciando monitoreo');
    setIsMonitoringActive(true);
  };

  const handleStopMonitoring = () => {
    console.log('🔴 Deteniendo monitoreo');
    setIsMonitoringActive(false);
  };

  const thresholds = useMemo(() => ({
    temperature: [
      { limit: 15, color: '#3b82f6', label: 'Muy Frío' },
      { limit: 25, color: '#10b981', label: 'Agradable' },
      { limit: 35, color: '#f59e0b', label: 'Caliente' },
      { limit: 50, color: '#ef4444', label: 'Muy Caliente' },
    ],
    humidity: [
      { limit: 30, color: '#ef4444', label: 'Seco' },
      { limit: 60, color: '#fbbf24', label: 'Normal' },
      { limit: 100, color: '#3b82f6', label: 'Húmedo' },
    ],
    distance: [
      { limit: 20, color: '#ef4444', label: 'Muy cerca' },
      { limit: 50, color: '#fbbf24', label: 'Cerca' },
      { limit: 100, color: '#10b981', label: 'Lejos' },
    ]
  }), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            🌡️ Monitor de Sensores Arduino
          </h1>
          <p className="text-slate-400 text-lg">Sistema de monitoreo en tiempo real - Optimizado 🚀</p>
          
          {/* Botón de descarga Excel */}
          <div className="mt-6">
            <a
              href="http://192.168.1.78:8002/api/reporte/excel/"
              download="reporte_sensores.xlsx"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📊 Descargar Reporte Excel
            </a>
          </div>
        </header>

        <ConnectionControls
          mode={mode}
          setMode={setMode}
          endpoints={endpoints}
          setEndpoints={setEndpoints}
          pollingInterval={pollingInterval}
          isConnected={isConnected}
          isMonitoringActive={isMonitoringActive}
          onStartMonitoring={handleStartMonitoring}
          onStopMonitoring={handleStopMonitoring}
        />

        <div className="text-center text-sm text-slate-400 bg-slate-800/50 rounded-lg p-3">
          <span className={isMonitoringActive ? 'text-green-400' : 'text-red-400'}>
            {isMonitoringActive ? '🟢 Monitoreo Activo' : '🔴 Monitoreo Detenido'}
          </span>
          <span className="mx-2">•</span>
          <span className="text-blue-400 font-semibold">⚡ Actualización:</span> cada {pollingInterval}ms
          <span className="mx-2">•</span>
          <span className="text-green-400">📡 Modo:</span> {mode}
          <span className="mx-2">•</span>
          <span className="text-purple-400">🚀 Endpoint Consolidado</span>
        </div>

        <section className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          
          <SensorWidget
            sensorName="🌡️ Temperatura"
            value={temperature}
            unit="°C"
            minValue={-10}
            maxValue={50}
            isConnected={tempConnected}
            thresholds={thresholds.temperature}
            hasControl={true}
            endpointComando={endpoints.control}
            onControlChange={(estado) => {
              console.log('🔥 LED estado cambiado:', estado);
            }}
          />

          <SensorWidget
            sensorName="💧 Humedad"
            value={humidity}
            unit="%"
            minValue={0}
            maxValue={100}
            isConnected={humConnected}
            thresholds={thresholds.humidity}
          />

          <SensorWidget
            sensorName="📏 Distancia"
            value={distance}
            unit="cm"
            minValue={0}
            maxValue={100}
            isConnected={distConnected}
            thresholds={thresholds.distance}
          />
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            📊 Histórico de Lecturas
          </h2>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            <SensorHistory
              history={temperatureHistory}
              sensorName="Temperatura"
              unit="°C"
              thresholds={thresholds.temperature}
              maxHistory={20}
              showStats={true}
            />

            <SensorHistory
              history={humidityHistory}
              sensorName="Humedad"
              unit="%"
              thresholds={thresholds.humidity}
              maxHistory={20}
              showStats={true}
            />

            <SensorHistory
              history={distanceHistory}
              sensorName="Distancia"
              unit="cm"
              thresholds={thresholds.distance}
              maxHistory={20}
              showStats={true}
            />
          </div>
        </section>

        <footer className="text-center text-slate-400 text-sm mt-12 pb-4 space-y-2">
          <p>
            Actualización cada {pollingInterval}ms • Modo: <span className="text-blue-400">{mode}</span> • 
            <span className="text-green-400"> ✅ Memory leak corregido</span>
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <span className={tempConnected ? 'text-green-400' : 'text-red-400'}>
              🌡️ Temp: {tempConnected ? '🟢' : '🔴'}
            </span>
            <span className={humConnected ? 'text-green-400' : 'text-red-400'}>
              💧 Hum: {humConnected ? '🟢' : '🔴'}
            </span>
            <span className={distConnected ? 'text-green-400' : 'text-red-400'}>
              📏 Dist: {distConnected ? '🟢' : '🔴'}
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
}