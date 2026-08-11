document.addEventListener('DOMContentLoaded', () => {
  const { qs, qsa, money, getHall, getData, setData, getBookedSlots, formatDate, formatTime, isAvailable, prefix, showToast } = HallHub;
  const saved = getData('hallhubBooking', {});
  const hall = getHall(saved.hallId || 'royal-pearl');
  let step = 1;
  let booking = {
    hallId: hall.id,
    date: saved.date || '',
    guests: Number(saved.guests || 500),
    eventType: saved.eventType || 'Wedding',
    name: saved.name || '',
    phone: saved.phone || '',
    email: saved.email || '',
    start: saved.start || '17:00',
    end: saved.end || '23:00',
    requirements: saved.requirements || '',
    version: 2,
    cateringId: saved.version === 2 ? (saved.cateringId || '') : '',
    decorationId: saved.version === 2 ? (saved.decorationId || '') : '',
    extras: saved.version === 2 ? (saved.extras || []) : []
  };

  const selectedCatering = () => CATERING.find(item => item.id === booking.cateringId);
  const selectedDecoration = () => DECORATION.find(item => item.id === booking.decorationId);
  const bookedSlots = () => getBookedSlots(hall);
  const selectedDateSlots = () => bookedSlots().filter(slot => slot.date === booking.date);
  const additionalTotal = () => EXTRAS.filter(item => booking.extras.includes(item.id)).reduce((sum, item) => sum + item.price, 0);
  const totals = () => {
    const venue = hall.price * booking.guests;
    const catering = selectedCatering() ? selectedCatering().price * booking.guests : 0;
    const decoration = selectedDecoration()?.price || 0;
    const additional = additionalTotal();
    const subtotal = venue + catering + decoration + additional;
    const serviceFee = Math.round(subtotal * .04);
    return { venue, catering, decoration, additional, subtotal, serviceFee, total: subtotal + serviceFee };
  };

  function renderSummary() {
    const total = totals();
    const cateringLabel = selectedCatering() ? `${selectedCatering().name} package` : 'Choose catering';
    const decorationLabel = selectedDecoration() ? `${selectedDecoration().name} package` : 'Choose decoration';
    qs('#bookingSummary').innerHTML = `<h3>Your booking</h3><div class="summary-hall"><img src="${hall.image}" alt="${hall.name}"><div><strong>${hall.name}</strong><small>${hall.area}</small></div></div><div class="summary-item"><span>Date</span><strong>${booking.date || 'Select a date'}</strong></div><div class="summary-item"><span>Guests</span><strong>${booking.guests.toLocaleString()}</strong></div><div class="summary-item"><span>Venue</span><strong>${money(total.venue)}</strong></div><div class="summary-item"><span>Catering</span><strong>${cateringLabel}</strong></div><div class="summary-item"><span>Decoration</span><strong>${decorationLabel}</strong></div><div class="summary-item"><span>Additional services</span><strong>${total.additional ? money(total.additional) : 'None'}</strong></div><div class="summary-item"><span>Subtotal</span><strong>${money(total.subtotal)}</strong></div><div class="summary-item"><span>Service fee</span><strong>${money(total.serviceFee)}</strong></div><div class="summary-total"><span>Total</span><strong>${money(total.total)}</strong></div>`;
  }

  function renderDateAvailability() {
    const target = qs('#dateAvailability');
    if (!target) return;
    const slots = selectedDateSlots();
    if (!booking.date) {
      target.className = 'date-status';
      target.innerHTML = '<i data-lucide="calendar-days"></i><span>Select a date to check its availability.</span>';
    } else if (slots.length) {
      target.className = 'date-status unavailable';
      target.innerHTML = `<i data-lucide="calendar-x-2"></i><span><strong>${formatDate(booking.date)} is already booked.</strong> ${slots.map(slot => `${formatTime(slot.start)} - ${formatTime(slot.end)}`).join(', ')}</span>`;
    } else {
      target.className = 'date-status available';
      target.innerHTML = `<i data-lucide="calendar-check-2"></i><span><strong>${formatDate(booking.date)} is available.</strong> No booking is recorded for this date.</span>`;
    }
    window.lucide?.createIcons();
  }

  function bookedScheduleMarkup() {
    return `<section class="booking-availability"><div class="booking-availability-head"><div><div class="eyebrow">Venue calendar</div><h3>Booked dates and timings</h3></div><span>${bookedSlots().length} reserved dates</span></div><p class="muted">These dates are unavailable for this venue. Choose a date that is not listed below.</p><div class="booking-slot-list">${bookedSlots().map(slot => `<div class="booking-slot"><span><i data-lucide="calendar-x-2"></i>${formatDate(slot.date)}</span><strong>${formatTime(slot.start)} - ${formatTime(slot.end)}</strong></div>`).join('')}</div></section>`;
  }

  function renderProgress() {
    qsa('.progress-step').forEach((item, index) => {
      item.classList.toggle('active', index + 1 === step);
      item.classList.toggle('done', index + 1 < step);
    });
  }

  function render() {
    renderProgress();
    let content = '';
    if (step === 1) content = `<h2>Tell us about your event</h2><p>We will use these details to confirm your date and make your booking personal.</p><div class="form-grid"><div class="field"><label for="bName">Full name</label><input class="field-control" id="bName" value="${booking.name}" placeholder="Your full name"></div><div class="field"><label for="bPhone">Phone number</label><input class="field-control" id="bPhone" value="${booking.phone}" placeholder="03XX XXXXXXX"></div><div class="field"><label for="bEmail">Email address</label><input class="field-control" id="bEmail" type="email" value="${booking.email}" placeholder="you@example.com"></div><div class="field"><label for="bEvent">Event type</label><select class="field-control" id="bEvent">${['Wedding','Walima','Mehndi','Baraat','Nikkah','Birthday','Corporate','Other'].map(type => `<option ${booking.eventType === type ? 'selected' : ''}>${type}</option>`).join('')}</select></div><div class="field"><label for="bDate">Event date</label><input class="field-control" id="bDate" type="date" value="${booking.date}"></div><div class="field"><label for="bGuests">Number of guests</label><input class="field-control" id="bGuests" type="number" min="${hall.minGuests}" max="${hall.capacity}" value="${booking.guests}"></div><div class="field"><label for="bStart">Start time</label><input class="field-control" id="bStart" type="time" value="${booking.start}"></div><div class="field"><label for="bEnd">End time</label><input class="field-control" id="bEnd" type="time" value="${booking.end}"></div><div class="field full"><label for="bReq">Special requirements</label><textarea class="field-control textarea" id="bReq" placeholder="Tell us anything the venue team should know.">${booking.requirements}</textarea></div></div><div id="dateAvailability" class="date-status"></div>${bookedScheduleMarkup()}`;
    if (step === 2) content = `<h2>Your venue</h2><p>Here is the space you selected. You can change it any time before payment.</p><div class="summary-hall venue-selection"><img src="${hall.image}" alt="${hall.name}"><div><div class="eyebrow">${hall.verified ? 'Verified venue' : 'Venue'}</div><strong>${hall.name}</strong><small>${hall.area}<br>${hall.minGuests}-${hall.capacity} guests · ${hall.type}<br>${booking.date || 'Date pending'} · ${booking.guests.toLocaleString()} guests</small><span class="rating"><i data-lucide="star"></i>${hall.rating} (${hall.reviews})</span></div></div><div class="info-card" style="margin-top:20px"><div class="feature-icon"><i data-lucide="calendar-check-2"></i></div><div><strong>${booking.date || 'Date to be confirmed'}</strong><p>${booking.guests.toLocaleString()} guests · ${booking.start} to ${booking.end}</p></div></div><a class="btn btn-ghost btn-sm" href="${prefix}pages/find-hall/find-hall.html" style="margin-top:18px"><i data-lucide="arrow-left"></i> Change hall</a>`;
    if (step === 3) content = `<h2>Choose your catering</h2><p>All packages are priced per guest. Select one package to continue; your total updates instantly.</p><div class="selection-grid">${CATERING.map(item => `<button type="button" class="selection-card ${item.id === booking.cateringId ? 'selected' : ''}" data-catering="${item.id}"><img src="${item.image}" alt="${item.name} catering package"><span class="selection-card-body"><strong class="selection-title">${item.name}</strong><span>${item.desc}</span><strong>${money(item.price)} / guest</strong><span class="package-items">${item.items.join(' · ')}</span></span></button>`).join('')}</div>`;
    if (step === 4) content = `<h2>Set the scene</h2><p>Choose one decoration direction and we will carry it through the details.</p><div class="selection-grid decoration-grid">${DECORATION.map(item => `<button type="button" class="selection-card ${item.id === booking.decorationId ? 'selected' : ''}" data-decoration="${item.id}"><img src="${item.image}" alt="${item.name} decoration package"><span class="selection-card-body"><strong class="selection-title">${item.name}</strong><span>${item.desc}</span><strong>${money(item.price)}</strong><span class="package-items">${item.items.join(' · ')}</span></span></button>`).join('')}</div>`;
    if (step === 5) content = `<h2>Review your celebration</h2><p>Choose any optional extras, then review the complete invoice before payment.</p><div class="extras"><h3>Additional services</h3>${EXTRAS.map(item => `<label class="extra-option"><input type="checkbox" data-extra="${item.id}" ${booking.extras.includes(item.id) ? 'checked' : ''}><span>${item.name}</span><strong>${money(item.price)}</strong></label>`).join('')}</div><div class="panel invoice-panel" style="padding:0;box-shadow:none"><div class="summary-item"><span>Venue</span><strong>${hall.name}</strong></div><div class="summary-item"><span>Event</span><strong>${booking.eventType} · ${booking.date || 'Date pending'} · ${booking.guests.toLocaleString()} guests</strong></div><div class="summary-item"><span>Catering</span><strong>${selectedCatering()?.name || 'Not selected'} · ${money(totals().catering)}</strong></div><div class="summary-item"><span>Decoration</span><strong>${selectedDecoration()?.name || 'Not selected'} · ${money(totals().decoration)}</strong></div><div class="summary-item"><span>Additional services</span><strong>${money(totals().additional)}</strong></div><div class="summary-item"><span>Subtotal</span><strong>${money(totals().subtotal)}</strong></div><div class="summary-item"><span>Service fee</span><strong>${money(totals().serviceFee)}</strong></div><div class="summary-total"><span>Complete package</span><strong>${money(totals().total)}</strong></div></div>`;
    qs('#bookingStep').innerHTML = `${content}<div class="step-actions">${step > 1 ? '<button class="btn btn-ghost" id="backStep"><i data-lucide="arrow-left"></i> Back</button>' : '<span></span>'}<button class="btn btn-primary" id="nextStep">${step === 5 ? 'Proceed to payment' : 'Continue'} <i data-lucide="arrow-right"></i></button></div>`;
    bindStepInteractions();
    window.lucide?.createIcons();
    renderSummary();
    renderDateAvailability();
  }

  function bindStepInteractions() {
    qsa('[data-catering]').forEach(card => card.addEventListener('click', () => { booking.cateringId = card.dataset.catering; render(); }));
    qsa('[data-decoration]').forEach(card => card.addEventListener('click', () => { booking.decorationId = card.dataset.decoration; render(); }));
    qsa('[data-extra]').forEach(input => input.addEventListener('change', () => { booking.extras = qsa('[data-extra]:checked').map(item => item.dataset.extra); render(); }));
    qs('#bGuests')?.addEventListener('input', event => { booking.guests = Number(event.target.value || 0); renderSummary(); });
    qs('#bDate')?.addEventListener('change', event => { booking.date = event.target.value; renderSummary(); renderDateAvailability(); });
    qs('#backStep')?.addEventListener('click', () => { step -= 1; render(); });
    qs('#nextStep')?.addEventListener('click', () => {
      if (step === 1) {
        booking.name = qs('#bName').value.trim();
        booking.phone = qs('#bPhone').value.trim();
        booking.email = qs('#bEmail').value.trim();
        booking.eventType = qs('#bEvent').value;
        booking.date = qs('#bDate').value;
        booking.guests = Number(qs('#bGuests').value || 0);
        booking.start = qs('#bStart').value;
        booking.end = qs('#bEnd').value;
        booking.requirements = qs('#bReq').value.trim();
        if (!booking.name || !booking.phone || !booking.email || !booking.date || !booking.guests) { showToast('Please complete your name, contact, date and guest count.'); return; }
        if (booking.guests < hall.minGuests || booking.guests > hall.capacity) { showToast(`This venue accommodates ${hall.minGuests}-${hall.capacity} guests.`); return; }
        if (!isAvailable(hall, booking.date)) {
          const slots = selectedDateSlots();
          showToast(`${formatDate(booking.date)} is already booked from ${slots.map(slot => `${formatTime(slot.start)} to ${formatTime(slot.end)}`).join(', ')}.`);
          renderDateAvailability();
          return;
        }
      }
      if (step === 3 && !booking.cateringId) { showToast('Please choose a catering package before continuing.'); return; }
      if (step === 4 && !booking.decorationId) { showToast('Please choose a decoration package before continuing.'); return; }
      if (step < 5) { step += 1; render(); } else { setData('hallhubBooking', booking); location.href = '../payment/payment.html'; }
    });
  }

  render();
});
