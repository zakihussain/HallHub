document.addEventListener('DOMContentLoaded', () => {
  const { qs, qsa, money, getHall, getBookedSlots, formatDate, formatTime, isAvailable, showToast } = HallHub;
  const hall = getHall(new URLSearchParams(location.search).get('id'));
  if (!hall) return;

  const reviews = hall.reviewItems || [];
  const gallery = Array.from(new Set(hall.gallery || [hall.image])).filter(Boolean);
  const bookedSlots = getBookedSlots(hall);
  const mapAddress = hall.address || hall.location || `${hall.name}, ${hall.city}, Pakistan`;
  const mapQuery = encodeURIComponent(`${hall.name}, ${mapAddress}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const facilityMarkup = (hall.facilities || []).map(facility => `<div class="facility"><i data-lucide="check"></i>${facility}</div>`).join('');
  const bookedScheduleMarkup = `<div class="booked-schedule"><div class="booked-schedule-head"><div><div class="eyebrow">Venue calendar</div><strong>Booked dates and timings</strong></div><span>${bookedSlots.length} reserved dates</span></div><p>These dates are unavailable for this venue.</p><div class="booked-schedule-list">${bookedSlots.map(slot => `<div class="booked-slot"><span><i data-lucide="calendar-x-2"></i>${formatDate(slot.date)}</span><strong>${formatTime(slot.start)} - ${formatTime(slot.end)}</strong></div>`).join('')}</div></div>`;
  const reviewMarkup = reviews.map(review => `<article class="review-card"><div class="review-top"><div class="avatar">${review.initials}</div><div><strong>${review.name}</strong><small>${hall.city} · ${review.event}</small></div></div><blockquote>“${review.text}”</blockquote><div class="review-footer"><span class="rating"><i data-lucide="star"></i>${review.rating}</span><span>${review.date}</span></div></article>`).join('');

  qs('#hallDetails').innerHTML = `<div style="padding:36px 0 0"><div class="breadcrumbs"><a href="../../index.html">Home</a><span>·</span><a href="../find-hall/find-hall.html">Find a Hall</a><span>·</span><span>${hall.name}</span></div><div class="gallery">${gallery.slice(0, 4).map((src, index) => `<img class="${index === 0 ? 'gallery-main' : ''}" src="${src}" alt="${hall.name} gallery image ${index + 1}" data-gallery-index="${index}">`).join('')}</div><button class="btn btn-ghost btn-sm gallery-view-all" id="viewAllPhotos"><i data-lucide="images"></i> View all photos <span class="photo-count">(${gallery.length})</span></button><div class="hall-layout"><div><div class="hall-header"><div><div class="eyebrow">${hall.verified ? 'Verified venue' : 'Featured venue'} · ${hall.type}</div><h1>${hall.name}</h1><p><i data-lucide="map-pin"></i> ${hall.area}</p><div style="margin-top:12px;display:flex;gap:15px;align-items:center"><span class="rating"><i data-lucide="star"></i>${hall.rating}</span><span class="muted" style="font-size:.8rem">${hall.reviewCount || hall.reviews} reviews</span></div></div><div class="hall-actions"><button class="icon-btn" id="saveHall" aria-label="Save hall"><i data-lucide="heart"></i></button><button class="icon-btn" id="shareHall" aria-label="Share hall"><i data-lucide="share-2"></i></button></div></div><section class="detail-section"><h2>About the venue</h2><p>${hall.description}</p><div class="spec-grid" style="margin-top:24px"><div class="spec"><i data-lucide="users"></i><strong>${hall.capacityMax || hall.capacity} guests</strong><span>Maximum capacity</span></div><div class="spec"><i data-lucide="users-round"></i><strong>${hall.capacityMin || hall.minGuests} guests</strong><span>Minimum capacity</span></div><div class="spec"><i data-lucide="ruler"></i><strong>${hall.eventArea}</strong><span>Event area</span></div><div class="spec"><i data-lucide="snowflake"></i><strong>${hall.ac ? 'Fully air-conditioned' : 'Open-air setting'}</strong><span>Comfort & atmosphere</span></div><div class="spec"><i data-lucide="car-front"></i><strong>${hall.parking ? 'On-site parking' : 'Street parking'}</strong><span>Guest arrival</span></div><div class="spec"><i data-lucide="accessibility"></i><strong>Accessible arrival</strong><span>Guest comfort</span></div></div></section><section class="detail-section"><h2>Facilities</h2><div class="facility-grid">${facilityMarkup}</div></section><section class="detail-section package-intro"><div><div class="eyebrow">The HallHub difference</div><h2>Make the space yours.</h2><p>After choosing your date and guest count, select a catering package and a decoration direction. The invoice updates live before you reach payment.</p></div><a class="btn btn-primary" href="../booking/booking.html"><i data-lucide="sparkles"></i> Customize your package</a></section><section class="detail-section"><h2>Location</h2><p>${mapAddress}</p><div class="map-card"><div class="map-card-head"><div><strong>${hall.name}</strong><p>Exact venue location in Google Maps</p></div><a class="btn btn-ghost btn-sm" href="${mapsUrl}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> Open in Google Maps</a></div><div class="map-frame"><iframe title="${hall.name} location on Google Maps" src="https://www.google.com/maps?q=${mapQuery}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div></section><section class="detail-section"><div style="display:flex;justify-content:space-between;align-items:end;gap:15px"><div><h2 style="margin-bottom:5px">Guest reviews</h2><p style="margin:0">What recent celebrations felt like here.</p></div><button class="btn btn-ghost btn-sm" data-toast="Review form coming soon — thanks for helping HallHub grow.">Write a review</button></div><div class="review-overview"><strong>${hall.rating}</strong><div><div class="rating"><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i></div><span class="muted">Based on ${hall.reviewCount || hall.reviews} verified reviews</span></div></div><div class="grid">${reviewMarkup}</div></section></div><aside><div class="booking-card"><div class="eyebrow">Make it yours</div><h3>Book this hall</h3><div class="booking-price">${money(hall.price)} <small>/ guest</small></div><div class="field"><label for="detailDate">Event date</label><input class="field-control" id="detailDate" type="date"></div><div class="field"><label for="detailGuests">Number of guests</label><input class="field-control" id="detailGuests" type="number" min="${hall.minGuests}" max="${hall.capacity}" value="${Math.min(500, hall.capacity)}"></div><div class="availability" id="availabilityNote">Choose a date to check availability</div>${bookedScheduleMarkup}<button class="btn btn-primary" id="bookHall">Continue to booking <i data-lucide="arrow-right"></i></button><p style="margin:14px 0 0;text-align:center;color:var(--muted);font-size:.7rem">Catering and decoration are selected on the next steps.</p></div></aside></div></div>`;

  window.lucide?.createIcons();
  qsa('[data-toast]').forEach(element => element.addEventListener('click', () => showToast(element.dataset.toast)));

  function updateAvailability() {
    const date = qs('#detailDate').value;
    const note = qs('#availabilityNote');
    const slots = bookedSlots.filter(slot => slot.date === date);
    if (!date) {
      note.className = 'availability';
      note.textContent = 'Choose a date to check availability';
      return;
    }
    const available = isAvailable(hall, date);
    note.className = `availability ${available ? '' : 'unavailable-note'}`;
    note.innerHTML = available ? 'Available for your date' : `This date is booked: ${slots.map(slot => `${formatTime(slot.start)} - ${formatTime(slot.end)}`).join(', ')}`;
  }

  let lightboxIndex = 0;
  const lightbox = qs('#lightbox');
  const renderLightboxImage = index => {
    lightboxIndex = (index + gallery.length) % gallery.length;
    qs('#lightboxImage').src = gallery[lightboxIndex];
    qs('#lightboxImage').alt = `${hall.name} gallery photo ${lightboxIndex + 1}`;
    qs('#lightboxCount').textContent = `${lightboxIndex + 1} / ${gallery.length}`;
  };
  const openLightbox = index => { renderLightboxImage(index); lightbox.classList.add('open'); };
  const closeLightbox = () => lightbox.classList.remove('open');

  qs('#detailDate').addEventListener('change', updateAvailability);
  qs('#bookHall').addEventListener('click', () => {
    const date = qs('#detailDate').value;
    const guests = Number(qs('#detailGuests').value || 0);
    if (!date) { showToast('Please choose your event date first.'); return; }
    if (!isAvailable(hall, date)) { showToast('Please choose an available date for this venue.'); return; }
    if (guests < hall.minGuests || guests > hall.capacity) { showToast(`This venue accommodates ${hall.minGuests}-${hall.capacity} guests.`); return; }
    HallHub.setData('hallhubBooking', { hallId: hall.id, date, guests, cateringId: '', decorationId: '', extras: [] });
    location.href = '../booking/booking.html';
  });
  qs('#shareHall').addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); showToast('Hall link copied to clipboard.'); } catch { showToast('Copy this page link to share it.'); } });
  qs('#saveHall').addEventListener('click', () => { const ids = HallHub.getData('hallhubFavorites', []); const next = ids.includes(hall.id) ? ids.filter(id => id !== hall.id) : [...ids, hall.id]; HallHub.setData('hallhubFavorites', next); qs('#saveHall').classList.toggle('saved', next.includes(hall.id)); showToast(next.includes(hall.id) ? 'Saved to your favourites.' : 'Removed from your favourites.'); });
  qsa('[data-gallery-index]').forEach(image => image.addEventListener('click', () => openLightbox(Number(image.dataset.galleryIndex))));
  qs('#viewAllPhotos').addEventListener('click', () => openLightbox(0));
  qs('#prevPhoto').addEventListener('click', () => renderLightboxImage(lightboxIndex - 1));
  qs('#nextPhoto').addEventListener('click', () => renderLightboxImage(lightboxIndex + 1));
  qs('#closeLightbox').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') renderLightboxImage(lightboxIndex - 1);
    if (event.key === 'ArrowRight') renderLightboxImage(lightboxIndex + 1);
  });
});
