import React, { useState, useEffect } from 'react';
import PromptButton from './PromptButton'; // Importamos el componente PromptButton
import ImprovePromptGeneradorId from './ImprovePromptGeneradorId'; // Cambiamos a mayúsculas

const IdGenerator = ({ onSetReferenceImages, onSetPrompt }) => {
  const [prompt, setPrompt] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isCustomPrompt, setIsCustomPrompt] = useState(false); 
  const maxWords = 200;

  // Actualizar wordCount cada vez que prompt cambie
  useEffect(() => {
    const words = prompt.trim().split(/\s+/);
    if (words[0] === '') {
      setWordCount(0);
    } else {
      setWordCount(words.length);
    }
  }, [prompt]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    onSetReferenceImages(files);
  };

  const handlePromptChange = (e) => {
    const text = e.target.value;
    setPrompt(text);
    setIsCustomPrompt(true);
    onSetPrompt(text);
  };

  return (
    <div id="idgenerator" className="form-container">
      <h3>Generar imagen con mi cara</h3>
      <p>Subí tus fotos y describí los cambios que querés ver. La IA hará el resto, transformando tus imágenes en retratos personalizados. ¡Visualizá el resultado y convertí tu creación en productos únicos que podés comprar directamente en nuestra tienda!</p>

      <div className="form-group">
        <label className="form-label">Imágenes de la cara (hasta 6):</label>
        <input
          type="file"
          multiple
          accept="image/*"
          className="form-control"
          onChange={handleFileChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Descripción de la imagen:</label>
        <div className='botonera-gemini'>
          {/* Usamos el componente PromptButton para generar el prompt */}
          <PromptButton setPrompt={setPrompt} />

          {/* Usamos el componente improvePromptGeneradorId solo si el prompt es personalizado */}
          {isCustomPrompt && (
            <ImprovePromptGeneradorId 
              prompt={prompt} 
              setPrompt={setPrompt} 
              setIsCustomPrompt={setIsCustomPrompt} 
            />
          )}
        </div>
        <textarea
          type="text"
          value={prompt}
          className="form-control"
          onChange={handlePromptChange}
          placeholder="Escribe tu descripción aquí..."
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
    </div>
  );
};

export default IdGenerator;
