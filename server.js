const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { app, server } = require('./app');

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  server.close(() => process.exit(1));
});
