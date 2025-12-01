// connection.js
// Implementa 3 formas de recibir temperatura desde el backend:
// 1) WebSocket (socket.io-client) - recommended if backend soporta socket.io
// 2) EventSource (SSE) - si backend expone /events
// 3) Polling HTTP - simple fallback

import axios from "./http";
import { io } from "socket.io-client";

/**
 * startWebSocket(url, onMessage) - usa socket.io-client
 *   url example: "http://localhost:8000"
 *   backend should emit 'temperature' events or similar
 */
export function startWebSocket(url, onMessage) {
  const socket = io(url, { transports: ["websocket"] });
  socket.on("connect", () => console.log("WS connected", socket.id));
  socket.on("temperature", (payload) => {
    onMessage(payload);
  });
  socket.on("disconnect", () => console.log("WS disconnected"));
  return () => socket.disconnect();
}

/**
 * startSSE(url, onMessage)
 *   url example: "http://localhost:8000/api/temperature/stream/"
 *   backend should send Server-Sent Events with data lines.
 */
export function startSSE(url, onMessage) {
  const es = new EventSource(url);
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage(data);
    } catch {
      // si el backend manda solo valor plano
      onMessage(e.data);
    }
  };
  es.onerror = (err) => {
    console.error("SSE error", err);
    // no cerrar aquí; dejar al caller decidir
  };
  return () => es.close();
}

/**
 * startPolling(url, onMessage, intervalMs)
 *   url example: "http://localhost:8000/api/temperature/latest/"
 *   backend returns JSON: { temperature: 25.3 }
 */
export function startPolling(url, onMessage, intervalMs = 1000) {
  let stopped = false;
  async function tick() {
    if (stopped) return;
    try {
      const res = await axios.get(url);
      // intenta detectar campo temp
      const payload = res.data?.temperature ?? res.data;
      onMessage(payload);
    } catch (err) {
      console.error("Polling error", err);
    } finally {
      setTimeout(tick, intervalMs);
    }
  }
  tick();
  return () => {
    stopped = true;
  };
}
