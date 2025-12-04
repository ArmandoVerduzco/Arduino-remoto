import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Settings, X, Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export default function ConnectionControls({
  mode,
  setMode,
  endpoints = {},
  setEndpoints = () => {},
  setPollingInterval,
  isConnected,
  isMonitoringActive = false,
  onStartMonitoring = () => {},
  onStopMonitoring = () => {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState('endpoints');
  const [tempEndpoints, setTempEndpoints] = useState(endpoints);

  // ✅ Valores por defecto OPTIMIZADOS - Solo 2 endpoints
  const defaultEndpoints = {
    sensores: "http://192.168.1.78:8002/api/sensores/ultimos/", // 🚀 Endpoint consolidado
    control: "https://unanimous-postretinal-quincy.ngrok-free.dev/arduino/comando/"
  };

  const currentEndpoints = { ...defaultEndpoints, ...endpoints };

  const handleTempChange = (key, value) => {
    setTempEndpoints({ ...tempEndpoints, [key]: value });
  };

  const handleSave = () => {
    setEndpoints(tempEndpoints);
    onStartMonitoring();
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempEndpoints(defaultEndpoints);
    setEndpoints(defaultEndpoints);
    if (setPollingInterval) {
      setPollingInterval(300);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Polling cada 300ms
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Botón flotante para abrir configuración */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 999
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
        }}
      >
        <Settings size={28} color="white" />
      </button>

      {/* Panel lateral */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
          />

          {/* Panel */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '450px',
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: '#1e293b',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Activity size={24} color="white" />
                <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: 600 }}>
                  Configuración
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                <X size={20} color="white" />
              </button>
            </div>

            {/* Estado de conexión */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: isConnected ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)'
            }}>
              {isConnected ? (
                <>
                  <Wifi size={20} color="#4ade80" />
                  <span style={{ color: '#4ade80', fontWeight: 500 }}>Conectado - Modo Optimizado 🚀</span>
                </>
              ) : (
                <>
                  <WifiOff size={20} color="#f87171" />
                  <span style={{ color: '#f87171', fontWeight: 500 }}>Desconectado</span>
                </>
              )}
            </div>

            {/* Contenido con scroll */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px'
            }}>
              {/* Modo de conexión */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px'
                }}>
                  Modo de conexión
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0f172a',
                    border: '2px solid #334155',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="polling">📡 Polling HTTP (Optimizado)</option>
                  <option value="sse">📻 Server-Sent Events (SSE)</option>
                  <option value="websocket">🔌 WebSocket</option>
                </select>
              </div>

              {/* Sección de Endpoints */}
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={() => toggleSection('endpoints')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    fontWeight: 500
                  }}
                >
                  <span>🔗 Endpoints de API</span>
                  {expandedSection === 'endpoints' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSection === 'endpoints' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* 🚀 Endpoint Consolidado de Sensores */}
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#cbd5e1',
                        fontSize: '13px',
                        marginBottom: '6px',
                        fontWeight: 500
                      }}>
                        🚀 Sensores Consolidados (Temp + Humedad + Distancia)
                      </label>
                      <input
                        type="text"
                        value={tempEndpoints.sensores || currentEndpoints.sensores}
                        onChange={(e) => handleTempChange('sensores', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#0f172a',
                          border: '2px solid #10b981',
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                        placeholder="http://192.168.1.78:8002/api/sensores/ultimos/"
                      />
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        ✅ Endpoint optimizado: 1 petición en lugar de 3 - Respuesta más rápida
                      </div>
                    </div>

                    {/* Control LED */}
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#cbd5e1',
                        fontSize: '13px',
                        marginBottom: '6px',
                        fontWeight: 500
                      }}>
                        💡 Control LED
                      </label>
                      <input
                        type="text"
                        value={tempEndpoints.control || currentEndpoints.control}
                        onChange={(e) => handleTempChange('control', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#0f172a',
                          border: '2px solid #667eea',
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                        placeholder="https://tu-ngrok.app/arduino/comando/"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Intervalo de actualización */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '12px'
                }}>
                  ⏱️ Intervalo: <span style={{ color: '#10b981', fontWeight: 700 }}>300ms</span> (Ultra Rápido)
                </label>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#cbd5e1',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  📊 Con el endpoint consolidado + 300ms obtendrás actualizaciones casi en tiempo real
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              
              {/* Fila 1: Reset y Guardar */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleReset}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
                
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Save size={18} />
                  Guardar y Conectar
                </button>
              </div>

              {/* Fila 2: Conectar/Desconectar */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {isMonitoringActive ? (
                  <button
                    onClick={onStopMonitoring}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      fontSize: '15px',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    <WifiOff size={20} />
                    Desconectar Sensores
                  </button>
                ) : (
                  <button
                    onClick={onStartMonitoring}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      fontSize: '15px',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <Wifi size={20} />
                    Conectar Sensores
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        input:focus, select:focus {
          border-color: #667eea !important;
        }
      `}</style>
    </>
  );
}