import jwt from 'jsonwebtoken';

const authOrgan = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and is a Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token using your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info from token to the request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      post: decoded.post, // optional
      role: decoded.role, // optional
    };

    next(); // proceed to the next middleware/route
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

export default authOrgan;
