import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Initialize performance monitoring
import './utils/performanceMonitor';
// Register service worker for caching
import { register as registerSW } from './utils/serviceWorkerRegistration';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker in production
if (import.meta.env.PROD) {
  registerSW({
    onSuccess: () => {
      console.log('Content is cached for offline use.');
    },
    onUpdate: () => {
      console.log('New content is available; please refresh.');
    },
  });
}
