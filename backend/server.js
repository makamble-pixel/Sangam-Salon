const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const { connect } = require('./config/db');
const servicesRoute = require('./routes/services');
const stylistsRoute = require('./routes/stylists');
const bookingsRoute = require('./routes/bookings');
const adminRoute = require('./routes/admin');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change_this_admin_token';

console.log('Starting server with admin token:', ADMIN_TOKEN);

// Configure Helmet with more permissive settings for development
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));

// Connect to MongoDB
connect(process.env.MONGODB_URI).catch(e => { 
  console.error('DB connection error:', e.message); 
  process.exit(1); 
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

function requireAdmin(req, res, next){
  console.log('Admin middleware: Checking authorization for', req.path);
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  console.log('Admin middleware: Token provided:', token ? 'Yes' : 'No');
  if (token === ADMIN_TOKEN) {
    console.log('Admin middleware: Authorization successful');
    return next();
  }
  console.log('Admin middleware: Authorization failed');
  return res.status(401).json({ error: 'Unauthorized' });
}

app.use('/api/services', servicesRoute);
app.use('/api/stylists', stylistsRoute);
app.use('/api', bookingsRoute);
app.use('/api/admin', requireAdmin, adminRoute);

app.get('*', (req,res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

// Listen on all network interfaces (0.0.0.0) instead of just localhost
app.listen(PORT, '0.0.0.0', ()=> {
  console.log(`Server running at:`);
  console.log(`  Local: http://localhost:${PORT}`);
});
