import React from 'react';
import axios from 'axios';
import { BeakerIcon } from '@heroicons/react/24/outline'; 


const PromptButton = ({ setPrompt }) => {

  const generatePrompt = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/generate-prompt');
      setPrompt(response.data.prompt); 
    } catch (error) {
      console.error('Error generating prompt:', error);
    }
  };

  return (
    <div className='contenedor-boton-gemini'>
      <button onClick={generatePrompt}>Generar descripción AI <BeakerIcon className="iconbutton" /></button>
    </div>
  );
};

export default PromptButton;