const userRepository = require('../repositories/userRepository');
const taskRepository = require('../repositories/taskRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ValidationError, NotFoundError, ConflictError, UnauthorizedError } = require('../utils/errors');
const { UserRegisterDto, UserLoginDto, UserUpdateDto } = require('../dto/userDto');

class UserService {
  async register(userData) {
    const userDto = new UserRegisterDto(userData);
    const { username, email, password, firstName, lastName } = userDto.toObject();

    const existingUserByEmail = await userRepository.checkEmailExists(email);
    if (existingUserByEmail) {
      throw new ConflictError('User with this email already exists');
    }

    const existingUserByUsername = await userRepository.checkUsernameExists(username);
    if (existingUserByUsername) {
      throw new ConflictError('User with this username already exists');
    }

    const newUser = await userRepository.create({
      username,
      email,
      password,
      firstName,
      lastName
    });

    const accessToken = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      },
      token: accessToken,
      refreshToken
    };
  }

  async login(loginData) {
    const loginDto = new UserLoginDto(loginData);
    const { email, password } = loginDto.toObject();

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid password');
    }

    await userRepository.updateLastLogin(user._id);

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token: accessToken,
      refreshToken
    };
  }

  async getAllUsers(userRole = null) {
    if (userRole === 'admin') {
      return await userRepository.findAll();
    }
    return await userRepository.findByRole('user');
  }

  async getUserById(id) {
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async getUserByEmail(email) {
    if (!email) {
      throw new ValidationError('Email is required');
    }

    return await userRepository.findByEmail(email);
  }

  async updateUser(id, updateData) {
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    const updateDto = new UserUpdateDto(updateData);
    const validatedData = updateDto.toObject();

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await userRepository.checkEmailExists(validatedData.email);
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
    }

    if (validatedData.username && validatedData.username !== existingUser.username) {
      const usernameExists = await userRepository.checkUsernameExists(validatedData.username);
      if (usernameExists) {
        throw new ConflictError('Username already in use');
      }
    }

    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 12);
    }

    return await userRepository.updateById(id, validatedData);
  }

  async deleteUser(id) {
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return await userRepository.deleteById(id);
  }

  async getUsersByTaskId(taskId) {
    if (!taskId) {
      throw new ValidationError('Task ID is required');
    }

    const taskWithUsers = await taskRepository.getUsersByTaskId(taskId);
    if (!taskWithUsers) {
      throw new NotFoundError('Task not found');
    }

    return {
      taskId: taskWithUsers._id,
      taskTitle: taskWithUsers.title,
      users: taskWithUsers.member.map(member => ({
        ...member.userId._doc,
        role: member.role
      }))
    };
  }
}

module.exports = new UserService();
