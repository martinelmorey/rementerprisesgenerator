// Header.js
import React from 'react';
import { useAuth } from './users/hooks/useAuth';

function Header({ toggleSidebar }) { // Acepta toggleSidebar como prop
  const { isLoggedIn } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <img src="/assets/images/remlogo.png" alt="REM Logo" />
        </div>
        <nav className="nav">
          <ul>
            {isLoggedIn && (
              <>
                <li>
                  <button onClick={toggleSidebar}>Menu</button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
