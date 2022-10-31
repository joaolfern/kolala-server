import socketIO from 'socket.io'

export const socketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('A user is connected');

    socket.on('message', (message) => {
      console.log(`message from ${socket.id} : ${message}`);
    });

    socket.on('disconnect', () => {
      console.log(`socket ${socket.id} disconnected`);
    });
  });
}

export const socketInitialize = (http) => {
  return new socketIO.Server(http, {
    transports: ['polling'],
    cors: {
      origin: '*',
    },
  });

}
