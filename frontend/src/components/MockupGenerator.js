import React, { useState, useEffect } from 'react';
import ProductCanvas from './ProductCanvas';

function MockupGenerator({ image, onMockupCreated }) {
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    console.log('MockupGenerator useEffect ejecutado');
    console.log('Prop image:', image);
    
    // Cargar imagen desde localStorage si viene de la galería
    const savedMockupImage = localStorage.getItem('mockupImage');
    console.log('localStorage mockupImage:', savedMockupImage);
    console.log('Todos los items en localStorage:', Object.keys(localStorage));
    
    if (savedMockupImage) {
      try {
        const mockupData = JSON.parse(savedMockupImage);
        console.log('Datos del mockup parseados:', mockupData);
        setUploadedImage(mockupData.imageUrl);
        // NO limpiar localStorage inmediatamente para debugging
        // localStorage.removeItem('mockupImage');
      } catch (error) {
        console.error('Error parseando mockupImage:', error);
      }
    } else if (image) {
      console.log('Usando imagen de props:', image);
      setUploadedImage(image);
    } else {
      console.log('No hay imagen disponible');
      setUploadedImage(null);
    }
  }, [image]);

  return (
    <div className="App">
      <h1>Generador Mockups</h1>
      {uploadedImage ? (
        <ProductCanvas
          image={uploadedImage}
          onMockupCreated={onMockupCreated} 
        />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>No hay imagen para generar mockup</p>
          <p>Para usar esta función:</p>
          <ol style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>Ve a "MI GALERÍA" en el menú</li>
            <li>Haz click en el botón de carrito 🛒 de cualquier imagen</li>
            <li>Serás redirigido aquí con la imagen cargada</li>
          </ol>
          <button 
            onClick={() => window.location.href = '/imagenes-generadas'}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Ir a Mi Galería
          </button>
        </div>
      )}
    </div>
  );
}

export default MockupGenerator;
