const app = require('express')();
const httpServer = require('http').createServer(app);

// cors in socket.io
const io = require('socket.io')(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const PORT = 7000;

const users = {};

io.on('connection', (socket) => {
  //   here we will listen to client
  console.log('someone is connected and socket id : ' + socket.id);

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
      }
    }
    io.emit('allUsers', users);
  });

  // server listenig newUser emit event and storing user to broadcast
  socket.on('newUser', (username) => {
    users[username] = socket.id;

    // we can tell every other users someone is connected
    io.emit('allUsers', users);
  });

  // when client will emit send_message event then serrver will pickup it
  socket.on('send_message', (data) => {
    const socketId = users[data.receiver];
    io.to(socketId).emit('new_message',data);
  });
});

httpServer.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
