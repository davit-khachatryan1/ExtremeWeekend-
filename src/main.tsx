import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { LangProvider } from './lib/i18n';
import { BookingProvider } from './lib/booking';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
    </LangProvider>
  </StrictMode>,
);
