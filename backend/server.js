import express from 'express';
import multer from 'multer';
import axios from 'axios'; 
import fal from '@fal-ai/serverless-client';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import connectDB from './database.js';
import productosAIRoutes from './routes/productosAI.js';

dotenv.config();

// Conectar a MongoDB
connectDB();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Autenticación Firebase
import authenticate from './middleware/authMiddleware.js'; 


const app = express();

app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
}));

app.use((req, res, next) => {
  // res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  // res.header("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());


//Para manejar archivos
const upload = multer(); 

// Rutas de productos AI
app.use('/api/productos-ai', productosAIRoutes);

// Configuración de Google Generative 
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// CREAR PROMPT CON GEMINI
async function generatePrompt() {
  try {
    // Configura el modelo Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Genera el contenido basado en un prompt de texto
    const result = await model.generateContent([
      "Genera un prompt creativo para una imagen, Devuélveme solo el prompt, sin encabezados, notas adicionales ni explicaciones. El resultado debe tener un máximo de 200 palabras."
    ]);
    
    console.log(result.response.text());  // Imprime el resultado del prompt generado
    return result.response.text();  // Devuelve el texto generado
  } catch (error) {
    console.error("Error al generar el prompt:", error);
    return "Error al generar el prompt";
  }
}

// Endpoint para generar un prompt
app.get('/api/generate-prompt', async (req, res) => {
  const prompt = await generatePrompt();
  res.json({ prompt });
});







// MEJORAR PROMPT CON GEMINI
async function improvePrompt(inputPrompt) {
  try {
    // Configura el modelo Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Genera el contenido basado en el prompt personalizado con instrucciones claras
    const result = await model.generateContent([
      `Mejora el siguiente prompt para crear una imagen más detallada y creativa. Devuélveme solo el prompt mejorado, sin encabezados, notas adicionales ni explicaciones. El resultado debe tener un máximo de 200 palabras:

"${inputPrompt}"`
    ]);

    let improvedPrompt = await result.response.text();

    // Eliminar posibles espacios en blanco al inicio y al final
    improvedPrompt = improvedPrompt.trim();

    // Verificar y recortar el texto si excede las 200 palabras
    const words = improvedPrompt.split(/\s+/);
    if (words.length > 200) {
      improvedPrompt = words.slice(0, 200).join(' ');
    }

    console.log(improvedPrompt);  // Imprime el prompt mejorado
    return improvedPrompt;        // Devuelve el prompt mejorado
  } catch (error) {
    console.error("Error al mejorar el prompt:", error);
    return "Error al mejorar el prompt";
  }
}

// Endpoint para mejorar un prompt
app.post('/api/improve-prompt', async (req, res) => {
  const { prompt } = req.body;  // Obtener el prompt del cuerpo de la solicitud
  if (!prompt) {
    return res.status(400).json({ error: 'No se proporcionó un prompt.' });
  }

  const improvedPrompt = await improvePrompt(prompt);
  res.json({ improvedPrompt });
});









// MEJORAR PROMPT CON GEMINI
async function improvePromptGeneradorId(inputPrompt) {
  try {
    // Configura el modelo Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Genera el contenido basado en el prompt personalizado con instrucciones específicas
    const result = await model.generateContent([
      `Mejora el siguiente prompt para crear una imagen más detallada y creativa de un retrato **frontal** donde la **cara de la persona sea claramente visible**. Es crucial que el prompt mejorado mantenga esta característica. Devuélveme solo el prompt mejorado, sin encabezados, notas adicionales ni explicaciones. El resultado debe tener un máximo de 200 palabras:

"${inputPrompt}"`
    ]);

    let improvedPrompt = await result.response.text();

    // Eliminar posibles espacios en blanco al inicio y al final
    improvedPrompt = improvedPrompt.trim();

    // Verificar y recortar el texto si excede las 200 palabras
    const words = improvedPrompt.split(/\s+/);
    if (words.length > 200) {
      improvedPrompt = words.slice(0, 200).join(' ');
    }

    console.log(improvedPrompt);  // Imprime el prompt mejorado
    return improvedPrompt;        // Devuelve el prompt mejorado
  } catch (error) {
    console.error("Error al mejorar el prompt:", error);
    return "Error al mejorar el prompt";
  }
}


// Endpoint para mejorar un prompt
app.post('/api/improve-prompt-generador-id', async (req, res) => {
  const { prompt } = req.body;  // Obtener el prompt del cuerpo de la solicitud
  if (!prompt) {
    return res.status(400).json({ error: 'No se proporcionó un prompt.' });
  }

  const improvedPrompt = await improvePromptGeneradorId(prompt);
  res.json({ improvedPrompt });
});










fal.config({
  credentials: process.env.FAL_KEY,
});

const loraConfigurations = {
  lora1: {
    path: process.env.LORA_1,
    triggerWords: ['DisneyStudio', 'Cartoon'],
    numInferenceSteps: 28,
    guidanceScale: 3.5,
    clipSkip: 2,
    strength: 0.7,
  },
  
  lora2: {
    path: process.env.LORA_2,
    triggerWords: ['GTAStyle', 'RockstarGames', 'gtayuvai'],
    numInferenceSteps: 25,
    guidanceScale: 2.5,
    clipSkip: 1,
    strength: 0.8,
  },

  lora3: {
    path: process.env.LORA_3,
    triggerWords: ['anime', 'cyberpunk'],
    numInferenceSteps: 28,
    guidanceScale: 4.2,
    clipSkip: 2,
    strength: 0.75,
  },

  lora4: {
    path: process.env.LORA_4,
    triggerWords: ['beavis', 'butthead', 'beavis and butthead'],
    numInferenceSteps: 28,
    guidanceScale: 4.2,
    clipSkip: 2,
    strength: 1,
  },

  lora5: {
    path: process.env.LORA_5,
    triggerWords: ['retro_neon'],
    numInferenceSteps: 27,
    guidanceScale: 4.2,
    clipSkip: 2,
    strength: 0.8,
  },

  lora6: {
    path: process.env.LORA_6,
    triggerWords: ['painted world', 'colorful splashes'],
    numInferenceSteps: 25,
    guidanceScale: 4.2,
    clipSkip: 2,
    strength: 0.8,
  },

  lora7: {
    path: process.env.LORA_7,
    triggerWords: ['illustration'],
    numInferenceSteps: 18,
    guidanceScale: 3.3,
    clipSkip: 2,
    strength: 0.8,
  },

  lora8: {
    path: process.env.LORA_8,
    triggerWords: ['Pop art'],
    numInferenceSteps: 25,
    guidanceScale: 4,
    clipSkip: 2,
    strength: 1,
  },

  lora9: {
    path: process.env.LORA_9,
    triggerWords: ['Inksketch'],
    numInferenceSteps: 30,
    guidanceScale: 7.5,
    clipSkip: 2,
    strength: 0.8,
  },

  lora10: {
    path: process.env.LORA_10,
    triggerWords: ['Pixel art'],
    numInferenceSteps: 20,
    guidanceScale: 4,
    clipSkip: 2,
    strength: 1,
  },

  lora11: {
    path: process.env.LORA_11,
    triggerWords: ['Style of Daisuke Higuchi'],
    numInferenceSteps: 30,
    guidanceScale: 4,
    clipSkip: 2,
    strength: 0.8,
  },

  lora12: {
    path: process.env.LORA_12,
    triggerWords: ['fantasy art deco'],
    numInferenceSteps: 28,
    guidanceScale: 4,
    clipSkip: 2,
    strength: 1,
  },

  lora13: {
    path: process.env.LORA_13,
    triggerWords: ['abstract'],
    numInferenceSteps: 30,
    guidanceScale: 3.3,
    clipSkip: 2,
    strength: 0.9,
  },

  lora14: {
    path: process.env.LORA_14,
    triggerWords: ['Woodblock print'],
    numInferenceSteps: 23,
    guidanceScale: 3.2,
    clipSkip: 2,
    strength: 1,
  },


};





// Funcion para generar un personaje utilizando la API de FAL.ai
const generarPersonaje = async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageFile = req.files?.imageFile?.[0];
    const compositionImageFile = req.files?.compositionImageFile?.[0];
    const styleImageFile = req.files?.styleImageFile?.[0];
    const identityImageFile = req.files?.identityImageFile?.[0];

    let imageUrl = req.body.imageUrl;
    let compositionImageUrl = req.body.compositionImageUrl;
    let styleImageUrl = req.body.styleImageUrl;
    let identityImageUrl = req.body.identityImageUrl;

    // Handle image uploads (replace URLs if files are uploaded)
    if (imageFile) {
      const imageUrlResponse = await fal.storage.upload(imageFile.buffer);
      imageUrl = imageUrlResponse.url;
    }

    if (compositionImageFile) {
      const compositionUrlResponse = await fal.storage.upload(compositionImageFile.buffer);
      compositionImageUrl = compositionUrlResponse.url;
    }

    if (styleImageFile) {
      const styleUrlResponse = await fal.storage.upload(styleImageFile.buffer);
      styleImageUrl = styleUrlResponse.url;
    }

    if (identityImageFile) {
      const identityUrlResponse = await fal.storage.upload(identityImageFile.buffer);
      identityImageUrl = identityUrlResponse.url;
    }

    const result = await fal.subscribe('fal-ai/omni-zero', {
      input: {
        prompt: prompt || 'A woman',
        image_url: imageUrl,
        composition_image_url: compositionImageUrl,
        style_image_url: styleImageUrl,
        identity_image_url: identityImageUrl,
      },
      logs: true,
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send('Error generating image');
  }
};

// Modify the endpoint to handle file uploads
app.post('/generar-personaje', upload.fields([
  { name: 'imageFile' },
  { name: 'compositionImageFile' },
  { name: 'styleImageFile' },
  { name: 'identityImageFile' },
]), generarPersonaje);






if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Endpoint protegido para generar imágenes y restar creditos
const generateImage = async (req, res) => {
  console.log('Solicitud recibida:', req.body);

  const { prompt, selectedLoras } = req.body;

  try {
    const firestore = admin.firestore(); // Asegúrate de que esto esté después de inicializar Firebase Admin
    const userRef = firestore.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userData = userDoc.data();

    if (userData.points < 1) {
      return res.status(400).json({ message: 'No tienes suficientes créditos' });
    }

    // Restar 1 punto
    await userRef.update({
      points: admin.firestore.FieldValue.increment(-1)
    });

    let finalPrompt = prompt;
    let finalImageSize = 'landscape_4_3';
    let finalNumInferenceSteps = 28;
    let finalGuidanceScale = 3.5;

    // Construir el array de LoRAs con sus configuraciones
    const loraWeights = selectedLoras.map(loraKey => {
      const loraConfig = loraConfigurations[loraKey];
      
      // Añadir las trigger words del LoRA al prompt
      finalPrompt += ` ${loraConfig.triggerWords.join(', ')}`;
      
      // Ajustar configuraciones globales según los LoRAs seleccionados
      finalImageSize = loraConfig.imageSize || finalImageSize;
      finalNumInferenceSteps = loraConfig.numInferenceSteps || finalNumInferenceSteps;
      finalGuidanceScale = loraConfig.guidanceScale || finalGuidanceScale;

      return {
        path: loraConfig.path,  // URL o path al LoRA
        scale: loraConfig.strength || 0.7  // Escala del LoRA
      };
    });

    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        prompt: finalPrompt,
        image_size: finalImageSize,
        num_inference_steps: finalNumInferenceSteps,
        guidance_scale: finalGuidanceScale,
        num_images: 1,
        enable_safety_checker: true,
        loras: loraWeights 
      },
      sync_mode: true
    });

    // Guardar en Firestore dentro de la subcolección del usuario
    await firestore.collection('users').doc(req.user.uid).collection('generatedImages').add({
      prompt: finalPrompt,
      imageUrl: result.images[0].url,  // URL de la imagen generada
      selectedLoras: selectedLoras,
      generationMode: 'Flux LoRA',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json(result);
  } catch (error) {
    if (error.response && error.response.status === 422) {
      console.error('Error con LoRA:', error.response.data.detail);
      res.status(422).json({ message: 'Error con LoRA: ' + error.response.data.detail });
    } else {
      console.error('Error al generar la imagen:', error);
      res.status(500).send('Error generando la imagen');
    }
  }
};


// Protege el endpoint con el middleware de autenticación
app.post('/generate-image', authenticate, generateImage);








// Endpoint para obtener las imágenes generadas por un usuario autenticado
app.get('/api/user-generated-images', authenticate, async (req, res) => {
  try {
    const firestore = admin.firestore();
    const imagesRef = firestore.collection('users').doc(req.user.uid).collection('generatedImages');
    const snapshot = await imagesRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No images found' });
    }

    const images = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, images });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Error fetching images' });
  }
});

// Endpoint para eliminar una imagen generada
app.delete('/api/generated-images/:imageId', authenticate, async (req, res) => {
  try {
    const { imageId } = req.params;
    const firestore = admin.firestore();
    
    // Eliminar de la subcolección del usuario
    await firestore.collection('users').doc(req.user.uid).collection('generatedImages').doc(imageId).delete();
    
    res.json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error eliminando la imagen' });
  }
});

// Generate Image with Pulid Model
app.post('/generate-image-pulid', authenticate, upload.fields([
  { name: 'referenceImages', maxCount: 6 }
]), async (req, res) => {
  try {
    // Obtén la referencia de Firestore del usuario autenticado
    const firestore = admin.firestore();
    const userRef = firestore.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userData = userDoc.data();

    // Verifica si el usuario tiene suficientes puntos (al menos 0.25)
    if (userData.points < 0.25) {
      return res.status(400).json({ message: 'No tienes suficientes créditos' });
    }

    // Resta 0.25 puntos
    await userRef.update({
      points: admin.firestore.FieldValue.increment(-0.25)
    });

    // Continuar con la lógica de generación de la imagen como antes
    console.log('Imágenes de referencia recibidas:', req.files['referenceImages']);
    console.log('Prompt recibido:', req.body.prompt);

    const { prompt } = req.body;
    const referenceImages = [];

    if (req.files['referenceImages']) {
      for (const file of req.files['referenceImages']) {
        try {
          const imageUrl = await fal.storage.upload(file.buffer);
          console.log('URL de imagen subida:', imageUrl);
          referenceImages.push({ image_url: imageUrl });
        } catch (uploadError) {
          console.error(`Error al subir la imagen ${file.originalname}:`, uploadError);
          return res.status(500).json({ success: false, message: `Error al subir la imagen ${file.originalname}` });
        }
      }
    }

    const result = await fal.subscribe("fal-ai/pulid", {
      input: {
        reference_images: referenceImages,
        prompt,
        negative_prompt: "flaws in the eyes, flaws in the face, flaws, lowres, non-HDRi, low quality, worst quality,artifacts noise, text, watermark, glitch, deformed, mutated, ugly, disfigured, hands, low resolution, partially rendered objects,  deformed or partially rendered eyes, deformed, deformed eyeballs, cross-eyed,blurry.",
        num_images: 1,
        guidance_scale: 1.2,
        num_inference_steps: 4,
        image_size: {
          "height": 1024,
          "width": 1024
        },
        id_scale: 0.8,
        mode: "fidelity"
      },
      logs: true,
    });

    console.log('Resultado de FAL:', result);
    res.json({ success: true, images: result.images });
  } catch (error) {
    if (error.response && error.response.status === 422) {
      console.error('Error de validación con FAL:', JSON.stringify(error.response.data.detail, null, 2));
      res.status(422).json({ message: 'Error de validación con FAL: ' + error.response.data.detail });
    } else {
      console.error('Error al generar la imagen:', error);
      res.status(500).send('Error generando la imagen');
    }
  }
});





// Endpoint para eliminar una imagen generada
app.delete('/api/delete-image/:id', authenticate, async (req, res) => {
  try {
    const imageId = req.params.id;
    const userRef = admin.firestore().collection('users').doc(req.user.uid);
    const imageRef = userRef.collection('generatedImages').doc(imageId);

    await imageRef.delete();
    res.json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la imagen' });
  }
});

















// Función para subir una imagen a WordPress
const uploadImageToWordPress = async (imageBuffer, filename) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://rementerprises.uy/wp-json/wp/v2/media',
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Authorization': `Bearer ${process.env.WP_TOKEN}`,
        'Content-Type': 'image/jpeg',
      },
      data: imageBuffer,
    });

    return { mediaId: response.data.id, mediaUrl: response.data.source_url };
  } catch (error) {
    console.error('Error uploading image to WordPress:', error.response ? error.response.data : error.message);
    throw new Error('Error uploading image to WordPress');
  }
};




// Función para manejar la generación y subida de ambas imágenes
const handleImageUploadAndProductCreation = async (req, res) => {
  const { productName, productDescription, categoryId, prompt } = req.body;
  const image = req.files['image']?.[0]; 
  const frameImage = req.files['frameImage']?.[0]; 
  const pillowImage = req.files['pillowImage']?.[0]; 
  const tshirtImage = req.files['tshirtImage']?.[0];

  if (!image || !frameImage || !pillowImage || !tshirtImage) {
    console.error('Error: Alguna de las imágenes está vacía.');
    return res.status(400).json({ success: false, message: 'Las imágenes son necesarias y no deben estar vacías.' });
  }

  try {
    const timestamp = Date.now();

    // Nombres únicos para cada imagen
    const generatedImageFilename = `generated-image-${timestamp}.jpg`;
    const frameImageFilename = `frame-image-${timestamp}.jpg`;
    const pillowImageFilename = `pillow-image-${timestamp}.jpg`;
    const tshirtImageFilename = `tshirt-image-${timestamp}.jpg`;

    // Subir cada imagen a WordPress
    const generatedImageResponse = await uploadImageToWordPress(image.buffer, generatedImageFilename);
    const frameImageResponse = await uploadImageToWordPress(frameImage.buffer, frameImageFilename);
    const pillowImageResponse = await uploadImageToWordPress(pillowImage.buffer, pillowImageFilename);
    const tshirtImageResponse = await uploadImageToWordPress(tshirtImage.buffer, tshirtImageFilename);

    // Concatenar el prompt a la descripción del producto
    const short_description = `
      ${productDescription || ''}

      <h5>Cuadro:</h5><br>
      Tamaño: <strong>30cm x 50cm</strong><br>
      Estampado: Sobre tela tipo Canvas impresa a todo color, cubriendo el marco lateral<br>
      Marco: Marco de madera cubierto por el lienzo estampado<br><br>

      <h5>Almohadón:</h5><br>
      Tamaño: <strong>49cm x 49cm</strong><br>
      Estampado: Completo a todo color<br>
      Relleno: Tela tnt/ Guata siliconada<br>
      Lavado: Muy fácil limpieza, funda desmontable<br><br>

      <h5>Remera:</h5><br>
      Material: <strong>100% algodón 180g</strong> (Pre encogido)<br>
      Estampado: Vinilo termotransferible (Made in France)<br>

      <h5>Prompt utilizado:</h5><br>
      ${prompt || 'N/A'}
    `;


    // Definir los atributos del producto, incluyendo 'N/A' para las variaciones que no aplican
    const productAttributes = [
      {
        name: 'Tipo de producto',
        options: ['Cuadro', 'Almohadón', 'Remera'],
        variation: true,
      },
      {
        name: 'Tamaño',
        options: ['S', 'M', 'L', 'XL', 'XXL', 'N/A'],
        variation: true,
      },
      {
        name: 'Color',
        options: ['Blanco', 'Negro', 'Gris', 'N/A'],
        variation: true,
      },
    ];

    // Crear el producto con las variaciones correspondientes
    const productResponse = await axios({
      method: 'post',
      url: 'https://rementerprises.uy/wp-json/wc/v3/products',
      auth: {
        username: process.env.WC_CONSUMER_KEY,
        password: process.env.WC_CONSUMER_SECRET,
      },
      data: {
        name: productName,
        type: 'variable',
        short_description: short_description,
        categories: [{ id: categoryId }],
        images: [
          { id: generatedImageResponse.mediaId, position: 0 },
          { id: frameImageResponse.mediaId, position: 1 },     
          { id: pillowImageResponse.mediaId, position: 2 },    
          { id: tshirtImageResponse.mediaId, position: 3 },    
        ],              
        attributes: productAttributes,
      },
    });

    const productId = productResponse.data.id;

    const variations = [];

    // Crear variaciones para 'Cuadro' y 'Almohadón' con 'Tamaño' y 'Color' como 'N/A'
    const nonRemeraProducts = [
      {
        name: 'Cuadro',
        imageId: frameImageResponse.mediaId, 
        price: '2000',
      },
      {
        name: 'Almohadón',
        imageId: pillowImageResponse.mediaId,
        price: '2000',
      },
    ];

    for (const product of nonRemeraProducts) {
      const variation = {
        regular_price: product.price,
        attributes: [
          { name: 'Tipo de producto', option: product.name },
          { name: 'Tamaño', option: 'N/A' },
          { name: 'Color', option: 'N/A' },
        ],
        image: { id: product.imageId }, 
      };
      variations.push(variation);
    }

    // Variaciones para 'Remera' con 'Tamaño' y 'Color'
    const tamanos = ['S', 'M', 'L', 'XL', 'XXL'];
    const colores = ['Blanco', 'Negro', 'Gris'];

    for (const tamano of tamanos) {
      for (const color of colores) {
        const variation = {
          regular_price: '1800',
          attributes: [
            { name: 'Tipo de producto', option: 'Remera' },
            { name: 'Tamaño', option: tamano },
            { name: 'Color', option: color },
          ],
          image: { id: tshirtImageResponse.mediaId }, 
        };
        variations.push(variation);
      }
    }

    // Crear cada variación de manera concurrente
    await Promise.all(
      variations.map(variation => 
        axios.post(`https://rementerprises.uy/wp-json/wc/v3/products/${productId}/variations`, variation, {
          auth: {
            username: process.env.WC_CONSUMER_KEY,
            password: process.env.WC_CONSUMER_SECRET,
          },
        })
      )
    );

    res.json({ success: true, productId, productUrl: productResponse.data.permalink });
  } catch (error) {
    console.error('Error durante la carga de imágenes o creación del producto:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Error durante la carga de imágenes o creación del producto' });
  }
};

app.post('/create-product', upload.fields([
  { name: 'image' }, 
  { name: 'frameImage' }, 
  { name: 'pillowImage' }, 
  { name: 'tshirtImage' }
]), handleImageUploadAndProductCreation);






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
