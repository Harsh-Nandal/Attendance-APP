import connectDB from '../../lib/mongodb';
import User from '../../models/User';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, userId, role, imageData, faceDescriptor } = req.body;

  // Validate input
  if (!name || !userId || !role || !imageData || !faceDescriptor) {
    return res.status(400).json({
      message: 'All fields are required including faceDescriptor.',
    });
  }

  try {
    await connectDB();

    // Optional: Check for duplicate userId
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(409).json({ message: 'User ID already exists.' });
    }

    // Upload image to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(imageData, {
      folder: 'mdci-faces',
    });

    // Save to MongoDB
    const newUser = await User.create({
      name,
      userId,
      role,
      imageUrl: uploadRes.secure_url,
      faceDescriptor, // must be an array of numbers
    });

    return res.status(200).json({
      message: 'Registration successful',
      user: newUser,
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
}
