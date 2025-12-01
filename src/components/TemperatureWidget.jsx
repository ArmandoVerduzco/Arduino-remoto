import React, { useState } from 'react';
import { Wifi, WifiOff, Lightbulb } from 'lucide-react';
import styles from '../styles/TemperatureWidget.module.css';

export default function TemperatureWidget({ temperature, isConnected }) {
  const [ledStatus, setLedStatus] = useState(false); // Estado del LED
  const [loading, setLoading] = useState(false); // Estado de carga

  const t = typeof temperature === "number" && !isNaN(temperature) ? temperature : null;
  
  // Calcular altura del líquido (0-100%)
  const minTemp = -10;
  const maxTemp = 50;
  const liquidHeight = t !== null 
    ? Math.min(Math.max(((t - minTemp) / (maxTemp - minTemp)) * 100, 0), 100)
    : 0;

  // Colores según temperatura
  const getColor = (temp) => {
    if (temp === null) return { liquid: '#9ca3af', glow: 'rgba(156, 163, 175, 0.3)' };
    if (temp < 15) return { liquid: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' };
    if (temp < 25) return { liquid: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' };
    if (temp < 35) return { liquid: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' };
    return { liquid: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
  };

  const colors = getColor(t);

  const getStatus = (temp) => {
    if (temp === null) return "Sin datos";
    if (temp < 15) return "Muy Frío";
    if (temp < 20) return "Frío";
    if (temp < 25) return "Agradable";
    if (temp < 30) return "Templado";
    if (temp < 35) return "Caliente";
    return "Muy Caliente";
  };

  // Determinar clase de temperatura para el display
  const getTemperatureClass = (temp) => {
    if (temp === null) return styles.noData;
    if (temp < 15) return styles.cold;
    if (temp < 25) return styles.comfortable;
    if (temp < 35) return styles.warm;
    return styles.hot;
  };

  // Determinar clase de temperatura para el fill
  const getFillClass = (temp) => {
    if (temp === null) return styles.fillNoData;
    if (temp < 15) return styles.fillCold;
    if (temp < 25) return styles.fillComfortable;
    if (temp < 35) return styles.fillWarm;
    return styles.fillHot;
  };

  // 🔥 FUNCIÓN PARA CONTROLAR EL LED
  const toggleLED = async () => {
    setLoading(true);
    try {
      const newStatus = !ledStatus;
      
      // 🎯 TU ENDPOINT REAL
      const response = await fetch('https://unanimous-postretinal-quincy.ngrok-free.dev/arduino/comando/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420',
        },
        body: JSON.stringify({
          comando: newStatus ? "1" : "0",
          hay_comando: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLedStatus(newStatus);
        console.log(`💡 LED ${newStatus ? 'Encendido' : 'Apagado'}`, data);
      } else {
        console.error('❌ Error al controlar LED:', response.status);
        alert('Error al enviar comando al LED');
      }
    } catch (error) {
      console.error('❌ Error al enviar comando:', error);
      alert('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Indicador de conexión */}
      <div className={`${styles.connectionIndicator} ${isConnected ? styles.connected : styles.disconnected}`}>
        {isConnected ? (
          <Wifi size={16} className="text-white" />
        ) : (
          <WifiOff size={16} className="text-white" />
        )}
      </div>

      <div className={styles.card}>
        {/* Termómetro SVG */}
        <div className={styles.thermometerContainer}>
          <svg width="120" height="280" viewBox="0 0 120 280">
            {/* Tubo del termómetro */}
            <rect x="35" y="20" width="50" height="180" rx="25" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
            
            {/* Bulbo inferior */}
            <circle cx="60" cy="235" r="35" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
            
            {/* Líquido en el bulbo */}
            <circle cx="60" cy="235" r="28" fill={colors.liquid} className="transition-all duration-700">
              <animate attributeName="r" values="28;29;28" dur="2s" repeatCount="indefinite"/>
            </circle>
            
            {/* Brillo en el bulbo */}
            <circle cx="52" cy="227" r="10" fill="white" opacity="0.3"/>
            
            {/* Líquido que sube */}
            <defs>
              <linearGradient id="liquidGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={colors.liquid} stopOpacity="1"/>
                <stop offset="100%" stopColor={colors.liquid} stopOpacity="0.8"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
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
        <div className={styles.displaySection}>
          <div className={`${styles.temperatureDisplay} ${getTemperatureClass(t)}`}>
            {t !== null ? `${t.toFixed(1)}°` : "--.-°"}
          </div>
          <div className={styles.statusBadge} style={{ color: colors.liquid }}>
            <span>
              {getStatus(t)}
            </span>
          </div>
        </div>

        {/* Barra de temperatura */}
        <div className={styles.progressSection}>
          <div>
            <div className={styles.progressBar}>
              <div 
                className={`${styles.progressFill} ${getFillClass(t)}`}
                style={{ width: `${liquidHeight}%` }}
              />
            </div>
          </div>
          <div className={styles.progressLabels}>
            <span>-10°C</span>
            <span>50°C</span>
          </div>
        </div>

        {/* 🔥 SECCIÓN DE CONTROL LED */}
        <div className={styles.ledControlSection}>
          <button
            onClick={toggleLED}
            disabled={!isConnected || loading}
            className={styles.ledButton}
            style={{
              backgroundColor: ledStatus ? '#ef4444' : '#10b981',
            }}
          >
            <Lightbulb size={20} />
            {loading ? 'Enviando...' : ledStatus ? '💡 Apagar LED' : '💡 Encender LED'}
          </button>
          
          {/* Indicador de estado */}
          <div className={styles.ledStatus}>
            Estado: <span className={ledStatus ? styles.ledOn : styles.ledOff}>
              {ledStatus ? '🔴 Encendido' : '⚫ Apagado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}