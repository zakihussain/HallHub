document.addEventListener('DOMContentLoaded', () => {
  const { qs, qsa, money, formatDate, formatTime, showToast } = HallHub;
  if (localStorage.getItem('hallhubAdmin') !== 'true') {
    location.href = '../login/login.html';
    return;
  }

  const content = qs('#adminContent');
  const bookedRows = HALLS.flatMap(hall => (hall.bookedSlots || []).map(slot => ({ ...slot, venue: hall.name, city: hall.city }))).sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
  const recent = bookedRows.slice(0, 6);

  function top(title, sub) {
    return `<div class="admin-topbar"><div><h1>${title}</h1><p>${sub}</p></div><div class="admin-user"><div class="avatar">SA</div><div><strong>Sarah Ahmed</strong><small>Super administrator</small></div></div></div>`;
  }

  function statusClass(status) {
    return status === 'Pending' ? 'status-pending' : 'status-confirmed';
  }

  function bookingTableRows(rows) {
    return rows.map(row => `<tr><td><strong style="color:var(--maroon)">${row.bookingId}</strong></td><td>${row.customer}</td><td>${row.venue}</td><td>${formatDate(row.date)}</td><td>${formatTime(row.start)} - ${formatTime(row.end)}</td><td><span class="status ${statusClass(row.status)}">${row.status}</span></td></tr>`).join('');
  }

  function dashboard() {
    return top('Good morning, Sarah.', 'Here is what is happening across HallHub today.') + `
      <div class="admin-stats">
        <div class="admin-stat"><div class="admin-stat-head"><span>Total venues</span><i data-lucide="building-2"></i></div><strong>${HALLS.length}</strong><span class="trend">Up 2 this month</span></div>
        <div class="admin-stat"><div class="admin-stat-head"><span>Booked dates</span><i data-lucide="calendar-check-2"></i></div><strong>${bookedRows.length}</strong><span class="trend">Across all venues</span></div>
        <div class="admin-stat"><div class="admin-stat-head"><span>Pending review</span><i data-lucide="clock-3"></i></div><strong>8</strong><span class="trend" style="color:#9b6a1b">Needs attention</span></div>
        <div class="admin-stat"><div class="admin-stat-head"><span>Total revenue</span><i data-lucide="trending-up"></i></div><strong>PKR 1.2M</strong><span class="trend">Up 18.2% this month</span></div>
      </div>
      <div class="admin-grid">
        <section class="admin-panel"><div class="panel-heading"><h2>Booking analytics</h2><select class="toolbar-actions" style="padding:7px;border:1px solid var(--line);border-radius:7px;color:var(--muted);font-size:.72rem"><option>Last 7 months</option><option>This year</option></select></div><div class="bar-chart">${[42, 65, 48, 78, 61, 88, 72].map((n, i) => `<div class="bar" style="height:${n}%"><span>${['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}</span></div>`).join('')}</div></section>
        <section class="admin-panel"><div class="panel-heading"><h2>Venue health</h2><a href="#halls" data-section-link="halls">Manage</a></div><div style="display:grid;gap:17px"><div><div class="metric-line"><span>Available this week</span><strong>82%</strong></div><div class="metric-track"><div style="width:82%;background:var(--gold)"></div></div></div><div><div class="metric-line"><span>Average response time</span><strong>1.8 hrs</strong></div><div class="metric-track"><div style="width:76%;background:var(--maroon)"></div></div></div><div><div class="metric-line"><span>Review score</span><strong>4.8 / 5</strong></div><div class="metric-track"><div style="width:96%;background:var(--success)"></div></div></div></div></section>
        <section class="admin-panel wide"><div class="panel-heading"><div><h2>Upcoming booked dates</h2><p class="muted">Dates and timings currently blocked for customers.</p></div><a href="#calendar" data-section-link="calendar">Open calendar</a></div><div class="table-scroll"><table class="recent-table"><thead><tr><th>Booking ID</th><th>Customer</th><th>Venue</th><th>Date</th><th>Timing</th><th>Status</th></tr></thead><tbody>${bookingTableRows(recent)}</tbody></table></div></section>
      </div>`;
  }

  function simple(section, title, sub, body) {
    return top(title, sub) + `<section class="admin-panel">${body || `<div style="padding:48px 20px;text-align:center"><div class="feature-icon" style="margin:0 auto 16px"><i data-lucide="${section === 'calendar' ? 'calendar-days' : section === 'customers' ? 'users' : section === 'messages' ? 'message-square' : 'layout-list'}"></i></div><h2 style="margin-bottom:8px">${title}</h2><p class="muted" style="max-width:470px;margin:0 auto">This management view is ready for live data. In the prototype, the customer journey and admin navigation are fully wired for demonstration.</p></div>`}</section>`;
  }

  function calendarCards() {
    return HALLS.map(hall => `<article class="admin-calendar-card"><div class="admin-calendar-card-head"><div><strong>${hall.name}</strong><small>${hall.city} · ${hall.bookedSlots.length} booked dates</small></div><span class="status status-confirmed">${hall.status}</span></div><div class="admin-calendar-slots">${hall.bookedSlots.map(slot => `<div class="admin-calendar-slot"><span><i data-lucide="calendar-x-2"></i>${formatDate(slot.date)}</span><strong>${formatTime(slot.start)} - ${formatTime(slot.end)}</strong><small>${slot.customer} · ${slot.event}</small></div>`).join('')}</div></article>`).join('');
  }

  function render(section = 'dashboard') {
    qsa('[data-section]').forEach(link => link.classList.toggle('active', link.dataset.section === section));
    let html = '';
    if (section === 'dashboard') html = dashboard();
    else if (section === 'halls') html = simple(section, 'Hall management', 'Review, publish and organise your venue partners.', `<div class="panel-heading"><h2>All halls · ${HALLS.length}</h2><button class="btn btn-primary btn-sm" data-toast="Add hall form ready for backend connection."><i data-lucide="plus"></i>Add a hall</button></div><div class="table-scroll"><table class="recent-table"><thead><tr><th>Venue</th><th>City</th><th>Capacity</th><th>Starting price</th><th>Status</th><th>Actions</th></tr></thead><tbody>${HALLS.slice(0, 8).map(hall => `<tr><td><div class="summary-hall" style="margin:0"><img src="${hall.image}" alt="" style="width:40px;height:35px"><strong style="font-family:'Playfair Display',serif">${hall.name}</strong></div></td><td>${hall.city}</td><td>${hall.capacity}</td><td>${money(hall.price)} / guest</td><td><span class="status status-confirmed">${hall.verified ? 'Published' : 'Review'}</span></td><td><button class="icon-btn admin-action-btn" aria-label="More actions for ${hall.name}" data-toast="Hall editor ready."><i data-lucide="more-horizontal"></i></button></td></tr>`).join('')}</tbody></table></div>`);
    else if (section === 'bookings') html = simple(section, 'Booking management', 'Keep every celebration moving from confirmed to complete.', `<div class="panel-heading"><div><h2>${bookedRows.length} booked dates</h2><p class="muted">Every reserved venue date with the event timing.</p></div><button class="btn btn-ghost btn-sm" data-toast="Export prepared for your booking team."><i data-lucide="download"></i>Export</button></div><div class="table-scroll"><table class="recent-table"><thead><tr><th>ID</th><th>Customer</th><th>Venue</th><th>Event date</th><th>Timing</th><th>Status</th></tr></thead><tbody>${bookingTableRows(bookedRows)}</tbody></table></div>`);
    else if (section === 'calendar') html = simple(section, 'Booking calendar', 'See every blocked date and timing, organised by venue.', `<div class="admin-calendar-grid">${calendarCards()}</div>`);
    else if (section === 'catering') html = simple(section, 'Catering packages', 'Manage the menus available to every venue.', `<div class="grid grid-3">${CATERING.map(item => `<article class="selection-card"><img src="${item.image}" alt="${item.name}"><div class="selection-card-body"><h3>${item.name}</h3><p>${item.desc}</p><strong>${money(item.price)} / guest</strong></div></article>`).join('')}</div>`);
    else if (section === 'decoration') html = simple(section, 'Decoration packages', 'Keep every visual detail on-brand and bookable.', `<div class="grid grid-2">${DECORATION.map(item => `<article class="selection-card"><img src="${item.image}" alt="${item.name}"><div class="selection-card-body"><h3>${item.name}</h3><p>${item.desc}</p><strong>${money(item.price)}</strong></div></article>`).join('')}</div>`);
    else if (section === 'reviews') html = simple(section, 'Review moderation', 'Protect the trust behind every HallHub decision.', `<div class="grid grid-2">${['Beautiful hall and extremely professional staff.', 'The venue looked even better than the photographs.', 'Our family loved the menu and the planning support.', 'A thoughtful experience from search to confirmation.'].map((text, index) => `<article class="review-card"><div class="review-top"><div class="avatar">${['AK', 'HM', 'SR', 'MA'][index]}</div><div><strong>${['Areeba Khan', 'Hamza Malik', 'Sarah Raza', 'Muneeb Ahmed'][index]}</strong><small>${['Royal Pearl', 'Noor Garden', 'Ivory Courtyard', 'Saffron Palace'][index]}</small></div></div><blockquote>“${text}”</blockquote><div class="review-footer"><span class="rating"><i data-lucide="star"></i>5.0</span><button class="btn btn-ghost btn-sm" data-toast="Review marked as approved.">Approve</button></div></article>`).join('')}</div>`);
    else html = simple(section, section.charAt(0).toUpperCase() + section.slice(1), `Manage ${section} across the HallHub marketplace.`);

    content.innerHTML = html;
    window.lucide?.createIcons();
    qsa('[data-toast]').forEach(element => element.addEventListener('click', () => showToast(element.dataset.toast)));
    qsa('[data-section-link]').forEach(element => element.addEventListener('click', () => render(element.dataset.sectionLink)));
  }

  qsa('[data-section]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    render(link.dataset.section);
    qs('#adminSidebar').classList.remove('open');
  }));
  qs('#adminMenu').addEventListener('click', () => qs('#adminSidebar').classList.toggle('open'));
  qs('#logout').addEventListener('click', () => { localStorage.removeItem('hallhubAdmin'); location.href = '../login/login.html'; });
  render(location.hash.slice(1) || 'dashboard');
});
