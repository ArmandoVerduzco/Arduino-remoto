import React, { useState, useCallback, useMemo } from 'react';
import { Wifi, WifiOff, Power } from 'lucide-react';
import styles from '../styles/SensorWidget.module.css';

export default function SensorWidget({
  sensorName = "Sensor",
  value = null,
  unit = "",
  minValue = 0,
  maxValue = 100,
  isConnected = false,
  thresholds = [],
  hasControl = false,
  endpointComando = null,
  onControlChange = null,
  visualizationType = "auto" // "auto", "bar", "radar", "horizontal", "sonar"
}) {
  const [controlStatus, setControlStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validación y normalización del valor
  const normalizedValue = useMemo(() => {
    if (typeof value !== "number" || isNaN(value) || value === null) return null;
    return value;
  }, [value]);

  // Detectar tipo de visualización automática
  const detectedType = useMemo(() => {
    if (visualizationType !== "auto") return visualizationType;
    
    // Si es distancia (cm), usar radar
    if (unit.toLowerCase().includes('cm') || sensorName.toLowerCase().includes('distancia')) {
      return "radar";
    }
    
    // Temperatura y humedad usan barra vertical
    return "bar";
  }, [visualizationType, unit, sensorName]);

  // Calcular porcentaje para todas las visualizaciones
  const percentage = useMemo(() => {
    if (normalizedValue === null) return 0;
    const range = maxValue - minValue;
    if (range === 0) return 50;
    const pct = ((normalizedValue - minValue) / range) * 100;
    return Math.min(Math.max(pct, 0), 100);
  }, [normalizedValue, minValue, maxValue]);

  // Determinar color y estado según thresholds
  const { color, status } = useMemo(() => {
    if (normalizedValue === null || thresholds.length === 0) {
      return { color: '#9ca3af', status: "Sin datos" };
    }

    for (let threshold of thresholds) {
      if (normalizedValue < threshold.limit) {
        return { color: threshold.color, status: threshold.label };
      }
    }

    const lastThreshold = thresholds[thresholds.length - 1];
    return { color: lastThreshold.color, status: lastThreshold.label };
  }, [normalizedValue, thresholds]);

  // Control toggle
  const toggleControl = useCallback(async () => {
    if (!endpointComando || !isConnected) return;
    
    setLoading(true);
    const newStatus = !controlStatus;

    try {
      const response = await fetch(endpointComando, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({ estado: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Control ${sensorName}:`, data);

      setControlStatus(newStatus);
      
      if (onControlChange) {
        onControlChange(newStatus);
      }
    } catch (err) {
      console.error(`❌ Error en control de ${sensorName}:`, err);
      alert(`Error al cambiar estado del ${sensorName}`);
    } finally {
      setLoading(false);
    }
  }, [endpointComando, isConnected, controlStatus, sensorName, onControlChange]);

  // Renderizar visualización según tipo
  const renderVisualization = () => {
    switch (detectedType) {
      case "radar":
        return (
          <div className={styles.radarContainer}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Círculos concéntricos */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="#1e293b" strokeWidth="2"/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="#1e293b" strokeWidth="2"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="#1e293b" strokeWidth="2"/>
              <circle cx="100" cy="100" r="20" fill="none" stroke="#1e293b" strokeWidth="2"/>
              
              {/* Líneas */}
              <line x1="100" y1="20" x2="100" y2="180" stroke="#334155" strokeWidth="1"/>
              <line x1="20" y1="100" x2="180" y2="100" stroke="#334155" strokeWidth="1"/>
              
              {/* Punto de detección */}
              <circle 
                cx="100" 
                cy={100 - (80 - (percentage * 0.8))} 
                r="8" 
                fill={color}
                style={{ filter: `drop-shadow(0 0 8px ${color})` }}
              >
                <animate attributeName="r" values="8;10;8" dur="1s" repeatCount="indefinite"/>
              </circle>
              
              {/* Texto de distancia en el radar */}
              <text 
                x="100" 
                y="100" 
                textAnchor="middle" 
                fill="#64748b" 
                fontSize="12"
                dy="4"
              >
                {normalizedValue !== null ? `${normalizedValue.toFixed(0)}${unit}` : '--'}
              </text>
            </svg>
          </div>
        );

      case "horizontal":
        return (
          <div className={styles.horizontalContainer}>
            <div className={styles.sensor}>📡</div>
            <div className={styles.horizontalBar}>
              <div 
                className={styles.horizontalFill}
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 20px ${color}`
                }}
              />
            </div>
            <div className={styles.horizontalLabels}>
              <span>{minValue}{unit}</span>
              <span>{maxValue}{unit}</span>
            </div>
          </div>
        );

      case "sonar":
        return (
          <div className={styles.sonarContainer}>
            <svg width="220" height="160" viewBox="0 0 220 160">
              {/* Arcos de sonar */}
              <g opacity="0.3">
                <path d="M 110 150 Q 110 100, 60 60" fill="none" stroke="#334155" strokeWidth="2"/>
                <path d="M 110 150 Q 110 100, 160 60" fill="none" stroke="#334155" strokeWidth="2"/>
              </g>
              
              {/* Ondas animadas */}
              <circle cx="110" cy="150" r="15" fill="none" stroke={color} strokeWidth="2" opacity="0.8">
                <animate attributeName="r" from="15" to="60" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="110" cy="150" r="15" fill="none" stroke={color} strokeWidth="2" opacity="0.8">
                <animate attributeName="r" from="15" to="60" dur="2s" begin="1s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.8" to="0" dur="2s" begin="1s" repeatCount="indefinite"/>
              </circle>
              
              {/* Objeto detectado */}
              <rect 
                x="95"
                y={150 - (80 - (percentage * 0.8)) - 10}
                width="30"
                height="20"
                rx="5"
                fill={color}
                opacity="0.9"
              />
              
              {/* Sensor */}
              <circle cx="110" cy="150" r="10" fill="#334155" stroke={color} strokeWidth="3"/>
            </svg>
          </div>
        );

      default: // "bar"
        return (
          <div className={styles.barContainer}>
            <div className={styles.barBackground}>
              <div 
                className={styles.barFill} 
                style={{ 
                  height: `${percentage}%`, 
                  backgroundColor: color,
                  transition: 'all 0.3s ease' 
                }} 
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* Indicador de conexión */}
      <div 
        className={`${styles.connectionIndicator} ${isConnected ? styles.connected : styles.disconnected}`}
        title={isConnected ? "Conectado" : "Desconectado"}
      >
        {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
      </div>

      <div className={styles.card}>
        <h3 className={styles.sensorTitle}>{sensorName}</h3>

        {/* Visualización dinámica */}
        {renderVisualization()}

        {/* Display del valor */}
        <div className={styles.displaySection}>
          <div className={styles.valueDisplay}>
            {normalizedValue !== null 
              ? `${normalizedValue.toFixed(1)} ${unit}` 
              : `--.- ${unit}`
            }
          </div>
          <div 
            className={styles.statusBadge} 
            style={{ 
              color,
              borderColor: color 
            }}
          >
            {status}
          </div>
        </div>

        {/* Sección de control (opcional) */}
        {hasControl && (
          <div className={styles.controlSection}>
            <button
              onClick={toggleControl}
              disabled={!isConnected || loading}
              className={`${styles.controlButton} ${controlStatus ? styles.active : ''}`}
              title={controlStatus ? 'Apagar' : 'Encender'}
            >
              <Power size={16} />
              <span>{loading ? 'Procesando...' : controlStatus ? 'Apagar' : 'Encender'}</span>
            </button>
          </div>
        )}

        {/* Rango min/max */}
        <div className={styles.rangeInfo}>
          <span className={styles.rangeLabel}>{minValue}{unit}</span>
          <span className={styles.rangeLabel}>{maxValue}{unit}</span>
        </div>
      </div>
    </div>
  );
}