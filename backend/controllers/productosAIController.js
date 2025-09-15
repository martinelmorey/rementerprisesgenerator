import ProductoAI from '../models/ProductoAI.js';
import admin from 'firebase-admin';
import { uploadImageToWasabi } from '../wasabi.js';

// Crear un producto mockup individual
export const createMockupProduct = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request files:', req.files);
    
    const { 
      userId,
      type,
      productType,
      originalImageUrl,
      originalPrompt,
      createdAt,
      status
    } = req.body;

    // Verificar autenticación
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    // Validar imagen del mockup
    const image = req.file;
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        message: 'Imagen del mockup es requerida',
        debug: {
          hasFile: !!req.file,
          hasFiles: !!req.files,
          bodyKeys: Object.keys(req.body)
        }
      });
    }

    // Subir imagen a Wasabi S3
    const timestamp = Date.now();
    const fileName = `mockups/${productType}-${timestamp}.jpg`;
    
    const uploadResult = await uploadImageToWasabi(image.buffer, fileName);
    const mockupImageUrl = uploadResult.url;
    
    console.log('Generated Wasabi URL:', mockupImageUrl);
    console.log('Upload result:', uploadResult);

    // Generar nombre del producto basado en el prompt
    let productName;
    if (originalPrompt && originalPrompt.trim()) {
      // Tomar las primeras 3 palabras del prompt
      const promptWords = originalPrompt.trim().split(' ').slice(0, 3).join(' ');
      productName = `${promptWords} - ${productType.charAt(0).toUpperCase() + productType.slice(1)} ${timestamp}`;
    } else {
      productName = `${productType.charAt(0).toUpperCase() + productType.slice(1)} Mockup ${timestamp}`;
    }
    
    const productoAI = new ProductoAI({
      name: productName,
      description: `Mockup de ${productType} generado automáticamente`,
      originalPrompt: originalPrompt || `Mockup ${productType}`,
      generationMode: 'LoRAs', // Usar un valor válido existente temporalmente
      selectedLoras: [],
      generatedImage: mockupImageUrl,
      referenceImages: originalImageUrl ? [originalImageUrl] : [],
      generationParams: { mockupType: productType },
      createdBy: userId || req.user.uid,
      userEmail: req.user.email,
      category: 'Mockup',
      status: status || 'active',
      createdAt: createdAt ? new Date(createdAt) : new Date()
    });

    await productoAI.save();

    res.json({ 
      success: true, 
      productId: productoAI._id,
      product: productoAI,
      imageUrl: mockupImageUrl,
      message: 'Producto mockup creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando producto mockup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al crear el producto mockup' 
    });
  }
};

// Crear un nuevo producto AI
export const createProductoAI = async (req, res) => {
  try {
    const { 
      productName, 
      prompt, 
      categoryId, 
      generationMode,
      selectedLoras,
      generationParams,
      referenceImages 
    } = req.body;

    // Verificar autenticación
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    // Validar imágenes requeridas
    const image = req.files['image']?.[0]; 
    const frameImage = req.files['frameImage']?.[0]; 
    const pillowImage = req.files['pillowImage']?.[0]; 
    const tshirtImage = req.files['tshirtImage']?.[0];

    if (!image || !frameImage || !pillowImage || !tshirtImage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todas las imágenes son requeridas (imagen generada, cuadro, almohadón, remera)' 
      });
    }

    // Subir imágenes a Wasabi S3
    const timestamp = Date.now();
    
    const uploadPromises = [
      uploadImageToWasabi(image.buffer, `ai-products/generated-${timestamp}.jpg`),
      uploadImageToWasabi(frameImage.buffer, `ai-products/frame-${timestamp}.jpg`),
      uploadImageToWasabi(pillowImage.buffer, `ai-products/pillow-${timestamp}.jpg`),
      uploadImageToWasabi(tshirtImage.buffer, `ai-products/tshirt-${timestamp}.jpg`)
    ];

    const [generatedImageResult, frameImageResult, pillowImageResult, tshirtImageResult] = await Promise.all(uploadPromises);
    
    const generatedImageUrl = generatedImageResult.url;
    const frameImageUrl = frameImageResult.url;
    const pillowImageUrl = pillowImageResult.url;
    const tshirtImageUrl = tshirtImageResult.url;

    // Crear el producto AI
    const productoAI = new ProductoAI({
      name: productName,
      description: `Producto AI generado con prompt: ${prompt}`,
      originalPrompt: prompt,
      generationMode: generationMode || 'LoRAs',
      selectedLoras: selectedLoras || [],
      generatedImage: generatedImageUrl,
      referenceImages: referenceImages || [],
      generationParams: generationParams || {},
      createdBy: req.user.uid,
      userEmail: req.user.email,
      category: categoryId || 'AI Generated'
    });

    // Crear variantes automáticamente
    productoAI.createDefaultVariants({
      frameImage: frameImageUrl,
      pillowImage: pillowImageUrl,
      tshirtImage: tshirtImageUrl
    });

    await productoAI.save();

    res.json({ 
      success: true, 
      productId: productoAI._id,
      product: productoAI,
      message: 'Producto AI creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando producto AI:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al crear el producto AI' 
    });
  }
};

// Obtener productos AI del usuario
export const getUserProductosAI = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const { page = 1, limit = 10, status = 'active' } = req.query;
    
    const productos = await ProductoAI.find({ 
      createdBy: req.user.uid,
      ...(status !== 'all' && { status })
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

    // Generar URLs del proxy para las imágenes
    const productosCorregidos = productos.map(producto => {
      let generatedImage = producto.generatedImage;
      
      // Si hay una imagen, usar el proxy del backend
      if (generatedImage) {
        try {
          // Extraer el nombre del archivo de la URL
          let fileName;
          if (generatedImage.includes('/')) {
            fileName = generatedImage.split('/').pop();
          }
          
          if (fileName) {
            // Usar el proxy del backend en lugar de URLs directas de Wasabi
            generatedImage = `http://localhost:5000/api/productos-ai/image/${fileName}`;
            console.log('URL proxy generada para:', fileName);
          }
        } catch (error) {
          console.error('Error generando URL proxy:', error);
          // Mantener la URL original si falla
        }
      }
      
      return {
        ...producto.toObject(),
        generatedImage
      };
    });

    const total = await ProductoAI.countDocuments({ 
      createdBy: req.user.uid,
      ...(status !== 'all' && { status })
    });

    res.json({
      success: true,
      productos: productosCorregidos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error obteniendo productos AI:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo productos AI' });
  }
};

// Obtener un producto AI específico
export const getProductoAI = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await ProductoAI.findById(id);
    
    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Incrementar vistas
    await producto.incrementViews();

    res.json({ success: true, producto });

  } catch (error) {
    console.error('Error obteniendo producto AI:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo producto AI' });
  }
};

// Actualizar producto AI
export const updateProductoAI = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verificar que el usuario sea el propietario
    const producto = await ProductoAI.findById(id);
    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    if (producto.createdBy !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'No autorizado para modificar este producto' });
    }

    const updatedProducto = await ProductoAI.findByIdAndUpdate(id, updates, { new: true });

    res.json({ success: true, producto: updatedProducto });

  } catch (error) {
    console.error('Error actualizando producto AI:', error);
    res.status(500).json({ success: false, message: 'Error actualizando producto AI' });
  }
};

// Eliminar producto AI
export const deleteProductoAI = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await ProductoAI.findById(id);
    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    if (producto.createdBy !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar este producto' });
    }

    // Eliminar imagen de Wasabi S3 si existe
    if (producto.generatedImage) {
      try {
        const { deleteImageFromWasabi } = await import('../wasabi.js');
        
        // Extraer el nombre del archivo de la URL
        let fileName;
        if (producto.generatedImage.includes('/')) {
          fileName = producto.generatedImage.split('/').pop();
          // Si no tiene el prefijo mockups/, agregarlo
          if (!producto.generatedImage.includes('mockups/')) {
            fileName = `mockups/${fileName}`;
          }
        }
        
        if (fileName) {
          await deleteImageFromWasabi(fileName);
          console.log('Imagen eliminada de Wasabi:', fileName);
        }
      } catch (imageError) {
        console.error('Error eliminando imagen de Wasabi:', imageError);
        // Continuar con la eliminación del producto aunque falle la imagen
      }
    }

    // Eliminar producto de MongoDB
    await ProductoAI.findByIdAndDelete(id);

    res.json({ success: true, message: 'Producto e imagen eliminados exitosamente' });

  } catch (error) {
    console.error('Error eliminando producto AI:', error);
    res.status(500).json({ success: false, message: 'Error eliminando producto AI' });
  }
};

// Obtener productos AI públicos (para galería)
export const getPublicProductosAI = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    
    let query = { status: 'active', isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { originalPrompt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const productos = await ProductoAI.find(query)
      .select('-createdBy -userEmail') // No exponer datos del usuario
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await ProductoAI.countDocuments(query);

    res.json({
      success: true,
      productos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error obteniendo productos AI públicos:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo productos AI' });
  }
};

// Nota: La función uploadImageToWasabi se encuentra en wasabi.js
