import React, { forwardRef } from 'react';
import { Stage, Layer, Image, Group } from 'react-konva';
import useImage from 'use-image';


const PillowMockup = forwardRef(({ templateUrl, imageUrl, adjustments }, ref) => {
  const [template] = useImage(templateUrl, 'anonymous');
  const [image] = useImage(imageUrl, 'anonymous');
  const [svgMask] = useImage('/assets/images/mockups/pillowrem.svg', 'anonymous');

  // Adjust scale and position for both the mask and the design 
  const offsetX = 3;
  const offsetY = -5;

  // Calcular tamaño automático para la imagen en el mockup
  const getImageDimensions = () => {
    if (!image) return { width: 0, height: 0, x: 300, y: 300 };
    
    // Área disponible en el almohadón (aproximada - área central)
    const pillowWidth = 400;
    const pillowHeight = 400;
    
    // Calcular escala para que la imagen llene bien el área
    const imageAspect = image.width / image.height;
    const pillowAspect = pillowWidth / pillowHeight;
    
    let finalWidth, finalHeight;
    
    if (imageAspect > pillowAspect) {
      // Imagen más ancha, ajustar por ancho
      finalWidth = pillowWidth * 1.7; // 170% del área disponible
      finalHeight = finalWidth / imageAspect;
    } else {
      // Imagen más alta, ajustar por alto
      finalHeight = pillowHeight * 1.7; // 170% del área disponible
      finalWidth = finalHeight * imageAspect;
    }
    
    // Centrar la imagen en el área del almohadón
    const centerX = 300 - finalWidth / 2;
    const centerY = 300 - finalHeight / 2;
    
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
      {/* Layer for the pillow template image */}
      <Layer>
        {/* Pillow template image */}
        <Image image={template} x={0} y={0} width={600} height={600} />
      </Layer>

      {/* Layer for the design and mask */}
      <Layer>
        <Group>
          {/* User's design image */}
          <Image
            image={image}
            x={imageDimensions.x}
            y={imageDimensions.y}
            width={imageDimensions.width}
            height={imageDimensions.height}
            rotation={adjustments.rotation}
            globalCompositeOperation="difference"
            opacity={0.9}
            
          />

          {/* SVG Mask to mask the design */}
          <Image
            image={svgMask}
            x={offsetX}
            y={offsetY}
            width={600}
            height={600}
            globalCompositeOperation="destination-in"  // Apply mask to the design
          />
        </Group>
      </Layer>
    </Stage>
  );
});

export default PillowMockup;
