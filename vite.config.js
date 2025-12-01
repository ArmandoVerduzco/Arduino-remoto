import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuración del servidor para ngrok + Tauri
  server: {
    host: '0.0.0.0',          // ✅ IMPORTANTE: permite acceso externo (ngrok)
    port: 5173,
    strictPort: true,
    open: false,              // no abre navegador automáticamente
    
    // ✅ PERMITE TODOS LOS HOSTS (crucial para ngrok)
    allowedHosts: [
      'epicontinental-kimbery-overharshly.ngrok-free.dev',
      'localhost',
      '.ngrok-free.dev',      // permite cualquier subdominio de ngrok
      '.ngrok.io',            // por si usas ngrok.io
    ],
    
    // ✅ Configuración crucial para ngrok
    hmr: {
      protocol: 'ws',         // usa WebSocket para Hot Module Replacement
      host: 'localhost',      // fallback para desarrollo local
      port: 5173,
    },
    
    // Para Tauri: ignora cambios en src-tauri
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    
    // ✅ Configuración de CORS para desarrollo
    cors: true,
    
    // ✅ Importante para que ngrok no tenga problemas con los assets
    proxy: {},
  },
  
  // ✅ Variables de entorno
  envPrefix: ['VITE_', 'TAURI_'],
  
  // ✅ Base URL - importante si usas rutas
  base: '/',

  clearScreen: false,
})