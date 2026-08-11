document.addEventListener('DOMContentLoaded', () => {
  const { qs, qsa, getData, setData, getHall, isAvailable, formatDate, formatTime, getBookedSlots, money, showToast } = HallHub;
  const booking = getData('hallhubBooking', {});
  const hall = getHall(booking.hallId || 'royal-pearl');
  if (booking.date && !isAvailable(hall, booking.date)) {
    const slots = getBookedSlots(hall).filter(slot => slot.date === booking.date);
    showToast(`${formatDate(booking.date)} is already booked from ${slots.map(slot => `${formatTime(slot.start)} to ${formatTime(slot.end)}`).join(', ')}.`);
    setTimeout(() => { location.href = '../booking/booking.html'; }, 500);
    return;
  }
  const catering = CATERING.find(item => item.id === booking.cateringId);
  const decoration = DECORATION.find(item => item.id === booking.decorationId);
  const guests = Number(booking.guests || 500);
  const venueTotal = hall.price * guests;
  const cateringTotal = catering ? catering.price * guests : 0;
  const decorationTotal = decoration?.price || 0;
  const additionalTotal = EXTRAS.filter(item => (booking.extras || []).includes(item.id)).reduce((sum, item) => sum + item.price, 0);
  const subtotal = venueTotal + cateringTotal + decorationTotal + additionalTotal;
  const serviceFee = Math.round(subtotal * .04);
  const grandTotal = subtotal + serviceFee;
  qs('#paymentSummary').innerHTML = `<h3>Your booking</h3><div class="summary-hall"><img src="${hall.image}" alt="${hall.name}"><div><strong>${hall.name}</strong><small>${hall.area}</small></div></div><div class="summary-item"><span>Event date</span><strong>${booking.date || 'To be confirmed'}</strong></div><div class="summary-item"><span>Guests</span><strong>${guests.toLocaleString()}</strong></div><div class="summary-item"><span>Venue</span><strong>${money(venueTotal)}</strong></div><div class="summary-item"><span>${catering?.name || 'Catering'} package</span><strong>${money(cateringTotal)}</strong></div><div class="summary-item"><span>${decoration?.name || 'Decoration'} package</span><strong>${money(decorationTotal)}</strong></div><div class="summary-item"><span>Additional services</span><strong>${additionalTotal ? money(additionalTotal) : 'None'}</strong></div><div class="summary-item"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-item"><span>Service fee</span><strong>${money(serviceFee)}</strong></div><div class="summary-total"><span>Total</span><strong>${money(grandTotal)}</strong></div>`;
  qsa('.payment-method').forEach(method => method.addEventListener('click', () => { qsa('.payment-method').forEach(item => item.classList.remove('active')); method.classList.add('active'); qs('#cardForm').style.display = method.querySelector('input').value === 'card' ? 'block' : 'none'; }));
  qsa('.card-brand').forEach(brand => brand.addEventListener('click', () => { qsa('.card-brand').forEach(item => item.classList.remove('active')); brand.classList.add('active'); }));
  qs('#payNow').addEventListener('click', () => { qs('#processing').classList.add('open'); window.lucide?.createIcons(); setTimeout(() => { const confirmation = { ...booking, bookingId: `HH-2026-${String(Math.floor(10000 + Math.random() * 89999))}`, hallName: hall.name, cateringName: catering?.name || 'Not selected', decorationName: decoration?.name || 'Not selected', additionalTotal, subtotal, serviceFee, total: grandTotal, paymentStatus: 'Paid', bookingStatus: 'Confirmed' }; setData('hallhubConfirmation', confirmation); location.href = '../confirmation/confirmation.html'; }, 1500); });
  window.lucide?.createIcons();
});
