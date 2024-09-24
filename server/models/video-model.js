const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VideoSchema = new Schema({
  userID: { type: String },
  url: { type: String },
  date: { type: Date },
})

const Video = mongoose.model('Video', VideoSchema)
module.exports = Video
