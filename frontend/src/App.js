import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LogInContainer from './components/users/LoginContainer';  
import Header from './components/Header';  
import Footer from './components/Footer';  
import MockupGenerator from './components/MockupGenerator'; 
import StepsComponent from './components/StepsComponent'; 
import Loader from './components/Loader'; // Importa el componente Loader
import 'bootstrap/dist/css/bootstrap.min.css';
import GenerarPersonaje from './components/GenerarPersonaje';
import Payment from './components/Payment';
import GeneratedImagesList from './components/GeneratedImageList';
import SideBar from './components/SideBar';
import ComoFunciona from './components/ComoFunciona';
import { useAuth } from './components/users/hooks/useAuth';
import { getAuth } from 'firebase/auth';



const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const { isLoggedIn } = useAuth(); 
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const placeholderImage = "/assets/images/examples/2.png"; 
  const [selectedLoras, setSelectedLoras] = useState([]);
  const [referenceImages, setReferenceImages] = useState([]); // Add state for reference images
  const [error, setError] = useState('');

  // Mover el estado isOpen y la función toggleSidebar aquí
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLoraChange = (lora) => {
    setSelectedLoras(prevSelectedLoras => {
        const updatedLoras = prevSelectedLoras.includes(lora)
            ? prevSelectedLoras.filter(item => item !== lora)
            : [...prevSelectedLoras, lora];
        console.log('LoRAs seleccionados:', updatedLoras);
        return updatedLoras;
    });
  };


  // Unified generateImage function for both LoRAs and Pulid
  const generateImage = async ({ prompt, selectedLoras, usePulid }) => {
    setLoading(true);
    setError(''); 
  
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (user) {
        const token = await user.getIdToken();
        
        if (usePulid) {
          // Pulid image generation
          const formData = new FormData();
          referenceImages.forEach((image) => {
            formData.append('referenceImages', image);
          });
          
          formData.append('prompt', prompt);
  
          const response = await axios.post(`${API_URL}/generate-image-pulid`, formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
  
          if (response.data && response.data.images && response.data.images.length > 0) {
            const imageUrl = response.data.images[0].url;
            setImage(imageUrl);
            return imageUrl;
          } else {
            throw new Error('No se recibió ninguna imagen del servidor');
          }
        } else {
          // LoRAs image generation
          const response = await axios.post(`${API_URL}/generate-image`, {
            prompt,
            selectedLoras,
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          if (response.data && response.data.images && response.data.images.length > 0) {
            const imageUrl = response.data.images[0].url;
            setImage(imageUrl);
            return imageUrl;
          } else {
            throw new Error('No se recibió ninguna imagen del servidor');
          }
        }
      } else {
        throw new Error('Usuario no autenticado');
      }
    } catch (error) {
      console.error('Error al generar la imagen:', error);
      setError('Error generando la imagen. Intenta de nuevo.');
      setImage(null);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  

  if (isLoggedIn === null) {
    return <Loader />; 
  }

  return (
    <Router>
      <div className="App">
        {!isLoggedIn ? (
          <LogInContainer />
        ) : (
        <>
          <Header toggleSidebar={toggleSidebar} />
            <SideBar isOpen={isOpen} toggleSidebar={toggleSidebar} />
            {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}
            <div className="container text-center contenedorapp">
              {error && <div className="alert alert-danger">{error}</div>}
            <Routes>
              <Route path="/" element={
                <StepsComponent 
                  placeholderImage={placeholderImage} 
                  onGenerateImage={generateImage} 
                  image={image} 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  loading={loading}  
                  selectedLoras={selectedLoras}  
                  handleLoraChange={handleLoraChange} 
                  setReferenceImages={setReferenceImages} // Pass this for Pulid
                />
              } />
              <Route path="/imagenes-generadas" element={<GeneratedImagesList/>} />
              <Route path="/payment" element={<Payment/>} />
              <Route path="/como-funciona" element={<ComoFunciona/>} />
              <Route path="/mockups" element={<MockupGenerator image={image} />} />
              <Route path="/generar-personaje" element={<GenerarPersonaje image={image} />} />

            </Routes>
          </div>
          <Footer/>
        </>
        )}
      </div>
    </Router>
  );
}

export default App;
