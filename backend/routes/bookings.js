const express = require('express');
const { parse } = require('date-fns');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Schedule = require('../models/Schedule');
const DayStatus = require('../models/DayStatus');
const Stylist = require('../models/Stylist');
const router = express.Router();

function timeToMinutes(t){ const [h,m]=t.split(':').map(Number); return h*60+m; }
function minutesToTime(n){ const h=String(Math.floor(n/60)).padStart(2,'0'); const m=String(n%60).padStart(2,'0'); return `${h}:${m}`; }
function getDow(dateStr){ return parse(dateStr,'yyyy-MM-dd',new Date()).getDay(); }
function mergeIntervals(ints){
  if (!ints.length) return [];
  ints.sort((a,b)=>a.start-b.start);
  const res=[ints[0]];
  for(let i=1;i<ints.length;i++){
    const p=res[res.length-1], c=ints[i];
    if(c.start<=p.end) p.end=Math.max(p.end,c.end);
    else res.push(c);
  }
  return res;
}

router.get('/availability', async (req, res) => {
  const { date, serviceId, stylistId } = req.query;
  if (!date || !serviceId) return res.status(400).json({ error: 'date and serviceId are required' });
  const service = await Service.findById(serviceId);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const dayStatus = await DayStatus.findOne({ date });
  if (dayStatus && dayStatus.status === 'closed') return res.json({ slots: [] });

  const dow = getDow(date);
  const schedules = stylistId
    ? await Schedule.find({ dayOfWeek: dow, stylistId })
    : await Schedule.find({ dayOfWeek: dow });

  if (!schedules.length) return res.json({ slots: [] });

  const workByStylist = {};
  for (const s of schedules){
    const sid = String(s.stylistId || 'any');
    if (!workByStylist[sid]) workByStylist[sid]=[];
    workByStylist[sid].push({ start: timeToMinutes(s.openTime), end: timeToMinutes(s.closeTime), stylistId: s.stylistId });
  }

  const bookings = await Booking.find({ date, status: 'confirmed' });
  const slots = [];
  const duration = service.durationMinutes;
  const step = duration;
  for (const sid of Object.keys(workByStylist)){
    const windows = workByStylist[sid];
    const stylistObj = sid === 'any' ? null : await Stylist.findById(sid);
    const busy = mergeIntervals(bookings.filter(b => String(b.stylistId || 'any') === sid).map(b=>({ start: timeToMinutes(b.time), end: timeToMinutes(b.time) + b.durationMinutes })));
    for (const w of windows){
      for (let start = w.start; start + duration <= w.end; start += step){
        const end = start + duration;
        const overlap = busy.some(bi => start < bi.end && end > bi.start);
        if (!overlap){
          slots.push({ time: minutesToTime(start), stylistId: (w.stylistId?String(w.stylistId):null), stylistName: stylistObj ? stylistObj.name : null });
        }
      }
    }
  }
  slots.sort((a,b)=> a.time.localeCompare(b.time) || (a.stylistName||'').localeCompare(b.stylistName||''));
  res.json({ slots });
});

router.post('/book', async (req, res) => {
  const { serviceId, stylistId, customerName, customerEmail, customerPhone, date, time, source } = req.body || {};
  if (!serviceId || !customerName || !customerEmail || !date || !time) return res.status(400).json({ error: 'Missing required fields' });
  const service = await Service.findById(serviceId);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  const dayStatus = await DayStatus.findOne({ date });
  if (dayStatus && dayStatus.status === 'closed') return res.status(409).json({ error: 'Salon is closed for selected date' });

  const conflictQuery = { date, time, status: 'confirmed' };
  if (stylistId) conflictQuery.stylistId = stylistId;
  const conflict = await Booking.findOne(conflictQuery);
  if (conflict) return res.status(409).json({ error: 'Selected time is no longer available' });

  const booking = await Booking.create({
    serviceId, stylistId: stylistId || undefined, customerName, customerEmail, customerPhone: customerPhone||'', date, time, durationMinutes: service.durationMinutes, status: 'confirmed', source: source || 'online'
  });
  res.json({ success: true, bookingId: booking._id });
});

router.get('/bookings', async (req, res) => {
  const list = await Booking.find().sort({ date: -1, time: -1 }).limit(1000).populate('serviceId').populate('stylistId');
  res.json(list);
});

router.post('/bookings/:id/cancel', async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
  res.json({ success: true });
});

router.get('/days/:date', async (req, res) => {
  const d = await DayStatus.findOne({ date: req.params.date });
  res.json(d || { date: req.params.date, status: 'open' });
});

router.post('/days/:date', async (req, res) => {
  const { status } = req.body;
  if (!['open','closed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const d = await DayStatus.findOneAndUpdate({ date: req.params.date }, { status }, { new: true, upsert: true });
  res.json(d);
});

module.exports = router;
