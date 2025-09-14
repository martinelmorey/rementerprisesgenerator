import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva'; 
import AdjustableImage from './AdjustableImage';
import PillowMockup from './PillowMockup';
import FrameMockup from './FrameMockup';
import TshirtMockup from './TshirtMockup';

function ProductCanvas({ image, onMockupCreated }) {
  // Define las referencias individualmente
  const frameRef = useRef();
  const pillowRef = useRef();
  const tshirtRef = useRef();

  const previewRef = useRef();

  const scrollLeft = () => {
    if (previewRef.current) {
      previewRef.current.scrollBy({ left: -500, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (previewRef.current) {
      previewRef.current.scrollBy({ left: 500, behavior: 'smooth' });
    }
  };
  

  // Estados separados para cada mockup
  const [frameAdjustments, setFrameAdjustments] = useState({
    x: 0,
    y: 0,
    width: 500,
    height: 500,
    rotation: 0,
  });

  const [pillowAdjustments, setPillowAdjustments] = useState({
    x: 0,
    y: 0,
    width: 500,
    height: 500,
    rotation: 0,
  });

  const [tshirtAdjustments, setTshirtAdjustments] = useState({
    x: 0,
    y: 0,
    width: 500,
    height: 500,
    rotation: 0,
  });

  // Estado para manejar el mockup activo
  const [selectedMockup, setSelectedMockup] = useState('frame');

  // Función de ajuste para cada mockup
  const handleAdjust = useCallback((newAdjustments) => {
    if (selectedMockup === 'frame') {
      setFrameAdjustments(newAdjustments);
    } else if (selectedMockup === 'pillow') {
      setPillowAdjustments(newAdjustments);
    } else if (selectedMockup === 'tshirt') {
      setTshirtAdjustments(newAdjustments);
    }
  }, [selectedMockup]);


  const handleMockupChange = (mockup) => {
    setSelectedMockup(mockup);
  };


useEffect(() => {
  const handleGenerateMockup = async () => {
    if (!frameRef.current || !pillowRef.current || !tshirtRef.current) {
      console.error("No se encontraron los `Stage` para generar los mockups.");
      return;
    }

    try {
      // Exporta los `Stage` completos
      const frameDataUrl = frameRef.current.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });
      const pillowDataUrl = pillowRef.current.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });
      const tshirtDataUrl = tshirtRef.current.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });

      // Convertir DataURLs a Blob
      const frameBlob = await (await fetch(frameDataUrl)).blob();
      const pillowBlob = await (await fetch(pillowDataUrl)).blob();
      const tshirtBlob = await (await fetch(tshirtDataUrl)).blob();

      if (onMockupCreated) {
        onMockupCreated({ frameBlob, pillowBlob, tshirtBlob });
      }
    } catch (error) {
      console.error("Error al generar los mockups del canvas:", error);
    }
  };

  if (image) {
    handleGenerateMockup();
  }
}, [
  image,
  onMockupCreated,
  frameAdjustments,
  pillowAdjustments,
  tshirtAdjustments, // Incluye los ajustes al arreglo de dependencias
]);

  

  return (
    <div className='product-canvas-container'>
      <div className='adjust-image-container'>
        <h2>Ajusta tu Imagen</h2>
        <p>Utiliza los nodos disponibles para mover, redimensionar y rotar la imagen. Asegúrate de que se ajuste perfectamente al diseño del mockup.</p>
        <div className='button-container'>
          <button onClick={() => handleMockupChange('frame')}>Ajustar Cuadro</button>
          <button onClick={() => handleMockupChange('pillow')}>Ajustar Almohadón</button>
          <button onClick={() => handleMockupChange('tshirt')}>Ajustar Remera</button>
        </div>  
        <Stage width={600} height={600}>
        <Layer>
            {selectedMockup === 'frame' && (
              <AdjustableImage imageUrl={image} onChange={handleAdjust} />
            )}
            {selectedMockup === 'pillow' && (
              <AdjustableImage imageUrl={image} onChange={handleAdjust} />
            )}
            {selectedMockup === 'tshirt' && (
              <AdjustableImage imageUrl={image} onChange={handleAdjust} />
            )}
          </Layer>
        </Stage>
      </div>

      <div className='preview-mockup-container'>
        <h2>Vista Previa de los Mockups</h2>

        <div className="scroll-buttons">
          <button onClick={scrollLeft}>Izquierda</button>
          <button onClick={scrollRight}>Derecha</button>
        </div>

        <div className='mockup-preview' ref={previewRef}>
          <div className='framemock'>
            <FrameMockup
              ref={frameRef}
              templateUrl="/assets/images/mockups/cuadromockup.jpg"
              imageUrl={image}
              adjustments={frameAdjustments}
            />
          </div>

          <div className='pillowmock'>
            <PillowMockup
              ref={pillowRef}
              templateUrl="/assets/images/mockups/almohadonmockup.jpg"
              imageUrl={image}
              adjustments={pillowAdjustments}
            />
          </div>

          <div className='tshirtmock'>
            <TshirtMockup
              ref={tshirtRef}
              templateUrl="/assets/images/mockups/remeramockup.jpg"
              imageUrl={image}
              adjustments={tshirtAdjustments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCanvas;
