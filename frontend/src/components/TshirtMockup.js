import React, { forwardRef } from 'react';
import { Stage, Layer, Image, Group } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';

const TshirtMockup = forwardRef(({ templateUrl, imageUrl, adjustments }, ref) => {
  const [template] = useImage(templateUrl, 'anonymous');
  const [image] = useImage(imageUrl, 'anonymous');

  // Variables para ajustar escala y posición
  const scale = 0.9; 
  const offsetX = 120; 
  const offsetY = 100;

  // Calcular tamaño automático para la imagen en el mockup
  const getImageDimensions = () => {
    if (!image) return { width: 0, height: 0, x: offsetX, y: offsetY };
    
    // Área disponible en la remera (aproximada)
    const shirtWidth = 350 * scale;
    const shirtHeight = 400 * scale;
    
    // Calcular escala para que la imagen llene bien el área
    const imageAspect = image.width / image.height;
    const shirtAspect = shirtWidth / shirtHeight;
    
    let finalWidth, finalHeight;
    
    if (imageAspect > shirtAspect) {
      // Imagen más ancha, ajustar por ancho
      finalWidth = shirtWidth * 1.8; // 180% del área disponible
      finalHeight = finalWidth / imageAspect;
    } else {
      // Imagen más alta, ajustar por alto
      finalHeight = shirtHeight * 1.8; // 180% del área disponible
      finalWidth = finalHeight * imageAspect;
    }
    
    // Centrar la imagen en el área de la remera
    const centerX = offsetX + 50 + (shirtWidth - finalWidth) / 2;
    const centerY = offsetY + (shirtHeight - finalHeight) / 2;
    
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
        {/* Plantilla de la remera */}
        <Image image={template} x={0} y={0} width={600} height={600} />

        {/* Imagen de mascara */}
        <Group
          clipFunc={(ctx) => {
            ctx.beginPath();
            // Define los creditos del clip
            ctx.moveTo(offsetX + 50, offsetY - 3); // Esquina superior izquierda
            ctx.lineTo(offsetX + 350 * scale - 4, offsetY); // Esquina superior derecha
            ctx.lineTo(offsetX + 350 * scale + 2, offsetY + 400 * scale); // Esquina inferior derecha
            ctx.lineTo(offsetX + 50, offsetY + 400 * scale); // Esquina inferior izquierda
            ctx.closePath();
            ctx.clip();
          }}
        >
          {/* Imagen del diseño */}
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

export default TshirtMockup;
