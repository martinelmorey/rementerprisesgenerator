import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Wasabi S3 con AWS SDK v3
const wasabi = new S3Client({
  endpoint: process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com',
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY,
    secretAccessKey: process.env.WASABI_SECRET_KEY,
  },
  region: process.env.WASABI_REGION || 'us-east-1',
  forcePathStyle: true,
});

// Función para subir imagen a Wasabi
export const uploadImageToWasabi = async (buffer, fileName, contentType = 'image/jpeg') => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read'
    });

    const result = await wasabi.send(command);
    
    // Construir URL pública
    const publicUrl = `${process.env.WASABI_ENDPOINT}/${process.env.WASABI_BUCKET_NAME}/${fileName}`;
    
    return {
      url: publicUrl,
      location: publicUrl,
      key: fileName,
      bucket: process.env.WASABI_BUCKET_NAME,
      etag: result.ETag
    };
  } catch (error) {
    console.error('Error uploading to Wasabi:', error);
    throw new Error(`Error uploading image to Wasabi: ${error.message}`);
  }
};

// Función para eliminar imagen de Wasabi
export const deleteImageFromWasabi = async (fileName) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: fileName
    });

    await wasabi.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from Wasabi:', error);
    throw new Error(`Error deleting image from Wasabi: ${error.message}`);
  }
};

// Función para generar URL firmada (si necesitas URLs temporales)
export const generateSignedUrl = async (fileName, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: fileName
    });

    return await getSignedUrl(wasabi, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Error generating signed URL: ${error.message}`);
  }
};

export default wasabi;
