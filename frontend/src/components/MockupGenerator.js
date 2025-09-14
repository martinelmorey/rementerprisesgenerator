import React, { useState, useEffect } from 'react';
import ProductCanvas from './ProductCanvas';

function MockupGenerator({ image, onMockupCreated }) {
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    if (image) {
      setUploadedImage(image); // Establecer la imagen generada como imagen cargada
    } else {
      setUploadedImage(null); // Limpiar la imagen si no hay ninguna
    }
  }, [image]);

  return (
    <div className="App">
      <h1>Generador Mockups</h1>
      {uploadedImage && (
        <ProductCanvas
          image={uploadedImage}
          onMockupCreated={onMockupCreated} 
        />
      )}
    </div>
  );
}

export default MockupGenerator;
