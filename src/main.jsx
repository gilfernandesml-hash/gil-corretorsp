import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css';

// Performance (opcional)
import { onCLS, onFID, onLCP } from 'web-vitals';

if (import.meta.env.DEV) {
  const logMetric = (metric) => {
    console.log(`[Performance] ${metric.name}: ${metric.value}`);
  };
  onCLS(logMetric);
  onFID(logMetric);
  onLCP(logMetric);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />,
)