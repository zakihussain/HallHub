document.addEventListener('DOMContentLoaded', () => {
  const { qs, qsa, hallCard, bindFavorites, prefix } = HallHub;
  const featured = qs('#featuredHalls');
  if (featured) { featured.innerHTML = HALLS.slice(0, 6).map(hallCard).join(''); bindFavorites(); window.lucide?.createIcons(); }
  const services = qs('#services');
  qsa('#services .service-card img').forEach((image, index) => {
    image.src = [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=900&q=85'
    ][index];
  });
  if (services) services.insertAdjacentHTML('afterend', `<section class="section about-preview" id="homeAbout"><div class="container"><div class="about-preview-grid"><div><div class="eyebrow">About Us</div><h2>Built for the moments that become family stories.</h2><p>HallHub was founded by Zain and Talha after seeing how much time families lose coordinating a hall, a menu and a decoration team separately. We bring those decisions into one calm, transparent experience.</p><p>Our promise is simple: make the important choices feel easier, the prices feel clearer and the celebration feel completely yours.</p><a class="btn btn-primary" href="pages/about/about.html">Meet the founders <i data-lucide="arrow-up-right"></i></a></div><div class="founder-preview"><div class="founder-card"><div class="founder-avatar founder-avatar-image founder-avatar-zain"><img src="assets/images/founders/zain.jpeg" alt="Zain, HallHub co-founder" loading="lazy"></div><div><span class="eyebrow">Co-founder</span><strong>Zain</strong><p>Product &amp; partnerships</p></div></div><div class="founder-card"><div class="founder-avatar founder-avatar-image founder-avatar-talha"><img src="assets/images/founders/talha.jpeg" alt="Talha, HallHub co-founder" loading="lazy"></div><div><span class="eyebrow">Co-founder</span><strong>Talha</strong><p>Operations &amp; experience</p></div></div></div></div></div></section>`);
  const stats = qs('.stats');
  if (stats) stats.insertAdjacentHTML('beforebegin', `<section class="section owner-reviews"><div class="container"><div class="section-heading owner-reviews-heading"><div class="eyebrow">For venue partners</div><h2>Halls grow when the right families can find them.</h2><p>HallHub helps venue owners turn their availability into qualified enquiries and confirmed celebrations.</p></div><div class="grid grid-3 owner-review-grid"><article class="owner-review-card"><div class="owner-review-top"><div class="owner-review-avatar">NH</div><div><strong>Nadia Hussain</strong><small>Owner · Royal Pearl Banquet, Karachi</small></div></div><blockquote>“Within our first month on HallHub, we received better-matched enquiries and filled dates we usually struggled to promote.”</blockquote><div class="owner-review-result"><i data-lucide="trending-up"></i><span>More qualified enquiries</span></div></article><article class="owner-review-card"><div class="owner-review-top"><div class="owner-review-avatar avatar-sand">FA</div><div><strong>Faisal Ahmed</strong><small>Partner · Noor Garden Marquee, Lahore</small></div></div><blockquote>“Families arrive prepared because they have already seen our packages and availability. That makes every conversation more productive.”</blockquote><div class="owner-review-result"><i data-lucide="calendar-check-2"></i><span>Clearer availability</span></div></article><article class="owner-review-card"><div class="owner-review-top"><div class="owner-review-avatar avatar-sage">MK</div><div><strong>Mariam Khan</strong><small>Owner · Ivory Courtyard, Islamabad</small></div></div><blockquote>“HallHub helped us showcase our weekday dates and reach couples looking for something intimate, not just the biggest ballroom.”</blockquote><div class="owner-review-result"><i data-lucide="users-round"></i><span>New customer segments</span></div></article></div></div></section>`);
  window.lucide?.createIcons();
  qs('#homeSearch')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const location = qs('#homeLocation').value;
    const guests = qs('#homeGuests').value;
    const budget = qs('#homeBudget').value;
    const eventType = qs('#homeEvent').value;
    if (location) params.set('city', location);
    if (guests) params.set('capacity', guests);
    if (budget) params.set('budget', budget);
    if (eventType) params.set('event', eventType);
    window.location.href = `${prefix}pages/find-hall/find-hall.html?${params.toString()}`;
  });
});
