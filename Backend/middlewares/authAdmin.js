 
import jwt from 'jsonwebtoken'; 
const authAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) { 
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }
 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
        if (decoded.email !== process.env.ADMIN_EMAIL) { 
            return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        }
 
        req.user = {
            userId: decoded.userId, 
            email: decoded.email,
            roles: decoded.roles || ['User']  
        };
 
        next();
    } catch (error) {
        console.error('Admin authentication error:', error.message);
         if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Authentication token expired.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
        }
         res.status(500).json({ success: false, message: 'Authentication failed.' });
    }
};

export default authAdmin;