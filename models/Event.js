const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  event: String,
  location: String,
  images: [String],
  timestamp: Date,
});

module.exports = mongoose.model("Event", eventSchema);
