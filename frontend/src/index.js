import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './providers/AuthContext'; 
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <PayPalScriptProvider options={{ "client-id": `${process.env.REACT_APP_PAYPAL_CLIENT_ID}` }}>
        <App />
      </PayPalScriptProvider>
    </AuthProvider> 
  </React.StrictMode>
);
