// Helper API function
async function api(path, opts = {}) {
  const options = Object.assign({
    headers: { 'Content-Type': 'application/json' }
  }, opts);
  
  const response = await fetch(path, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || response.statusText);
  }
  return response.json();
}

// Admin authentication
let adminToken = sessionStorage.getItem('adminToken');

// Helper function to make authenticated API calls
async function apiAuth(path, opts = {}) {
  const options = Object.assign({
    headers: { 'Content-Type': 'application/json' }
  }, opts);
  
  if (adminToken) {
    options.headers['Authorization'] = `Bearer ${adminToken}`;
  }
  
  const response = await fetch(path, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || response.statusText);
  }
  return response.json();
}

// Check if admin is authenticated
function checkAuth() {
  if (!adminToken) {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('admin-content').style.display = 'none';
  } else {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    loadAdminData();
  }
}

// Admin login (using token directly)
async function adminLogin() {
  const password = document.getElementById('admin-password').value;
  if (!password) {
    showStatus('Please enter the admin password', 'error');
    return;
  }
  
  // Use the password as the admin token directly
  adminToken = password;
  sessionStorage.setItem('adminToken', adminToken);
  
  // Test the token by trying to access admin data
  try {
    await apiAuth('/api/admin/bookings');
    checkAuth();
    showStatus('Admin access granted', 'success');
  } catch (error) {
    adminToken = null;
    sessionStorage.removeItem('adminToken');
    showStatus('Invalid admin password', 'error');
  }
}

// Admin logout
function adminLogout() {
  adminToken = null;
  sessionStorage.removeItem('adminToken');
  checkAuth();
  showStatus('Logged out successfully', 'success');
}

// Load admin data
async function loadAdminData() {
  try {
    const [bookings, stats] = await Promise.all([
      apiAuth('/api/admin/bookings'),
      apiAuth('/api/admin/stats')
    ]);
    
    renderBookings(bookings);
    renderStats(stats);
  } catch (error) {
    console.error('Error loading admin data:', error);
    showStatus('Error loading admin data: ' + error.message, 'error');
  }
}

// Render bookings table
function renderBookings(bookings) {
  const tbody = document.getElementById('bookings-tbody');
  
  if (!bookings || !bookings.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-secondary);">No bookings found</td></tr>';
    return;
  }
  
  tbody.innerHTML = bookings.map(booking => `
    <tr>
      <td>${booking.customerName}</td>
      <td>${booking.serviceId ? booking.serviceId.name : 'N/A'}</td>
      <td>${new Date(booking.date).toLocaleDateString()}</td>
      <td>${booking.time}</td>
      <td>${booking.stylistId ? booking.stylistId.name : 'Any'}</td>
      <td>₹${booking.serviceId ? booking.serviceId.price : 'N/A'}</td>
      <td>
        <span class="badge ${booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warn' : 'error'}">
          ${booking.status}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn outline contact-btn" data-booking-id="${booking._id}" style="padding:4px 8px;font-size:0.8rem;">
            📞 Contact
          </button>
          ${booking.status !== 'cancelled' ? 
            `<button class="btn outline cancel-btn" data-booking-id="${booking._id}" style="padding:4px 8px;font-size:0.8rem;color:#ff6b6b;">
              ❌ Cancel
            </button>` : 
            '<span class="small" style="color:var(--text-secondary);">Cancelled</span>'
          }
          ${booking.status === 'pending' ? 
            `<button class="btn outline confirm-btn" data-booking-id="${booking._id}" style="padding:4px 8px;font-size:0.8rem;color:var(--accent2);">
              ✅ Confirm
            </button>` : ''
          }
        </div>
      </td>
    </tr>
  `).join('');
  
  // Add event listeners for action buttons
  addBookingActionListeners();
}

// Add event listeners for booking action buttons
function addBookingActionListeners() {
  // Contact buttons
  document.querySelectorAll('.contact-btn').forEach(btn => {
    btn.addEventListener('click', () => showContactModal(btn.dataset.bookingId));
  });
  
  // Cancel buttons
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => cancelBooking(btn.dataset.bookingId));
  });
  
  // Confirm buttons
  document.querySelectorAll('.confirm-btn').forEach(btn => {
    btn.addEventListener('click', () => confirmBooking(btn.dataset.bookingId));
  });
}

// Show contact modal
async function showContactModal(bookingId) {
  try {
    const contactInfo = await apiAuth(`/api/admin/bookings/${bookingId}/contact`);
    
    document.getElementById('contact-info').innerHTML = `
      <div style="margin-bottom:16px;">
        <div style="margin-bottom:8px;"><strong>Customer:</strong> ${contactInfo.customerName}</div>
        <div style="margin-bottom:8px;"><strong>Service:</strong> ${contactInfo.service}</div>
        <div style="margin-bottom:8px;"><strong>Date:</strong> ${new Date(contactInfo.date).toLocaleDateString()}</div>
        <div style="margin-bottom:8px;"><strong>Time:</strong> ${contactInfo.time}</div>
        <div style="margin-bottom:8px;"><strong>Stylist:</strong> ${contactInfo.stylist}</div>
        <div style="margin-bottom:8px;"><strong>Status:</strong> <span class="badge ${contactInfo.status === 'confirmed' ? 'success' : contactInfo.status === 'pending' ? 'warn' : 'error'}">${contactInfo.status}</span></div>
      </div>
      <div style="background:rgba(255,107,53,0.1);border:1px solid rgba(255,107,53,0.2);border-radius:var(--radius-sm);padding:12px;">
        <div style="margin-bottom:4px;"><strong>📧 Email:</strong> ${contactInfo.customerEmail}</div>
        <div><strong>📞 Phone:</strong> ${contactInfo.customerPhone || 'Not provided'}</div>
      </div>
    `;
    
    // Set up contact links
    document.getElementById('phone-link').href = contactInfo.contactLinks.phone;
    document.getElementById('email-link').href = contactInfo.contactLinks.email;
    document.getElementById('whatsapp-link').href = contactInfo.contactLinks.whatsapp;
    
    // Show modal
    document.getElementById('contact-modal').style.display = 'flex';
  } catch (error) {
    console.error('Error loading contact info:', error);
    showStatus('Error loading contact information: ' + error.message, 'error');
  }
}

// Close contact modal
function closeContactModal() {
  document.getElementById('contact-modal').style.display = 'none';
}

// Cancel booking
async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) {
    return;
  }
  
  try {
    const result = await apiAuth(`/api/admin/bookings/${bookingId}/cancel`, {
      method: 'POST'
    });
    
    showStatus(result.message, 'success');
    loadAdminData(); // Refresh the bookings table
  } catch (error) {
    console.error('Error cancelling booking:', error);
    showStatus('Error cancelling booking: ' + error.message, 'error');
  }
}

// Confirm booking
async function confirmBooking(bookingId) {
  try {
    const result = await apiAuth(`/api/admin/bookings/${bookingId}/confirm`, {
      method: 'POST'
    });
    
    showStatus(result.message, 'success');
    loadAdminData(); // Refresh the bookings table
  } catch (error) {
    console.error('Error confirming booking:', error);
    showStatus('Error confirming booking: ' + error.message, 'error');
  }
}

// Render stats
function renderStats(stats) {
  document.getElementById('total-bookings').textContent = stats.totalBookings || 0;
  document.getElementById('today-bookings').textContent = stats.todayBookings || 0;
  document.getElementById('pending-bookings').textContent = stats.pendingBookings || 0;
  document.getElementById('total-revenue').textContent = `₹${stats.totalRevenue || 0}`;
}

// Check shop status for a date
async function checkShopStatus(date) {
  try {
    const result = await apiAuth(`/api/admin/shop-status/${date}`);
    
    const statusBadge = document.getElementById('status-badge');
    const statusDate = document.getElementById('status-date');
    const statusDisplay = document.getElementById('shop-status-display');
    
    statusBadge.textContent = result.status.toUpperCase();
    statusBadge.className = `badge ${result.status === 'open' ? 'success' : 'error'}`;
    statusDate.textContent = `Status for ${new Date(date).toLocaleDateString()}`;
    statusDisplay.style.display = 'block';
  } catch (error) {
    console.error('Error checking shop status:', error);
    showStatus('Error checking shop status: ' + error.message, 'error');
  }
}

// Set shop status for a date
async function setShopStatus(date, status) {
  try {
    const result = await apiAuth(`/api/admin/shop-status/${date}`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
    
    showStatus(`Shop ${status} for ${new Date(date).toLocaleDateString()}`, 'success');
    checkShopStatus(date); // Refresh the status display
  } catch (error) {
    console.error('Error setting shop status:', error);
    showStatus('Error setting shop status: ' + error.message, 'error');
  }
}

// Show status messages
function showStatus(message, type = '') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warn' ? 'warn' : '';
  
  if (message) {
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
    }, 3000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  
  // Set today's date as default for shop status
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('shop-date').value = today;
  
  // Add event listeners
  document.getElementById('login-btn').addEventListener('click', adminLogin);
  document.getElementById('logout-btn').addEventListener('click', adminLogout);
  
  // Shop status management
  document.getElementById('check-status-btn').addEventListener('click', () => {
    const date = document.getElementById('shop-date').value;
    if (date) {
      checkShopStatus(date);
    }
  });
  
  document.getElementById('set-open-btn').addEventListener('click', () => {
    const date = document.getElementById('shop-date').value;
    if (date) {
      setShopStatus(date, 'open');
    }
  });
  
  document.getElementById('set-closed-btn').addEventListener('click', () => {
    const date = document.getElementById('shop-date').value;
    if (date) {
      setShopStatus(date, 'closed');
    }
  });
  
  // Modal close button
  document.getElementById('close-modal').addEventListener('click', closeContactModal);
  
  // Close modal when clicking outside
  document.getElementById('contact-modal').addEventListener('click', (e) => {
    if (e.target.id === 'contact-modal') {
      closeContactModal();
    }
  });
  
  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();
});
