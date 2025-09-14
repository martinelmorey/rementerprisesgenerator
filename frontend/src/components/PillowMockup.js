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
            x={adjustments.x}
            y={adjustments.y}
            width={adjustments.width}
            height={adjustments.height}
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
