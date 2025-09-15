import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const handleAdjust = useCallback((newAdjustments) => {
    if (selectedMockup === 'frame') {
      setFrameAdjustments(newAdjustments);
    } else if (selectedMockup === 'pillow') {
      setPillowAdjustments(newAdjustments);
    } else if (selectedMockup === 'tshirt') {
      setTshirtAdjustments(newAdjustments);
    }
  }, [selectedMockup]);


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
      gap: '20px', 
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Panel izquierdo - Controles */}
      <div style={{ 
        width: '350px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        height: 'fit-content',
        position: 'sticky',
        top: '20px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Generador de Mockups</h2>
        
        {/* Selector de productos */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>Productos a crear:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { key: 'frame', icon: '🖼️', name: 'Cuadro' },
              { key: 'pillow', icon: '🛏️', name: 'Almohadón' },
              { key: 'tshirt', icon: '👕', name: 'Remera' }
            ].map(product => (
              <label key={product.key} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: selectedProducts[product.key] ? '#e3f2fd' : '#f9f9f9',
                border: selectedProducts[product.key] ? '2px solid #2196f3' : '2px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="checkbox" 
                  checked={selectedProducts[product.key]}
                  onChange={() => handleProductSelection(product.key)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ fontSize: '20px' }}>{product.icon}</span>
                <span style={{ fontWeight: selectedProducts[product.key] ? 'bold' : 'normal' }}>
                  {product.name}
                </span>
              </label>
            ))}
          </div>
          <div style={{ 
            marginTop: '15px', 
            padding: '10px',
            backgroundColor: '#f0f8ff',
            borderRadius: '6px',
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#1976d2'
          }}>
            {getSelectedProductsCount()} productos seleccionados
          </div>
        </div>

        {/* Selector de mockup para ajustar */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>Ajustar:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { key: 'frame', icon: '🖼️', name: 'Cuadro' },
              { key: 'pillow', icon: '🛏️', name: 'Almohadón' },
              { key: 'tshirt', icon: '👕', name: 'Remera' }
            ].map(mockup => (
              <button 
                key={mockup.key}
                onClick={() => handleMockupChange(mockup.key)}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: selectedMockup === mockup.key ? '#2196f3' : '#f5f5f5',
                  color: selectedMockup === mockup.key ? 'white' : '#333',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  fontWeight: selectedMockup === mockup.key ? 'bold' : 'normal'
                }}
              >
                <span>{mockup.icon}</span>
                <span>{mockup.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor de imagen */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>
            Ajustar imagen en {selectedMockup === 'frame' ? 'Cuadro' : selectedMockup === 'pillow' ? 'Almohadón' : 'Remera'}:
          </h3>
          <div style={{ 
            border: '2px solid #e0e0e0', 
            borderRadius: '8px',
            backgroundColor: '#fafafa'
          }}>
            <Stage width={310} height={310}>
              <Layer>
                <AdjustableImage imageUrl={image} onChange={handleAdjust} />
              </Layer>
            </Stage>
          </div>
          <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 0 0' }}>
            Arrastra los controles para ajustar posición, tamaño y rotación
          </p>
        </div>

        {/* Botón de crear */}
        <button 
          onClick={handleCreateProducts}
          disabled={isCreatingProduct || getSelectedProductsCount() === 0}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: getSelectedProductsCount() === 0 ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: getSelectedProductsCount() === 0 ? 'not-allowed' : 'pointer',
            opacity: isCreatingProduct ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {isCreatingProduct ? '🔄 Creando...' : `🛒 Crear ${getSelectedProductsCount()} producto(s)`}
        </button>
        
        {getSelectedProductsCount() === 0 && (
          <p style={{ 
            color: '#f44336', 
            fontSize: '14px', 
            textAlign: 'center',
            margin: '10px 0 0 0'
          }}>
            Selecciona al menos un producto
          </p>
        )}
      </div>

      {/* Panel derecho - Vista previa */}
      <div style={{ 
        flex: 1,
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Vista Previa en Tiempo Real</h2>
        
        {/* Tabs para mockups */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '2px solid #f0f0f0'
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
                padding: '12px 20px',
                border: 'none',
                borderBottom: selectedMockup === tab.key ? '3px solid #2196f3' : '3px solid transparent',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: selectedMockup === tab.key ? 'bold' : 'normal',
                color: selectedMockup === tab.key ? '#2196f3' : '#666',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
              {selectedProducts[tab.key] && (
                <span style={{ 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '8px', 
                  height: '8px',
                  display: 'inline-block'
                }}></span>
              )}
            </button>
          ))}
        </div>

        {/* Vista previa del mockup activo */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ 
            border: '3px solid #e0e0e0',
            borderRadius: '12px',
            padding: '10px',
            backgroundColor: '#fafafa'
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
          padding: '15px',
          backgroundColor: selectedProducts[selectedMockup] ? '#e8f5e8' : '#fff3e0',
          borderRadius: '8px',
          border: selectedProducts[selectedMockup] ? '2px solid #4caf50' : '2px solid #ff9800'
        }}>
          {selectedProducts[selectedMockup] ? (
            <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
              ✅ Este producto será creado
            </span>
          ) : (
            <span style={{ color: '#f57c00', fontWeight: 'bold' }}>
              ⚠️ Este producto no está seleccionado
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
