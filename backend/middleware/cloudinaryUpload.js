import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// PDF/Video storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let folder = 'premium-content';
        let resource_type = 'auto'; // automatically detect pdf/video/image
        return {
            folder,
            resource_type,
            public_id: `${Date.now()}-${file.originalname}`
        };
    },
});

const upload = multer({ storage });

export default upload;
