import React, { useRef, useEffect, useState } from 'react';
import { Image, Transformer } from 'react-konva';
import useImage from 'use-image';

function AdjustableImage({ imageUrl, onChange, currentAdjustments }) {
  const [image] = useImage(imageUrl);
  const imageRef = useRef();
  const transformerRef = useRef();
  const [initialScale, setInitialScale] = useState(1);

  useEffect(() => {
    if (image && imageRef.current) {
      const containerWidth = 280;
      const containerHeight = 280;
      
      if (currentAdjustments && currentAdjustments.width && currentAdjustments.height) {
        // Usar ajustes existentes del producto seleccionado
        imageRef.current.x(currentAdjustments.x);
        imageRef.current.y(currentAdjustments.y);
        imageRef.current.width(currentAdjustments.width);
        imageRef.current.height(currentAdjustments.height);
        imageRef.current.rotation(currentAdjustments.rotation || 0);
        imageRef.current.scale({ x: 1, y: 1 });
      } else {
        // Configuración inicial solo si no hay ajustes previos
        const baseScale = Math.min(
          containerWidth / image.width,
          containerHeight / image.height
        );
        
        const scale = baseScale * 0.85;
        setInitialScale(scale);
        
        const width = image.width * scale;
        const height = image.height * scale;
        
        imageRef.current.width(width);
        imageRef.current.height(height);
        imageRef.current.x((containerWidth - width) / 2);
        imageRef.current.y((containerHeight - height) / 2);
        imageRef.current.rotation(0);
        imageRef.current.scale({ x: 1, y: 1 });
        
        // Solo notificar cambios iniciales si no hay ajustes previos
        onChange({
          x: (containerWidth - width) / 2,
          y: (containerHeight - height) / 2,
          rotation: 0,
          width: width,
          height: height,
        });
      }
      
      if (transformerRef.current) {
        transformerRef.current.nodes([imageRef.current]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [image, currentAdjustments, onChange]);
  

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
