import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../providers/AuthContext';
import Swal from 'sweetalert2';

const API_URL = process.env.REACT_APP_API_URL;

const MisProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('active');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchProductos();
    }
  }, [currentUser, currentPage, statusFilter]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      
      const response = await axios.get(`${API_URL}/api/productos-ai/user/my-products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          page: currentPage,
          limit: 12,
          status: statusFilter
        }
      });

      if (response.data.success) {
        setProductos(response.data.productos);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching productos:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar tus productos.',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = await currentUser.getIdToken();
        
        await axios.delete(`${API_URL}/api/productos-ai/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        Swal.fire('¡Eliminado!', 'Tu producto ha sido eliminado.', 'success');
        fetchProductos(); // Recargar la lista
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!currentUser) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <h3>Debes iniciar sesión para ver tus productos</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Mis Productos AI</h2>
            <div className="d-flex gap-2">
              <select 
                className="form-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="active">Activos</option>
                <option value="draft">Borradores</option>
                <option value="inactive">Inactivos</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center">
              <h4>No tienes productos AI aún</h4>
              <p>Crea tu primer producto usando nuestro generador AI</p>
              <a href="/" className="btn btn-primary">Crear Producto</a>
            </div>
          ) : (
            <>
              <div className="row">
                {productos.map((producto) => (
                  <div key={producto._id} className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100">
                      <img 
                        src={producto.generatedImage} 
                        className="card-img-top" 
                        alt={producto.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{producto.name}</h5>
                        <p className="card-text text-muted small">
                          {producto.originalPrompt.substring(0, 100)}...
                        </p>
                        
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">
                              {formatDate(producto.createdAt)}
                            </small>
                            <span className={`badge ${
                              producto.status === 'active' ? 'bg-success' : 
                              producto.status === 'draft' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {producto.status}
                            </span>
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {producto.views} vistas • {producto.variants?.length || 0} variantes
                            </small>
                          </div>
                          
                          <div className="btn-group w-100 mt-2" role="group">
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => window.location.href = `/producto/${producto._id}`}
                            >
                              Ver
                            </button>
                            <button 
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => window.location.href = `/editar-producto/${producto._id}`}
                            >
                              Editar
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(producto._id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <nav aria-label="Navegación de productos">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </button>
                    </li>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisProductos;
