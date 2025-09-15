import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../providers/AuthContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import './MisProductosAI.css';

function MisProductosAI() {
  const { currentUser } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductos = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching productos for user:', currentUser.uid);
      const token = await currentUser.getIdToken();
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/productos-ai/user/my-products`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setProductos(data.productos || []);
        console.log('Productos loaded:', data.productos?.length || 0);
      } else {
        throw new Error(data.message || 'Error obteniendo productos');
      }
    } catch (err) {
      console.error('Error fetching productos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/productos-ai/${productId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        // Refrescar la lista de productos
        fetchProductos();
        console.log('Producto eliminado exitosamente');
      } else {
        throw new Error('Error eliminando producto');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error eliminando producto: ' + err.message);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  if (!currentUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Inicia sesión para ver tus productos</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Cargando productos...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error: {error}</h2>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mis Productos AI ({productos.length})</h1>
      
      {productos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>No tienes productos aún</h3>
          <p>Crea tu primer producto usando el generador de mockups</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px',
          marginTop: '20px'
        }}>
          {productos.map((producto) => (
            <div key={producto._id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              position: 'relative',
              background: 'linear-gradient(145deg, rgb(11, 11, 11) 0%, rgba(66, 66, 66, 0.39) 100%)'
            }}>
              {/* Botón de eliminar */}
              <button
                onClick={() => handleDeleteProduct(producto._id, producto.name)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#00ff88',
                  border: '1px solid #00ff88',
                  borderRadius: '6px',
                  padding: '0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  width: '35px',
                  height: '35px',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#000000';
                  e.target.style.color = '#00ff88';
                  const icon = e.target.querySelector('svg');
                  if (icon) icon.style.color = '#00ff88';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#00ff88';
                  e.target.style.color = '#ffffff';
                  const icon = e.target.querySelector('svg');
                  if (icon) icon.style.color = 'white';
                }}
                title={`Eliminar ${producto.name}`}
              >
                <TrashIcon style={{ width: '16px', height: '16px', color: 'white' }} />
              </button>

              <div style={{ marginBottom: '10px' }}>
                <img 
                  src={producto.generatedImage} 
                  alt={producto.name}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                  onError={(e) => {
                    console.log('Image error for:', producto.generatedImage);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Image loaded:', producto.generatedImage);
                  }}
                />
              </div>
              
              <h3 style={{ margin: '10px 0', fontSize: '16px' }}>
                {producto.name}
              </h3>
              
              <p style={{ 
                color: '#666', 
                fontSize: '14px',
                fontStyle: 'italic',
                margin: '5px 0'
              }}>
                "{producto.originalPrompt}"
              </p>
              
              <div style={{ fontSize: '12px', color: '#999' }}>
                <div>Estado: {producto.status}</div>
                <div>Modo: {producto.generationMode}</div>
                <div>Creado: {new Date(producto.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MisProductosAI;
