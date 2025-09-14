import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';  



const GenerarPersonaje = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [compositionImageUrl, setCompositionImageUrl] = useState('');
  const [compositionImageFile, setCompositionImageFile] = useState(null);
  const [styleImageUrl, setStyleImageUrl] = useState('');
  const [styleImageFile, setStyleImageFile] = useState(null);
  const [identityImageUrl, setIdentityImageUrl] = useState('');
  const [identityImageFile, setIdentityImageFile] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('prompt', prompt);

    // Add file if provided, otherwise add URL
    if (imageFile) {
      formData.append('imageFile', imageFile);
    } else {
      formData.append('imageUrl', imageUrl);
    }

    if (compositionImageFile) {
      formData.append('compositionImageFile', compositionImageFile);
    } else {
      formData.append('compositionImageUrl', compositionImageUrl);
    }

    if (styleImageFile) {
      formData.append('styleImageFile', styleImageFile);
    } else {
      formData.append('styleImageUrl', styleImageUrl);
    }

    if (identityImageFile) {
      formData.append('identityImageFile', identityImageFile);
    } else {
      formData.append('identityImageUrl', identityImageUrl);
    }

    try {
      const response = await axios.post('/generar-personaje', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setGeneratedImage(response.data.image.url);
    } catch (error) {
      console.error('Error generating image:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error generating image. Please try again.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Generar Personaje</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Prompt:</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your character (e.g., A futuristic warrior)"
          />
        </div>
        
        {/* Image Upload or URL */}
        <div>
          <label>Image URL:</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter the image URL"
            disabled={!!imageFile} // Disable if file is uploaded
          />
          <label>or Upload Image:</label>
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
            disabled={!!imageUrl} // Disable if URL is provided
          />
        </div>

        {/* Composition Image Upload or URL */}
        <div>
          <label>Composition Image URL:</label>
          <input
            type="text"
            value={compositionImageUrl}
            onChange={(e) => setCompositionImageUrl(e.target.value)}
            placeholder="Enter the composition image URL"
            disabled={!!compositionImageFile} // Disable if file is uploaded
          />
          <label>or Upload Composition Image:</label>
          <input
            type="file"
            onChange={(e) => setCompositionImageFile(e.target.files[0])}
            disabled={!!compositionImageUrl} // Disable if URL is provided
          />
        </div>

        {/* Style Image Upload or URL */}
        <div>
          <label>Style Image URL:</label>
          <input
            type="text"
            value={styleImageUrl}
            onChange={(e) => setStyleImageUrl(e.target.value)}
            placeholder="Enter the style image URL"
            disabled={!!styleImageFile} // Disable if file is uploaded
          />
          <label>or Upload Style Image:</label>
          <input
            type="file"
            onChange={(e) => setStyleImageFile(e.target.files[0])}
            disabled={!!styleImageUrl} // Disable if URL is provided
          />
        </div>

        {/* Identity Image Upload or URL */}
        <div>
          <label>Identity Image URL:</label>
          <input
            type="text"
            value={identityImageUrl}
            onChange={(e) => setIdentityImageUrl(e.target.value)}
            placeholder="Enter the identity image URL"
            disabled={!!identityImageFile} // Disable if file is uploaded
          />
          <label>or Upload Identity Image:</label>
          <input
            type="file"
            onChange={(e) => setIdentityImageFile(e.target.files[0])}
            disabled={!!identityImageUrl} // Disable if URL is provided
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Character'}
        </button>
      </form>

      {generatedImage && (
        <div>
          <h2>Generated Image</h2>
          <img src={generatedImage} alt="Generated Character" />
        </div>
      )}
    </div>
  );
};

export default GenerarPersonaje;
