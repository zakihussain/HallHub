(function () {
  const root = document.documentElement;
  const page = document.body.dataset.page || '';
  const prefix = page === 'home' ? './' : '../../';
  const scopedStyles = page === 'home' ? 'assets/css/home.css' : page.startsWith('admin') ? (location.pathname.includes('/dashboard/') ? 'dashboard.css' : 'login.css') : location.pathname.includes('/about/') ? 'about.css' : location.pathname.includes('/find-hall/') ? 'find-hall.css' : location.pathname.includes('/hall-details/') ? 'hall-details.css' : location.pathname.includes('/booking/') ? 'booking.css' : location.pathname.includes('/payment/') ? 'payment.css' : location.pathname.includes('/confirmation/') ? 'confirmation.css' : location.pathname.includes('/contact/') ? 'contact.css' : '';
  if (scopedStyles) { const styleLink = document.createElement('link'); styleLink.rel = 'stylesheet'; styleLink.href = page === 'home' ? scopedStyles : scopedStyles; document.head.appendChild(styleLink); }

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const money = (value) => `PKR ${Number(value || 0).toLocaleString('en-PK')}`;
  const getData = (key, fallback = null) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const setData = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const getHall = (id) => (window.HALLS || []).find(h => h.id === id) || window.HALLS?.[0];
  const getBookedSlots = (hall) => (hall?.bookedSlots || []).slice().sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
  const formatDate = (date) => date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date pending';
  const formatTime = (time) => {
    if (!time) return 'Time pending';
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  const isAvailable = (hall, date) => !date || !(hall.unavailableDates || []).includes(date);
  const getBooking = () => getData('hallhubBooking', {});

  function renderNav(active = '') {
    const target = qs('[data-site-nav]');
    if (!target) return;
    target.innerHTML = `<header class="site-header"><div class="container"><div class="nav">
      <a class="brand" href="${prefix}index.html"><span class="brand-mark">H</span><span>HALLHUB<small>Your Day. Your Hall. Your Way.</small></span></a>
        <nav class="nav-links" aria-label="Primary navigation">
          <a class="${active==='home'?'active':''}" href="${prefix}index.html">Home</a>
          <a class="${active==='about'?'active':''}" href="${prefix}pages/about/about.html">About Us</a>
          <a class="${active==='find'?'active':''}" href="${prefix}pages/find-hall/find-hall.html">Find a Hall</a>
        </nav>
        <div class="nav-actions"><a class="btn btn-primary btn-sm" href="${prefix}pages/contact/contact.html">Contact Us <i data-lucide="arrow-up-right"></i></a><button class="icon-btn menu-btn" aria-label="Open menu"><i data-lucide="menu"></i></button></div>
    </div></div></header>`;
    const nav = qs('.nav', target); const menu = qs('.menu-btn', target); menu?.addEventListener('click', () => nav.classList.toggle('open'));
    window.lucide?.createIcons();
  }
  function renderFooter() {
    const target = qs('[data-site-footer]'); if (!target) return;
    target.innerHTML = `<footer class="site-footer"><div class="container"><div class="footer-grid">
      <div><a class="brand" href="${prefix}index.html"><span class="brand-mark">H</span><span>HALLHUB<small>Your Day. Your Hall. Your Way.</small></span></a><p style="margin-top:20px;max-width:260px">Premium venues, catering and decoration for celebrations that feel entirely yours.</p></div>
        <div><h4>Explore</h4><div class="footer-links"><a href="${prefix}pages/find-hall/find-hall.html">Find a Hall</a><a href="${prefix}pages/about/about.html">About Us</a><a href="${prefix}pages/contact/contact.html">Contact Us</a></div></div>
      <div><h4>For hosts</h4><div class="footer-links"><a href="${prefix}admin/login/login.html">List your venue</a><a href="${prefix}admin/login/login.html">Admin sign in</a><a href="${prefix}pages/contact/contact.html#faq">FAQs</a></div></div>
      <div><h4>Stay in the loop</h4><p>Receive handpicked venue inspiration and planning notes.</p><div style="display:flex;gap:7px"><input class="field-control" placeholder="Your email" aria-label="Email address"><button class="btn btn-gold btn-sm" data-toast="Thanks — you’re on the list.">Join</button></div></div>
    </div><div class="footer-bottom"><span>© 2026 HallHub. Crafted for celebrations.</span><span>Privacy · Terms · Secure bookings</span></div></div></footer>`;
  }
  function hallCard(h) {
    const saved = getData('hallhubFavorites', []).includes(h.id);
    const dateBadge = h._selectedDate ? `<span class="availability-pill ${h._dateAvailable?'available':'unavailable'}"><i data-lucide="${h._dateAvailable?'calendar-check-2':'calendar-x-2'}"></i>${h._dateAvailable?'Available':'Unavailable'} on selected date</span>` : '';
    return `<article class="hall-card"><div class="hall-image-wrap"><img class="hall-image" src="${h.image}" alt="${h.name} wedding venue" onerror="this.onerror=null;this.classList.add('image-unavailable');this.src='/assets/images/halls/royal-pearl/photo-1.png'"><div class="hall-badges">${h.verified?'<span class="badge badge-gold"><i data-lucide="badge-check"></i> Verified</span>':''}</div><button class="icon-btn favorite ${saved?'saved':''}" data-favorite="${h.id}" aria-label="Save ${h.name}"><i data-lucide="heart"></i></button></div><div class="hall-body"><div class="hall-title-row"><div><h3>${h.name}</h3><div class="hall-location"><i data-lucide="map-pin"></i> ${h.area}</div></div><span class="rating"><i data-lucide="star"></i>${h.rating}</span></div><div class="hall-meta"><span><i data-lucide="users"></i>${h.minGuests}–${h.capacity}</span><span><i data-lucide="building-2"></i>${h.type}</span><span><i data-lucide="snowflake"></i>${h.ac?'AC':'Open air'}</span><span><i data-lucide="car-front"></i>Parking</span></div>${dateBadge}<div class="hall-bottom"><div><span class="price-label">Starting from</span><span class="price">${money(h.price)}<small style="font-size:.66rem;color:var(--muted);font-weight:500"> / guest</small></span></div><a class="btn btn-primary btn-sm" href="${prefix}pages/hall-details/hall-details.html?id=${h.id}">View Details <i data-lucide="arrow-up-right"></i></a></div></div></article>`;
  }
  function bindFavorites() { qsa('[data-favorite]').forEach(btn => btn.addEventListener('click', () => { const ids = getData('hallhubFavorites', []); const id = btn.dataset.favorite; const next = ids.includes(id) ? ids.filter(x=>x!==id) : [...ids,id]; setData('hallhubFavorites', next); btn.classList.toggle('saved', next.includes(id)); window.lucide?.createIcons(); showToast(next.includes(id) ? 'Saved to your favourites.' : 'Removed from favourites.'); })); }
  function showToast(message) { let toast = qs('.toast'); if (!toast) { toast = document.createElement('div'); toast.className='toast'; document.body.appendChild(toast); } toast.textContent=message; toast.classList.add('show'); clearTimeout(window.__hallToast); window.__hallToast=setTimeout(()=>toast.classList.remove('show'),3000); }
  window.HallHub = { qs, qsa, money, getData, setData, getHall, getBooking, getBookedSlots, formatDate, formatTime, isAvailable, hallCard, bindFavorites, showToast, renderNav, renderFooter, prefix };
  document.addEventListener('DOMContentLoaded', () => { renderNav(document.body.dataset.active || ''); renderFooter(); qsa('[data-toast]').forEach(el=>el.addEventListener('click',()=>showToast(el.dataset.toast))); window.lucide?.createIcons(); });
})();
