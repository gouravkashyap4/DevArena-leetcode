import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'premium',          // Cloudinary folder
    resource_type: 'auto',      // detect pdf/video/image automatically
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'pdf', 'doc', 'docx'], // add PDF & DOC
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // unique file name
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    // Ensure we get secure URLs
    secure: true,
    // Force HTTPS
    force_https: true
  },
});

// multer upload middleware
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    console.log('=== MULTER FILE FILTER ===');
    console.log('File:', file.originalname, 'Type:', file.mimetype, 'Size:', file.size);
    
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      return cb(new Error('File too large. Maximum size is 50MB.'), false);
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi', 'video/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      console.log('❌ File type not allowed:', file.mimetype);
      return cb(new Error('File type not allowed.'), false);
    }
    
    console.log('✅ File accepted:', file.originalname);
    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  console.error('=== MULTER ERROR ===');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Only one file allowed.' });
    }
    return res.status(400).json({ message: 'File upload error', error: error.message });
  }
  
  if (error.message) {
    return res.status(400).json({ message: error.message });
  }
  
  res.status(500).json({ message: 'File upload failed' });
};

export { upload, handleMulterError };
export default upload;
