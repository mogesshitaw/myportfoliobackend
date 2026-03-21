import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload project image
export const uploadProjectImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const filePath = file.path;
    const fileExt = path.extname(file.originalname);
    const optimizedFileName = `project-${uuidv4()}${fileExt}`;
    const optimizedFilePath = path.join(__dirname, '../uploads', optimizedFileName);

    // Optimize image
    await sharp(filePath)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(optimizedFilePath);

    // Delete original file
    fs.unlinkSync(filePath);

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/${optimizedFileName}`;

    res.status(201).json({
      success: true,
      imageUrl: imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
};

// Upload avatar image (for testimonials)
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const filePath = file.path;
    const fileExt = path.extname(file.originalname);
    const optimizedFileName = `avatar-${uuidv4()}${fileExt}`;
    const optimizedFilePath = path.join(__dirname, '../uploads', optimizedFileName);

    // Optimize image - resize to 200x200 for avatar
    await sharp(filePath)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(optimizedFilePath);

    // Delete original file
    fs.unlinkSync(filePath);

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/${optimizedFileName}`;

    res.status(201).json({
      success: true,
      imageUrl: imageUrl,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar'
    });
  }
};

// Delete image
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        error: 'Filename is required'
      });
    }

    const filePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
};