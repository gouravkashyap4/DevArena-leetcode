import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import upload, { handleMulterError } from '../middleware/multer.js';
import {
  getAllProblems,
  addProblem,
  updateProblem,
  deleteProblem,
  getAllPremium,
  addPremium,
  updatePremium,
  deletePremium,
  getAllUsers,
  updateUser,
  deleteUser
} from '../controllers/adminController.js';

const router = express.Router();

// -------------------- Problems CRUD --------------------
// Admin-only routes
router.get('/problems', adminAuth, getAllProblems);
router.post('/problems', adminAuth, addProblem);
router.put('/problems/:id', adminAuth, updateProblem);
router.delete('/problems/:id', adminAuth, deleteProblem);

// -------------------- Premium CRUD --------------------
// GET: Anyone can view premium content
router.get('/premium', getAllPremium);

// Test admin authentication
router.get('/test', adminAuth, (req, res) => {
  res.json({ message: 'Admin authentication working!', user: req.user.username });
});

// Test database connection
router.get('/test-db', adminAuth, async (req, res) => {
  try {
    // Import the premium model
    const { default: premiumModel } = await import('../models/Premium.js');
    
    // Test database connection
    const dbState = premiumModel.db.readyState;
    console.log('Database ready state:', dbState);
    
    // Test basic database operation
    const count = await premiumModel.countDocuments();
    
    res.json({ 
      message: 'Database connection test', 
      dbState: dbState,
      premiumCount: count,
      cloudinary: {
        cloudName: !!process.env.CLOUD_NAME,
        apiKey: !!process.env.CLOUD_API_KEY,
        apiSecret: !!process.env.CLOUD_API_SECRET
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      message: 'Database test failed', 
      error: error.message
    });
  }
});

// Test premium content fetch (no auth required)
router.get('/test-premium', async (req, res) => {
  try {
    console.log('=== TEST PREMIUM ENDPOINT ===');
    
    // Import the premium model
    const { default: premiumModel } = await import('../models/Premium.js');
    
    // Test basic database operation
    const count = await premiumModel.countDocuments();
    console.log('Total premium documents:', count);
    
    // Get a few sample documents
    const samples = await premiumModel.find({}).limit(3);
    console.log('Sample documents:', samples.map(doc => ({
      id: doc._id,
      name: doc.name,
      isActive: doc.isActive,
      fileUrl: doc.fileUrl
    })));
    
    res.json({ 
      message: 'Premium content test', 
      totalCount: count,
      samples: samples,
      dbState: premiumModel.db.readyState
    });
  } catch (error) {
    console.error('Premium test error:', error);
    res.status(500).json({ 
      message: 'Premium test failed', 
      error: error.message
    });
  }
});

// Test file upload to see what Cloudinary returns
router.post('/test-upload', adminAuth, upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    console.log('=== TEST UPLOAD DEBUG ===');
    console.log('Full file object:', JSON.stringify(file, null, 2));
    console.log('File path:', file.path);
    console.log('File secure_url:', file.secure_url);
    console.log('File url:', file.url);
    
    res.json({
      message: 'Test upload successful',
      file: {
        path: file.path,
        secure_url: file.secure_url,
        url: file.url,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ message: 'Test upload failed', error: error.message });
  }
});

// Check current database state
router.get('/db-status', adminAuth, async (req, res) => {
  try {
    // Import both models to handle old and new content
    const { default: paymentModel } = await import('../models/Payment.js');
    const { default: premiumModel } = await import('../models/Premium.js');
    
    // Get items from both models
    const paymentItems = await paymentModel.find({ isPremiumContent: true }).select('name fileUrl fileName fileType createdAt');
    const premiumItems = await premiumModel.find({}).select('name fileUrl fileName fileType createdAt');
    
    const allItems = [...paymentItems, ...premiumItems];
    
    const urlAnalysis = allItems.map(item => ({
      id: item._id,
      name: item.name,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileType: item.fileType,
      createdAt: item.createdAt,
      hasValidUrl: item.fileUrl && !item.fileUrl.includes('localhost') && !item.fileUrl.startsWith('/uploads/'),
      urlType: item.fileUrl ? (item.fileUrl.includes('cloudinary') ? 'cloudinary' : 'local') : 'none',
      model: item.isPremiumContent ? 'Payment' : 'Premium'
    }));
    
    res.json({
      totalItems: allItems.length,
      paymentItems: paymentItems.length,
      premiumItems: premiumItems.length,
      validUrls: urlAnalysis.filter(item => item.hasValidUrl).length,
      invalidUrls: urlAnalysis.filter(item => !item.hasValidUrl).length,
      items: urlAnalysis
    });
  } catch (error) {
    console.error('DB status error:', error);
    res.status(500).json({ message: 'Failed to get DB status', error: error.message });
  }
});

// Test if a URL is accessible
router.post('/test-url', adminAuth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    
    console.log('Testing URL:', url);
    
    // Try to fetch the URL
    const response = await fetch(url);
    const isAccessible = response.ok;
    
    res.json({
      url: url,
      isAccessible: isAccessible,
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    console.error('Test URL error:', error);
    res.status(500).json({ 
      message: 'Failed to test URL', 
      error: error.message,
      url: req.body.url
    });
  }
});

// Fix existing premium content URLs
router.post('/fix-urls', adminAuth, async (req, res) => {
  try {
    // Import both models to handle old and new content
    const { default: paymentModel } = await import('../models/Payment.js');
    const { default: premiumModel } = await import('../models/Premium.js');
    
    // Get items from both models
    const paymentItems = await paymentModel.find({ isPremiumContent: true });
    const premiumItems = await premiumModel.find({});
    
    const allItems = [...paymentItems, ...premiumItems];
    let fixedCount = 0;
    let totalItems = allItems.length;
    
    console.log('=== FIXING URLs ===');
    console.log('Payment items found:', paymentItems.length);
    console.log('Premium items found:', premiumItems.length);
    console.log('Total items found:', totalItems);
    
    for (const item of allItems) {
      console.log('Checking item:', item._id, 'with URL:', item.fileUrl);
      
      if (item.fileUrl && (item.fileUrl.startsWith('/uploads/') || item.fileUrl.includes('localhost'))) {
        console.log('❌ Found item with local URL:', item.fileUrl);
        
        // Try to construct a Cloudinary URL from the filename or extract from old URL
        let fileName = item.fileName;
        
        // If no fileName, try to extract from the old URL
        if (!fileName && item.fileUrl) {
          const urlParts = item.fileUrl.split('/');
          fileName = urlParts[urlParts.length - 1]; // Get the last part of the URL
          console.log('📁 Extracted filename from URL:', fileName);
        }
        
        if (fileName) {
          const cloudName = process.env.CLOUD_NAME;
          const resourceType = item.fileType?.startsWith('video/') ? 'video' : 'image';
          const newUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/v1/premium/${fileName}`;
          
          console.log('🔄 Updating URL from:', item.fileUrl);
          console.log('🔄 Updating URL to:', newUrl);
          
          // Update the item with the new URL based on which model it belongs to
          if (item.isPremiumContent) {
            // This is a payment item
            await paymentModel.findByIdAndUpdate(item._id, { fileUrl: newUrl });
            console.log('✅ Updated Payment item URL:', item._id);
          } else {
            // This is a premium item
            await premiumModel.findByIdAndUpdate(item._id, { fileUrl: newUrl });
            console.log('✅ Updated Premium item URL:', item._id);
          }
          fixedCount++;
        } else {
          console.log('⚠️ Item has no fileName and cannot extract from URL, cannot fix:', item._id);
          console.log('⚠️ Item data:', {
            id: item._id,
            name: item.name,
            fileUrl: item.fileUrl,
            fileName: item.fileName,
            fileType: item.fileType
          });
        }
      } else {
        console.log('✅ Item has valid URL:', item.fileUrl);
      }
    }
    
    console.log('=== URL FIXING COMPLETE ===');
    console.log('Total items:', totalItems);
    console.log('Items fixed:', fixedCount);
    
    res.json({
      message: `Fixed ${fixedCount} out of ${totalItems} items with local URLs`,
      totalItems: totalItems,
      itemsFixed: fixedCount,
      paymentItems: paymentItems.length,
      premiumItems: premiumItems.length
    });
  } catch (error) {
    console.error('Fix URLs error:', error);
    res.status(500).json({ message: 'Failed to check URLs', error: error.message });
  }
});

// POST: Admin uploads file directly to Cloudinary
router.post('/premium', adminAuth, upload.single('file'), handleMulterError, addPremium);

// PUT: Admin updates premium content
router.put('/premium/:id', adminAuth, upload.single('file'), handleMulterError, updatePremium);

// DELETE: Admin deletes premium content (Cloudinary + DB)
router.delete('/premium/:id', adminAuth, deletePremium);

// -------------------- Users CRUD --------------------
// Admin-only routes
router.get('/users', adminAuth, getAllUsers);
router.put('/users/:id', adminAuth, updateUser);
router.delete('/users/:id', adminAuth, deleteUser);

export default router;
