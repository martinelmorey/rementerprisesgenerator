import mongoose from 'mongoose';

const generatedImageSchema = new mongoose.Schema({
  // Usuario propietario
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  
  // Información de la imagen
  prompt: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true // URL de Wasabi S3
  },
  imageKey: {
    type: String,
    required: true // Key en Wasabi para eliminación
  },
  
  // Metadatos de generación
  generationMode: {
    type: String,
    enum: ['LoRAs', 'Pulid'],
    default: 'LoRAs'
  },
  selectedLoras: [{
    type: String
  }],
  referenceImages: [{
    type: String
  }],
  
  // Información técnica
  imageSize: {
    width: Number,
    height: Number
  },
  fileSize: Number, // en bytes
  contentType: {
    type: String,
    default: 'image/jpeg'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para optimizar consultas
generatedImageSchema.index({ userId: 1, createdAt: -1 });
generatedImageSchema.index({ userEmail: 1 });

// Middleware para actualizar updatedAt
generatedImageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const GeneratedImage = mongoose.model('GeneratedImage', generatedImageSchema);

export default GeneratedImage;
