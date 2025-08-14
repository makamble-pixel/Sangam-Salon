const mongoose = require('mongoose');
const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  durationMinutes: { type: Number, required: true },
  price: { type: Number, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Service', ServiceSchema);
