import React from 'react';
import Login from './Login.js';
import { useAuth } from './hooks/useAuth';

const LogInContainer = () => {
  const { setLoggedInUser } = useAuth();

  const handleLogin = (user) => {
    setLoggedInUser(user); 
  };

  return (
    <div className="login-container-popup">
        <Login onLogin={handleLogin} /> 
    </div>
  );
};

export default LogInContainer;
