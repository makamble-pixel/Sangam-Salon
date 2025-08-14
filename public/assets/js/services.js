// Service images mapping
const serviceImages = {
  'Classic Haircut': 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=1600&auto=format&fit=crop',
  'Beard Trim': 'https://images.unsplash.com/photo-1516642499105-492ff3ac521b?q=80&w=1600&auto=format&fit=crop',
  'Hair Color - Global': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1600&auto=format&fit=crop',
  'Highlights': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop',
  'Blow Dry & Style': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop',
  'Signature Facial': 'https://images.unsplash.com/photo-1603664113651-3f4f8b79f9b2?q=80&w=1600&auto=format&fit=crop',
  'Party Makeup': 'https://images.unsplash.com/photo-1512499617640-c2f999098c5c?q=80&w=1600&auto=format&fit=crop',
  'Manicure': 'https://images.unsplash.com/photo-1616394584738-fc6e61254b4f?q=80&w=1600&auto=format&fit=crop',
  'Pedicure': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1600&auto=format&fit=crop',
  'Hair Spa': 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=1600&auto=format&fit=crop',
  'Waxing': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1600&auto=format&fit=crop',
  'Threading': 'https://images.unsplash.com/photo-1586861203470-861d5a720b46?q=80&w=1600&auto=format&fit=crop'
};

// Curated default services to display if not provided by API
const curatedDefaults = [
  { name: 'Classic Haircut', description: 'Tailored cut, shampoo & style', price: 800, durationMinutes: 45 },
  { name: 'Beard Trim', description: 'Precision trim and shape', price: 350, durationMinutes: 20 },
  { name: 'Hair Color - Global', description: 'Single-process color', price: 2500, durationMinutes: 120 },
  { name: 'Highlights', description: 'Foil highlights, toner & style', price: 3200, durationMinutes: 150 },
  { name: 'Blow Dry & Style', description: 'Wash, blow dry, and style', price: 600, durationMinutes: 40 },
  { name: 'Signature Facial', description: 'Deep cleanse, exfoliation, mask', price: 1500, durationMinutes: 60 },
  { name: 'Party Makeup', description: 'Event-ready look', price: 3000, durationMinutes: 90 },
  { name: 'Manicure', description: 'Clean up, trim, shape & polish', price: 700, durationMinutes: 45 },
  { name: 'Pedicure', description: 'Relaxing foot care & polish', price: 900, durationMinutes: 60 },
  { name: 'Hair Spa', description: 'Nourishing hair treatment & massage', price: 1200, durationMinutes: 60 },
  { name: 'Waxing', description: 'Full arms or legs waxing', price: 800, durationMinutes: 45 },
  { name: 'Threading', description: 'Eyebrow & upper lip threading', price: 200, durationMinutes: 15 }
];

function renderServices(list) {
  console.log('Rendering services:', list);
  const grid = document.getElementById('services-grid');
  if (!grid) {
    console.error('services-grid element not found!');
    return;
  }
  
  const html = list.map(service => `
    <div class="card" style="text-align:center;">
      <img src="${serviceImages[service.name] || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop'}" alt="${service.name}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:16px;"/>
      <h3 style="margin-bottom:8px;color:var(--text);font-size:1.3rem;">${service.name}</h3>
      <p class="small" style="margin-bottom:12px;line-height:1.6;">${service.description || 'Professional service tailored to your needs'}</p>
      <div class="price">₹${service.price}</div>
      <p class="small" style="margin-bottom:16px;color:var(--text-secondary);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;margin-right:4px;vertical-align:-2px;">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        ${service.durationMinutes} minutes
      </p>
      <a href="/booking.html${service._id ? (`?serviceId=${service._id}`) : (`?serviceName=${encodeURIComponent(service.name)}`)}" class="btn primary" style="width:100%;">
        Book This Service
      </a>
    </div>
  `).join('');
  
  console.log('Generated HTML length:', html.length);
  grid.innerHTML = html;
}

// Load and display services with images
async function loadServices() {
  console.log('loadServices called');
  
  // Render curated defaults immediately for fast UX
  console.log('Rendering curated defaults...');
  renderServices(curatedDefaults);
  
  try {
    console.log('Fetching from /api/services...');
    const response = await fetch('/api/services');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const services = await response.json();
    console.log('API services received:', services);
    
    // Merge API services with curated defaults (avoid duplicates by name)
    const apiByName = new Map((services || []).map(s => [s.name.toLowerCase(), s]));
    const merged = [...(services || [])];
    for (const d of curatedDefaults) {
      if (!apiByName.has(d.name.toLowerCase())) merged.push(d);
    }
    
    console.log('Merged services:', merged);
    renderServices(merged);
  } catch (error) {
    console.error('Error loading services:', error);
    // Keep curated defaults rendered; optionally show a note
    const grid = document.getElementById('services-grid');
    if (grid && grid.children.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column:1/-1;text-align:center;padding:60px 20px;">
          <div style="font-size:3rem;margin-bottom:20px;">😔</div>
          <h3 style="margin-bottom:16px;">Unable to Load Services</h3>
          <p class="small" style="margin-bottom:20px;">We're having trouble loading our services. Please try refreshing the page.</p>
          <button onclick="location.reload()" class="btn outline">Refresh Page</button>
        </div>
      `;
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, calling loadServices...');
  loadServices();
});

// Also try to render immediately in case DOM is already loaded
if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded...');
} else {
  console.log('Document already loaded, calling loadServices immediately...');
  loadServices();
}
