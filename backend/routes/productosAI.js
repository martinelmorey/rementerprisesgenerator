import express from 'express';
import multer from 'multer';
import {
  createProductoAI,
  getUserProductosAI,
  getProductoAI,
  updateProductoAI,
  deleteProductoAI,
  getPublicProductosAI
} from '../controllers/productosAIController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer();

// Rutas públicas
router.get('/public', getPublicProductosAI);
router.get('/:id', getProductoAI);

// Rutas protegidas (requieren autenticación)
router.post('/create', authenticate, upload.fields([
  { name: 'image' }, 
  { name: 'frameImage' }, 
  { name: 'pillowImage' }, 
  { name: 'tshirtImage' }
]), createProductoAI);

router.get('/user/my-products', authenticate, getUserProductosAI);
router.put('/:id', authenticate, updateProductoAI);
router.delete('/:id', authenticate, deleteProductoAI);

export default router;
