import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js'; // Make sure path is correct

const eventAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not Authorized. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user info using userId
    const user = await userModel.findById(decoded.userId).select('name email _id');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    req.user = user; // now req.user has _id, name, email

    next();
  } catch (error) {
    console.error('EventAuth middleware error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export default eventAuth;
