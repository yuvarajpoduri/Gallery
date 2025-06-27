const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  event: String,
  location: String,
  images: [String],
  timestamp: Date,
  likes: { type: Number, default: 0 },
});

module.exports = mongoose.model("Event", eventSchema);
