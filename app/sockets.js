module.exports = function(io) {


  io.sockets.on('connection', function(socket){
    socket.on('joinRoom', function(room){
      if(socket.room)
        socket.leave(socket.room);

      socket.room = room;
      socket.join(room);

    });

    socket.on('leaveRoom', function(){
      if(socket.room)
        socket.leave(socket.room);
    });

    socket.on('updateCoords', function(data){
      socket.broadcast.to(socket.room).emit('getNewCoords', data);
    });

    socket.on('userJoined', function(data){
      console.log("Kommer vi hit?");
      socket.broadcast.to(socket.room).emit('newUser', data);
    });

  });


};
