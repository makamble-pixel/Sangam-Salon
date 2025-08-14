# Unisex Salon (Node.js + MongoDB Atlas) - Timeslots package

## What
This package contains a full-stack salon website:
- Backend (Express + Mongoose) in `/backend`
- Frontend static files in `/public`
- Booking with time slots auto-calculated from service duration
- Admin dashboard to view/cancel bookings and set open/closed days
- Offline booking queue (client-side) with auto-sync

## Quick start
1. Copy `.env.example` to `.env` in the project root and fill your MongoDB URI and ADMIN_TOKEN.
2. From the `backend` folder run:
   ```bash
   npm install
   npm run seed
   npm start
   ```
3. Open http://localhost:3000

## Notes
- Admin endpoints require `Authorization: Bearer <ADMIN_TOKEN>` header.
- Offline bookings are stored in `localStorage` under `bookingQueue` and auto-synced.
- For production: add proper auth, HTTPS, email/SMS confirmations, and payment if needed.
