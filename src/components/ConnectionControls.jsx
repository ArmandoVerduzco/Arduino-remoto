import React from 'react';
import { Activity } from 'lucide-react';
import styles from '../styles/ConnectionControls.module.css';

export default function ConnectionControls({ 
  mode, 
  setMode, 
  url, 
  setUrl, 
  pollingInterval, 
  setPollingInterval, 
  onConnect, 
  isConnected 
}) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <Activity />
        Configuración de Conexión
      </h3>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Modo de conexión</label>
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value)}
          className={styles.select}
        >
          <option value="websocket">🔌 WebSocket (socket.io)</option>
          <option value="sse">📡 SSE (EventSource)</option>
          <option value="polling">🔄 Polling HTTP</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>URL del servidor</label>
        <input 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://192.168.1.100:8000"
          className={styles.input}
        />
      </div>

      {mode === "polling" && (
        <div className={styles.rangeContainer}>
          <label className={styles.rangeLabel}>
            Intervalo de actualización: {pollingInterval}ms
          </label>
          <input 
            type="range"
            min="500"
            max="5000"
            step="100"
            value={pollingInterval} 
            onChange={(e) => setPollingInterval(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <div className={styles.rangeLabels}>
            <span>0.5s</span>
            <span>5s</span>
          </div>
        </div>
      )}

      <button
        onClick={onConnect}
        className={`${styles.button} ${isConnected ? styles.buttonDisconnect : styles.buttonConnect}`}
      >
        {isConnected ? '🔌 Desconectar' : '⚡ Conectar'}
      </button>
    </div>
  );
}