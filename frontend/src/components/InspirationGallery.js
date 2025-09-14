import React, { useEffect, useRef, useMemo } from 'react';

const InspirationGallery = () => {
  const masonryLeftRef = useRef(null);
  const masonryRightRef = useRef(null);

  const images = useMemo(() => [
    "/assets/images/examples/4.png",
    "/assets/images/examples/3.png",
    "/assets/images/examples/5.png",
    "/assets/images/examples/7.png",
    "/assets/images/examples/8.png",
    "/assets/images/examples/9.png"
  ], []);

  useEffect(() => {
    if (!masonryLeftRef.current || !masonryRightRef.current) {
      // Si las referencias aún no están disponibles, salir temprano.
      return;
    }
  
    const imagesLeft = masonryLeftRef.current.querySelectorAll('.masonry-item');
    const imagesRight = masonryRightRef.current.querySelectorAll('.masonry-item');
  
    const allItems = [...imagesLeft, ...imagesRight];
  
    let imagesToLoad = allItems.length;
    let imagesLoadedCount = 0;
  
    function startAnimation() {
      if (imagesLeft.length === 0 || imagesRight.length === 0) {
        return; // Asegúrate de que haya elementos antes de calcular estilos.
      }
  
      // Cálculos para la fila izquierda
      const leftComputedStyle = getComputedStyle(imagesLeft[0]);
      const leftMarginLeft = parseFloat(leftComputedStyle.marginLeft);
      const leftMarginRight = parseFloat(leftComputedStyle.marginRight);
      const leftItemWidth = imagesLeft[0].offsetWidth + leftMarginLeft + leftMarginRight;
      const leftTotalItems = imagesLeft.length;
      const leftTotalWidth = leftItemWidth * leftTotalItems;
  
      // Cálculos para la fila derecha
      const rightComputedStyle = getComputedStyle(imagesRight[0]);
      const rightMarginLeft = parseFloat(rightComputedStyle.marginLeft);
      const rightMarginRight = parseFloat(rightComputedStyle.marginRight);
      const rightItemWidth = imagesRight[0].offsetWidth + rightMarginLeft + rightMarginRight;
      const rightTotalItems = imagesRight.length;
      const rightTotalWidth = rightItemWidth * rightTotalItems;
  
      let leftPos = 0;
      let rightPos = -rightTotalWidth;
  
      const speed = 2.5;
  
      const animate = () => {
        leftPos -= speed;
        rightPos += speed;
  
        if (leftPos <= -leftTotalWidth) {
          leftPos = 0;
        }
        if (rightPos >= 0) {
          rightPos = -rightTotalWidth;
        }
  
        if (masonryLeftRef.current && masonryRightRef.current) {
          masonryLeftRef.current.style.transform = `translateX(${leftPos}px)`;
          masonryRightRef.current.style.transform = `translateX(${rightPos}px)`;
        }
  
        requestAnimationFrame(animate);
      };
  
      animate();
    }
  
    const imageLoaded = () => {
      imagesLoadedCount++;
      if (imagesLoadedCount === imagesToLoad) {
        startAnimation();
      }
    };
  
    allItems.forEach((item) => {
      const img = item.querySelector('img');
      if (img.complete) {
        imageLoaded();
      } else {
        img.onload = imageLoaded;
      }
    });
  }, [images]);
  

  return (
    <div className="mb-5">
      <p className="text">
        Mira lo que otros han creado utilizando nuestro generador de imágenes. Deja que estas imágenes te inspiren y guíen en la creación de tus propias obras maestras.
      </p>
      <div className="masonry">
        <div className='masonryleft' ref={masonryLeftRef}>
          {[...images, ...images].map((src, index) => (
            <div className="masonry-item" key={`left-${index}`}>
              <img src={src} alt={`Ejemplo ${index + 1}`} />
            </div>
          ))}
        </div>

        <div className='masonryright' ref={masonryRightRef}>
          {[...images, ...images].map((src, index) => (
            <div className="masonry-item" key={`right-${index}`}>
              <img src={src} alt={`Ejemplo ${index + 1}`} />
            </div>
          ))}
        </div>  
      </div>
    </div>
  );
};

export default InspirationGallery;
