import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

dotenv.config();

// Configure Cloudinary with environment variables
const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

cloudinary.config(config);

// Validate configuration on startup
if (!config.cloud_name || !config.api_key || !config.api_secret) {
    // Cloudinary credentials not fully configured
}

export default cloudinary;
