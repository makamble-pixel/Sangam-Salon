const mongoose = require('mongoose');
const ScheduleSchema = new mongoose.Schema({
  stylistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stylist' },
  dayOfWeek: { type: Number, required: true }, // 0..6
  openTime: { type: String, required: true },  // "10:00"
  closeTime: { type: String, required: true }  // "20:00"
}, { timestamps: true });
module.exports = mongoose.model('Schedule', ScheduleSchema);
