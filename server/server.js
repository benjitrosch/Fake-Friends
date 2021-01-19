const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT;
const mongoose = require('mongoose');

const MONGO_URI = require('./models/database');
const surveyRouter = require('./routes/surveyRouter');
const userRouter = require('./routes/userRouter');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

// establish connection with mongoDB --->
mongoose.connect( MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once("open", () => console.log("connected to database"));

// statically serve build + index.html files if in production mode --->
if (process.env.NODE_ENV === 'production') {
  app.use('/build', express.static(path.join(__dirname, '../build')));
  app.get('/', (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, '../index.html'));
  });
};

// route requests to /survey endpoint to survey router --->
app.use('/survey', surveyRouter);

// route requests to /user endpoint to user router --->
app.use('/user', userRouter);

// general 404 handler for any other endpoints / serve homepage --->
app.use('*', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../index.html'));
});

// global error handler --->
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

/* .............................. SOCKET.IO ..............................  */

// establish socket.io connection w/ server --->
const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(PORT || 3000, ()=>{
  console.log('connected to port 3000');
});

const Player = require('./Player.js');
const Room = require('./Room.js');
const Survey = require('./models/surveyModel');

// initialize room array to store active instances of game rooms --->
const rooms = [];

// initial event listener for when socket.io connection is established 
//   all subsequent socket event listeners will be 'listening' for relevant once connection is made
io.on('connection', (socket) => {

  // event listener for 'checkoccupancy' => finds specified game room in existing rooms array
  //  if no room exists, return; if room exists, check current occupancy & emit 'roomfull' if room is over limit 
  socket.on('checkoccupancy', data => {
    const room = rooms.filter(currRoom => currRoom.key === data)[0];
    if(!room)
      return;
    if (room.users.length >= 4){
      io.to(socket.id).emit('roomfull', true);
    }
  });

// event listener for 'joinroom', emitted when a player enters the room 
//    (event initialized/emitted in Game.js component) --->
  socket.on('joinroom', data => {

    // initialize a new instance of player before a player enters the specified game room --->
    const newPlayer = new Player(data.name, socket.id);
    let target = {
      users: []
    };

    // check if the room entered already exists in active rooms array, if so, add the player as a user
    //   otherwise, query the db for the specific survey info,
    //   then initialize a new instance of room and add the player as a user, storing survey info, and roomId
    // emit 'joinedroom' event
    if (rooms.some(room => room.key === data.room)){
      target = rooms.filter(room => room.key === data.room)[0];
      target.users.push(newPlayer);
      sendRoomData(data.room, target.users, target.survey);
    } else {
      Survey.findOne({_id: data.room})
        .then(result => {
          target = new Room(data.room, result, [newPlayer]);
          rooms.push(target);
          sendRoomData(data.room, target.users, target.survey);
        })
        .catch(err => console.log(`Could not create room: ${err}`));
    }
  });

  // on 'ready' listener => find the room instance in existing rooms array
  //  increment the # of users who answered ready by 1, 
  //  check if # of users who answered question === # of users in the room, reset room
  //  emit 'startgame' event
  socket.on('ready', data => {
    const room = rooms.filter(currRoom => currRoom.key === data.room)[0];
    if (room.answeredQuestion() === room.users.length) {
      room.reset();
      io.sockets.to(data.room).emit('startgame');
    } else {
      io.sockets.to(data.room).emit('readyup');
    }
  });

  // on 'submitanswer' listener => find the room instance in existing rooms array
  // find the specific player within the room; if answer to survey question is correct, increment score
  // Check if everyone in the room has answered this specific question => if so, emit 'nextquesiton' event
  socket.on('submitanswer', data => {
    const room = rooms.filter(currRoom => currRoom.key === data.room)[0];
    const player = room.users.filter(currUser => currUser.id === data.id)[0];
    if (data.isCorrect) player.addScore();
    //else player.decreaseScore();
    if (room.answeredQuestion() === room.users.length) {
      room.reset();
      io.sockets.to(data.room).emit('nextquestion', room.users);
    }
  });

  socket.on('gameover', data => {
    const room = rooms.filter(currRoom => currRoom.key === data.room)[0];

    var winner = room.users.reduce((prev, current) => {
      if (+current.id > +prev.id) {
          return current;
      } else {
          return prev;
      }
    });

    io.sockets.to(data.room).emit('winner', winner);
  })

  // helper function to emit current room data back to front end -->
  function sendRoomData(room, users, survey){
    socket.join(room);
    io.sockets.to(room).emit('joinedroom', {users, survey});
  }

});