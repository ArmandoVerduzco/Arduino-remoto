import React from 'react';
import styles from '../styles/TemperatureHistory.module.css';

export default function TemperatureHistory({ history }) {
  if (history.length === 0) return null;

  const maxHistory = 20;
  const displayHistory = history.slice(-maxHistory);
  const maxTemp = Math.max(...displayHistory);
  const minTemp = Math.min(...displayHistory);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📊 Historial</h3>
      <div className={styles.chartContainer}>
        {displayHistory.map((temp, i) => {
          const height = ((temp - minTemp) / (maxTemp - minTemp || 1)) * 100 || 50;
          const colorClass = temp < 20 ? styles.cold : temp < 30 ? styles.moderate : styles.hot;
          return (
            <div key={i} className={styles.barWrapper}>
              <div 
                className={`${styles.bar} ${colorClass}`}
                style={{ height: `${height}%` }}
              />
              <div className={styles.tooltip}>
                {temp.toFixed(1)}°C
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.info}>
        <span>Min: {minTemp.toFixed(1)}°C</span>
        <span>Max: {maxTemp.toFixed(1)}°C</span>
        <span>Actual: {displayHistory[displayHistory.length - 1]?.toFixed(1)}°C</span>
      </div>
    </div>
  );
}