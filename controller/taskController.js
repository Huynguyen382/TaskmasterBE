const taskService = require('../services/taskService');
const ApiResponse = require('../utils/response');
const { AppError } = require('../utils/errors');

exports.createTask = async (req, res, next) => {
  try {
    const taskData = { ...req.body, createdBy: req.user.id };
    const newTask = await taskService.createTask(taskData);
    
    return ApiResponse.created(res, newTask, 'Task created successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    return ApiResponse.error(res, 'Failed to create task', 500);
  }
};

exports.getAllTasksForUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tasks = await taskService.getAllTasksForUser(userId);
    return ApiResponse.success(res, tasks, 'Tasks retrieved successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    return ApiResponse.error(res, 'Failed to retrieve tasks', 500);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const task = await taskService.getTaskById(taskId, userId); 
    return ApiResponse.success(res, task, 'Task retrieved successfully');
  } catch (error) {
    console.log('Error in getTaskById:', error);
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    return ApiResponse.error(res, 'Failed to retrieve task', 500);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const updatedTask = await taskService.updateTask(taskId, req.body, userId);
    return ApiResponse.success(res, updatedTask, 'Task updated successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    return ApiResponse.error(res, 'Failed to update task', 500);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    await taskService.deleteTask(taskId, userId);
    return ApiResponse.success(res, null, 'Task deleted successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    return ApiResponse.error(res, 'Failed to delete task', 500);
  }
};

exports.addMemberToTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const memberData = req.body;
    
    const updatedTask = await taskService.addMemberToTask(taskId, memberData, userId);
    return ApiResponse.success(res, updatedTask, 'Member added to task successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    return ApiResponse.error(res, 'Failed to add member to task', 500);
  }
};

exports.removeMemberFromTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { email: memberEmail } = req.body;
    const currentUserId = req.user.id;
    
    const updatedTask = await taskService.removeMemberFromTask(taskId, memberEmail, currentUserId);
    return ApiResponse.success(res, updatedTask, 'Member removed from task successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    return ApiResponse.error(res, 'Failed to remove member from task', 500);
  }
};

exports.getTasksByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const userId = req.user.id;
    
    const tasks = await taskService.getTasksByStatus(status, userId);
    return ApiResponse.success(res, tasks, `Tasks with status '${status}' retrieved successfully`);
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    return ApiResponse.error(res, 'Failed to retrieve tasks by status', 500);
  }
};

exports.getTasksByPriority = async (req, res, next) => {
  try {
    const { priority } = req.params;
    const userId = req.user.id;
    
    const tasks = await taskService.getTasksByPriority(priority, userId);
    return ApiResponse.success(res, tasks, `Tasks with priority '${priority}' retrieved successfully`);
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    return ApiResponse.error(res, 'Failed to retrieve tasks by priority', 500);
  }
};

exports.getUsersByTaskId = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const users = await taskService.getUsersByTaskId(taskId);
    return ApiResponse.success(res, users, 'Users retrieved successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    return ApiResponse.error(res, 'Failed to retrieve users by task id', 500);
  }
};