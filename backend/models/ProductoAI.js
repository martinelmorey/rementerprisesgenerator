import mongoose from 'mongoose';
import slugify from 'slugify';

const AIVariantSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['cuadro', 'almohadon', 'remera']
  },
  size: { 
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL', 'N/A'],
    default: 'N/A'
  },
  color: { 
    type: String,
    enum: ['Blanco', 'Negro', 'Gris', 'N/A'],
    default: 'N/A'
  },
  sku: { 
    type: String, 
    unique: true,
    sparse: true
  },
  price: { type: Number, required: true },
  mockupImage: { type: String }, // URL de la imagen del mockup
  isActive: { type: Boolean, default: true },
  stock: { type: Number, default: 999 } // Stock infinito por defecto para productos AI
});

const ProductoAISchema = new mongoose.Schema({
  // Información básica del producto
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  
  // Información específica de AI
  originalPrompt: { type: String, required: true },
  improvedPrompt: { type: String },
  generationMode: { 
    type: String, 
    enum: ['LoRAs', 'Pulid', 'Generator'],
    required: true 
  },
  
  // LoRAs utilizados (si aplica)
  selectedLoras: [{ type: String }],
  loraConfiguration: { type: mongoose.Schema.Types.Mixed },
  
  // Imágenes
  generatedImage: { type: String, required: true }, // Imagen AI original
  referenceImages: [{ type: String }], // Para modo Pulid
  
  // Variantes del producto (cuadro, almohadón, remeras)
  variants: [AIVariantSchema],
  
  // Metadatos de generación
  generationParams: {
    guidanceScale: { type: Number },
    numInferenceSteps: { type: Number },
    imageSize: { type: String },
    model: { type: String }
  },
  
  // Usuario que generó el producto
  createdBy: { 
    type: String, // Firebase UID
    required: true 
  },
  userEmail: { type: String },
  
  // Categorización
  category: { 
    type: String,
    default: 'AI Generated'
  },
  tags: [{ type: String }],
  
  // Estado del producto
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'sold'],
    default: 'active'
  },
  
  // Estadísticas
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  
  // Precios base
  basePrices: {
    cuadro: { type: Number, default: 2000 },
    almohadon: { type: Number, default: 2000 },
    remera: { type: Number, default: 1800 }
  },
  
  // Información de venta
  salesData: {
    totalSales: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    lastSale: { type: Date }
  },
  
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true,
  // Índices para búsquedas eficientes
  index: {
    createdBy: 1,
    status: 1,
    createdAt: -1,
    slug: 1
  }
});

// Middleware para generar slug y SKUs
ProductoAISchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  // Generar SKUs para variantes
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((variant, index) => {
      if (!variant.sku) {
        const typeCode = variant.type.substring(0, 3).toUpperCase();
        const sizeCode = variant.size !== 'N/A' ? variant.size : 'NA';
        const colorCode = variant.color !== 'N/A' ? variant.color.substring(0, 2).toUpperCase() : 'NA';
        variant.sku = `AI-${typeCode}-${sizeCode}-${colorCode}-${Date.now()}-${index}`;
      }
    });
  }
  
  next();
});

// Método para crear variantes automáticamente
ProductoAISchema.methods.createDefaultVariants = function(mockupImages) {
  const variants = [];
  
  // Cuadro
  variants.push({
    type: 'cuadro',
    size: 'N/A',
    color: 'N/A',
    price: this.basePrices.cuadro,
    mockupImage: mockupImages.frameImage
  });
  
  // Almohadón
  variants.push({
    type: 'almohadon',
    size: 'N/A',
    color: 'N/A',
    price: this.basePrices.almohadon,
    mockupImage: mockupImages.pillowImage
  });
  
  // Remeras - todas las combinaciones
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Blanco', 'Negro', 'Gris'];
  
  sizes.forEach(size => {
    colors.forEach(color => {
      variants.push({
        type: 'remera',
        size: size,
        color: color,
        price: this.basePrices.remera,
        mockupImage: mockupImages.tshirtImage
      });
    });
  });
  
  this.variants = variants;
  return this;
};

// Método para obtener precio con descuentos
ProductoAISchema.methods.getEffectivePrice = function(variantId, discount = 0) {
  const variant = this.variants.id(variantId);
  if (!variant) return null;
  
  let price = variant.price;
  if (discount > 0) {
    price = price - (price * discount / 100);
  }
  
  return price;
};

// Método para incrementar vistas
ProductoAISchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Método para registrar venta
ProductoAISchema.methods.recordSale = function(amount, quantity = 1) {
  this.orders += quantity;
  this.salesData.totalSales += quantity;
  this.salesData.revenue += amount;
  this.salesData.lastSale = new Date();
  return this.save();
};

export default mongoose.model('ProductoAI', ProductoAISchema);
