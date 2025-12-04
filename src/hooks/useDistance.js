import { useState, useEffect } from "react";

export default function useDistance({ mode, url, pollingInterval }) {
  const [distance, setDistance] = useState(null);
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
          console.log('📡 SSE Distancia conectado');
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const dist = data.distance || data.distancia || data.valor || data.value;
            if (dist !== undefined && dist !== null) {
              setDistance(parseFloat(dist));
              setHistory(prev => [...prev, parseFloat(dist)]);
            }
          } catch (err) {
            console.error('Error parseando SSE distancia:', err);
          }
        };
        
        eventSource.onerror = () => {
          setConnected(false);
          eventSource.close();
        };
        
        cleanup = () => eventSource.close();
      } catch (error) {
        console.error('Error SSE distancia:', error);
        setConnected(false);
      }
    }

    // ====== MODO POLLING ======
    if (mode === "polling") {
      setConnected(false);
      
      const fetchDistance = async () => {
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
            const dist = parseFloat(data.datos[0].valor);
            console.log('✅ Distancia recibida:', dist, 'cm');
            
            setDistance(dist);
            setHistory(prev => [...prev, dist]);
            setConnected(true);
          } 
          // Formatos alternativos
          else {
            const dist = data.distance || data.distancia || data.value || data.valor;
            if (dist !== undefined && dist !== null) {
              setDistance(parseFloat(dist));
              setHistory(prev => [...prev, parseFloat(dist)]);
              setConnected(true);
            } else {
              console.warn('⚠️ No se encontró distancia en:', data);
            }
          }
        } catch (error) {
          console.error('❌ Error al obtener distancia:', error);
          setConnected(false);
        }
      };
      
      fetchDistance(); // Primera llamada inmediata
      const interval = setInterval(fetchDistance, pollingInterval);
      
      cleanup = () => clearInterval(interval);
    }

    return () => {
      if (cleanup) cleanup();
      setConnected(false);
    };
  }, [mode, url, pollingInterval]);

  return { distance, connected, history };
}