import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(CLOUDINARY_CONFIG.cloud_name && 
            CLOUDINARY_CONFIG.api_key && 
            CLOUDINARY_CONFIG.api_secret);
};

// Configure Cloudinary only if credentials exist
if (isCloudinaryConfigured()) {
  cloudinary.config(CLOUDINARY_CONFIG);
  console.log('✅ Cloudinary configured successfully');
} else {
  console.log('⚠️ Cloudinary not configured, using local storage only');
}

// Determine upload method
const USE_CLOUDINARY = process.env.USE_CLOUDINARY === 'true' && isCloudinaryConfigured();

class ImageUploadService {
  
  async uploadProjectImage(file, options = {}) {
    const { 
      width = 1200, 
      height = 800, 
      quality = 85,
      folder = 'portfolio/projects'
    } = options;

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

  async uploadAvatar(file, options = {}) {
    const { 
      width = 200, 
      height = 200, 
      quality = 85,
      folder = 'portfolio/avatars'
    } = options;

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
      console.error('Cloudinary upload error:', error);
      // Fallback to local upload
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
      }

      const fileExt = path.extname(file.originalname);
      const fileName = `${type}-${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadsDir, fileName);

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

      return {
        success: true,
        imageUrl: imageUrl,
        fileName: fileName,
        provider: 'local',
        message: 'Image saved locally'
      };
    } catch (error) {
      console.error('Local upload error:', error);
      throw error;
    }
  }

  async deleteImage(identifier, provider = 'local') {
    try {
      if (provider === 'cloudinary' && USE_CLOUDINARY) {
        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(identifier);
        return {
          success: result.result === 'ok',
          provider: 'cloudinary',
          message: result.result === 'ok' ? 'Deleted from Cloudinary' : 'Deletion failed'
        };
      } else {
        // Delete from local storage
        const filePath = path.join(__dirname, '../uploads', identifier);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
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
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getUploadMethod() {
    return {
      useCloudinary: USE_CLOUDINARY,
      isConfigured: isCloudinaryConfigured(),
      provider: USE_CLOUDINARY ? 'cloudinary' : 'local',
      cloudinaryConfig: USE_CLOUDINARY ? {
        cloudName: CLOUDINARY_CONFIG.cloud_name
      } : null
    };
  }
}

export default new ImageUploadService();