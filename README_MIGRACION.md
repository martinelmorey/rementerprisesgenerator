# Migración de WordPress a MongoDB Atlas

## Resumen de la Migración

Esta guía documenta la migración de tu sistema de productos AI desde WordPress/WooCommerce hacia MongoDB Atlas, creando una colección separada `productosAI` para una mejor gestión y escalabilidad.

## ✅ Ventajas de la Migración

1. **Separación de responsabilidades**: Productos tradicionales en WordPress, productos AI en MongoDB
2. **Mejor performance**: MongoDB es más eficiente para datos complejos de AI
3. **Escalabilidad**: Manejo de grandes volúmenes de productos AI
4. **Flexibilidad**: Esquemas dinámicos para metadatos de AI
5. **Análisis avanzado**: Mejores capacidades de consulta y agregación

## 🏗️ Arquitectura Nueva vs Anterior

### Anterior (WordPress)
```
Frontend → Backend → WordPress API → WooCommerce
                  → Firebase (usuarios/créditos)
```

### Nueva (MongoDB + WordPress)
```
Frontend → Backend → MongoDB (productos AI)
                  → WordPress (productos tradicionales - opcional)
                  → Firebase (usuarios/créditos)
```

## 📋 Pasos de Implementación

### 1. Configurar MongoDB Atlas

1. Crear cuenta en [MongoDB Atlas](https://cloud.mongodb.com)
2. Crear un cluster
3. Crear base de datos (ej: `rem_enterprises_ai`)
4. Crear usuario con permisos de lectura/escritura
5. Obtener string de conexión

### 2. Instalar Dependencias

```bash
cd backend
npm install mongoose slugify
```

### 3. Configurar Variables de Entorno

Agregar a tu `.env`:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rem_enterprises_ai?retryWrites=true&w=majority
```

### 4. Aplicar Cambios en el Backend

Los archivos modificados/creados:

- ✅ `models/ProductoAI.js` - Modelo de producto AI
- ✅ `controllers/productosAIController.js` - Controladores CRUD
- ✅ `routes/productosAI.js` - Rutas API
- ✅ `database.js` - Conexión MongoDB
- ✅ `server.js` - Integración de rutas
- ✅ `package.json` - Dependencias actualizadas

### 5. Actualizar Frontend

- ✅ `PurchaseButton.js` - Usar nueva API MongoDB
- ✅ `MisProductos.js` - Componente para gestionar productos AI

### 6. Migración de Datos Existentes (Opcional)

Si tienes productos existentes en WordPress que quieres migrar:

```javascript
// Script de migración (crear como migration.js)
import axios from 'axios';
import ProductoAI from './models/ProductoAI.js';
import connectDB from './database.js';

const migrateFromWordPress = async () => {
  await connectDB();
  
  // Obtener productos de WordPress
  const wpProducts = await axios.get('https://tu-sitio.com/wp-json/wc/v3/products', {
    auth: {
      username: process.env.WC_CONSUMER_KEY,
      password: process.env.WC_CONSUMER_SECRET
    }
  });
  
  // Convertir y guardar en MongoDB
  for (const wpProduct of wpProducts.data) {
    const productoAI = new ProductoAI({
      name: wpProduct.name,
      description: wpProduct.description,
      originalPrompt: extractPromptFromDescription(wpProduct.description),
      generatedImage: wpProduct.images[0]?.src,
      // ... mapear otros campos
    });
    
    await productoAI.save();
  }
};
```

## 🔄 Flujo de Trabajo Actualizado

### Creación de Producto AI

1. Usuario genera imagen con FAL.ai
2. Se crean mockups automáticamente
3. Usuario ingresa nombre del producto
4. Se sube a MongoDB con todas las variantes
5. Se almacenan imágenes en Firebase Storage
6. Producto disponible en galería personal

### Gestión de Productos

- **Crear**: `/api/productos-ai/create` (POST)
- **Listar propios**: `/api/productos-ai/user/my-products` (GET)
- **Ver público**: `/api/productos-ai/public` (GET)
- **Ver detalle**: `/api/productos-ai/:id` (GET)
- **Actualizar**: `/api/productos-ai/:id` (PUT)
- **Eliminar**: `/api/productos-ai/:id` (DELETE)

## 🗂️ Estructura de Datos

### Producto AI en MongoDB

```javascript
{
  _id: ObjectId,
  name: "Mi Producto AI",
  slug: "mi-producto-ai",
  description: "Descripción del producto",
  originalPrompt: "Prompt usado para generar la imagen",
  improvedPrompt: "Prompt mejorado (opcional)",
  generationMode: "LoRAs" | "Pulid" | "Generator",
  selectedLoras: ["lora1", "lora2"],
  generatedImage: "https://storage.googleapis.com/...",
  referenceImages: ["https://..."], // Para Pulid
  variants: [
    {
      type: "cuadro",
      size: "N/A",
      color: "N/A", 
      price: 2000,
      sku: "AI-CUA-NA-NA-1234567890-0",
      mockupImage: "https://...",
      isActive: true,
      stock: 999
    },
    // ... más variantes
  ],
  generationParams: {
    guidanceScale: 3.5,
    numInferenceSteps: 28,
    imageSize: "landscape_4_3"
  },
  createdBy: "firebase_user_uid",
  userEmail: "user@example.com",
  category: "AI Generated",
  status: "active",
  views: 0,
  likes: 0,
  orders: 0,
  basePrices: {
    cuadro: 2000,
    almohadon: 2000,
    remera: 1800
  },
  salesData: {
    totalSales: 0,
    revenue: 0,
    lastSale: null
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 🚀 Despliegue

### Variables de Entorno Requeridas

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# Firebase (existente)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# FAL.ai (existente)
FAL_KEY=your_fal_key

# Google AI (existente)
GOOGLE_API_KEY=your_google_key

# WordPress (opcional, para compatibilidad)
WP_TOKEN=your_wp_token
WC_CONSUMER_KEY=your_wc_key
WC_CONSUMER_SECRET=your_wc_secret
```

### Comandos de Inicio

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔧 Mantenimiento

### Índices Recomendados en MongoDB

```javascript
// Crear índices para mejor performance
db.productosais.createIndex({ "createdBy": 1 })
db.productosais.createIndex({ "status": 1 })
db.productosais.createIndex({ "createdAt": -1 })
db.productosais.createIndex({ "slug": 1 })
db.productosais.createIndex({ "originalPrompt": "text", "name": "text", "description": "text" })
```

### Backup y Monitoreo

1. Configurar backups automáticos en MongoDB Atlas
2. Monitorear performance de consultas
3. Revisar logs de errores regularmente

## 🎯 Próximos Pasos

1. **Dashboard de Analytics**: Crear dashboard para analizar productos AI más populares
2. **Marketplace Público**: Permitir que usuarios vendan sus creaciones AI
3. **API Pública**: Exponer API para integraciones externas
4. **Machine Learning**: Analizar patrones de prompts exitosos
5. **Optimización de Imágenes**: Implementar CDN para mejor performance

## ⚠️ Consideraciones Importantes

1. **Compatibilidad**: El endpoint WordPress `/create-product` se mantiene como fallback
2. **Autenticación**: Todos los endpoints AI requieren autenticación Firebase
3. **Almacenamiento**: Las imágenes se almacenan en Firebase Storage
4. **Escalabilidad**: MongoDB Atlas escala automáticamente según uso
5. **Costos**: Monitorear uso de MongoDB Atlas y Firebase Storage

## 🆘 Troubleshooting

### Error de Conexión MongoDB
```bash
Error: MongoNetworkError: failed to connect to server
```
**Solución**: Verificar string de conexión y whitelist de IPs en MongoDB Atlas

### Error de Autenticación Firebase
```bash
Error: Usuario no autenticado
```
**Solución**: Verificar token de Firebase en headers de la request

### Error al Subir Imágenes
```bash
Error: Firebase Storage upload failed
```
**Solución**: Verificar permisos de Firebase Storage y configuración del bucket

---

## 📞 Soporte

Para dudas sobre la implementación, revisar:
1. Logs del servidor
2. MongoDB Atlas monitoring
3. Firebase console
4. Documentación de FAL.ai

¡La migración está completa y lista para usar! 🎉
