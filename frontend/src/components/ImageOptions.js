import React, { useState, useEffect } from 'react';
import PromptButton from './PromptButton';
import ImprovePromptButton from './ImprovePromptButton';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'; 

function ImageOptions({ onUpdatePrompt, selectedLoras, setSelectedLoras }) {
  const [cameraType, setCameraType] = useState('');
  const [colorScheme, setColorScheme] = useState('');
  const [photoStyle, setPhotoStyle] = useState('');
  const [imageSize, setImageSize] = useState('');
  const [style, setStyle] = useState('');
  const [lighting, setLighting] = useState('');
  const [composition, setComposition] = useState('');
  const [background, setBackground] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [prompt, setPrompt] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isCustomPrompt, setIsCustomPrompt] = useState(false); 
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false); 
  const [isSingleSelectionMode, setIsSingleSelectionMode] = useState(false); // Nuevo estado para el modo de selección
  const maxWords = 200;

  // Función para alternar entre selección única y múltiple
  const toggleSelectionMode = () => {
    setIsSingleSelectionMode(!isSingleSelectionMode);
    setSelectedLoras([]); // Limpia las selecciones al cambiar el modo
  };

  // Función para seleccionar o deseleccionar "Loras" según el modo
  const toggleLora = (lora) => {
    setSelectedLoras((prevSelectedLoras) => {
      if (isSingleSelectionMode) {
        // En modo de selección única, selecciona solo una "Lora"
        return prevSelectedLoras.includes(lora) ? [] : [lora];
      } else {
        // En modo de selección múltiple, permite agregar o quitar "Loras"
        return prevSelectedLoras.includes(lora)
          ? prevSelectedLoras.filter((selected) => selected !== lora)
          : [...prevSelectedLoras, lora];
      }
    });
  };

  useEffect(() => {
    let combinedPrompt = isCustomPrompt ? customPrompt.trim() : prompt.trim();

    if (cameraType) combinedPrompt += ` | ${cameraType}`;
    if (photoStyle) combinedPrompt += ` in ${photoStyle}`;
    if (colorScheme) combinedPrompt += `, ${colorScheme}`;
    if (style) combinedPrompt += `, ${style}`;
    if (lighting) combinedPrompt += `, lighting: ${lighting}`;
    if (composition) combinedPrompt += `, composition: ${composition}`;
    if (background) combinedPrompt += `, background: ${background}`;
    if (imageSize) combinedPrompt += ` (size: ${imageSize})`;

    onUpdatePrompt(combinedPrompt);
  }, [
    cameraType,
    colorScheme,
    photoStyle,
    style,
    lighting,
    composition,
    background,
    imageSize,
    customPrompt,
    prompt,
    isCustomPrompt,
    onUpdatePrompt,
  ]);

  const handlePromptChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/);
    if (words[0] === '') {
      setCustomPrompt('');
      setWordCount(0);
    } else if (words.length <= maxWords) {
      setCustomPrompt(text);
      setWordCount(words.length);
    } else {
      const trimmedText = words.slice(0, maxWords).join(' ');
      setCustomPrompt(trimmedText);
      setWordCount(maxWords);
    }
    setIsCustomPrompt(true); 
  };

  const handleSetPrompt = (newPrompt) => {
    setPrompt(newPrompt);
    setCustomPrompt(newPrompt);
    setWordCount(newPrompt.trim().split(/\s+/).length);
  };

  const getButtonStyle = (selected, value) => ({
    backgroundColor: selected ? '#018e38' : '#000000',
    color: selected ? '#fff' : '#018e38',
    border: '1px solid #018e38',
    padding: '10px',
    margin: '5px',
    fontSize: '12px',
    cursor: 'pointer',
  });

  return (
    <div className='contenedorLoras'>
      {/* Botón para cambiar entre modos de selección única y múltiple */}
      <div className="toggle-switch" onClick={toggleSelectionMode}>
        <div className={`switch ${isSingleSelectionMode ? 'single' : 'multi'}`}>
          {isSingleSelectionMode ? 'Simple' : 'Mesclar'}
        </div>
      </div>

      <div className="opciones">
        <h3>Selecciona tu estilo preferido</h3>
        <button
          className={`btn lora-button lora1 ${selectedLoras.includes('lora1') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora1')}
        >
          Estilo Disney
        </button>
        <button
          className={`btn lora-button lora2 ${selectedLoras.includes('lora2') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora2')}
        >
          GTA
        </button>
        <button
          className={`btn lora-button lora3 ${selectedLoras.includes('lora3') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora3')}
        >
          Anime Cyberpunk
        </button>
        <button
          className={`btn lora-button lora4 ${selectedLoras.includes('lora4') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora4')}
        >
          Beavis and Butthead
        </button>
        <button
          className={`btn lora-button lora5 ${selectedLoras.includes('lora5') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora5')}
        >
          Neon
        </button>
        <button
          className={`btn lora-button lora6 ${selectedLoras.includes('lora6') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora6')}
        >
          Painted World
        </button>
        <button
          className={`btn lora-button lora7 ${selectedLoras.includes('lora7') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora7')}
        >
          Eldritch Comics
        </button>

        <button
          className={`btn lora-button lora8 ${selectedLoras.includes('lora8') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora8')}
        >
          Pop Art Pusher
        </button>

        <button
          className={`btn lora-button lora9 ${selectedLoras.includes('lora9') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora9')}
        >
          InkSketch
        </button>

        <button
          className={`btn lora-button lora10 ${selectedLoras.includes('lora10') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora10')}
        >
          Pixelart
        </button>

        <button
          className={`btn lora-button lora11 ${selectedLoras.includes('lora11') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora11')}
        >
          Deviant
        </button>

        <button
          className={`btn lora-button lora12 ${selectedLoras.includes('lora12') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora12')}
        >
          Fantasy Art Deco
        </button>

        <button
          className={`btn lora-button lora13 ${selectedLoras.includes('lora13') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora13')}
        >
          Pen
        </button>

        <button
          className={`btn lora-button lora14 ${selectedLoras.includes('lora14') ? 'selected' : ''}`}
          onClick={() => toggleLora('lora14')}
        >
          Woodblock Print
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Describe tu Imagen</h3>
        <p>Escribe lo que te gustaría ver en la imagen. Mientras más clara y precisa sea la descripción, mejor será el resultado final.</p>  
        <div className='botonera-gemini'>
          <PromptButton setPrompt={setPrompt} />   

          {/* Botón para mejorar el prompt solo si es personalizado */}
          {isCustomPrompt && (
            <ImprovePromptButton prompt={customPrompt || prompt} setPrompt={handleSetPrompt} />
          )}
        </div>
        <textarea
          placeholder="Describe tu imagen aqui..."
          value={isCustomPrompt ? customPrompt : prompt}
          onChange={handlePromptChange}
          rows={4}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        />
        <div
          style={{
            textAlign: 'right',
            marginTop: '5px',
            color: wordCount >= maxWords ? 'red' : '#018e38',
            fontSize: '14px',
          }}
        >
          Palabras: {wordCount}/{maxWords}
        </div>
      </div>

      <div className='contenedorbotonopcionesavanza'>    
        <button
          className="btn btn-secondary"
          style={{ marginBottom: '10px', cursor: 'pointer' }}
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          {showAdvancedOptions ? 'Ocultar Opciones Avanzadas' : 'Mostrar Opciones Avanzadas'}
          <AdjustmentsHorizontalIcon className="iconbutton" /> 
        </button>
      </div>

      {showAdvancedOptions && (
      <div className='contenedorOpciones'>  

      <div className="opciones">
        <h3>Tamaño de la Imagen</h3>
        <button
          style={getButtonStyle(imageSize === 'square_hd', 'square_hd')}
          onClick={() => setImageSize('square_hd')}
        >
          Cuadrado HD
        </button>
        <button
          style={getButtonStyle(imageSize === 'portrait_16_9', 'portrait_16_9')}
          onClick={() => setImageSize('portrait_16_9')}
        >
          Vertical 16:9 (Retrato)
        </button>
        <button
          style={getButtonStyle(imageSize === 'landscape_16_9', 'landscape_16_9')}
          onClick={() => setImageSize('landscape_16_9')}
        >
          Horizontal 16:9 (Paisaje)
        </button>
      </div>


        <div className="opciones">
          <h3>Tipo de Cámara</h3>
          <button
            style={getButtonStyle(cameraType === 'Wide angle shot', 'Wide angle shot')}
            onClick={() => setCameraType('Wide angle shot')}
          >
            Gran Angular
          </button>
          <button
            style={getButtonStyle(cameraType === 'Close-up', 'Close-up')}
            onClick={() => setCameraType('Close-up')}
          >
            Primer Plano
          </button>
          <button
            style={getButtonStyle(cameraType === 'Over the shoulder', 'Over the shoulder')}
            onClick={() => setCameraType('Over the shoulder')}
          >
            Sobre el Hombro
          </button>
          <button
            style={getButtonStyle(cameraType === "Bird's-eye view", "Bird's-eye view")}
            onClick={() => setCameraType("Bird's-eye view")}
          >
            Vista de Pájaro
          </button>
          <button
            style={getButtonStyle(cameraType === 'Dutch angle', 'Dutch angle')}
            onClick={() => setCameraType('Dutch angle')}
          >
            Ángulo Holandés
          </button>
        </div>


        <div className="opciones">
          <h3>Estilo Fotográfico</h3>
          <button
            style={getButtonStyle(photoStyle === 'Portrait', 'Portrait')}
            onClick={() => setPhotoStyle('Portrait')}
          >
            Retrato
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Landscape', 'Landscape')}
            onClick={() => setPhotoStyle('Landscape')}
          >
            Paisaje
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Macro', 'Macro')}
            onClick={() => setPhotoStyle('Macro')}
          >
            Macro
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Street photography', 'Street photography')}
            onClick={() => setPhotoStyle('Street photography')}
          >
            Fotografía Callejera
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Fashion photography', 'Fashion photography')}
            onClick={() => setPhotoStyle('Fashion photography')}
          >
            Fotografía de Moda
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Aerial photography', 'Aerial photography')}
            onClick={() => setPhotoStyle('Aerial photography')}
          >
            Fotografía Aérea
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Documentary photography', 'Documentary photography')}
            onClick={() => setPhotoStyle('Documentary photography')}
          >
            Fotografía Documental
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Sports photography', 'Sports photography')}
            onClick={() => setPhotoStyle('Sports photography')}
          >
            Fotografía Deportiva
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Wildlife photography', 'Wildlife photography')}
            onClick={() => setPhotoStyle('Wildlife photography')}
          >
            Fotografía de Vida Salvaje
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Astrophotography', 'Astrophotography')}
            onClick={() => setPhotoStyle('Astrophotography')}
          >
            Astrofotografía
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Underwater photography', 'Underwater photography')}
            onClick={() => setPhotoStyle('Underwater photography')}
          >
            Fotografía Submarina
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Architectural photography', 'Architectural photography')}
            onClick={() => setPhotoStyle('Architectural photography')}
          >
            Fotografía Arquitectónica
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Food photography', 'Food photography')}
            onClick={() => setPhotoStyle('Food photography')}
          >
            Fotografía de Alimentos
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Product photography', 'Product photography')}
            onClick={() => setPhotoStyle('Product photography')}
          >
            Fotografía de Productos
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Event photography', 'Event photography')}
            onClick={()=> setPhotoStyle('Event photography')}
          >
            Fotografía de Eventos
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Fine art photography', 'Fine art photography')}
            onClick={() => setPhotoStyle('Fine art photography')}
          >
            Fotografía Artística
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Travel photography', 'Travel photography')}
            onClick={() => setPhotoStyle('Travel photography')}
          >
            Fotografía de Viajes
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Night photography', 'Night photography')}
            onClick={() => setPhotoStyle('Night photography')}
          >
            Fotografía Nocturna
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Editorial photography', 'Editorial photography')}
            onClick={() => setPhotoStyle('Editorial photography')}
          >
            Fotografía Editorial
          </button>
          <button
            style={getButtonStyle(photoStyle === 'Conceptual photography', 'Conceptual photography')}
            onClick={() => setPhotoStyle('Conceptual photography')}
          >
            Fotografía Conceptual
          </button>
        </div>


        <div className="opciones">
          <h3>Iluminación</h3>
          <button
            style={getButtonStyle(lighting === 'Golden hour', 'Golden hour')}
            onClick={() => setLighting('Golden hour')}
          >
            Hora Dorada
          </button>
          <button
            style={getButtonStyle(lighting === 'Backlit', 'Backlit')}
            onClick={() => setLighting('Backlit')}
          >
            Contraluz
          </button>
          <button
            style={getButtonStyle(lighting === 'Low key', 'Low key')}
            onClick={() => setLighting('Low key')}
          >
            Claves Bajas
          </button>
          <button
            style={getButtonStyle(lighting === 'High key', 'High key')}
            onClick={() => setLighting('High key')}
          >
            Claves Altas
          </button>
          <button
            style={getButtonStyle(lighting === 'Cinematic lighting', 'Cinematic lighting')}
            onClick={() => setLighting('Cinematic lighting')}
          >
            Iluminación Cinematográfica
          </button>
        </div>


        <div className="opciones">
          <h3>Composición</h3>
          <button
            style={getButtonStyle(composition === 'Rule of thirds', 'Rule of thirds')}
            onClick={() => setComposition('Rule of thirds')}
          >
            Regla de los Tercios
          </button>
          <button
            style={getButtonStyle(composition === 'Symmetrical', 'Symmetrical')}
            onClick={() => setComposition('Symmetrical')}
          >
            Simétrica
          </button>
          <button
            style={getButtonStyle(composition === 'Asymmetrical', 'Asymmetrical')}
            onClick={() => setComposition('Asymmetrical')}
          >
            Asimétrica
          </button>
          <button
            style={getButtonStyle(composition === 'Golden ratio', 'Golden ratio')}
            onClick={() => setComposition('Golden ratio')}
          >
            Proporción Áurea
          </button>
        </div>


        <div className="opciones">
          <h3>Fondo</h3>
          <button
            style={getButtonStyle(background === 'Urban cityscape', 'Urban cityscape')}
            onClick={() => setBackground('Urban cityscape')}
          >
            Ciudad Urbana
          </button>
          <button
            style={getButtonStyle(background === 'Mystic forest', 'Mystic forest')}
            onClick={() => setBackground('Mystic forest')}
          >
            Bosque Místico
          </button>
          <button
            style={getButtonStyle(background === 'Futuristic landscape', 'Futuristic landscape')}
            onClick={() => setBackground('Futuristic landscape')}
          >
            Paisaje Futurista
          </button>
          <button
            style={getButtonStyle(background === 'Neon lights', 'Neon lights')}
            onClick={() => setBackground('Neon lights')}
          >
            Luces Neón
          </button>
        </div>


        <div className="opciones">
          <h3>Esquema de Color</h3>
          <button
            style={getButtonStyle(colorScheme === 'Vibrant colors', 'Vibrant colors')}
            onClick={() => setColorScheme('Vibrant colors')}
          >
            Colores Vibrantes
          </button>
          <button
            style={getButtonStyle(colorScheme === 'Muted colors', 'Muted colors')}
            onClick={() => setColorScheme('Muted colors')}
          >
            Colores Suaves
          </button>
          <button
            style={getButtonStyle(colorScheme === 'Monochromatic', 'Monochromatic')}
            onClick={() => setColorScheme('Monochromatic')}
          >
            Monocromático
          </button>
          <button
            style={getButtonStyle(colorScheme === 'Pastel colors', 'Pastel colors')}
            onClick={() => setColorScheme('Pastel colors')}
          >
            Colores Pastel
          </button>
          <button
            style={getButtonStyle(colorScheme === 'Neon colors', 'Neon colors')}
            onClick={() => setColorScheme('Neon colors')}
          >
            Colores Neón
          </button>
          <button
            style={getButtonStyle(colorScheme === 'Cool tones', 'Cool tones')}
            onClick={() => setColorScheme('Cool tones')}
          >
            Tonos Fríos
          </button>
          <button
            style={getButtonStyle(colorScheme === 'Warm tones', 'Warm tones')}
            onClick={() => setColorScheme('Warm tones')}
          >
            Tonos Cálidos
          </button>
        </div>


        <div className="opciones">
          <h3>Estilo Artístico</h3>
          <button
            style={getButtonStyle(style === 'Realistic', 'Realistic')}
            onClick={() => setStyle('Realistic')}
          >
            Realista
          </button>
          <button
            style={getButtonStyle(style === 'Impressionist', 'Impressionist')}
            onClick={() => setStyle('Impressionist')}
          >
            Impresionista
          </button>
          <button
            style={getButtonStyle(style === 'Surrealist', 'Surrealist')}
            onClick={() => setStyle('Surrealist')}
          >
            Surrealista
          </button>
          <button
            style={getButtonStyle(style === 'Cyberpunk', 'Cyberpunk')}
            onClick={() => setStyle('Cyberpunk')}
          >
            Cyberpunk
          </button>
          <button
            style={getButtonStyle(style === 'Anime', 'Anime')}
            onClick={() => setStyle('Anime')}
          >
            Anime
          </button>
          <button
            style={getButtonStyle(style === 'Gothic', 'Gothic')}
            onClick={() => setStyle('Gothic')}
          >
            Gótico
          </button>
          <button
            style={getButtonStyle(style === 'Minimalist', 'Minimalist')}
            onClick={() => setStyle('Minimalist')}
          >
            Minimalista
          </button>
          <button
            style={getButtonStyle(style === 'Digital Art', 'Digital Art')}
            onClick={() => setStyle('Digital Art')}
          >
            Arte Digital
          </button>
        </div>

      </div>
      )}
    </div>
  );
}

export default ImageOptions;
