import fs from 'fs';
import imageUploadService from '../services/imageUploadService.js';

// Upload project image
export const uploadProjectImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const result = await imageUploadService.uploadProjectImage(req.file, {
      width: 1200,
      height: 800,
      quality: 85
    });

    res.status(201).json({
      success: true,
      imageUrl: result.imageUrl,
      provider: result.provider,
      message: `Image uploaded successfully using ${result.provider}`,
      ...(result.publicId && { publicId: result.publicId })
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
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

// Upload avatar image
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const result = await imageUploadService.uploadAvatar(req.file, {
      width: 200,
      height: 200,
      quality: 85
    });

    res.status(201).json({
      success: true,
      imageUrl: result.imageUrl,
      provider: result.provider,
      message: `Avatar uploaded successfully using ${result.provider}`,
      ...(result.publicId && { publicId: result.publicId })
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
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
    const { provider = 'local' } = req.query;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        error: 'Filename or publicId is required'
      });
    }

    const result = await imageUploadService.deleteImage(filename, provider);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error || 'Failed to delete image'
      });
    }

    res.json({
      success: true,
      message: result.message,
      provider: result.provider
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
};

// Get upload configuration
export const getUploadConfig = async (req, res) => {
  res.json({
    success: true,
    config: imageUploadService.getUploadMethod()
  });
};