import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { mantineTheme, colorSchemeManager } from './theme/mantineTheme';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider 
      theme={mantineTheme} 
      defaultColorScheme="dark" 
      colorSchemeManager={colorSchemeManager}
    >
      <App />
    </MantineProvider>
  </StrictMode>,
);
