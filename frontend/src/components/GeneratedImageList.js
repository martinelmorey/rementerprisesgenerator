import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../providers/AuthContext';
import { CloudArrowDownIcon, ShoppingBagIcon, TrashIcon, BeakerIcon } from '@heroicons/react/24/outline';
import Loader from './Loader';
import { Link } from 'react-router-dom';

const GeneratedImagesList = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const fetchGeneratedImages = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get('http://localhost:5000/api/user-generated-images', {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });

        if (response.data.success) {
          setImages(response.data.images);
          setPagination(response.data.pagination || {});
        } else {
          setImages([]);
        }
      } catch (error) {
        console.error('Error al obtener las imágenes generadas:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneratedImages();
  }, [currentUser]);

  const handleDownloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const date = new Date();
      const dateString = date.toISOString().split('T')[0];
      const timeString = date.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `imagen-generada-${dateString}-${timeString}.jpg`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
    }
  };

  const handleGenerateProduct = (image) => {
    console.log(`Botón de generar producto presionado para la imagen con prompt: ${image.prompt}`);
  };

  const handleDeleteImage = async (imageId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const token = await currentUser.getIdToken();
        await axios.delete(`http://localhost:5000/api/generated-images/${imageId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setImages(images.filter(image => image._id !== imageId));

        Swal.fire('¡Eliminada!', 'La imagen ha sido eliminada.', 'success');
      } catch (error) {
        console.error('Error al eliminar la imagen:', error);
        Swal.fire('Error', 'Hubo un error al intentar eliminar la imagen.', 'error');
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (images.length === 0) {
    return (
      <div>
        <h1>Mi Galería</h1>
        <div className='contenedorvaciogaleria'>
          <h5>No has generado ninguna imagen aún.</h5>
          <Link to="/" className="active" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '10px', padding: '8px 12px', backgroundColor: 'rgb(45 142 56)', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            <BeakerIcon className="iconbutton" />
            GENERAR PRODUCTO AI
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Mi Galería</h1>
      {pagination.totalImages && (
        <p>Total de imágenes: {pagination.totalImages}</p>
      )}
      <div className='galeriaImagenes'>
        <ul>
          {images.map((image) => (
            <li key={image._id}>
              <img 
                src={image.imageUrl} 
                alt="Generated" 
                style={{ width: '300px' }} 
              />
              <p><strong>Prompt:</strong> {image.prompt}</p>
              <p><strong>Modo:</strong> {image.generationMode}</p>
              {image.selectedLoras && image.selectedLoras.length > 0 && (
                <p><strong>LoRAs:</strong> {image.selectedLoras.join(', ')}</p>
              )}
              <p><strong>Creada:</strong> {new Date(image.createdAt).toLocaleDateString()}</p>

              <div className='botonesGaleria'>
                <button 
                  onClick={() => handleDownloadImage(image.imageUrl)}
                  className="download-button"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CloudArrowDownIcon className="iconbutton" />
                </button>

                <button onClick={() => handleGenerateProduct(image)}>
                  <ShoppingBagIcon className="iconbutton" />
                </button>

                <button 
                  onClick={() => handleDeleteImage(image._id)}
                  className="delete-button"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <TrashIcon className="iconbutton" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GeneratedImagesList;
