// --- In middlewares/authAdmin.js ---
import jwt from 'jsonwebtoken';
// import userModel from '../Models/usermodel.js'; // Only needed if you fetch roles from DB here

const authAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            // Return a proper HTTP status code
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is an admin (using the email from token)
        if (decoded.email !== process.env.ADMIN_EMAIL) {
            // Return a proper HTTP status code
            return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        }

        // --- FIX: Attach roles to req.user ---
        // Make sure the JWT payload includes 'roles'
        req.user = {
            userId: decoded.userId, // Good practice to include the ID if available in token
            email: decoded.email,
            roles: decoded.roles || ['User'] // Use roles from JWT, fallback to ['User'] if missing
        };
        // --- End FIX ---

        next();
    } catch (error) {
        console.error('Admin authentication error:', error.message);
        // Handle common JWT errors for better feedback
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Authentication token expired.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
        }
        // Generic error for other issues
        res.status(500).json({ success: false, message: 'Authentication failed.' });
    }
};

export default authAdmin;