const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: String,
  venue: String,
  date: Date,
  category: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },  // Link to the User schema,
  photos: [
    {
      filename: String,
      path: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  userImages: {
    type: Map,
    of: [String] // a map of usernames to array of image paths
  }
});

module.exports = mongoose.model('Event', eventSchema);
