const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const auth = require('../middleware/auth');
const { requireAdmin, authorizeOwnerOrAdmin } = require('../middleware/authorize');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/refresh', userController.refreshToken);
router.post('/logout', userController.logout);

// Protected routes
router.use(auth); // Apply authentication to all routes below

// GET all users (authenticated)
// Admin sẽ nhận toàn bộ; user thường sẽ được lọc trong service
router.get('/', userController.getAllUsers);

// GET user by id (owner or admin)
router.get('/:id', authorizeOwnerOrAdmin(), userController.getUserById);

// PUT update user (owner or admin)
router.put('/:id', authorizeOwnerOrAdmin(), userController.updateUser);

// DELETE user (admin only)
router.delete('/:id', requireAdmin(), userController.deleteUser);

// GET users by task ID (authenticated users)
router.get('/task/:taskId', userController.getUsersByTaskId);

module.exports = router;
