import React, { useRef, useEffect, useState } from 'react';
import { Image, Transformer } from 'react-konva';
import useImage from 'use-image';

function AdjustableImage({ imageUrl, onChange }) {
  const [image] = useImage(imageUrl);
  const imageRef = useRef();
  const transformerRef = useRef();
  const [initialScale, setInitialScale] = useState(1);

  useEffect(() => {
    if (image) {
      const containerWidth = 600; // Ancho del contenedor
      const containerHeight = 600; // Alto del contenedor
  
      // Calcular la escala que ajustará la imagen al contenedor
      const scale = Math.min(
        containerWidth / image.width,
        containerHeight / image.height
      );
  
      // Aplicar la escala calculada
      setInitialScale(scale);
  
      // Establecer el tamaño inicial ajustado y centralizar la imagen
      const width = image.width * scale;
      const height = image.height * scale;
  
      imageRef.current.width(width);
      imageRef.current.height(height);
      imageRef.current.scale({ x: 1, y: 1 });
  
      // Notificar los cambios iniciales
      onChange({
        x: (containerWidth - width) / 2, // Centrado en el contenedor
        y: (containerHeight - height) / 2,
        rotation: 0,
        width: width,
        height: height,
      });
  
      if (transformerRef.current) {
        transformerRef.current.nodes([imageRef.current]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [image, onChange]); // Incluye 'onChange' como dependencia
  

  const handleTransformEnd = () => {
    const node = imageRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: node.width() * scaleX,
      height: node.height() * scaleY,
    });
  };

  return (
    <>
      <Image
        image={image}
        x={0} // Comienza en (0,0) pero se centrará luego
        y={0}
        draggable
        ref={imageRef}
        scaleX={initialScale} // Aplica la escala calculada
        scaleY={initialScale} // Aplica la escala calculada
        onTransformEnd={handleTransformEnd}
        onDragEnd={handleTransformEnd}
      />
      <Transformer ref={transformerRef} />
    </>
  );
}

export default AdjustableImage;
