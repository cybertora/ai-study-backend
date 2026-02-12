import { createServer } from 'http';
import app from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initializeSocket } from './services/socketService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-study-assistant';

const httpServer = createServer(app);

const io = initializeSocket(httpServer);

app.set('io', io);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');

    httpServer.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Socket.io ready for real-time connections`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error(' MongoDB connection error:', error.message);
    process.exit(1);
  });

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
