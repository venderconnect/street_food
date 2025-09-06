import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { registerSocketHandlers } from './src/sockets/index.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set — socket auth will reject connections without a valid token');
}

if (process.env.MONGO_URI) {
  try {
    await connectDB(process.env.MONGO_URI);
  } catch (err) {
    console.error('Failed to connect to MongoDB, continuing without DB for local dev', err);
  }
} else {
  console.warn('MONGO_URI not set — skipping DB connect (useful for frontend-only dev)');
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ['GET','POST','PATCH'],
    credentials: true,
  },
});

registerSocketHandlers(io);
server.listen(PORT, () => console.log(`API running on :${PORT}`));
