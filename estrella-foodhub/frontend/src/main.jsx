import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>
    <ThemeProvider><AuthProvider>
      <ErrorBoundary><App /></ErrorBoundary>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </AuthProvider></ThemeProvider>
  </React.StrictMode>);
