export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    const { userId } = socket.handshake.auth || {};
    if (userId) socket.join(`user:${userId}`);
    socket.on('subscribe:order', (orderId) => socket.join(`order:${orderId}`));
    socket.on('unsubscribe:order', (orderId) => socket.leave(`order:${orderId}`));
  });
}
