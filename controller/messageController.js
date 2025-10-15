const messageService = require('../services/messageService');

function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.emit('welcome', 'Welcome to the chat');
        socket.on('joinTaskRoom', (taskId) => {
            socket.join(taskId);
        });
        socket.on('sendMessage', async (data) => {
            try {
                const newMessage = await messageService.sendMessage(data);
                io.to(data.taskId).emit('receiveMessage', newMessage);
            } catch (error) {
                socket.emit('error', error.message);
            }
        });
        socket.on('disconnect', () => {
            console.log('user disconnected', socket.taskId);
        });
    });
}
module.exports = initializeSocket;