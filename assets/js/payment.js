document.addEventListener('DOMContentLoaded', () => {
  const { qs, qsa, getData, setData, getHall, isAvailable, formatDate, formatTime, getBookedSlots, money, showToast } = HallHub;
  const booking = getData('hallhubBooking', {});
  const hall = getHall(booking.hallId || 'royal-pearl');
  const completeBooking = Boolean(booking.hallId && booking.name && booking.phone && booking.email && booking.eventType && booking.date && booking.guests && booking.start && booking.end && booking.cateringId && booking.decorationId);
  if (!completeBooking) {
    showToast('Please complete all booking details, catering and decoration selections first.');
    setTimeout(() => { location.href = '../booking/booking.html'; }, 700);
    return;
  }
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
  const cardIds = ['cardholder', 'cardNumber', 'expiry', 'cvv', 'billingEmail'];
  const setCardError = (id, message = '') => {
    const input = qs(`#${id}`);
    const field = input?.closest('.field');
    if (!input || !field) return;
    field.classList.toggle('has-error', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    let error = field.querySelector('.field-error');
    if (message && !error) { error = document.createElement('small'); error.className = 'field-error'; field.append(error); }
    if (error) { error.textContent = message; error.hidden = !message; }
  };
  const luhnValid = number => {
    let sum = 0;
    const parity = number.length % 2;
    for (let index = 0; index < number.length; index += 1) {
      let digit = Number(number[index]);
      if (index % 2 === parity) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit;
    }
    return number.length > 0 && sum % 10 === 0;
  };
  const decoratePaymentFields = () => {
    const attributes = {
      cardholder: { autocomplete: 'cc-name' },
      cardNumber: { inputmode: 'numeric', autocomplete: 'cc-number', maxlength: '19' },
      expiry: { inputmode: 'numeric', autocomplete: 'cc-exp', maxlength: '7' },
      cvv: { inputmode: 'numeric', autocomplete: 'cc-csc', maxlength: '3' },
      billingEmail: { autocomplete: 'email' }
    };
    const hints = {
      cardholder: 'Enter the name exactly as shown on the card.',
      cardNumber: 'Format: 16 digits grouped as 1234 5678 9012 3456.',
      expiry: 'Format: MM / YY, for example 08 / 28.',
      cvv: 'Format: 3 digits on the back of the card.',
      billingEmail: 'Format: you@example.com.'
    };
    cardIds.forEach(id => {
      const input = qs(`#${id}`);
      const field = input?.closest('.field');
      if (!input || !field) return;
      input.required = true;
      Object.entries(attributes[id]).forEach(([key, value]) => input.setAttribute(key, value));
      if (!field.querySelector('.field-help')) field.insertAdjacentHTML('beforeend', `<small class="field-help">${hints[id]}</small>`);
    });
  };
  const validateCardForm = () => {
    const method = qs('input[name="payment"]:checked')?.value;
    if (method !== 'card') return true;
    const values = Object.fromEntries(cardIds.map(id => [id, qs(`#${id}`)?.value.trim() || '']));
    const errors = {};
    const cardNumber = values.cardNumber.replace(/\D/g, '');
    const brand = qs('input[name="cardBrand"]:checked')?.value;
    if (values.cardholder.length < 2) errors.cardholder = 'Enter the name shown on the card.';
    if (!/^\d{16}$/.test(cardNumber) || !luhnValid(cardNumber)) errors.cardNumber = 'Enter a valid 16-digit card number, for example 4111 1111 1111 1111.';
    if (brand === 'visa' && !cardNumber.startsWith('4')) errors.cardNumber = 'For Visa, use a card number starting with 4.';
    const mastercardPrefix = Number(cardNumber.slice(0, 4));
    const isMastercardNumber = /^(5[1-5]\d{2})/.test(cardNumber) || (mastercardPrefix >= 2221 && mastercardPrefix <= 2720);
    if (brand === 'mastercard' && !isMastercardNumber) errors.cardNumber = 'For Mastercard, use a number starting with 51-55 or 2221-2720.';
    const expiryMatch = values.expiry.match(/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/);
    if (!expiryMatch) errors.expiry = 'Use MM / YY, for example 08 / 28.';
    else {
      const now = new Date();
      const year = 2000 + Number(expiryMatch[2]);
      const month = Number(expiryMatch[1]);
      if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) errors.expiry = 'Enter a future expiry date.';
    }
    if (!/^\d{3}$/.test(values.cvv)) errors.cvv = 'Enter exactly 3 digits.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.billingEmail)) errors.billingEmail = 'Enter a valid email, for example you@example.com.';
    cardIds.forEach(id => setCardError(id, errors[id] || ''));
    const firstInvalid = cardIds.find(id => errors[id]);
    if (firstInvalid) { qs(`#${firstInvalid}`)?.focus(); showToast('Please correct the highlighted payment fields.'); return false; }
    return true;
  };
  decoratePaymentFields();
  qs('#cardNumber').addEventListener('input', event => { const digits = event.target.value.replace(/\D/g, '').slice(0, 16); event.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 '); setCardError('cardNumber'); });
  qs('#expiry').addEventListener('input', event => { const digits = event.target.value.replace(/\D/g, '').slice(0, 4); event.target.value = digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits; setCardError('expiry'); });
  qs('#cvv').addEventListener('input', event => { event.target.value = event.target.value.replace(/\D/g, '').slice(0, 3); setCardError('cvv'); });
  cardIds.filter(id => !['cardNumber', 'expiry', 'cvv'].includes(id)).forEach(id => qs(`#${id}`)?.addEventListener('input', () => setCardError(id)));
  qs('#payNow').addEventListener('click', event => { if (!validateCardForm()) { event.preventDefault(); event.stopImmediatePropagation(); } });
  qs('#payNow').addEventListener('click', () => { qs('#processing').classList.add('open'); window.lucide?.createIcons(); setTimeout(() => { const confirmation = { ...booking, bookingId: `HH-2026-${String(Math.floor(10000 + Math.random() * 89999))}`, hallName: hall.name, cateringName: catering?.name || 'Not selected', decorationName: decoration?.name || 'Not selected', additionalTotal, subtotal, serviceFee, total: grandTotal, paymentStatus: 'Paid', bookingStatus: 'Confirmed' }; setData('hallhubConfirmation', confirmation); location.href = '../confirmation/confirmation.html'; }, 1500); });
  window.lucide?.createIcons();
});
