import React from 'react';
import axios from 'axios';

const ImprovePromptGeneradorId = ({ prompt, setPrompt, setIsCustomPrompt }) => {

  const improvePrompt = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/improve-prompt-generador-id`, { prompt });
      setPrompt(response.data.improvedPrompt); 
      setIsCustomPrompt(false);
    } catch (error) {
      console.error('Error improving prompt:', error);
    }
  };

  return (
    <div className='contenedor-boton-gemini'>
      <button onClick={improvePrompt}>Mejorar Prompt AI</button>
    </div>
  );
};

export default ImprovePromptGeneradorId;
