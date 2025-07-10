// src/config/cloudinaryConfig.js

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Configure Cloudinary directly
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, // Ensure these names match your .env file
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Export the configured cloudinary object so it can be imported and used
export default cloudinary;