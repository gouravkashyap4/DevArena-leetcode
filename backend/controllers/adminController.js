import problemModel from '../models/Problem.js';
import userModel from '../models/User.js';
import paymentModel from '../models/Payment.js';
import premiumModel from '../models/Premium.js';
import cloudinary from '../config/cloudinary.js';

// -------------------- Premium CRUD --------------------

// Add Premium Content
export const addPremium = async (req, res) => {
  try {
    console.log('=== ADD PREMIUM REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request user:', req.user);

    // Check if database is connected
    if (!premiumModel.db.readyState) {
      console.error('Database not connected. Ready state:', premiumModel.db.readyState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
      console.error('Cloudinary environment variables missing:', {
        CLOUD_NAME: !!process.env.CLOUD_NAME,
        CLOUD_API_KEY: !!process.env.CLOUD_API_KEY,
        CLOUD_API_SECRET: !!process.env.CLOUD_API_SECRET
      });
      return res.status(500).json({ message: 'Cloudinary configuration error' });
    }

    const file = req.file;
    if (!file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, description, category, difficulty } = req.body;

    // Validate required fields
    if (!name || !description) {
      console.log('Missing required fields:', { name, description });
      return res.status(400).json({ message: 'Name and description are required' });
    }

    // Get the proper file URL from Cloudinary
    let fileUrl = file.path || file.secure_url || file.url;
    
    console.log('=== CLOUDINARY FILE DEBUG ===');
    console.log('File object keys:', Object.keys(file));
    console.log('File path:', file.path);
    console.log('File secure_url:', file.secure_url);
    console.log('File url:', file.url);
    console.log('File filename:', file.filename);
    console.log('File public_id:', file.public_id);
    console.log('File originalname:', file.originalname);
    console.log('File mimetype:', file.mimetype);
    
    // If we don't have a proper URL, try to construct one from the public_id
    if (!fileUrl || fileUrl.startsWith('/uploads/') || fileUrl.includes('localhost')) {
      if (file.public_id) {
        // Use public_id to construct URL
        const cloudName = process.env.CLOUD_NAME;
        const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
        fileUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/v1/${file.public_id}`;
        console.log('✅ Constructed Cloudinary URL using public_id:', fileUrl);
      } else if (file.filename) {
        // Fallback to filename
        const cloudName = process.env.CLOUD_NAME;
        const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
        fileUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/v1/premium/${file.filename}`;
        console.log('✅ Constructed Cloudinary URL using filename:', fileUrl);
      } else {
        console.log('❌ Could not construct Cloudinary URL - missing public_id and filename');
        return res.status(500).json({ message: 'Failed to process uploaded file' });
      }
    }
    
    console.log('Final fileUrl:', fileUrl);
    console.log('=== END CLOUDINARY DEBUG ===');

    const premiumData = {
      name: name.trim(),
      description: description.trim(),
      category: category || 'course',
      difficulty: difficulty || 'beginner',
      fileUrl: fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      uploadedBy: req.user._id
    };

    console.log('Creating premium content with data:', premiumData);

    // Create new premium content using the proper Premium model
    const newPremium = await premiumModel.create(premiumData);

    console.log('Premium content created successfully:', newPremium);

    res.status(201).json({
      message: 'Premium content created successfully',
      premium: newPremium,
    });
  } catch (error) {
    console.error('Add Premium Error:', error);
    console.error('Error stack:', error.stack);
    
    // More specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ 
        message: 'Database error', 
        error: error.message 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Premium Content
export const updatePremium = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, difficulty } = req.body;
    const file = req.file;

    const updateData = {
      name: name?.trim(),
      description: description?.trim(),
      category: category || 'course',
      difficulty: difficulty || 'beginner'
    };

    // If new file is uploaded, update file information
    if (file) {
      const fileUrl = file.path || file.secure_url || file.url;
      updateData.fileUrl = fileUrl;
      updateData.fileName = file.originalname;
      updateData.fileSize = file.size;
      updateData.fileType = file.mimetype;
    }

    const updatedPremium = await premiumModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedPremium) {
      return res.status(404).json({ message: 'Premium content not found' });
    }

    res.json({
      message: 'Premium content updated successfully',
      premium: updatedPremium,
    });
  } catch (error) {
    console.error('Update Premium Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all Premium Content
export const getAllPremium = async (req, res) => {
  try {
    console.log('=== GET ALL PREMIUM REQUEST ===');
    
    // First, let's see what's in the database without filters
    const allPremium = await premiumModel.find({});
    console.log('All premium items (no filter):', allPremium.length);
    console.log('Sample items:', allPremium.slice(0, 3).map(item => ({
      id: item._id,
      name: item.name,
      isActive: item.isActive,
      fileUrl: item.fileUrl
    })));
    
    // Now try with the isActive filter
    const premium = await premiumModel.find({ isActive: true })
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 });
    
    console.log('Premium items with isActive filter:', premium.length);
    
    // If no items found with isActive filter, try without it
    let finalPremium = premium;
    if (premium.length === 0) {
      console.log('No items found with isActive filter, trying without filter...');
      finalPremium = await premiumModel.find({})
        .populate('uploadedBy', 'username email')
        .sort({ createdAt: -1 });
      console.log('Items found without filter:', finalPremium.length);
    }
    
    // Fix URLs for any items that might have incorrect URLs
    const fixedPremium = finalPremium.map(item => {
      if (item.fileUrl && item.fileUrl.startsWith('/uploads/')) {
        // This is an old local upload URL, we need to fix it
        console.log('Found item with local upload URL:', item.fileUrl);
        // For now, return the item as is, but log the issue
        return item;
      }
      return item;
    });
    
    console.log('Final premium items to return:', fixedPremium.length);
    
    res.json(fixedPremium);
  } catch (error) {
    console.error('Get Premium Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Premium Content
export const deletePremium = async (req, res) => {
  try {
    const premium = await premiumModel.findById(req.params.id);
    if (!premium) return res.status(404).json({ message: "Premium content not found" });

    // Delete file from Cloudinary if it exists
    if (premium.fileUrl) {
      try {
        const publicId = premium.fileUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue with deletion even if Cloudinary fails
      }
    }

    await premium.deleteOne();

    res.json({ message: "Premium content deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- Users CRUD --------------------
// Get all Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.json(users);
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update User role/premium
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userModel.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedUser);
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userModel.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// -------------------- Problems CRUD --------------------

// Get all Problems
export const getAllProblems = async (req, res) => {
  try {
    const problems = await problemModel.find();
    res.json(problems);
  } catch (error) {
    console.error('Get Problems Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add Problem
export const addProblem = async (req, res) => {
  try {
    const newProblem = await problemModel.create(req.body);
    res.status(201).json({
      message: 'Problem added successfully',
      problem: newProblem,
    });
  } catch (error) {
    console.error('Add Problem Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Problem
export const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProblem = await problemModel.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedProblem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({
      message: 'Problem updated successfully',
      problem: updatedProblem,
    });
  } catch (error) {
    console.error('Update Problem Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Problem
export const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await problemModel.findByIdAndDelete(id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete Problem Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
