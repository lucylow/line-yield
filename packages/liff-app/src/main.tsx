import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeLIFF } from './config/liff';
import './index.css';

// Initialize LIFF before rendering the app
const initApp = async () => {
  try {
    // Initialize LIFF
    const liff = await initializeLIFF();
    
    if (liff) {
      console.log('LIFF initialized:', {
        isLoggedIn: liff.isLoggedIn(),
        isInClient: liff.isInClient(),
        os: liff.getOS(),
        version: liff.getVersion(),
      });
    }
    
    // Render the app
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Render error fallback
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h1>LINE Yield</h1>
          <p>Failed to initialize LINE integration.</p>
          <p>Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }
};

// Start the app
initApp();