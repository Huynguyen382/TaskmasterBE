const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const ApiResponse = require('../utils/response');

module.exports = async function(req, res, next) {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      console.error('JWT_SECRET is not defined');
      return ApiResponse.error(res, 'Internal Server Error', 500);
    }

    const decoded = jwt.verify(token, secret);
    
    // Get full user information from database
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return ApiResponse.unauthorized(res, 'User not found');
    }

    if (!user.isActive) {
      return ApiResponse.unauthorized(res, 'Account is deactivated');
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token');
    }
    return ApiResponse.error(res, 'Authentication failed', 401);
  }
}; 