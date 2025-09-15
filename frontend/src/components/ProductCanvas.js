import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer } from 'react-konva'; 
import AdjustableImage from './AdjustableImage';
import PillowMockup from './PillowMockup';
import FrameMockup from './FrameMockup';
import TshirtMockup from './TshirtMockup';
import { useAuth } from '../providers/AuthContext';

function ProductCanvas({ image, onMockupCreated }) {
  const { currentUser } = useAuth();
  
  // Define las referencias individualmente
  const frameRef = useRef();
  const pillowRef = useRef();
  const tshirtRef = useRef();

  // Referencias removidas - ya no se necesitan
  

  // Estados separados para cada mockup
  const [frameAdjustments, setFrameAdjustments] = useState({
    x: 0,
    y: 0,
    width: 500,
    height: 500,
    rotation: 0,
  });

  const [pillowAdjustments, setPillowAdjustments] = useState({
    x: 0,
    y: 0,
    width: 500,
    height: 500,
    rotation: 0,
  });

  const [tshirtAdjustments, setTshirtAdjustments] = useState({
    x: 0,
    y: 0,
    width: 500,
    height: 500,
    rotation: 0,
  });

  // Estado para manejar el mockup activo
  const [selectedMockup, setSelectedMockup] = useState('frame');
  
  // Estados para selección de productos
  const [selectedProducts, setSelectedProducts] = useState({
    frame: true,
    pillow: true,
    tshirt: true
  });
  
  // Estados para UI
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  
  // Sin precios - productos gratuitos

  // Función de ajuste para cada mockup
  const handleAdjust = useCallback((adjustments) => {
    if (selectedMockup === 'frame') {
      setFrameAdjustments(adjustments);
    } else if (selectedMockup === 'pillow') {
      setPillowAdjustments(adjustments);
    } else if (selectedMockup === 'tshirt') {
      setTshirtAdjustments(adjustments);
    }
  }, [selectedMockup]);

  const handleAutoAdjust = () => {
    // Dimensiones del editor
    const editorSize = 280;
    const editorCenter = editorSize / 2; // 140
    
    // Tamaño más grande para que se vea bien en el mockup
    const optimalSize = editorSize * 0.8; // 80% del editor para mejor centrado
    
    const autoAdjustments = {
      x: editorCenter - optimalSize / 2, // Centrar perfectamente
      y: editorCenter - optimalSize / 2, // Centrar perfectamente
      width: optimalSize,
      height: optimalSize,
      rotation: 0
    };

    console.log('Auto-ajuste aplicado:', {
      mockup: selectedMockup,
      editorCenter,
      optimalSize,
      adjustments: autoAdjustments
    });

    // Aplicar los ajustes al mockup seleccionado
    if (selectedMockup === 'frame') {
      setFrameAdjustments(autoAdjustments);
    } else if (selectedMockup === 'pillow') {
      setPillowAdjustments(autoAdjustments);
    } else if (selectedMockup === 'tshirt') {
      setTshirtAdjustments(autoAdjustments);
    }
  };

  const handleMockupChange = (mockup) => {
    setSelectedMockup(mockup);
  };
  
  const handleProductSelection = (product) => {
    setSelectedProducts(prev => ({
      ...prev,
      [product]: !prev[product]
    }));
  };
  
  // Función removida - sin precios
  
  const getSelectedProductsCount = () => {
    return Object.values(selectedProducts).filter(Boolean).length;
  };
  
  const handleCreateProducts = async () => {
    if (!currentUser) {
      alert('Debes estar logueado para crear productos');
      return;
    }
    
    const selectedCount = getSelectedProductsCount();
    if (selectedCount === 0) {
      alert('Selecciona al menos un producto para crear');
      return;
    }
    
    const confirmed = window.confirm(
      `¿Crear ${selectedCount} producto(s)?\n\n` +
      Object.entries(selectedProducts)
        .filter(([_, selected]) => selected)
        .map(([product, _]) => `• ${product.charAt(0).toUpperCase() + product.slice(1)}`)
        .join('\n')
    );
    
    if (!confirmed) return;
    
    setIsCreatingProduct(true);
    
    try {
      // Generar mockups seleccionados
      const mockupsToCreate = [];
      
      // Esperar un momento para asegurar que los canvas estén renderizados
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (selectedProducts.frame && frameRef.current) {
        console.log('Exportando frame mockup...');
        try {
          const frameDataUrl = frameRef.current.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });
          mockupsToCreate.push({
            type: 'frame',
            dataUrl: frameDataUrl
          });
          console.log('Frame exportado exitosamente');
        } catch (error) {
          console.error('Error exportando frame:', error);
        }
      }
      
      if (selectedProducts.pillow && pillowRef.current) {
        console.log('Exportando pillow mockup...');
        try {
          const pillowDataUrl = pillowRef.current.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });
          mockupsToCreate.push({
            type: 'pillow',
            dataUrl: pillowDataUrl
          });
          console.log('Pillow exportado exitosamente');
        } catch (error) {
          console.error('Error exportando pillow:', error);
        }
      }
      
      if (selectedProducts.tshirt && tshirtRef.current) {
        console.log('Exportando tshirt mockup...');
        try {
          const tshirtDataUrl = tshirtRef.current.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });
          mockupsToCreate.push({
            type: 'tshirt',
            dataUrl: tshirtDataUrl
          });
          console.log('Tshirt exportado exitosamente');
        } catch (error) {
          console.error('Error exportando tshirt:', error);
        }
      }
      
      if (mockupsToCreate.length === 0) {
        alert('No se pudieron generar los mockups. Inténtalo de nuevo.');
        return;
      }
      
      // Crear productos en MongoDB via API con upload a Wasabi
      for (const mockup of mockupsToCreate) {
        // Convertir DataURL a Blob
        const response = await fetch(mockup.dataUrl);
        const blob = await response.blob();
        
        // Crear FormData para enviar imagen y datos
        const formData = new FormData();
        formData.append('image', blob, `${mockup.type}-${Date.now()}.jpg`);
        formData.append('userId', currentUser.uid);
        formData.append('type', 'mockup');
        formData.append('productType', mockup.type);
        formData.append('originalImageUrl', image);
        
        // Obtener prompt del localStorage si existe
        const savedPrompt = localStorage.getItem('lastGeneratedPrompt') || localStorage.getItem('currentPrompt') || '';
        formData.append('originalPrompt', savedPrompt);
        formData.append('createdAt', new Date().toISOString());
        formData.append('status', 'active');
        
        const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/productos-ai/create-mockup`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
          },
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Error creating product: ${uploadResponse.statusText}`);
        }
      }
      
      alert(`¡${mockupsToCreate.length} producto(s) creado(s) exitosamente!`);
      
      // Reset selecciones
      setSelectedProducts({
        frame: true,
        pillow: true,
        tshirt: true
      });
      
    } catch (error) {
      console.error('Error creando productos:', error);
      alert('Error al crear los productos. Inténtalo de nuevo.');
    } finally {
      setIsCreatingProduct(false);
    }
  };


useEffect(() => {
  const handleGenerateMockup = async () => {
    if (!frameRef.current || !pillowRef.current || !tshirtRef.current) {
      console.error("No se encontraron los `Stage` para generar los mockups.");
      return;
    }

    try {
      // Exporta los `Stage` completos
      const frameDataUrl = frameRef.current.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });
      const pillowDataUrl = pillowRef.current.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });
      const tshirtDataUrl = tshirtRef.current.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });

      // Convertir DataURLs a Blob
      const frameBlob = await (await fetch(frameDataUrl)).blob();
      const pillowBlob = await (await fetch(pillowDataUrl)).blob();
      const tshirtBlob = await (await fetch(tshirtDataUrl)).blob();

      if (onMockupCreated) {
        onMockupCreated({ frameBlob, pillowBlob, tshirtBlob });
      }
    } catch (error) {
      console.error("Error al generar los mockups del canvas:", error);
    }
  };

  if (image) {
    handleGenerateMockup();
  }
}, [
  image,
  onMockupCreated,
  frameAdjustments,
  pillowAdjustments,
  tshirtAdjustments, // Incluye los ajustes al arreglo de dependencias
]);

  

  return (
    <div style={{ 
      display: 'flex', 
      gap: '30px', 
      padding: '30px 0px',
      minHeight: '100vh',
    }}>
      {/* Panel izquierdo - Controles */}
      <div style={{ 
        width: '380px', 
        background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)', 
        borderRadius: '20px', 
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 255, 136, 0.1)',
        height: 'fit-content',
        position: 'sticky',
        top: '30px'
      }}>
        <h2 style={{ 
          margin: '0 0 30px 0', 
          color: '#ffffff',
          fontSize: '1.8rem',
          fontWeight: '700',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Configuración</h2>
        
        {/* Selector de productos */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '1.1rem', 
            color: '#00ff88',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
          Productos a crear:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { key: 'frame', name: 'Cuadro' },
              { key: 'pillow', name: 'Almohadón' },
              { key: 'tshirt', name: 'Remera' }
            ].map(product => (
              <label key={product.key} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px',
                padding: '18px',
                borderRadius: '12px',
                backgroundColor: selectedProducts[product.key] ? 'rgba(0, 255, 136, 0.1)' : '#0f0f0f',
                border: selectedProducts[product.key] ? '2px solid #00ff88' : '2px solid #333333',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <input 
                  type="checkbox" 
                  checked={selectedProducts[product.key]}
                  onChange={() => handleProductSelection(product.key)}
                  style={{ 
                    transform: 'scale(1.3)',
                    accentColor: '#00ff88',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ 
                  fontWeight: selectedProducts[product.key] ? '700' : '500',
                  color: selectedProducts[product.key] ? '#ffffff' : '#cccccc',
                  fontSize: '1.1rem'
                }}>
                  {product.name}
                </span>
                {selectedProducts[product.key] && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: '#00ff88',
                    borderRadius: '50%',
                    width: '8px',
                    height: '8px',
                    boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                  }}></div>
                )}
              </label>
            ))}
          </div>
          <div style={{ 
            marginTop: '20px', 
            padding: '15px',
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 204, 106, 0.1) 100%)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '12px',
            textAlign: 'center',
            fontWeight: '700',
            color: '#00ff88',
            fontSize: '1.1rem'
          }}>
            ✨ {getSelectedProductsCount()} productos seleccionados
          </div>
        </div>

        {/* Selector de mockup para ajustar */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '1.1rem', 
            color: '#00ff88',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
          Ajustar:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { key: 'frame', name: 'Cuadro' },
              { key: 'pillow', name: 'Almohadón' },
              { key: 'tshirt', name: 'Remera' }
            ].map(mockup => (
              <button 
                key={mockup.key}
                onClick={() => handleMockupChange(mockup.key)}
                style={{
                  padding: '15px 20px',
                  border: selectedMockup === mockup.key ? '2px solid #00ff88' : '2px solid #333333',
                  borderRadius: '12px',
                  background: selectedMockup === mockup.key ? 
                    'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 106, 0.2) 100%)' : 
                    '#0f0f0f',
                  color: selectedMockup === mockup.key ? '#ffffff' : '#cccccc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease',
                  fontWeight: selectedMockup === mockup.key ? '700' : '500',
                  fontSize: '1rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <span>{mockup.name}</span>
                {selectedMockup === mockup.key && (
                  <div style={{
                    marginLeft: 'auto',
                    backgroundColor: '#00ff88',
                    borderRadius: '50%',
                    width: '8px',
                    height: '8px',
                    boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                  }}></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Editor de imagen */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '1.1rem', 
            color: '#00ff88',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
          Ajustar imagen en {selectedMockup === 'frame' ? 'Cuadro' : selectedMockup === 'pillow' ? 'Almohadón' : 'Remera'}:
          </h3>
          <div style={{ 
            border: '2px solid #333333', 
            borderRadius: '15px',
            backgroundColor: '#0f0f0f',
            padding: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            <Stage width={280} height={280}>
              <Layer>
                <AdjustableImage 
                  imageUrl={image} 
                  onChange={handleAdjust}
                  currentAdjustments={
                    selectedMockup === 'frame' ? frameAdjustments :
                    selectedMockup === 'pillow' ? pillowAdjustments :
                    tshirtAdjustments
                  }
                />
              </Layer>
            </Stage>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '15px'
          }}>
            <button
              onClick={handleAutoAdjust}
              style={{
                padding: '12px 20px',
                backgroundColor: '#00ff88',
                color: '#000000',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00cc6a';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 255, 136, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#00ff88';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 255, 136, 0.3)';
              }}
            >
              🎯 Auto-ajustar Imagen
            </button>
            <p style={{ 
              fontSize: '0.9rem', 
              color: '#888888', 
              margin: '0',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              💡 Arrastra los controles para ajustar manualmente o usa auto-ajustar
            </p>
          </div>
        </div>

        {/* Botón de crear */}
        <button 
          onClick={handleCreateProducts}
          disabled={isCreatingProduct || getSelectedProductsCount() === 0}
          style={{
            width: '100%',
            padding: '5px',
            fontSize: '1.1rem',
            fontWeight: '700',
            background: getSelectedProductsCount() === 0 ? 
              'linear-gradient(135deg, #333333 0%, #1a1a1a 100%)' : 
              'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
            color: getSelectedProductsCount() === 0 ? '#666666' : '#000000',
            border: getSelectedProductsCount() === 0 ? '2px solid #333333' : '2px solid #00ff88',
            borderRadius: '15px',
            cursor: getSelectedProductsCount() === 0 ? 'not-allowed' : 'pointer',
            opacity: isCreatingProduct ? 0.7 : 1,
            transition: 'all 0.3s ease',
            boxShadow: getSelectedProductsCount() === 0 ? 
              'none' : 
              '0 10px 30px rgba(0, 255, 136, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (getSelectedProductsCount() > 0 && !isCreatingProduct) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 40px rgba(0, 255, 136, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (getSelectedProductsCount() > 0 && !isCreatingProduct) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(0, 255, 136, 0.3)';
            }
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>
            {isCreatingProduct ? '🔄 Creando...' : `Crear ${getSelectedProductsCount()} producto(s)`}
          </span>
        </button>
        
        {getSelectedProductsCount() === 0 && (
          <p style={{ 
            color: '#ff6b6b', 
            fontSize: '0.9rem', 
            textAlign: 'center',
            margin: '15px 0 0 0',
            fontWeight: '500'
          }}>
            ⚠️ Selecciona al menos un producto
          </p>
        )}
      </div>

      {/* Panel derecho - Vista previa */}
      <div style={{ 
        flex: 1,
        background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 255, 136, 0.1)'
      }}>
        <h2 style={{ 
          margin: '0 0 30px 0', 
          color: '#ffffff',
          fontSize: '1.8rem',
          fontWeight: '700',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Vista Previa en Tiempo Real</h2>
        
        {/* Tabs para mockups */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '30px',
          borderBottom: '2px solid #333333',
          paddingBottom: '15px'
        }}>
          {[
            { key: 'frame', icon: '🖼️', name: 'Cuadro' },
            { key: 'pillow', icon: '🛏️', name: 'Almohadón' },
            { key: 'tshirt', icon: '👕', name: 'Remera' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedMockup(tab.key)}
              style={{
                padding: '15px 25px',
                border: 'none',
                borderBottom: selectedMockup === tab.key ? '3px solid #00ff88' : '3px solid transparent',
                backgroundColor: selectedMockup === tab.key ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                borderRadius: '12px 12px 0 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: selectedMockup === tab.key ? '700' : '500',
                color: selectedMockup === tab.key ? '#00ff88' : '#888888',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
              }}
            >
              <span>{tab.name}</span>
              
            </button>
          ))}
        </div>

        {/* Vista previa del mockup activo */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <div style={{ 
            border: '3px solid #333333',
            borderRadius: '20px',
            padding: '15px',
            backgroundColor: '#0f0f0f',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            {selectedMockup === 'frame' && (
              <FrameMockup
                templateUrl="/assets/images/mockups/cuadromockup.jpg"
                imageUrl={image}
                adjustments={frameAdjustments}
              />
            )}
            {selectedMockup === 'pillow' && (
              <PillowMockup
                templateUrl="/assets/images/mockups/almohadonmockup.jpg"
                imageUrl={image}
                adjustments={pillowAdjustments}
              />
            )}
            {selectedMockup === 'tshirt' && (
              <TshirtMockup
                templateUrl="/assets/images/mockups/remeramockup.jpg"
                imageUrl={image}
                adjustments={tshirtAdjustments}
              />
            )}
          </div>
        </div>

        {/* Indicador de estado */}
        <div style={{ 
          textAlign: 'center',
          padding: '10px',
          width: 'fit-content', 
          margin: '0 auto',
          background: selectedProducts[selectedMockup] ? 
            'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 204, 106, 0.1) 100%)' : 
            'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
          borderRadius: '15px',
          border: selectedProducts[selectedMockup] ? '2px solid #00ff88' : '2px solid #ff6b6b',
          boxShadow: selectedProducts[selectedMockup] ? 
            '0 8px 25px rgba(0, 255, 136, 0.2)' : 
            '0 8px 25px rgba(255, 107, 107, 0.2)'
        }}>
          {selectedProducts[selectedMockup] ? (
            <span style={{ 
              color: '#00ff88', 
              fontWeight: '500',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <span>✅</span> Este producto será creado
            </span>
          ) : (
            <span style={{ 
              color: '#ff6b6b', 
              fontWeight: '500',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <span>⚠️</span> Este producto no está seleccionado
            </span>
          )}
        </div>

        {/* Mockups ocultos para exportación - Solo se renderizan cuando se necesitan */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <FrameMockup
            ref={frameRef}
            templateUrl="/assets/images/mockups/cuadromockup.jpg"
            imageUrl={image}
            adjustments={frameAdjustments}
          />
          <PillowMockup
            ref={pillowRef}
            templateUrl="/assets/images/mockups/almohadonmockup.jpg"
            imageUrl={image}
            adjustments={pillowAdjustments}
          />
          <TshirtMockup
            ref={tshirtRef}
            templateUrl="/assets/images/mockups/remeramockup.jpg"
            imageUrl={image}
            adjustments={tshirtAdjustments}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductCanvas;
