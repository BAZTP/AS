import React, { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes';
import { storageService } from './services/storageService';

export const App: React.FC = () => {
  useEffect(() => {
    // Inicializar catálogo y configuración demo si es la primera visita
    storageService.initializeDefaultDataIfNeeded();
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
