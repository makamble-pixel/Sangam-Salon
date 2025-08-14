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

let selected = null;
let currentServices = [];
let currentStylists = [];

// Curated services to display if API is not available
const curatedServices = [
  { _id: 'service_1', name: 'Classic Haircut', description: 'Tailored cut, shampoo & style', price: 800, durationMinutes: 45 },
  { _id: 'service_2', name: 'Beard Trim', description: 'Precision trim and shape', price: 350, durationMinutes: 20 },
  { _id: 'service_3', name: 'Hair Color - Global', description: 'Single-process color', price: 2500, durationMinutes: 120 },
  { _id: 'service_4', name: 'Highlights', description: 'Foil highlights, toner & style', price: 3200, durationMinutes: 150 },
  { _id: 'service_5', name: 'Blow Dry & Style', description: 'Wash, blow dry, and style', price: 600, durationMinutes: 40 },
  { _id: 'service_6', name: 'Signature Facial', description: 'Deep cleanse, exfoliation, mask', price: 1500, durationMinutes: 60 },
  { _id: 'service_7', name: 'Party Makeup', description: 'Event-ready look', price: 3000, durationMinutes: 90 },
  { _id: 'service_8', name: 'Manicure', description: 'Clean up, trim, shape & polish', price: 700, durationMinutes: 45 },
  { _id: 'service_9', name: 'Pedicure', description: 'Relaxing foot care & polish', price: 900, durationMinutes: 60 },
  { _id: 'service_10', name: 'Hair Spa', description: 'Nourishing hair treatment & massage', price: 1200, durationMinutes: 60 },
  { _id: 'service_11', name: 'Waxing', description: 'Full arms or legs waxing', price: 800, durationMinutes: 45 },
  { _id: 'service_12', name: 'Threading', description: 'Eyebrow & upper lip threading', price: 200, durationMinutes: 15 }
];

// Curated stylists with Indian names
const curatedStylists = [
  { _id: 'stylist_1', name: 'Sikandar', specialties: ['Haircuts', 'Styling', 'Beard Trim'] },
  { _id: 'stylist_2', name: 'Imran', specialties: ['Haircuts', 'Fades', 'Beard Grooming'] },
  { _id: 'stylist_3', name: 'Priya', specialties: ['Hair Color', 'Highlights', 'Balayage'] },
  { _id: 'stylist_4', name: 'Meera', specialties: ['Facial', 'Skincare', 'Makeup'] },
  { _id: 'stylist_5', name: 'Rahul', specialties: ['Haircuts', 'Styling', 'Hair Spa'] },
  { _id: 'stylist_6', name: 'Anjali', specialties: ['Manicure', 'Pedicure', 'Nail Art'] },
  { _id: 'stylist_7', name: 'Amit', specialties: ['Haircuts', 'Beard Trim', 'Waxing'] },
  { _id: 'stylist_8', name: 'Kavya', specialties: ['Threading', 'Facial', 'Skincare'] },
  { _id: 'stylist_9', name: 'Vikram', specialties: ['Haircuts', 'Styling', 'Hair Treatments'] },
  { _id: 'stylist_10', name: 'Zara', specialties: ['Makeup', 'Hair Styling', 'Bridal Services'] }
];

// Load initial data
async function load() {
  try {
    // Try to fetch from API first
    const [apiServices, apiStylists] = await Promise.all([
      fetch('/api/services').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/stylists').then(r => r.ok ? r.json() : []).catch(() => [])
    ]);
    
    // Use API data if available, otherwise use curated data
    currentServices = apiServices.length > 0 ? apiServices : curatedServices;
    currentStylists = apiStylists.length > 0 ? apiStylists : curatedStylists;
    
    // Populate service dropdown
    const serviceSelect = document.getElementById('service');
    serviceSelect.innerHTML = '<option value="">Select a service...</option>' + 
      currentServices.map(service => 
        `<option value="${service._id}">${service.name} · ₹${service.price} · ${service.durationMinutes}min</option>`
      ).join('');
    
    // Preselect service if provided via URL param
    const params = new URLSearchParams(window.location.search);
    const preselectServiceId = params.get('serviceId');
    const preselectServiceName = params.get('serviceName');
    if (preselectServiceId && currentServices.some(s => s._id === preselectServiceId)) {
      serviceSelect.value = preselectServiceId;
    } else if (preselectServiceName) {
      const match = currentServices.find(s => s.name.toLowerCase() === preselectServiceName.toLowerCase());
      if (match) serviceSelect.value = match._id;
    }
    
    // Populate stylist dropdown
    const stylistSelect = document.getElementById('stylist');
    stylistSelect.innerHTML = '<option value="">Any available stylist</option>' + 
      currentStylists.map(stylist => 
        `<option value="${stylist._id}">${stylist.name} (${stylist.specialties.join(', ')})</option>`
      ).join('');
    
    // Set minimum date to today
    const today = new Date();
    const tz = today.getTimezoneOffset() * 60000;
    const local = new Date(Date.now() - tz).toISOString().split('T')[0];
    document.getElementById('date').min = local;
    document.getElementById('date').value = local;
    
    updateSlots();
  } catch (error) {
    console.error('Error loading data:', error);
    // Fallback to curated data
    currentServices = curatedServices;
    currentStylists = curatedStylists;
    
    // Populate dropdowns with curated data
    const serviceSelect = document.getElementById('service');
    serviceSelect.innerHTML = '<option value="">Select a service...</option>' + 
      curatedServices.map(service => 
        `<option value="${service._id}">${service.name} · ₹${service.price} · ${service.durationMinutes}min</option>`
      ).join('');
    
    const stylistSelect = document.getElementById('stylist');
    stylistSelect.innerHTML = '<option value="">Any available stylist</option>' + 
      curatedStylists.map(stylist => 
        `<option value="${stylist._id}">${stylist.name} (${stylist.specialties.join(', ')})</option>`
      ).join('');
    
    // Set minimum date to today
    const today = new Date();
    const tz = today.getTimezoneOffset() * 60000;
    const local = new Date(Date.now() - tz).toISOString().split('T')[0];
    document.getElementById('date').min = local;
    document.getElementById('date').value = local;
    
    showStatus('Using offline services and stylists. Some features may be limited.', 'warn');
  }
}

// Render available time slots
function renderSlots(slots) {
  const wrap = document.getElementById('slots');
  
  if (!slots || !slots.length) {
    wrap.innerHTML = '<p class="small" style="text-align:center;grid-column:1/-1;padding:20px;color:var(--text-secondary);">No slots available for selected date and service</p>';
    return;
  }
  
  wrap.innerHTML = slots.map(slot => 
    `<div class="slot" data-time="${slot.time}" data-stylist="${slot.stylistId || ''}">
      <div style="font-weight:600;">${slot.time}</div>
      ${slot.stylistName ? `<div class="small">${slot.stylistName}</div>` : ''}
    </div>`
  ).join('');
  
  // Add click handlers
  wrap.querySelectorAll('.slot').forEach(el => {
    el.addEventListener('click', function() {
      wrap.querySelectorAll('.slot').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      selected = {
        time: el.dataset.time,
        stylistId: el.dataset.stylist || null
      };
      updateBookingSummary();
    });
  });
}

// Update available slots based on selection
async function updateSlots() {
  selected = null;
  showStatus('', '');
  
  const serviceId = document.getElementById('service').value;
  const stylistId = document.getElementById('stylist').value;
  const date = document.getElementById('date').value;
  
  if (!serviceId || !date) {
    document.getElementById('slots').innerHTML = 
      '<p class="small" style="text-align:center;grid-column:1/-1;padding:20px;color:var(--text-secondary);">Select a service and date to see available slots</p>';
    return;
  }
  
  const slotsContainer = document.getElementById('slots');
  slotsContainer.innerHTML = '<p class="small" style="text-align:center;grid-column:1/-1;padding:20px;">Loading available slots...</p>';
  
  try {
    const queryParams = new URLSearchParams({
      date: date,
      serviceId: serviceId
    });
    
    if (stylistId) {
      queryParams.append('stylistId', stylistId);
    }
    
    const data = await api(`/api/availability?${queryParams}`);
    renderSlots(data.slots);
  } catch (error) {
    console.error('Error loading slots:', error);
    slotsContainer.innerHTML = `<p class="small" style="text-align:center;grid-column:1/-1;padding:20px;color:#ff6b6b;">Error: ${error.message}</p>`;
  }
}

// Update booking summary
function updateBookingSummary() {
  const summaryDiv = document.getElementById('booking-summary');
  const summaryDetails = document.getElementById('summary-details');
  
  if (!selected) {
    summaryDiv.style.display = 'none';
    return;
  }
  
  const serviceId = document.getElementById('service').value;
  const date = document.getElementById('date').value;
  const stylistId = document.getElementById('stylist').value;
  
  const service = currentServices.find(s => s._id === serviceId);
  const stylist = stylistId ? currentStylists.find(s => s._id === stylistId) : null;
  const selectedStylist = selected.stylistId ? currentStylists.find(s => s._id === selected.stylistId) : null;
  
  if (service) {
    summaryDetails.innerHTML = `
      <div style="margin-bottom:8px;"><strong>Service:</strong> ${service.name}</div>
      <div style="margin-bottom:8px;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</div>
      <div style="margin-bottom:8px;"><strong>Time:</strong> ${selected.time}</div>
      <div style="margin-bottom:8px;"><strong>Stylist:</strong> ${selectedStylist ? selectedStylist.name : (stylist ? stylist.name : 'Any available')}</div>
      <div style="margin-bottom:8px;"><strong>Duration:</strong> ${service.durationMinutes} minutes</div>
      <div style="color:var(--accent);font-weight:600;"><strong>Price:</strong> ₹${service.price}</div>
    `;
    summaryDiv.style.display = 'block';
  }
}

// Show status messages
function showStatus(message, type = '') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warn' ? 'warn' : '';
}

// Book appointment
async function bookNow() {
  const statusDiv = document.getElementById('status');
  const bookBtn = document.getElementById('bookBtn');
  
  // Validate form
  const payload = {
    serviceId: document.getElementById('service').value,
    stylistId: selected ? selected.stylistId : undefined,
    date: document.getElementById('date').value,
    time: selected ? selected.time : undefined,
    customerName: document.getElementById('name').value.trim(),
    customerEmail: document.getElementById('email').value.trim(),
    customerPhone: document.getElementById('phone').value.trim(),
    source: navigator.onLine ? 'online' : 'offline-sync'
  };
  
  if (!payload.serviceId || !payload.date || !payload.time || !payload.customerName || !payload.customerEmail) {
    showStatus('Please fill all required fields and select a time slot', 'error');
    return;
  }
  
  // Show loading state
  bookBtn.disabled = true;
  bookBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;">
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
    Booking...
  `;
  
  try {
    if (!navigator.onLine) {
      // Save offline
      const queue = JSON.parse(localStorage.getItem('bookingQueue') || '[]');
      queue.push(payload);
      localStorage.setItem('bookingQueue', JSON.stringify(queue));
      showStatus('Appointment saved offline — will sync when online', 'success');
    } else {
      // Book online
      const result = await api('/api/book', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showStatus(`✅ Appointment booked successfully! Booking ID: ${result.bookingId}`, 'success');
      
      // Reset form
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('phone').value = '';
      selected = null;
      updateBookingSummary();
    }
  } catch (error) {
    console.error('Booking error:', error);
    showStatus(`Booking failed: ${error.message}`, 'error');
  } finally {
    bookBtn.disabled = false;
    bookBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      Book Appointment
    `;
  }
}

// Sync offline bookings
async function syncQueue() {
  if (!navigator.onLine) return;
  
  const queue = JSON.parse(localStorage.getItem('bookingQueue') || '[]');
  if (!queue.length) return;
  
  const remaining = [];
  for (const item of queue) {
    try {
      await api('/api/book', {
        method: 'POST',
        body: JSON.stringify(item)
      });
    } catch (error) {
      remaining.push(item);
    }
  }
  localStorage.setItem('bookingQueue', JSON.stringify(remaining));
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  load();
  
  // Add event listeners
  ['service', 'stylist', 'date'].forEach(id => {
    document.getElementById(id).addEventListener('change', updateSlots);
  });
  
  document.getElementById('bookBtn').addEventListener('click', bookNow);
  
  // Online/offline handling
  window.addEventListener('online', syncQueue);
  syncQueue();
  
  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();
});

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
