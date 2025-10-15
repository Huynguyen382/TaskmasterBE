const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controller/taskController');

// Apply authentication to all routes
router.use(auth);

// GET all tasks for user
router.get('/', taskController.getAllTasksForUser);

// GET tasks by status
router.get('/status/:status', taskController.getTasksByStatus);

// GET tasks by priority
router.get('/priority/:priority', taskController.getTasksByPriority);

// GET task by id
router.get('/:id', taskController.getTaskById);

// POST create new task
router.post('/', taskController.createTask);

// PUT update task
router.put('/:id', taskController.updateTask);

// DELETE task
router.delete('/:id', taskController.deleteTask);

// POST add member to task
router.post('/:id/members', taskController.addMemberToTask);

// DELETE remove member from task
router.delete('/:id/members', taskController.removeMemberFromTask);

// GET users by task id
router.get('/:id/users', taskController.getUsersByTaskId);

module.exports = router;
