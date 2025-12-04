import React, { useMemo } from "react";
import styles from "../styles/SensorHistory.module.css";

export default function SensorHistory({ 
  history, 
  sensorName, 
  unit, 
  thresholds = [],
  maxHistory = 20,
  showStats = true 
}) {
  // TODOS LOS HOOKS PRIMERO (antes de cualquier return)
  
  // Filtrar valores válidos y limitar a maxHistory
  const displayHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    return history
      .filter(val => typeof val === 'number' && !isNaN(val))
      .slice(-maxHistory);
  }, [history, maxHistory]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (displayHistory.length === 0) return null;

    const maxVal = Math.max(...displayHistory);
    const minVal = Math.min(...displayHistory);
    const avgVal = displayHistory.reduce((sum, val) => sum + val, 0) / displayHistory.length;
    const currentVal = displayHistory[displayHistory.length - 1];

    return { maxVal, minVal, avgVal, currentVal };
  }, [displayHistory]);

  // Función para obtener color y etiqueta según thresholds
  const getThresholdInfo = useMemo(() => {
    return (val) => {
      if (!thresholds || thresholds.length === 0) {
        return { color: '#9ca3af', label: 'Normal' };
      }

      // Buscar threshold correspondiente
      for (let threshold of thresholds) {
        if (val < threshold.limit) {
          return { color: threshold.color, label: threshold.label };
        }
      }

      // Si supera todos los límites
      const last = thresholds[thresholds.length - 1];
      return { color: last.color, label: last.label };
    };
  }, [thresholds]);

  // AHORA SÍ LOS RETURNS CONDICIONALES
  
  // Validación: sin datos
  if (!history || history.length === 0 || displayHistory.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>📊 {sensorName}</h3>
        <div className={styles.emptyState}>
          <p>Sin datos históricos disponibles</p>
        </div>
      </div>
    );
  }

  // Validación: stats inválidas
  if (!stats) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>📊 {sensorName}</h3>
        <div className={styles.emptyState}>
          <p>Datos inválidos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        📊 {sensorName} 
        <span className={styles.subtitle}>
          (Últimas {displayHistory.length} lecturas)
        </span>
      </h3>

      {/* Gráfico de barras */}
      <div className={styles.chartContainer}>
        {displayHistory.map((val, i) => {
          // Calcular altura relativa (normalizada)
          const range = stats.maxVal - stats.minVal;
          const height = range > 0 
            ? ((val - stats.minVal) / range) * 100 
            : 50;

          const { color, label } = getThresholdInfo(val);

          return (
            <div key={i} className={styles.barWrapper}>
              <div
                className={styles.bar}
                style={{ 
                  height: `${height}%`, 
                  backgroundColor: color,
                  opacity: i === displayHistory.length - 1 ? 1 : 0.7 // Destacar última barra
                }}
                title={`${val.toFixed(1)} ${unit} - ${label}`}
              />
              <div className={styles.tooltip}>
                <strong>{val.toFixed(1)} {unit}</strong>
                <br />
                <small>{label}</small>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estadísticas */}
      {showStats && (
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Min</span>
            <span className={styles.statValue}>
              {stats.minVal.toFixed(1)} {unit}
            </span>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Prom</span>
            <span className={styles.statValue}>
              {stats.avgVal.toFixed(1)} {unit}
            </span>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Max</span>
            <span className={styles.statValue}>
              {stats.maxVal.toFixed(1)} {unit}
            </span>
          </div>
          
          <div className={`${styles.statItem} ${styles.current}`}>
            <span className={styles.statLabel}>Actual</span>
            <span className={styles.statValue}>
              {stats.currentVal.toFixed(1)} {unit}
            </span>
          </div>
        </div>
      )}

      {/* Indicadores de tendencia opcional */}
      <div className={styles.trend}>
        {displayHistory.length > 1 && (
          <>
            {displayHistory[displayHistory.length - 1] > displayHistory[displayHistory.length - 2] ? (
              <span className={styles.trendUp}>↗ Subiendo</span>
            ) : displayHistory[displayHistory.length - 1] < displayHistory[displayHistory.length - 2] ? (
              <span className={styles.trendDown}>↘ Bajando</span>
            ) : (
              <span className={styles.trendStable}>→ Estable</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}