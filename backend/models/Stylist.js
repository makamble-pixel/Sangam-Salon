const mongoose = require('mongoose');
const StylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialties: [String]
}, { timestamps: true });
module.exports = mongoose.model('Stylist', StylistSchema);
