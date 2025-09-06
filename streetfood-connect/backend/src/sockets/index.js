import jwt from 'jsonwebtoken';

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    const { token } = socket.handshake.auth || {};
    if (!token) {
      // disconnect unauthorized sockets
      socket.disconnect(true);
      return;
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const userId = payload.sub;
      if (userId) socket.join(`user:${userId}`);
      socket.on('subscribe:order', (orderId) => socket.join(`order:${orderId}`));
      socket.on('unsubscribe:order', (orderId) => socket.leave(`order:${orderId}`));
    } catch (e) {
      socket.disconnect(true);
    }
  });
}
