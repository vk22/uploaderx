
const dotenv = require("dotenv")
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
dotenv.config({ path: envFile })
console.log('envFile ', envFile);

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
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


app.use('/uploads', express.static(path.join(process.env.ROOT_DIR, 'uploads')))

app.use('/api', require('./routes/admin'))
app.use('/api', require('./routes/user'))
app.use('/api', require('./routes/upload'))

io.on("connection", (socket) => {
  console.log('socket connected ', socket.id)
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

