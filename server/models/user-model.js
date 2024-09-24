const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: { type: String },
  comment: { type: String },
  tokens: { type: Object },
  refreshToken: { type: String },
  uploads: {type: Array },
  uploadsPerDay: {type: Number },
  plan: { type: String, default: 'basic' }
})

const User = mongoose.model('User', UserSchema)
module.exports = User
