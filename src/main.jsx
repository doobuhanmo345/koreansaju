import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './context/appProvider';
import { AuthContextProvider } from './context/useAuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AppProvider>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </AppProvider>
  </React.StrictMode>,
);
