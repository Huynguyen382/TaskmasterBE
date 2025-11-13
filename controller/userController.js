
const userService = require('../services/userService');
const ApiResponse = require('../utils/response');
const { AppError } = require('../utils/errors');

exports.registerUser = async (req, res, next) => {
    try {
        const data = await userService.register(req.body);
        if (data.refreshToken) {
            res.cookie('rtoken', data.refreshToken, {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        }
        return ApiResponse.created(res, { user: data.user, token: data.token }, 'User registered successfully');
    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(res, error.message, error.statusCode);
        }
        return ApiResponse.error(res, 'Registration failed', 500);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const data = await userService.login(req.body);
        if (data.refreshToken) {
            res.cookie('rtoken', data.refreshToken, {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        }
        return ApiResponse.success(res, { user: data.user, token: data.token }, 'Login successful');
    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(res, error.message, error.statusCode);
        }
        return ApiResponse.error(res, 'Login failed', 500);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const jwt = require('jsonwebtoken');
        const refreshToken = req.cookies?.rtoken;
        if (!refreshToken) {
            return ApiResponse.unauthorized(res, 'No refresh token');
        }
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
        const accessToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        return ApiResponse.success(res, { token: accessToken }, 'Token refreshed');
    } catch (error) {
        return ApiResponse.unauthorized(res, 'Invalid refresh token');
    }
};

exports.logout = async (req, res, next) => {
    try {
        res.clearCookie('rtoken', { httpOnly: true, sameSite: 'lax', secure: false });
        return ApiResponse.success(res, null, 'Logged out');
    } catch (error) {
        return ApiResponse.error(res, 'Logout failed', 500);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const userRole = req.user?.role; // From auth middleware
        const data = await userService.getAllUsers(userRole);
        return ApiResponse.success(res, data, 'Users retrieved successfully');
    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(res, error.message, error.statusCode);
        }
        return ApiResponse.error(res, 'Failed to retrieve users', 500);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const data = await userService.getUserById(req.params.id);
        return ApiResponse.success(res, data, 'User retrieved successfully');
    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(res, error.message, error.statusCode);
        }
        return ApiResponse.error(res, 'Failed to retrieve user', 500);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const data = await userService.updateUser(req.params.id, req.body);
        return ApiResponse.success(res, data, 'User updated successfully');
    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(res, error.message, error.statusCode);
        }
        return ApiResponse.error(res, 'Failed to update user', 500);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(res, error.message, error.statusCode);
        }
        return ApiResponse.error(res, 'Failed to delete user', 500);
    }
};

exports.getUsersByTaskId = async (req, res, next) => {
    try {
        const data = await userService.getUsersByTaskId(req.params.taskId);
        return ApiResponse.success(res, data, 'Task users retrieved successfully');
    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(res, error.message, error.statusCode);
        }
        return ApiResponse.error(res, 'Failed to retrieve task users', 500);
    }
};