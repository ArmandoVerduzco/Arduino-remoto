import { useState, useEffect } from "react";

export default function useHumidity({ mode, url, pollingInterval }) {
  const [humidity, setHumidity] = useState(null);
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
          console.log('📡 SSE Humedad conectado');
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const hum = data.humidity || data.humedad || data.valor || data.value;
            if (hum !== undefined && hum !== null) {
              setHumidity(parseFloat(hum));
              setHistory(prev => [...prev, parseFloat(hum)]);
            }
          } catch (err) {
            console.error('Error parseando SSE humedad:', err);
          }
        };
        
        eventSource.onerror = () => {
          setConnected(false);
          eventSource.close();
        };
        
        cleanup = () => eventSource.close();
      } catch (error) {
        console.error('Error SSE humedad:', error);
        setConnected(false);
      }
    }

    // ====== MODO POLLING ======
    if (mode === "polling") {
      setConnected(false);
      
      const fetchHumidity = async () => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': '69420',
              'Accept': 'application/json',
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Formato específico: { datos: [{valor: ...}] }
          if (data.datos && Array.isArray(data.datos) && data.datos.length > 0) {
            const hum = parseFloat(data.datos[0].valor);
            console.log('✅ Humedad recibida:', hum, '%');
            
            setHumidity(hum);
            setHistory(prev => [...prev, hum]);
            setConnected(true);
          } 
          // Formatos alternativos
          else {
            const hum = data.humidity || data.humedad || data.value || data.valor;
            if (hum !== undefined && hum !== null) {
              setHumidity(parseFloat(hum));
              setHistory(prev => [...prev, parseFloat(hum)]);
              setConnected(true);
            } else {
              console.warn('⚠️ No se encontró humedad en:', data);
            }
          }
        } catch (error) {
          console.error('❌ Error al obtener humedad:', error);
          setConnected(false);
        }
      };
      
      fetchHumidity(); // Primera llamada inmediata
      const interval = setInterval(fetchHumidity, pollingInterval);
      
      cleanup = () => clearInterval(interval);
    }

    return () => {
      if (cleanup) cleanup();
      setConnected(false);
    };
  }, [mode, url, pollingInterval]);

  return { humidity, connected, history };
}