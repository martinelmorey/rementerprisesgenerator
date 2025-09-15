import React, { forwardRef } from 'react';
import { Stage, Layer, Image, Group } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';

const FrameMockup = forwardRef(({ templateUrl, imageUrl, adjustments }, ref) => {
  const [template] = useImage(templateUrl, 'anonymous');
  const [image] = useImage(imageUrl, 'anonymous');

  // Variables para ajustar escala y posición
  const scale = 0.7; 
  const offsetX = 139; 
  const offsetY = 98;

  // Calcular tamaño automático para la imagen en el mockup
  const getImageDimensions = () => {
    if (!image) return { width: 0, height: 0, x: offsetX, y: offsetY };
    
    // Área disponible en el cuadro (aproximada)
    const frameWidth = 464 * scale;
    const frameHeight = 625 * scale;
    
    // Calcular escala para que la imagen llene bien el área
    const imageAspect = image.width / image.height;
    const frameAspect = frameWidth / frameHeight;
    
    let finalWidth, finalHeight;
    
    if (imageAspect > frameAspect) {
      // Imagen más ancha, ajustar por ancho
      finalWidth = frameWidth * 2.0; // 200% del área disponible
      finalHeight = finalWidth / imageAspect;
    } else {
      // Imagen más alta, ajustar por alto
      finalHeight = frameHeight * 2.0; // 200% del área disponible
      finalWidth = finalHeight * imageAspect;
    }
    
    console.log('FrameMockup - Dimensiones calculadas:', {
      frameWidth,
      frameHeight,
      finalWidth,
      finalHeight,
      imageAspect,
      frameAspect
    });
    
    // Centrar la imagen en el área del cuadro
    const centerX = offsetX + (frameWidth - finalWidth) / 2;
    const centerY = offsetY + (frameHeight - finalHeight) / 2;
    
    // Aplicar ajustes del usuario (solo posición relativa)
    const adjustedX = centerX + (adjustments.x - 140); // 140 es aprox el centro del editor
    const adjustedY = centerY + (adjustments.y - 140);
    
    return {
      width: finalWidth,
      height: finalHeight,
      x: adjustedX,
      y: adjustedY
    };
  };

  const imageDimensions = getImageDimensions(); 

  return (
    <Stage ref={ref} width={600} height={600}>
      <Layer>
        {/* Plantilla del cuadro */}
        <Image image={template} x={0} y={0} width={600} height={600} />
      
        {/* Imagen de mascara */}
        <Group
          clipFunc={(ctx) => {
            ctx.beginPath();
            ctx.moveTo(offsetX - 3, offsetY - 3); // Esquina superior izquierda
            ctx.lineTo(offsetX + 464 * scale, offsetY - 3 * scale); // Esquina superior derecha
            ctx.lineTo(offsetX + 468 * scale + 2, offsetY + 625 * scale); // Esquina inferior derecha
            ctx.lineTo(offsetX - 9, offsetY + 625 * scale); // Esquina inferior izquierda
            ctx.closePath();
            ctx.clip();
          }}
        >
          {/* Imagen del diseño superpuesta */}
          <Image
            image={image}
            x={imageDimensions.x}
            y={imageDimensions.y}
            width={imageDimensions.width}
            height={imageDimensions.height}
            rotation={adjustments.rotation}
            opacity={0.85} 
            filters={[Konva.Filters.Brighten]} 
            brightness={-0.1}
          />
        </Group>
      </Layer>
    </Stage>
  );
});

export default FrameMockup;
