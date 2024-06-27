const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  contact: String,
  password: String,
  otp: String,
  otpExpires: Date,
  photos: [{
    filename: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  username: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  profileImage: { type: String, default: '' }
});

module.exports = mongoose.model('User', userSchema, 'users');
