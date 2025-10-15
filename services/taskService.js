const taskRepository = require('../repositories/taskRepository');
const userRepository = require('../repositories/userRepository');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { TaskCreateDto, TaskUpdateDto, TaskMemberDto } = require('../dto/taskDto');
const mongoose = require('mongoose');

class TaskService {
  // Helper: convert various id shapes (ObjectId, string, populated doc) to string id safely
  toIdString(value) {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return String(value._id);
    try { return String(value); } catch { return null; }
  }

  async createTask(taskData) {
    const taskDto = new TaskCreateDto(taskData);
    const validatedData = taskDto.toObject();

    const creator = await userRepository.findById(validatedData.createdBy);
    if (!creator) {
      throw new NotFoundError('Creator not found');
    }

    const initialMember = { userId: validatedData.createdBy, role: 'manager' };
    validatedData.member = [initialMember, ...validatedData.member];

    return await taskRepository.create(validatedData);
  }

  async getAllTasksForUser(userId) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const createdTasks = await taskRepository.findByCreator(userId);
    const memberTasks = await taskRepository.findByMember(userId);

    const allTasks = [...createdTasks];
    memberTasks.forEach(task => {
      if (!allTasks.find(t => t._id.toString() === task._id.toString())) {
        allTasks.push(task);
      }
    });

    return allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getTaskById(taskId, userId) {
    
    if (!taskId) {
      throw new ValidationError('Task ID is required');
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new ValidationError('Invalid task ID format');
    }

    const requesterId = this.toIdString(userId);
    if (!mongoose.Types.ObjectId.isValid(requesterId)) {
      throw new ValidationError('Invalid user ID format');
    }

    const task = await taskRepository.findById(taskId);
    
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const createdById = this.toIdString(task.createdBy);
    const isCreator = createdById === requesterId;
    
    const isMember = (task.member || []).some(member => {
      const memberId = this.toIdString(member.userId);
      return memberId === requesterId;
    });
    
    const hasAccess = isCreator || isMember;

    if (!hasAccess) {
      throw new ForbiddenError('Access denied to this task');
    }

    return task;
  }

  async updateTask(taskId, updateData, userId) {
    if (!taskId) {
      throw new ValidationError('Task ID is required');
    }

    const updateDto = new TaskUpdateDto(updateData);
    const validatedData = updateDto.toObject();

    const existingTask = await taskRepository.findById(taskId);
    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    const requesterId = this.toIdString(userId);
    const isCreator = this.toIdString(existingTask.createdBy) === requesterId;
    const isManager = (existingTask.member || []).some(member => 
      this.toIdString(member.userId) === requesterId && member.role === 'manager'
    );

    if (!isCreator && !isManager) {
      throw new ForbiddenError('Only task creator or managers can update this task');
    }

    return await taskRepository.updateById(taskId, validatedData);
  }

  async deleteTask(taskId, userId) {
    if (!taskId) {
      throw new ValidationError('Task ID is required');
    }

    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (this.toIdString(task.createdBy) !== this.toIdString(userId)) {
      throw new ForbiddenError('Only task creator can delete this task');
    }

    return await taskRepository.deleteById(taskId);
  }

  async addMemberToTask(taskId, memberData, userId) {
    if (!taskId) {
      throw new ValidationError('Task ID is required');
    }

    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Kiểm tra quyền truy cập - chỉ creator hoặc manager mới có thể thêm member
    const requesterId = this.toIdString(userId);
    const isCreator = this.toIdString(task.createdBy) === requesterId;
    const isManager = (task.member || []).some(member => 
      this.toIdString(member.userId) === requesterId && member.role === 'manager'
    );

    if (!isCreator && !isManager) {
      throw new ForbiddenError('Only task creator or managers can add members');
    }

    // Tìm user bằng email
    const email = memberData.email;
    if (!email) {
      throw new ValidationError('Email is required');
    }

    const userToAdd = await userRepository.findByEmail(email);
    if (!userToAdd) {
      throw new NotFoundError('User to add not found');
    }

    // Kiểm tra user đã là member chưa
    const isAlreadyMember = (task.member || []).some(member => 
      this.toIdString(member.userId) === this.toIdString(userToAdd._id)
    );

    if (isAlreadyMember) {
      throw new ValidationError('User is already a member of this task');
    }

    const newMemberData = {
      userId: userToAdd._id,
      role: memberData.role || 'member'
    };

    return await taskRepository.addMember(taskId, newMemberData);
  }

  async removeMemberFromTask(taskId, memberEmail, userId) {
    if (!taskId || !memberEmail) {
      throw new ValidationError('Task ID and member email are required');
    }

    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Kiểm tra quyền truy cập - chỉ creator hoặc manager mới có thể xóa member
    const requesterId = this.toIdString(userId);
    const isCreator = this.toIdString(task.createdBy) === requesterId;
    const isManager = (task.member || []).some(member => 
      this.toIdString(member.userId) === requesterId && member.role === 'manager'
    );

    if (!isCreator && !isManager) {
      throw new ForbiddenError('Only task creator or managers can remove members');
    }

    // Tìm user bằng email
    const userToRemove = await userRepository.findByEmail(memberEmail);
    if (!userToRemove) {
      throw new NotFoundError('User to remove not found');
    }

    // Không thể xóa task creator
    if (this.toIdString(task.createdBy) === this.toIdString(userToRemove._id)) {
      throw new ForbiddenError('Cannot remove task creator');
    }

    // Kiểm tra user có phải member không
    const isMember = (task.member || []).some(member => 
      this.toIdString(member.userId) === this.toIdString(userToRemove._id)
    );

    if (!isMember) {
      throw new NotFoundError('User is not a member of this task');
    }

    return await taskRepository.removeMember(taskId, userToRemove._id);
  }

  async getTasksByStatus(status, userId) {
    if (!status) {
      throw new ValidationError('Status is required');
    }

    const tasks = await taskRepository.findByStatus(status);
    
    const requesterId = this.toIdString(userId);
    return tasks.filter(task => {
      const isCreator = this.toIdString(task.createdBy) === requesterId;
      const isMember = (task.member || []).some(member => this.toIdString(member.userId) === requesterId);
      return isCreator || isMember;
    });
  }

  async getTasksByPriority(priority, userId) {
    if (!priority) {
      throw new ValidationError('Priority is required');
    }

    const tasks = await taskRepository.findByPriority(priority);
    
    const requesterId = this.toIdString(userId);
    return tasks.filter(task => {
      const isCreator = this.toIdString(task.createdBy) === requesterId;
      const isMember = (task.member || []).some(member => this.toIdString(member.userId) === requesterId);
      return isCreator || isMember;
    });
  }

  async getUsersByTaskId(taskId) {
    const task = await taskRepository.findById(taskId)
    .populate('member.userId', 'username email firstName lastName');
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return task.member
    .populate('member.userId', 'username email firstName lastName');
    return members;
  }
}

module.exports = new TaskService();


