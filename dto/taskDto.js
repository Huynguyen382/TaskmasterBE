const { ValidationError } = require('../utils/errors');

class TaskCreateDto {
  constructor(data) {
    this.title = data.title?.trim();
    this.description = data.description?.trim();
    this.status = data.status || 'todo';
    this.priority = data.priority || 'medium';
    this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    this.createdBy = data.createdBy;
    this.member = data.member || [];
    this.tags = data.tags || [];
    
    this.validate();
  }

  validate() {
    const errors = [];

    // Title validation
    if (!this.title) {
      errors.push('Task title is required');
    } else if (this.title.length > 100) {
      errors.push('Title cannot be more than 100 characters');
    }

    // Description validation
    if (this.description && this.description.length > 500) {
      errors.push('Description cannot be more than 500 characters');
    }

    // Status validation
    if (!['todo', 'in-progress', 'completed', 'cancelled'].includes(this.status)) {
      errors.push('Status must be one of: todo, in-progress, completed, cancelled');
    }

    // Priority validation
    if (!['low', 'medium', 'high', 'urgent'].includes(this.priority)) {
      errors.push('Priority must be one of: low, medium, high, urgent');
    }

    // Due date validation
    if (this.dueDate && isNaN(this.dueDate.getTime())) {
      errors.push('Please provide a valid due date');
    }

    // Created by validation
    if (!this.createdBy) {
      errors.push('Created by is required');
    }

    // Member validation
    if (this.member && Array.isArray(this.member)) {
      this.member.forEach((member, index) => {
        if (!member.userId) {
          errors.push(`Member ${index + 1}: User ID is required`);
        }
        if (member.role && !['manager', 'member'].includes(member.role)) {
          errors.push(`Member ${index + 1}: Role must be either 'manager' or 'member'`);
        }
      });
    }

    if (errors.length > 0) {
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }
  }

  toObject() {
    const obj = {
      title: this.title,
      status: this.status,
      priority: this.priority,
      createdBy: this.createdBy,
      member: this.member,
      tags: this.tags
    };

    if (this.description) obj.description = this.description;
    if (this.dueDate) obj.dueDate = this.dueDate;

    return obj;
  }
}

class TaskUpdateDto {
  constructor(data) {
    this.title = data.title?.trim();
    this.description = data.description?.trim();
    this.status = data.status;
    this.priority = data.priority;
    this.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    this.member = data.member;
    this.tags = data.tags;
    
    this.validate();
  }

  validate() {
    const errors = [];

    // Title validation (optional)
    if (this.title !== undefined) {
      if (!this.title) {
        errors.push('Task title cannot be empty');
      } else if (this.title.length > 100) {
        errors.push('Title cannot be more than 100 characters');
      }
    }

    // Description validation (optional)
    if (this.description !== undefined && this.description.length > 500) {
      errors.push('Description cannot be more than 500 characters');
    }

    // Status validation (optional)
    if (this.status !== undefined && !['todo', 'in-progress', 'completed', 'cancelled'].includes(this.status)) {
      errors.push('Status must be one of: todo, in-progress, completed, cancelled');
    }

    // Priority validation (optional)
    if (this.priority !== undefined && !['low', 'medium', 'high', 'urgent'].includes(this.priority)) {
      errors.push('Priority must be one of: low, medium, high, urgent');
    }

    // Due date validation (optional)
    if (this.dueDate !== undefined && this.dueDate && isNaN(this.dueDate.getTime())) {
      errors.push('Please provide a valid due date');
    }

    // Member validation (optional)
    if (this.member !== undefined && Array.isArray(this.member)) {
      this.member.forEach((member, index) => {
        if (!member.userId) {
          errors.push(`Member ${index + 1}: User ID is required`);
        }
        if (member.role && !['manager', 'member'].includes(member.role)) {
          errors.push(`Member ${index + 1}: Role must be either 'manager' or 'member'`);
        }
      });
    }

    if (errors.length > 0) {
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }
  }

  toObject() {
    const obj = {};
    
    if (this.title !== undefined) obj.title = this.title;
    if (this.description !== undefined) obj.description = this.description;
    if (this.status !== undefined) obj.status = this.status;
    if (this.priority !== undefined) obj.priority = this.priority;
    if (this.dueDate !== undefined) obj.dueDate = this.dueDate;
    if (this.member !== undefined) obj.member = this.member;
    if (this.tags !== undefined) obj.tags = this.tags;
    
    return obj;
  }
}

class TaskMemberDto {
  constructor(data) {
    this.userId = data.userId;
    this.role = data.role || 'member';
    
    this.validate();
  }

  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!['manager', 'member'].includes(this.role)) {
      errors.push('Role must be either "manager" or "member"');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }
  }

  toObject() {
    return {
      userId: this.userId,
      role: this.role
    };
  }
}

module.exports = {
  TaskCreateDto,
  TaskUpdateDto,
  TaskMemberDto
};
