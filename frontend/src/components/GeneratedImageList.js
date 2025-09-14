import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from './users/hooks/useAuth';
import { CloudArrowDownIcon, ShoppingBagIcon, TrashIcon, BeakerIcon } from '@heroicons/react/24/outline';
import Loader from './Loader';
import { Link } from 'react-router-dom';

const GeneratedImagesList = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { loggedInUser } = useAuth();

  useEffect(() => {
    if (!loggedInUser) return;

    const fetchGeneratedImages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user-generated-images', {
          headers: {
            Authorization: `Bearer ${loggedInUser.accessToken}`, 
          },
        });

        if (response.data.success) {
          setImages(response.data.images);
        } else {
          setImages([]); // No hay imágenes, entonces dejamos el array vacío
        }
      } catch (error) {
        console.error('Error al obtener las imágenes generadas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneratedImages();
  }, [loggedInUser]);

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
        await axios.delete(`http://localhost:5000/api/delete-image/${imageId}`, {
          headers: {
            Authorization: `Bearer ${loggedInUser.accessToken}`,
          },
        });

        setImages(images.filter(image => image.id !== imageId));

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
      <div className='galeriaImagenes'>
        <ul>
          {images.map((image) => (
            <li key={image.id}>
              <img 
                src={image.imageUrl} 
                alt="Generated" 
                style={{ width: '300px' }} 
              />
              <p><strong>Prompt:</strong> {image.prompt}</p>

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
                  onClick={() => handleDeleteImage(image.id)}
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
