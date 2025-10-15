const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const auth = require('../middleware/auth');
const { requireAdmin, authorizeOwnerOrAdmin } = require('../middleware/authorize');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.use(auth); // Apply authentication to all routes below

// GET all users (admin only)
router.get('/', requireAdmin(), userController.getAllUsers);

// GET user by id (owner or admin)
router.get('/:id', authorizeOwnerOrAdmin(), userController.getUserById);

// PUT update user (owner or admin)
router.put('/:id', authorizeOwnerOrAdmin(), userController.updateUser);

// DELETE user (admin only)
router.delete('/:id', requireAdmin(), userController.deleteUser);

// GET users by task ID (authenticated users)
router.get('/task/:taskId', userController.getUsersByTaskId);

module.exports = router;
