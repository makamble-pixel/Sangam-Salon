const express = require('express');
const { parse } = require('date-fns');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const DayStatus = require('../models/DayStatus');
const router = express.Router();

// Get all bookings for admin
router.get('/bookings', async (req, res) => {
  try {
    console.log('Admin: Fetching bookings...');
    const bookings = await Booking.find()
      .sort({ date: -1, time: -1 })
      .populate('serviceId')
      .populate('stylistId');
    console.log(`Admin: Found ${bookings.length} bookings`);
    res.json(bookings);
  } catch (error) {
    console.error('Admin: Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('Admin: Fetching stats...');
    const today = new Date().toISOString().split('T')[0];
    
    const [totalBookings, todayBookings, pendingBookings, allBookings] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ date: today }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.find().populate('serviceId')
    ]);
    
    const totalRevenue = allBookings.reduce((sum, booking) => {
      return sum + (booking.serviceId ? booking.serviceId.price : 0);
    }, 0);
    
    const stats = {
      totalBookings,
      todayBookings,
      pendingBookings,
      totalRevenue
    };
    
    console.log('Admin: Stats calculated:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Admin: Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get shop status for a specific date
router.get('/shop-status/:date', async (req, res) => {
  try {
    const { date } = req.params;
    console.log('Admin: Getting shop status for date:', date);
    
    const dayStatus = await DayStatus.findOne({ date });
    const status = dayStatus ? dayStatus.status : 'open';
    
    res.json({ date, status });
  } catch (error) {
    console.error('Admin: Error getting shop status:', error);
    res.status(500).json({ error: 'Failed to get shop status' });
  }
});

// Set shop status for a specific date
router.post('/shop-status/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { status } = req.body;
    console.log('Admin: Setting shop status for date:', date, 'status:', status);
    
    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "open" or "closed"' });
    }
    
    const dayStatus = await DayStatus.findOneAndUpdate(
      { date },
      { status },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, date, status: dayStatus.status });
  } catch (error) {
    console.error('Admin: Error setting shop status:', error);
    res.status(500).json({ error: 'Failed to set shop status' });
  }
});

// Cancel a booking
router.post('/bookings/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Admin: Cancelling booking:', id);
    
    const booking = await Booking.findByIdAndUpdate(
      id, 
      { status: 'cancelled' },
      { new: true }
    ).populate('serviceId').populate('stylistId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ 
      success: true, 
      booking,
      message: `Booking cancelled for ${booking.customerName} on ${booking.date} at ${booking.time}`
    });
  } catch (error) {
    console.error('Admin: Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Confirm a booking
router.post('/bookings/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Admin: Confirming booking:', id);
    
    const booking = await Booking.findByIdAndUpdate(
      id, 
      { status: 'confirmed' },
      { new: true }
    ).populate('serviceId').populate('stylistId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ 
      success: true, 
      booking,
      message: `Booking confirmed for ${booking.customerName} on ${booking.date} at ${booking.time}`
    });
  } catch (error) {
    console.error('Admin: Error confirming booking:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// Get customer contact information
router.get('/bookings/:id/contact', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Admin: Getting contact info for booking:', id);
    
    const booking = await Booking.findById(id).populate('serviceId').populate('stylistId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const contactInfo = {
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      service: booking.serviceId ? booking.serviceId.name : 'N/A',
      date: booking.date,
      time: booking.time,
      stylist: booking.stylistId ? booking.stylistId.name : 'Any',
      status: booking.status,
      contactLinks: {
        phone: `tel:${booking.customerPhone}`,
        email: `mailto:${booking.customerEmail}`,
        whatsapp: `https://wa.me/${(booking.customerPhone || '').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(booking.customerName)}%2C%20regarding%20your%20booking%20on%20${booking.date}%20at%20${booking.time}`
      }
    };
    
    res.json(contactInfo);
  } catch (error) {
    console.error('Admin: Error getting contact info:', error);
    res.status(500).json({ error: 'Failed to get contact information' });
  }
});

module.exports = router;
