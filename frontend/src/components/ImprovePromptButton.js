import React from 'react';
import axios from 'axios';

const ImprovePromptButton = ({ prompt, setPrompt }) => {

  const improvePrompt = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/improve-prompt`, { prompt });
      setPrompt(response.data.improvedPrompt); 
    } catch (error) {
      console.error('Error improving prompt:', error);
    }
  };

  return (
    <div className='contenedor-boton-gemini'>
      <button onClick={improvePrompt} disabled={!prompt}>
        Mejorar Prompt
      </button>
    </div>
  );
};

export default ImprovePromptButton;
