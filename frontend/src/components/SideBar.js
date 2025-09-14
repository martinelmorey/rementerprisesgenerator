import React from 'react';
import { useAuth } from './users/hooks/useAuth';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, BeakerIcon, PhotoIcon, CreditCardIcon, InformationCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';


const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isLoggedIn, userData, handleLogOut } = useAuth();

  if (!isLoggedIn || !userData) {
    return null;
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Botón para cerrar el Sidebar */}
      <button className="close-btn" onClick={toggleSidebar}>Cerrar</button>
      <div className='menusidebar'>
        <h3>Bienvenido</h3>
        <h5>{userData.name}</h5>
        
        <div className='contenedortipouser'>
          <p><strong>Creditos:</strong> {userData.points}</p>
          <p><strong>Suscripción:</strong> {userData.subscriptionStatus}</p>
        </div>
  
        <ul>
          <li>
            <Link to="/" className="active" onClick={toggleSidebar}>
              <BeakerIcon className="iconbutton" /> GENERAR PRODUCTO AI
            </Link>
          </li>
          <li>
            <Link to="/imagenes-generadas" className="active" onClick={toggleSidebar}>
              <PhotoIcon className="iconbutton" /> MI GALERIA
            </Link>
          </li>
          <li>
            <Link to="/payment" onClick={toggleSidebar}>
              <CreditCardIcon className="iconbutton" /> CRÉDITOS
            </Link>
          </li>
          <li>
            <Link to="/como-funciona" onClick={toggleSidebar}>
              <InformationCircleIcon className="iconbutton" /> COMO FUNCIONA
            </Link>
          </li>
          <li>
            <Link to="https://rementerprises.uy/" onClick={toggleSidebar}>
              <ShoppingBagIcon className="iconbutton" /> VOLVER A LA TIENDA
            </Link>
          </li>
          <li>
            <span
              onClick={handleLogOut}
              style={{ cursor: 'pointer' }}
            >
              <ArrowLeftOnRectangleIcon className="iconbutton" /> CERRAR SESIÓN
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
