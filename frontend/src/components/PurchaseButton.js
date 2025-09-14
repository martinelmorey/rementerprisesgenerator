import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = process.env.REACT_APP_API_URL;

// Función para convertir una DataURL a Blob
const convertToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return await response.blob();
};

const PurchaseButton = ({ generatedImage, mockupImage, prompt, categoryId, onSuccess }) => {
  const [productName, setProductName] = useState('');  

  console.log(mockupImage)

  const handlePurchase = async () => {
    try {
      if (!generatedImage || !mockupImage) {
        Swal.fire({
          title: 'Error',
          text: 'Faltan imágenes para crear el producto.',
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

      // Añadir el nombre del producto, la descripción y la categoría
      formData.append('productName', productName);
      formData.append('prompt', prompt);
      formData.append('categoryId', categoryId);

      // Enviar la solicitud para crear el producto
      const response = await axios.post(`${API_URL}/create-product`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Swal.fire({
          title: '¡Producto creado con éxito!',
          text: 'Puedes comprarlo haciendo clic en el botón de abajo:',
          icon: 'success',
          showCancelButton: true, // Añadir un botón de cancelación opcional
          confirmButtonText: 'Ir a la página del producto',
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirigir a la página del producto
            window.open(response.data.productUrl, '_blank');
          }
        });

        if (onSuccess) onSuccess(response.data.productUrl);
      }
    } catch (error) {
      console.error('Error durante el proceso de compra:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema durante el proceso de compra. Por favor, inténtalo de nuevo.',
        icon: 'error',
      });
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
      />
      <button className="btn btn-primary" onClick={handlePurchase}>
        Crear producto
      </button>
    </div>
  );
};

export default PurchaseButton;
