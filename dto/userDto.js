const { ValidationError } = require('../utils/errors');

class UserRegisterDto {
  constructor(data) {
    this.username = data.username?.trim();
    this.email = data.email?.trim()?.toLowerCase();
    this.password = data.password;
    this.firstName = data.firstName?.trim();
    this.lastName = data.lastName?.trim();
    
    this.validate();
  }

  validate() {
    const errors = [];

    // Username validation
    if (!this.username) {
      errors.push('Username is required');
    } else if (this.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    } else if (this.username.length > 30) {
      errors.push('Username cannot be more than 30 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
      errors.push('Username can only contain letters, numbers and underscores');
    }

    // Email validation
    if (!this.email) {
      errors.push('Email is required');
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
      errors.push('Please enter a valid email address');
    }

    // Password validation
    if (!this.password) {
      errors.push('Password is required');
    } else if (this.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    // First name validation
    if (!this.firstName) {
      errors.push('First name is required');
    } else if (this.firstName.length > 50) {
      errors.push('First name cannot be more than 50 characters');
    }

    // Last name validation
    if (!this.lastName) {
      errors.push('Last name is required');
    } else if (this.lastName.length > 50) {
      errors.push('Last name cannot be more than 50 characters');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }
  }

  toObject() {
    return {
      username: this.username,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName
    };
  }
}

class UserLoginDto {
  constructor(data) {
    this.email = data.email?.trim()?.toLowerCase();
    this.password = data.password;
    
    this.validate();
  }

  validate() {
    const errors = [];

    if (!this.email) {
      errors.push('Email is required');
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!this.password) {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }
  }

  toObject() {
    return {
      email: this.email,
      password: this.password
    };
  }
}

class UserUpdateDto {
  constructor(data) {
    this.username = data.username?.trim();
    this.email = data.email?.trim()?.toLowerCase();
    this.firstName = data.firstName?.trim();
    this.lastName = data.lastName?.trim();
    this.password = data.password;
    this.role = data.role;
    this.isActive = data.isActive;
    
    this.validate();
  }

  validate() {
    const errors = [];

    // Username validation (optional)
    if (this.username !== undefined) {
      if (this.username.length < 3) {
        errors.push('Username must be at least 3 characters');
      } else if (this.username.length > 30) {
        errors.push('Username cannot be more than 30 characters');
      } else if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
        errors.push('Username can only contain letters, numbers and underscores');
      }
    }

    // Email validation (optional)
    if (this.email !== undefined) {
      if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    // Password validation (optional)
    if (this.password !== undefined) {
      if (this.password.length < 6) {
        errors.push('Password must be at least 6 characters');
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }
    }

    // First name validation (optional)
    if (this.firstName !== undefined && this.firstName.length > 50) {
      errors.push('First name cannot be more than 50 characters');
    }

    // Last name validation (optional)
    if (this.lastName !== undefined && this.lastName.length > 50) {
      errors.push('Last name cannot be more than 50 characters');
    }

    // Role validation (optional)
    if (this.role !== undefined && !['user', 'admin', 'manager'].includes(this.role)) {
      errors.push('Role must be one of: user, admin, manager');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }
  }

  toObject() {
    const obj = {};
    
    if (this.username !== undefined) obj.username = this.username;
    if (this.email !== undefined) obj.email = this.email;
    if (this.firstName !== undefined) obj.firstName = this.firstName;
    if (this.lastName !== undefined) obj.lastName = this.lastName;
    if (this.password !== undefined) obj.password = this.password;
    if (this.role !== undefined) obj.role = this.role;
    if (this.isActive !== undefined) obj.isActive = this.isActive;
    
    return obj;
  }
}

module.exports = {
  UserRegisterDto,
  UserLoginDto,
  UserUpdateDto
};
