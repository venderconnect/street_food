import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { registerSocketHandlers } from './src/sockets/index.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

await connectDB(process.env.MONGO_URI);

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
