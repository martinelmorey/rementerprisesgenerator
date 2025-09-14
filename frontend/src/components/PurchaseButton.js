import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../providers/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

// Función para convertir una DataURL a Blob
const convertToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return await response.blob();
};

const PurchaseButton = ({ generatedImage, mockupImage, prompt, categoryId, generationMode, selectedLoras, onSuccess }) => {
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();  

  console.log(mockupImage)

  const handlePurchase = async () => {
    try {
      setLoading(true);

      if (!currentUser) {
        Swal.fire({
          title: 'Error',
          text: 'Debes iniciar sesión para crear productos.',
          icon: 'error',
        });
        return;
      }

      if (!generatedImage || !mockupImage) {
        Swal.fire({
          title: 'Error',
          text: 'Faltan imágenes para crear el producto.',
          icon: 'error',
        });
        return;
      }

      if (!productName.trim()) {
        Swal.fire({
          title: 'Error',
          text: 'Por favor ingresa un nombre para el producto.',
          icon: 'error',
        });
        return;
      }

      const formData = new FormData();
      const timestamp = Date.now();

      // Convertir la imagen generada a Blob
      const generatedImageBlob = await convertToBlob(generatedImage);

      // Usar directamente los blobs de mockup que ya tienes (sin reconvertir)
      const frameBlob = mockupImage.frameBlob;
      const pillowBlob = mockupImage.pillowBlob;
      const tshirtBlob = mockupImage.tshirtBlob;

      console.log(frameBlob)
      console.log(pillowBlob)
      console.log(tshirtBlob)


      if (!frameBlob || !pillowBlob || !tshirtBlob) {
        Swal.fire({
          title: 'Error',
          text: 'Faltan imágenes de los mockups para crear el producto.',
          icon: 'error',
        });
        return;
      }

      // Añadir los blobs a FormData
      formData.append('image', generatedImageBlob, `generated-image-${timestamp}.jpg`);
      formData.append('frameImage', frameBlob, `frame-image-${timestamp}.jpg`);
      formData.append('pillowImage', pillowBlob, `pillow-image-${timestamp}.jpg`);
      formData.append('tshirtImage', tshirtBlob, `tshirt-image-${timestamp}.jpg`);

      // Añadir datos del producto
      formData.append('productName', productName);
      formData.append('prompt', prompt);
      formData.append('categoryId', categoryId);
      formData.append('generationMode', generationMode || 'LoRAs');
      
      if (selectedLoras && selectedLoras.length > 0) {
        formData.append('selectedLoras', JSON.stringify(selectedLoras));
      }

      // Obtener token de autenticación
      const token = await currentUser.getIdToken();

      // Enviar la solicitud para crear el producto AI en MongoDB
      const response = await axios.post(`${API_URL}/api/productos-ai/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.data.success) {
        Swal.fire({
          title: '¡Producto creado con éxito!',
          text: 'Tu producto AI ha sido guardado en tu galería personal.',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Ver mis productos',
          cancelButtonText: 'Crear otro'
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirigir a la galería de productos del usuario
            window.location.href = '/mis-productos';
          }
        });

        // Limpiar el formulario
        setProductName('');
        
        if (onSuccess) onSuccess(response.data.product);
      }
    } catch (error) {
      console.error('Error durante el proceso de creación:', error);
      
      let errorMessage = 'Hubo un problema durante el proceso de creación. Por favor, inténtalo de nuevo.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='purchaseButtonContainer'>
      <input
        type="text"
        placeholder="Elige un nombre para el producto"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        className="form-control mb-2 productname"
        disabled={loading}
      />
      <button 
        className="btn btn-primary" 
        onClick={handlePurchase}
        disabled={loading || !productName.trim()}
      >
        {loading ? 'Creando producto...' : 'Crear producto AI'}
      </button>
      
      <small className="text-muted mt-2 d-block">
        Tu producto se guardará en MongoDB y estará disponible en tu galería personal.
      </small>
    </div>
  );
};

export default PurchaseButton;
