import React, { useState, useEffect, useRef } from 'react';
import ProductCanvas from './ProductCanvas';

function MockupGenerator({ image, onMockupCreated }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const hasLoadedFromStorage = useRef(false);

  // useEffect que se ejecuta al montar y cuando cambia image
  useEffect(() => {
    console.log('=== MockupGenerator useEffect ejecutado ===');
    console.log('Prop image:', image);
    console.log('uploadedImage actual:', uploadedImage);
    console.log('hasLoadedFromStorage:', hasLoadedFromStorage.current);
    
    // Verificar si hay una imagen en localStorage (viene de la galería)
    const savedMockupImage = localStorage.getItem('mockupImage');
    console.log('localStorage mockupImage:', savedMockupImage);
    
    if (savedMockupImage && !hasLoadedFromStorage.current) {
      // Si hay imagen en localStorage y no la hemos cargado aún, usarla (viene de la galería)
      try {
        const mockupData = JSON.parse(savedMockupImage);
        console.log('✅ Usando imagen desde galería:', mockupData);
        setUploadedImage(mockupData.imageUrl);
        hasLoadedFromStorage.current = true;
        // Limpiar localStorage después de usar
        localStorage.removeItem('mockupImage');
        console.log('🧹 localStorage limpiado después de usar');
      } catch (error) {
        console.error('❌ Error parseando mockupImage:', error);
        localStorage.removeItem('mockupImage'); // Limpiar localStorage corrupto
        hasLoadedFromStorage.current = true;
        // Si hay error con localStorage, usar prop image como fallback
        if (image) {
          console.log('🔄 Fallback: usando imagen de props:', image);
          setUploadedImage(image);
        } else {
          console.log('❌ No hay imagen disponible después del error');
          setUploadedImage(null);
        }
      }
    } else if (image && !uploadedImage && !hasLoadedFromStorage.current) {
      // Si no hay localStorage pero sí hay prop image (viene del generador)
      console.log('✅ Usando imagen de props (generador de imágenes):', image);
      setUploadedImage(image);
    } else if (!savedMockupImage && !image && !uploadedImage && !hasLoadedFromStorage.current) {
      // No hay imagen disponible
      console.log('❌ No hay imagen disponible - ni localStorage ni props');
      setUploadedImage(null);
    } else {
      console.log('🔒 Saltando useEffect - ya procesado o imagen ya cargada');
    }
  }, [image, uploadedImage]); // Depende de image y uploadedImage

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
        padding: '40px 20px',
        borderBottom: '2px solid #00ff88',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Efecto de fondo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0',
            textShadow: '0 0 30px rgba(0, 255, 136, 0.3)',
            letterSpacing: '-0.02em'
          }}>
            Generador Mockups
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#a0a0a0',
            margin: '15px 0 0 0',
            fontWeight: '400'
          }}>
            Transforma tus imágenes en productos profesionales
          </p>
        </div>
      </div>

      {uploadedImage ? (
        <ProductCanvas
          image={uploadedImage}
          onMockupCreated={onMockupCreated} 
        />
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          padding: '40px 20px'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '2px solid #333333',
            borderRadius: '20px',
            padding: '50px 40px',
            textAlign: 'center',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Efecto de brillo */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'conic-gradient(from 0deg, transparent, rgba(0, 255, 136, 0.1), transparent)',
              animation: 'rotate 20s linear infinite',
              pointerEvents: 'none'
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '20px',
                filter: 'grayscale(1)',
                opacity: 0.7
              }}>
                🖼️
              </div>
              
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#ffffff',
                margin: '0 0 15px 0'
              }}>
                No hay imagen cargada
              </h2>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#a0a0a0',
                margin: '0 0 30px 0',
                lineHeight: '1.6'
              }}>
                Para crear mockups profesionales, necesitas cargar una imagen primero
              </p>
              
              <div style={{
                backgroundColor: '#0f0f0f',
                border: '1px solid #333333',
                borderRadius: '12px',
                padding: '25px',
                margin: '30px 0',
                textAlign: 'left'
              }}>
                <h3 style={{
                  color: '#00ff88',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  margin: '0 0 15px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>📋</span> Cómo usar esta función:
                </h3>
                <ol style={{
                  color: '#cccccc',
                  fontSize: '1rem',
                  lineHeight: '1.8',
                  paddingLeft: '20px',
                  margin: '0'
                }}>
                  <li>Ve a <strong style={{ color: '#00ff88' }}>"MI GALERÍA"</strong> en el menú principal</li>
                  <li>Selecciona cualquier imagen de tu galería</li>
                  <li>Haz clic en el botón <strong style={{ color: '#00ff88' }}>🛒 "Crear Producto"</strong></li>
                  <li>Serás redirigido aquí con la imagen cargada automáticamente</li>
                </ol>
              </div>
              
              <button 
                onClick={() => window.location.href = '/imagenes-generadas'}
                style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(0, 255, 136, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(0, 255, 136, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.3)';
                }}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>
                  🚀 Ir a Mi Galería
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default MockupGenerator;
