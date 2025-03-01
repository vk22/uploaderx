
const dotenv = require("dotenv")
// console.log('process.env.NODE_ENV ', process.env.NODE_ENV)
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
dotenv.config({ path: envFile })
// console.log('envFile ', envFile);
// console.log(process.env);

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const config = require('./config/config');
const app = express();
const http = require("http");
const cors = require('cors');
const { Server } = require("socket.io")

app.use(cookieParser())
app.use(bodyParser.json())
app.use(cors())


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4000"],
    method: ["GET", "POST", "PUT", "PATCH"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});


// Make io accessible to our router
app.use(function(req,res,next){
  req.io = io;
  next();
});


app.use('/api', require('./routes/admin'))
app.use('/api', require('./routes/user'))
app.use('/api', require('./routes/upload'))

let users = []


io.on("connection", async (socket) => {
  console.log('connection  connection connection')
  console.log('socket id ', socket.id)

  // socket.broadcast.to(socket.id).emit('newMessage',{
  //     msg: 'Kuku',
  //     name: socket.id
  // });


  // io.to(socket.id).emit('newMessage', {text: 'Hell0, '+socket.id});

  // socket.on('username', (userName) => {

  //   console.log('socket id ', socket.id)
  //   console.log('userName ', userName)

  //     users.push({
  //         id : socket.id,
  //         userName : userName
  //     });

  //     let len = users.length;
  //     len--;

  //     this.io.emit('userList', users, users[len].id); 
  // });


  // socket.on('getMsg', (data) => {
  //     socket.broadcast.to(data.toid).emit('sendMsg',{
  //         msg:data.msg,
  //         name:data.name
  //     });
  // });

  //const userId = await fetchUserId(socket);


  // io.to(socket.id).emit('newMessage', {text: 'Hell0, '+socket.id});

  // socket.on("createUser", (user) => {
  //   usersDB.addUser({
  //     ...user,
  //     id: socket.id,
  //   });

  //   return { id: socket.id };
  // });

  // socket.on("joinRoom", ({ name, room }) => {
  //   socket.join(room);
  //   io.to(room).emit("updateUsers", usersDB.getUsersByRoom(room));
  //   socket.emit("newMessage", new Message("admin", `Hello, ${name}`));
  //   socket.broadcast
  //     .to(room)
  //     .emit(
  //       "newMessage",
  //       new Message("admin", `User ${name} connected to chat`),
  //     );
  // });
  // socket.emit('newMessage', {text: 'Hell0'})

  // socket.on('createMessage', function(data) {
  //   console.log('createMessage', data)
  //   io.emit('newMessage', data)
  // });

  // socket.on("createMessage", ({ id, msg }) => {
  //   console.log('createMessage', { id, msg })
  //   socket.emit("newMessage", 'Hello!');
  // });

});

mongoose.connect(process.env.DATABASE)

mongoose.connection
  .once('open', () => {
    console.log('Mongoose - successful connection ...')
  })
  .on('error', error => console.warn(error))

module.exports = {
  app,
  server,
};


server.listen(process.env.PORT, () => {
  console.log(`API listening at http://localhost:${process.env.PORT}`)
})

