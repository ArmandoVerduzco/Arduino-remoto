import { useState, useEffect } from "react";

export default function useTemperature({ mode, url, pollingInterval }) {
  const [temperature, setTemperature] = useState(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let cleanup;

    // ====== MODO WEBSOCKET ======
    if (mode === "websocket") {
      console.log('WebSocket mode - esperando conexión real');
    }

    // ====== MODO SSE ======
    if (mode === "sse") {
      try {
        const eventSource = new EventSource(url);
        
        eventSource.onopen = () => {
          setConnected(true);
          console.log('📡 SSE conectado');
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const temp = data.temperature || data.temp || data.valor || data.value;
            if (temp !== undefined && temp !== null) {
              setTemperature(parseFloat(temp));
              setHistory(prev => [...prev, parseFloat(temp)]);
            }
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
        setConnected(false);
      }
    }

    // ====== MODO POLLING ======
    if (mode === "polling") {
      setConnected(false);
      
      const fetchTemperature = async () => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': '69420',  // Evita la página de advertencia
              'Accept': 'application/json',
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Tu formato específico: { datos: [{valor: ...}] }
          if (data.datos && Array.isArray(data.datos) && data.datos.length > 0) {
            const temp = parseFloat(data.datos[0].valor);
            console.log('✅ Temperatura recibida:', temp, '°C');
            
            setTemperature(temp);
            setHistory(prev => [...prev, temp]);
            setConnected(true);
          } 
          // Formatos alternativos
          else {
            const temp = data.temperature || data.temp || data.value || data.valor;
            if (temp !== undefined && temp !== null) {
              setTemperature(parseFloat(temp));
              setHistory(prev => [...prev, parseFloat(temp)]);
              setConnected(true);
            } else {
              console.warn('⚠️ No se encontró temperatura en:', data);
            }
          }
        } catch (error) {
          console.error('❌ Error al obtener datos:', error);
          setConnected(false);
        }
      };
      
      fetchTemperature(); // Primera llamada inmediata
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