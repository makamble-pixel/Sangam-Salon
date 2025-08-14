const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  stylistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stylist' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: String,
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:mm
  durationMinutes: { type: Number, required: true },
  status: { type: String, enum: ['pending','confirmed','cancelled'], default: 'confirmed' },
  source: { type: String, enum: ['online','admin','offline-sync'], default: 'online' }
}, { timestamps: true });
module.exports = mongoose.model('Booking', BookingSchema);
