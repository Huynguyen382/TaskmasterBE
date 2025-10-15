const User = require('../models/User');

class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findByEmailWithPassword(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findAll(filter = {}) {
    return await User.find(filter).select('-password');
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    }).select('-password');
  }

  async deleteById(id) {
    return await User.findByIdAndDelete(id);
  }

  async findByRole(role) {
    return await User.find({ role }).select('-password');
  }

  async updateLastLogin(id) {
    return await User.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async checkEmailExists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }

  async checkUsernameExists(username) {
    const user = await User.findOne({ username });
    return !!user;
  }
}

module.exports = new UserRepository();
