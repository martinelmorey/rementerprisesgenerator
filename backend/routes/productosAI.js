import express from 'express';
import multer from 'multer';
import { 
  createProductoAI, 
  getUserProductosAI, 
  getProductoAI, 
  updateProductoAI, 
  deleteProductoAI,
  getPublicProductosAI,
  createMockupProduct
} from '../controllers/productosAIController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// Configurar multer para manejar archivos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Proxy para servir imágenes de Wasabi (evita bloqueos del navegador)
router.get('/image/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const { generateSignedUrl } = await import('../wasabi.js');
    
    // Generar URL firmada
    const signedUrl = await generateSignedUrl(`mockups/${fileName}`, 3600);
    
    // Hacer fetch de la imagen y retornarla
    const response = await fetch(signedUrl);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    // Copiar headers de contenido
    res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=3600');
    
    // Convertir response a buffer y enviarlo
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Error sirviendo imagen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de prueba para verificar configuración de Wasabi
router.get('/test-wasabi', (req, res) => {
  const config = {
    endpoint: process.env.WASABI_ENDPOINT,
    region: process.env.WASABI_REGION,
    bucket: process.env.WASABI_BUCKET_NAME,
    sampleUrl: `https://s3.${process.env.WASABI_REGION || 'us-east-1'}.wasabisys.com/${process.env.WASABI_BUCKET_NAME}/mockups/test.jpg`
  };
  
  res.json({
    success: true,
    config,
    message: 'Configuración de Wasabi'
  });
});

// Rutas públicas
router.get('/public', getPublicProductosAI);
router.get('/:id', getProductoAI);

// Rutas protegidas
router.use(authenticate);

// Crear producto AI con imágenes
router.post('/create', upload.array('images', 10), createProductoAI);

// Crear producto mockup individual
router.post('/create-mockup', upload.single('image'), createMockupProduct);

// Obtener productos del usuario
router.get('/user/my-products', getUserProductosAI);

// Actualizar y eliminar productos
router.put('/:id', updateProductoAI);
router.delete('/:id', deleteProductoAI);

export default router;
