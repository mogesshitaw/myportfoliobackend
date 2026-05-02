import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to import Cloudinary with better error handling
let cloudinary;
let CLOUDINARY_AVAILABLE = false;

try {
  const cloudinaryModule = await import('cloudinary');
  cloudinary = cloudinaryModule.v2;
  CLOUDINARY_AVAILABLE = true;
  console.log('✅ Cloudinary package loaded successfully');
} catch (error) {
  console.log('⚠️ Cloudinary package not installed:', error.message);
}

// Configure Cloudinary with better logging
const isCloudinaryConfigured = () => {
  if (!CLOUDINARY_AVAILABLE) {
    console.log('❌ Cloudinary package not available');
    return false;
  }
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  console.log('🔍 Checking Cloudinary config:');
  console.log(`   Cloud Name: ${cloudName ? '✅ Set' : '❌ Missing'}`);
  console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   API Secret: ${apiSecret ? '✅ Set' : '❌ Missing'}`);
  
  const configured = !!(cloudName && apiKey && apiSecret);
  
  if (configured && cloudinary) {
    try {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      console.log('✅ Cloudinary configured successfully');
    } catch (configError) {
      console.error('❌ Failed to configure Cloudinary:', configError.message);
      return false;
    }
  } else if (CLOUDINARY_AVAILABLE && !configured) {
    console.log('⚠️ Cloudinary installed but not properly configured');
  }
  
  return configured;
};

// Determine upload method with logging
const USE_CLOUDINARY = process.env.USE_CLOUDINARY === 'true' && isCloudinaryConfigured();

console.log(`📤 Upload method: ${USE_CLOUDINARY ? 'Cloudinary' : 'Local Storage'}`);
console.log(`   USE_CLOUDINARY env: ${process.env.USE_CLOUDINARY || 'not set'}`);

class ImageUploadService {
  
  async uploadProjectImage(file, options = {}) {
    const { 
      width = 1200, 
      height = 800, 
      quality = 85,
      folder = 'portfolio/projects'
    } = options;

    console.log(`📤 Uploading project image: ${file.originalname}`);
    console.log(`   Using: ${USE_CLOUDINARY ? 'Cloudinary' : 'Local'}`);

    if (USE_CLOUDINARY) {
      return this.uploadToCloudinary(file, {
        folder,
        width,
        height,
        quality,
        crop: 'limit'
      });
    } else {
      return this.uploadToLocal(file, {
        type: 'project',
        width,
        height,
        quality,
        fit: 'inside'
      });
    }
  }

  // 🔴 ADD THIS METHOD - uploadAvatar
  async uploadAvatar(file, options = {}) {
    const { 
      width = 200, 
      height = 200, 
      quality = 85,
      folder = 'portfolio/avatars'
    } = options;

    console.log(`📤 Uploading avatar image: ${file.originalname}`);
    console.log(`   Using: ${USE_CLOUDINARY ? 'Cloudinary' : 'Local'}`);

    if (USE_CLOUDINARY) {
      return this.uploadToCloudinary(file, {
        folder,
        width,
        height,
        quality,
        crop: 'fill',
        gravity: 'face'
      });
    } else {
      return this.uploadToLocal(file, {
        type: 'avatar',
        width,
        height,
        quality,
        fit: 'cover'
      });
    }
  }

  async uploadToCloudinary(file, options) {
    try {
      if (!cloudinary) {
        throw new Error('Cloudinary not available');
      }
      
      const { folder, width, height, quality, crop, gravity } = options;
      
      // Build transformation
      const transformation = {
        width: width,
        height: height,
        crop: crop || 'limit',
        quality: quality || 'auto'
      };
      
      if (gravity) {
        transformation.gravity = gravity;
      }

      console.log(`📤 Uploading to Cloudinary: ${file.originalname}`);
      console.log(`   Folder: ${folder}`);
      console.log(`   Transformation:`, transformation);
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folder,
        transformation: [transformation],
        resource_type: 'image'
      });
      
      // Delete local temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      console.log(`✅ Uploaded to Cloudinary successfully!`);
      console.log(`   Public ID: ${result.public_id}`);
      console.log(`   URL: ${result.secure_url}`);
      
      return {
        success: true,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary',
        width: result.width,
        height: result.height,
        format: result.format
      };
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error.message);
      console.error('   Error details:', error);
      console.log('⚠️ Falling back to local storage...');
      return this.uploadToLocal(file, options);
    }
  }

  async uploadToLocal(file, options) {
    try {
      const { type, width, height, quality, fit } = options;
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('📁 Created uploads directory');
      }

      const fileExt = path.extname(file.originalname);
      const fileName = `${type}-${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadsDir, fileName);

      console.log(`📝 Optimizing image locally: ${file.originalname}`);
      
      // Optimize image with Sharp
      let sharpInstance = sharp(file.path);
      
      if (fit === 'cover') {
        sharpInstance = sharpInstance.resize(width, height, { fit: 'cover' });
      } else {
        sharpInstance = sharpInstance.resize(width, height, { 
          fit: 'inside', 
          withoutEnlargement: true 
        });
      }

      await sharpInstance
        .jpeg({ quality })
        .toFile(filePath);

      // Delete original temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const imageUrl = `${baseUrl}/uploads/${fileName}`;

      console.log(`✅ Image saved locally: ${fileName}`);
      console.log(`   URL: ${imageUrl}`);
      
      return {
        success: true,
        imageUrl: imageUrl,
        fileName: fileName,
        provider: 'local',
        message: 'Image saved locally'
      };
    } catch (error) {
      console.error('❌ Local upload error:', error);
      throw error;
    }
  }

  async deleteImage(identifier, provider = 'local') {
    try {
      if (provider === 'cloudinary' && USE_CLOUDINARY && cloudinary) {
        console.log(`🗑️ Deleting from Cloudinary: ${identifier}`);
        const result = await cloudinary.uploader.destroy(identifier);
        return {
          success: result.result === 'ok',
          provider: 'cloudinary',
          message: result.result === 'ok' ? 'Deleted from Cloudinary' : 'Deletion failed'
        };
      } else {
        const filePath = path.join(__dirname, '../uploads', identifier);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted local file: ${identifier}`);
          return {
            success: true,
            provider: 'local',
            message: 'Deleted from local storage'
          };
        }
        return {
          success: false,
          error: 'File not found'
        };
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getUploadMethod() {
    return {
      useCloudinary: USE_CLOUDINARY,
      cloudinaryAvailable: CLOUDINARY_AVAILABLE,
      isConfigured: isCloudinaryConfigured(),
      provider: USE_CLOUDINARY ? 'cloudinary' : 'local',
      cloudinaryConfig: USE_CLOUDINARY && cloudinary ? {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
      } : null
    };
  }
}

// Create instance and export
const imageUploadService = new ImageUploadService();
export default imageUploadService;