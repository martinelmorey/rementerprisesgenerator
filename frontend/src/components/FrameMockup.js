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

export default FrameMockup;
