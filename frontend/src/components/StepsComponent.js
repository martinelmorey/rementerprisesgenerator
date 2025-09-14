import React, { useState } from 'react';
import ImageOptions from './ImageOptions';
import IdGenerator from './IdGenerator'; 
import InspirationGallery from './InspirationGallery';
import MockupGenerator from './MockupGenerator';
import PurchaseButton from './PurchaseButton';
import GenerarPersonaje from './GenerarPersonaje';
import Loader from './Loader';
import { InformationCircleIcon, ArrowRightIcon, ArrowLeftIcon, PhotoIcon, CubeIcon } from '@heroicons/react/24/outline'; 
import { Link } from 'react-router-dom';

const StepsComponent = ({
  placeholderImage,
  onGenerateImage,
  prompt,
  setPrompt,
  loading,
  image,
  setReferenceImages,
}) => {
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState("177"); 
  const [selectedLoras, setSelectedLoras] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null); 
  const [mockupImage, setMockupImage] = useState(null);
  const [generationMode, setGenerationMode] = useState('Pulid');
 

  const nextStep = () => setStep(prevStep => Math.min(prevStep + 1, 5)); 
  const prevStep = () => setStep(prevStep => Math.max(prevStep - 1, 1));

  // Function to toggle between LoRAs and Pulid
  const handleSelectGenerationMode = (mode) => {
    // Resetear los datos cuando se cambia el modo de generación
    resetGenerationData();
    setGenerationMode(mode);
  };

  // Call the onGenerateImage function passed from App.js, with usePulid flag
  const handleGenerateImage = async () => {
    try {
      const responseImage = await onGenerateImage({ 
        prompt, 
        selectedLoras, 
        usePulid: generationMode === 'Pulid'
      });
      if (responseImage) {
        setGeneratedImage(responseImage);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const resetGenerationData = () => {
    setPrompt('');
    setSelectedLoras([]);
    setGeneratedImage(null);
    setMockupImage(null);
    setReferenceImages([]);
  };
  
  



  return (
    <div>
      {loading && <Loader />} 
      
      {step === 1 && (
        <div className="mb-5">
          <h1 className="mb-4">Bienvenidos a REM ENTERPRISES AI</h1>
          <p className="text">
            En REM ENTERPRISES, una empresa orgullosamente uruguaya, estamos utilizando la inteligencia artificial para transformar tus ideas en arte digital. Con nuestro generador, tienes la oportunidad de crear imágenes únicas y sorprendentes.
          </p>
          <p className="text">
            ¡Empieza ahora y ve cómo una simple descripción puede convertirse en una obra maestra!
          </p>
          
          <div className='iniciobuttons'>
            <Link className='btn' to="/como-funciona">
            Como Funciona <InformationCircleIcon className="iconbutton" /> 
            </Link>
            <button className="btn btn-success" onClick={nextStep}>
            Comenzar <ArrowRightIcon className="iconbutton" />
            </button>
          </div>

          <h3 className="">Inspírate con Estas Creaciones</h3>
          <InspirationGallery nextStep={nextStep} /> 

        </div>
      )}

      {step === 2 && (
        <>
          <h1 className="mb-4">Generador REM ENTERPRISES AI</h1>

          <div className="mb-5 paso4">
            <div className="paso4interiorleft">
              
              <div className='contenedorhandleSelectGenerationMode'>
                <button 
                  className={`btn btn-secondary mb-3 ${generationMode === 'Pulid' ? 'btn-primary' : ''}`} 
                  onClick={() => handleSelectGenerationMode('Pulid')}
                >
                  Generar con mi cara
                </button>

                <button 
                  className={`btn btn-secondary mb-3 ${generationMode === 'LoRAs' ? 'btn-primary' : ''}`} 
                  onClick={() => handleSelectGenerationMode('LoRAs')}
                >
                  Generar con estilos
                </button>

                {/* Usar Generator 
                <button 
                  className={`btn btn-secondary mb-3 ${generationMode === 'Generator' ? 'btn-primary' : ''}`} 
                  onClick={() => handleSelectGenerationMode('Generator')}
                >
                  Usar Generator
                </button>
                */}
                
              </div>  

              {generationMode === 'Pulid' ? (
                <IdGenerator 
                  onSetReferenceImages={setReferenceImages} 
                  onSetPrompt={setPrompt} 
                />
              ) : generationMode === 'LoRAs' ? (
                <ImageOptions
                  onUpdatePrompt={setPrompt}
                  categoryId={categoryId}  
                  setCategoryId={setCategoryId}  
                  selectedLoras={selectedLoras}  
                  setSelectedLoras={setSelectedLoras}  
                />
              ) : (
                <GenerarPersonaje/>
              )}

            </div>

            <div className="paso4interiorright">
              <div>
                <img
                  className="img-fluid generated-image border rounded"
                  src={generatedImage || placeholderImage} // Mostrar la imagen generada
                  alt="Generada"
                />
              </div>

              <textarea
                className="form-control my-3"
                placeholder="La descripción de la imagen aparecerá aquí"
                value={prompt}
                readOnly
                rows={4} 
              />

              <div className="d-flex">
                <button className="btn btn-light" onClick={prevStep}>
                <ArrowLeftIcon className="iconbutton" /> Inicio
                </button>

                <button
                  className="btn btn-warning"
                  onClick={handleGenerateImage}
                  disabled={!prompt || !categoryId || loading}
                >
                  {loading ? 'Generando...' : (
                    <>
                      Generar Imagen <PhotoIcon className="iconbutton" />
                    </>
                  )}
                </button>

                {generatedImage && (
                  <button
                    className="btn btn-success"
                    onClick={nextStep}
                  >
                    Generar Producto <CubeIcon className="iconbutton" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {step === 3 && (
        <div className="mb-5">
          <MockupGenerator image={generatedImage} onMockupCreated={setMockupImage} /> 
          <PurchaseButton 
            generatedImage={generatedImage} 
            mockupImage={mockupImage} 
            prompt={prompt} 
            categoryId={categoryId}
            generationMode={generationMode}
            selectedLoras={selectedLoras}
          />
          <div className="d-flex mt-4">
            <button className="btn btn-light" onClick={prevStep}>Atrás</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepsComponent;
