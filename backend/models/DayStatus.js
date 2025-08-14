const mongoose = require('mongoose');
const DayStatusSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  status: { type: String, enum: ['open','closed'], default: 'open' }
}, { timestamps: true });
module.exports = mongoose.model('DayStatus', DayStatusSchema);
