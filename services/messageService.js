const Message = require('../models/Message');

exports.sendMessage = async ({ content, senderId, taskId }) => {
    const messageData = { content, senderId, taskId };
    if (!content || !senderId || !taskId) {
        return { message: 'Missing required fields' };
    }
    const message = new Message({
      content,
      sender: senderId,
      task: taskId
    });
    await message.save();
    return Message.findById(message._id).populate('sender').populate('task');
}

