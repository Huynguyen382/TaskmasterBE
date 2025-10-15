const Task = require('../models/Task');

class TaskRepository {
  async create(taskData) {
    const task = new Task(taskData);
    return await task.save();
  }

  async findById(id) {
    return await Task.findById(id)
      .populate('createdBy', 'username email firstName lastName')
      .populate('member.userId', 'username email firstName lastName');
  }

  async findAll(filter = {}) {
    return await Task.find(filter)
      .populate('createdBy', 'username email firstName lastName')
      .populate('member.userId', 'username email firstName lastName')
      .sort({ createdAt: -1 });
  }

  async updateById(id, updateData) {
    return await Task.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    })
    .populate('createdBy', 'username email firstName lastName')
    .populate('member.userId', 'username email firstName lastName');
  }

  async deleteById(id) {
    return await Task.findByIdAndDelete(id);
  }

  async findByCreator(creatorId) {
    return await Task.find({ createdBy: creatorId })
      .populate('createdBy', 'username email firstName lastName')
      .populate('member.userId', 'username email firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findByMember(userId) {
    return await Task.find({ 'member.userId': userId })
      .populate('createdBy', 'username email firstName lastName')
      .populate('member.userId', 'username email firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findByStatus(status) {
    return await Task.find({ status })
      .populate('createdBy', 'username email firstName lastName')
      .populate('member.userId', 'username email firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findByPriority(priority) {
    return await Task.find({ priority })
      .populate('createdBy', 'username email firstName lastName')
      .populate('member.userId', 'username email firstName lastName')
      .sort({ createdAt: -1 });
  }

  async addMember(taskId, memberData) {
    return await Task.findByIdAndUpdate(
      taskId,
      { $push: { member: memberData } },
      { new: true, runValidators: true }
    ).populate('member.userId', 'username email firstName lastName');
  }

  async removeMember(taskId, userId) {
    return await Task.findByIdAndUpdate(
      taskId,
      { $pull: { member: { userId } } },
      { new: true }
    ).populate('member.userId', 'username email firstName lastName');
  }

  async getUsersByTaskId(taskId) {
    return await Task.findById(taskId)
      .populate('member.userId', 'username email firstName lastName')
      .select('title member');
  }

  async findByIdForMember(taskId, userId) {
    return await Task.findOne({
      _id: taskId,
      'member.userId': userId
    })
    .populate('createdBy', 'username email firstName lastName')
    .populate('member.userId', 'username email firstName lastName');
  }
}

module.exports = new TaskRepository();
