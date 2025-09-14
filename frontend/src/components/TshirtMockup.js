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
            x={adjustments.x}
            y={adjustments.y}
            width={adjustments.width}
            height={adjustments.height}
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
