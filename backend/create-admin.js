import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import userModel from './models/User.js';
import './config/db.js';

const createAdminUser = async () => {
  try {
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if admin already exists
    const existingAdmin = await userModel.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new userModel({
      username: 'admin',
      email: 'admin@devarena.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@devarena.com');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdminUser();
