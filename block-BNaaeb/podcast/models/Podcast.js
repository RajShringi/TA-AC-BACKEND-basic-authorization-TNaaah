const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const podcastSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  podcastPlan: { type: String },
  image: { type: String },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Podcast", podcastSchema);
