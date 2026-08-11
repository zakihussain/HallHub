document.addEventListener('DOMContentLoaded', () => {
  const { qs, getData, getHall, money, prefix } = HallHub;
  const booking = getData('hallhubConfirmation', {});
  const hall = getHall(booking.hallId || 'royal-pearl') || HALLS[0];
  const guests = Number(booking.guests || 500);
  const catering = CATERING.find(item => item.id === booking.cateringId || item.name === booking.cateringName) || CATERING.find(item => item.id === 'gold');
  const decoration = DECORATION.find(item => item.id === booking.decorationId || item.name === booking.decorationName) || DECORATION.find(item => item.id === 'premium');
  const extras = EXTRAS.filter(item => (booking.extras || []).includes(item.id));
  const venueTotal = hall.price * guests;
  const cateringTotal = catering ? catering.price * guests : 0;
  const decorationTotal = decoration?.price || 0;
  const additionalTotal = Number.isFinite(Number(booking.additionalTotal)) ? Number(booking.additionalTotal) : extras.reduce((sum, item) => sum + item.price, 0);
  const subtotal = Number.isFinite(Number(booking.subtotal)) ? Number(booking.subtotal) : venueTotal + cateringTotal + decorationTotal + additionalTotal;
  const serviceFee = Number.isFinite(Number(booking.serviceFee)) ? Number(booking.serviceFee) : Math.round(subtotal * .04);
  const total = Number.isFinite(Number(booking.total)) ? Number(booking.total) : subtotal + serviceFee;
  const bookingId = booking.bookingId || 'HH-2026-00482';
  const bookingDate = booking.date || '15 Dec 2026';
  const hallName = booking.hallName || hall.name || 'Royal Pearl Banquet';
  const cateringName = booking.cateringName || catering?.name || 'Gold';
  const decorationName = booking.decorationName || decoration?.name || 'Premium';

  qs('#confirmationPanel').innerHTML = `<div class="success-icon"><i data-lucide="check"></i></div><div class="eyebrow">Thank you for trusting HallHub</div><h1>Booking confirmed!</h1><p>Your celebration is officially on its way. We’ve saved the details below for your records.</p><span class="confirmation-id">Booking ID · ${bookingId}</span><div class="confirmation-details"><div class="confirmation-detail"><span>Hall</span><strong>${hallName}</strong></div><div class="confirmation-detail"><span>Event date</span><strong>${bookingDate}</strong></div><div class="confirmation-detail"><span>Guest count</span><strong>${guests.toLocaleString()} guests</strong></div><div class="confirmation-detail"><span>Catering</span><strong>${cateringName} package</strong></div><div class="confirmation-detail"><span>Decoration</span><strong>${decorationName} package</strong></div><div class="confirmation-detail"><span>Total paid</span><strong>${money(total)}</strong></div><div class="confirmation-detail"><span>Payment status</span><strong style="color:var(--success)">${booking.paymentStatus || 'Paid'}</strong></div><div class="confirmation-detail"><span>Booking status</span><strong style="color:var(--success)">${booking.bookingStatus || 'Confirmed'}</strong></div></div><div class="success-actions"><button class="btn btn-primary" id="downloadReceipt"><i data-lucide="download"></i> Download PDF receipt</button><a class="btn btn-ghost" href="${prefix}index.html">Return home</a><a class="btn btn-ghost" href="${prefix}pages/contact/contact.html">Contact HallHub</a></div>`;

  qs('#downloadReceipt').addEventListener('click', () => downloadReceiptPdf({ booking, hallName, hall, guests, bookingId, bookingDate, catering, cateringName, decoration, decorationName, extras, venueTotal, cateringTotal, decorationTotal, additionalTotal, subtotal, serviceFee, total }));
  window.lucide?.createIcons();
});

function pdfSafe(value) {
  return String(value ?? '').normalize('NFKD').replace(/[^\x20-\x7E]/g, '-');
}

function pdfEscape(value) {
  return pdfSafe(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function pdfText(value, x, y, size = 10, font = 'F1', color = '0.16 0.14 0.13') {
  return `BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${pdfEscape(value)}) Tj ET`;
}

function pdfRightText(value, right, y, size = 10, font = 'F1', color = '0.16 0.14 0.13') {
  const width = pdfSafe(value).length * size * .49;
  return pdfText(value, Math.max(40, right - width), y, size, font, color);
}

function pdfRect(x, y, width, height, fill, stroke = null, lineWidth = 1) {
  const commands = [];
  if (fill) commands.push(`${fill} rg ${x} ${y} ${width} ${height} re f`);
  if (stroke) commands.push(`${stroke} RG ${lineWidth} w ${x} ${y} ${width} ${height} re S`);
  return commands.join('\n');
}

function pdfLine(x1, y1, x2, y2, color = '0.90 0.87 0.83', lineWidth = 1) {
  return `${color} RG ${lineWidth} w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function receiptMoney(value) {
  return HallHub.money(value);
}

function buildReceiptPdf(data) {
  const maroon = '0.35 0.09 0.15';
  const gold = '0.79 0.64 0.29';
  const muted = '0.46 0.42 0.40';
  const soft = '0.98 0.96 0.93';
  const content = [];
  const rows = [
    ['Venue booking', `${data.guests.toLocaleString()} guests`, receiptMoney(data.hall.price), data.venueTotal],
    [`Catering - ${data.cateringName}`, `${data.guests.toLocaleString()} guests`, receiptMoney(data.catering?.price || 0), data.cateringTotal],
    [`Decoration - ${data.decorationName}`, '1 package', receiptMoney(data.decorationTotal), data.decorationTotal],
    ...data.extras.map(item => [item.name, '1 service', receiptMoney(item.price), item.price])
  ];
  if (!data.extras.length) rows.push(['Additional services', 'None', '-', 0]);

  content.push('q');
  content.push(pdfRect(0, 0, 595, 842, '1 1 1'));
  content.push(pdfRect(46, 758, 38, 38, maroon));
  content.push(pdfText('H', 58, 770, 20, 'F2', '0.79 0.64 0.29'));
  content.push(pdfText('HALLHUB', 96, 786, 22, 'F2', maroon));
  content.push(pdfText('YOUR DAY. YOUR HALL. YOUR WAY.', 97, 772, 7, 'F2', muted));
  content.push(pdfRightText('RECEIPT', 549, 786, 18, 'F2', maroon));
  content.push(pdfRightText(`Issued ${new Date().toLocaleDateString('en-GB')}`, 549, 770, 8, 'F1', muted));
  content.push(pdfLine(46, 744, 549, 744, gold, 1.4));

  content.push(pdfText('Booking receipt', 46, 708, 22, 'F2', maroon));
  content.push(pdfText('Thank you for choosing HallHub for your celebration.', 46, 688, 10, 'F1', muted));
  content.push(pdfText('BOOKING ID', 46, 650, 8, 'F2', gold));
  content.push(pdfText(data.bookingId, 46, 634, 11, 'F2', maroon));
  content.push(pdfText('EVENT DATE', 220, 650, 8, 'F2', gold));
  content.push(pdfText(data.bookingDate, 220, 634, 11, 'F2', maroon));
  content.push(pdfText('GUESTS', 390, 650, 8, 'F2', gold));
  content.push(pdfText(`${data.guests.toLocaleString()} guests`, 390, 634, 11, 'F2', maroon));
  content.push(pdfLine(46, 612, 549, 612));
  content.push(pdfText('VENUE', 46, 592, 8, 'F2', gold));
  content.push(pdfText(data.hallName, 46, 575, 12, 'F2'));
  content.push(pdfText(data.hall.area || '', 46, 559, 9, 'F1', muted));
  content.push(pdfRightText(`Payment status: ${data.booking.paymentStatus || 'Paid'}`, 549, 575, 9, 'F2', '0.17 0.48 0.36'));
  content.push(pdfRightText(`Booking status: ${data.booking.bookingStatus || 'Confirmed'}`, 549, 559, 9, 'F1', muted));

  const tableTop = 520;
  content.push(pdfRect(46, tableTop - 28, 503, 28, soft));
  content.push(pdfText('DESCRIPTION', 58, tableTop - 18, 8, 'F2', maroon));
  content.push(pdfText('QTY', 330, tableTop - 18, 8, 'F2', maroon));
  content.push(pdfText('RATE', 390, tableTop - 18, 8, 'F2', maroon));
  content.push(pdfRightText('AMOUNT', 537, tableTop - 18, 8, 'F2', maroon));

  let rowY = tableTop - 58;
  rows.forEach(([description, quantity, rate, amount]) => {
    content.push(pdfText(description, 58, rowY, 9, 'F1'));
    content.push(pdfText(quantity, 330, rowY, 8, 'F1', muted));
    content.push(pdfText(rate, 390, rowY, 8, 'F1', muted));
    content.push(pdfRightText(receiptMoney(amount), 537, rowY, 9, 'F2', maroon));
    content.push(pdfLine(46, rowY - 14, 549, rowY - 14));
    rowY -= 30;
  });

  const summaryY = rowY - 10;
  content.push(pdfText('Subtotal', 350, summaryY, 9, 'F1', muted));
  content.push(pdfRightText(receiptMoney(data.subtotal), 537, summaryY, 9, 'F2', maroon));
  content.push(pdfText('Service fee', 350, summaryY - 22, 9, 'F1', muted));
  content.push(pdfRightText(receiptMoney(data.serviceFee), 537, summaryY - 22, 9, 'F2', maroon));
  content.push(pdfRect(330, summaryY - 66, 219, 30, '0.99 0.98 0.94', maroon, .8));
  content.push(pdfText('TOTAL PAID', 344, summaryY - 54, 9, 'F2', maroon));
  content.push(pdfRightText(receiptMoney(data.total), 537, summaryY - 54, 13, 'F2', maroon));
  content.push(pdfLine(46, 92, 549, 92, gold, 1));
  content.push(pdfText('HallHub', 46, 70, 9, 'F2', maroon));
  content.push(pdfText('This receipt confirms a demo booking. No real payment has been charged.', 95, 70, 8, 'F1', muted));
  content.push(pdfRightText('hallhub.pk', 549, 70, 8, 'F2', maroon));
  content.push('Q');

  const stream = content.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
  ];
  let pdf = '%PDF-1.4\n%HallHub\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets[index + 1] = pdf.length; pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function downloadReceiptPdf(data) {
  const blob = new Blob([buildReceiptPdf(data)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hallhub-${data.bookingId || 'receipt'}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
