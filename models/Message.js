const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  
    content: {
        type: String,
        required: true,
        trim: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Task',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);