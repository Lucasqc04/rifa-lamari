import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import FloatingWhatsappButton from './components/FloatingWhatsappButton.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <FloatingWhatsappButton />
  </StrictMode>
);
