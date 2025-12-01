import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TestSimulator from './TestSimulator.jsx';
import './index.css'; // Tailwind + estilos globales
import './App.css';   // estilos específicos de componentes
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
