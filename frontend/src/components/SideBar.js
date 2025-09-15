import React from 'react';
import { useAuth } from '../providers/AuthContext';
import { useUserCredits } from '../hooks/useUserCredits';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { ShoppingBagIcon, BeakerIcon, PhotoIcon, CreditCardIcon, InformationCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';


const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { currentUser } = useAuth();
  const { credits, userTypeLabel, loading } = useUserCredits();

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Botón para cerrar el Sidebar */}
      <button className="close-btn" onClick={toggleSidebar}>Cerrar</button>
      <div className='menusidebar'>
        <h3>Bienvenido</h3>
        <h5>{currentUser.displayName || currentUser.email}</h5>
        
        <div className='contenedortipouser'>
          <p><strong>Creditos:</strong> {loading ? '...' : credits}</p>
          <p><strong>Suscripción:</strong> {loading ? '...' : userTypeLabel}</p>
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
            <Link to="/mis-productos" onClick={toggleSidebar}>
              <ShoppingBagIcon className="iconbutton" /> MIS PRODUCTOS AI
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
              onClick={() => signOut(auth)}
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
