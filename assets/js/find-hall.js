document.addEventListener('DOMContentLoaded', () => {
  const { qs, qsa, hallCard, bindFavorites, isAvailable } = HallHub;
  const params = new URLSearchParams(location.search);
  const panel = qs('#filterPanel');
  const marketplace = qs('#marketplace');
  const results = qs('#hallResults');
  const openFiltersButton = qs('#openFilters');

  const setFiltersOpen = open => {
    panel.classList.toggle('open', open);
    panel.classList.toggle('filter-panel-closed', !open);
    marketplace.classList.toggle('filters-closed', !open);
    openFiltersButton.setAttribute('aria-expanded', String(open));
  };

  const capacityBounds = value => {
    if (!value) return { min: 0, max: Infinity };
    if (value === '300') return { min: 100, max: 300 };
    if (value === '500') return { min: 300, max: 500 };
    if (value === '1000') return { min: 500, max: 1000 };
    return { min: 1000, max: Infinity };
  };

  const budgetBounds = value => {
    if (!value) return { min: 0, max: Infinity };
    const [min, max] = value.split('-').map(Number);
    return { min: min || 0, max: max || Infinity };
  };

  const matchesType = (hall, type) => {
    if (!type) return true;
    const normalized = String(hall.type || '').toLowerCase();
    if (type === 'Indoor') return !hall.outdoor;
    if (type === 'Outdoor') return Boolean(hall.outdoor);
    if (type === 'Indoor & Outdoor') return Boolean(hall.outdoor) || normalized.includes('hotel');
    if (type === 'Banquet') return normalized.includes('banquet') || normalized.includes('ballroom') || normalized.includes('wedding venue');
    if (type === 'Marquee') return normalized.includes('marquee');
    if (type === 'Ballroom') return normalized.includes('ballroom');
    if (type === 'Lawn') return normalized.includes('lawn') || normalized.includes('outdoor');
    return normalized === type.toLowerCase();
  };

  const readFilters = () => {
    const capacity = capacityBounds(qs('#guestCapacity').value);
    const budget = budgetBounds(qs('#budgetRange').value);
    return {
      city: qs('#filterCity').value,
      event: qs('#filterEvent').value,
      type: qs('#filterType').value,
      rating: Number(qs('#filterRating').value || 0),
      minPrice: budget.min,
      maxPrice: budget.max,
      minGuests: capacity.min,
      maxGuests: capacity.max,
      date: qs('#eventDate').value,
      facilities: qsa('[data-facility]:checked').map(input => input.value)
    };
  };

  let appliedFilters = readFilters();

  function renderResults() {
    const filters = appliedFilters;
    const exactMatches = HALLS.filter(hall => (
      (!filters.city || hall.city === filters.city) &&
      matchesType(hall, filters.type) &&
      hall.rating >= filters.rating &&
      hall.price >= filters.minPrice && hall.price <= filters.maxPrice &&
      hall.capacity >= filters.minGuests && hall.minGuests <= filters.maxGuests &&
      filters.facilities.every(facility => hall.facilities.includes(facility))
    ));

    let list = exactMatches;
    const notice = qs('#filterNotice');
    notice.hidden = true;
    if (!list.length) {
      const cityCandidates = filters.city ? HALLS.filter(hall => hall.city === filters.city) : HALLS;
      const candidates = cityCandidates.length ? cityCandidates : HALLS;
      const scored = candidates.map(hall => {
        let score = 0;
        if (matchesType(hall, filters.type)) score += 5;
        if (hall.rating >= filters.rating) score += 3;
        if (hall.price >= filters.minPrice && hall.price <= filters.maxPrice) score += 3;
        if (hall.capacity >= filters.minGuests && hall.minGuests <= filters.maxGuests) score += 3;
        score += filters.facilities.filter(facility => hall.facilities.includes(facility)).length;
        return { hall, score };
      }).sort((a, b) => b.score - a.score || b.hall.rating - a.hall.rating);
      list = scored.slice(0, 1).map(({ hall }) => hall);
      if (list.length) {
        notice.textContent = 'No exact match for every selected preference, so we are showing the closest available venue.';
        notice.hidden = false;
      }
    }

    list = list.map(hall => ({ ...hall, _selectedDate: filters.date, _dateAvailable: isAvailable(hall, filters.date) }));

    const sort = qs('#sortBy').value;
    if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sort === 'capacity') list.sort((a, b) => b.capacity - a.capacity);

    qs('#resultCount').textContent = `${list.length} venue${list.length === 1 ? '' : 's'} found`;
    qs('#noResults').style.display = list.length ? 'none' : 'block';
    results.style.display = list.length ? 'grid' : 'none';
    results.innerHTML = list.map(hallCard).join('');
    bindFavorites();
    window.lucide?.createIcons();
  }

  const requestedCity = params.get('city');
  if (requestedCity && [...qs('#filterCity').options].some(option => option.value === requestedCity)) qs('#filterCity').value = requestedCity;
  const requestedEvent = params.get('event');
  if (requestedEvent && [...qs('#filterEvent').options].some(option => option.value === requestedEvent)) qs('#filterEvent').value = requestedEvent;
  if (params.get('capacity') && [...qs('#guestCapacity').options].some(option => option.value === params.get('capacity'))) {
    qs('#guestCapacity').value = params.get('capacity');
  } else if (params.get('guests')) {
    const guests = Number(params.get('guests'));
    qs('#guestCapacity').value = guests >= 1000 ? '1500' : guests >= 500 ? '1000' : guests >= 300 ? '500' : guests >= 100 ? '300' : '';
  }
  if (params.get('budget') && [...qs('#budgetRange').options].some(option => option.value === params.get('budget'))) {
    qs('#budgetRange').value = params.get('budget');
  } else if (params.get('maxPrice')) {
    const maxPrice = Number(params.get('maxPrice'));
    qs('#budgetRange').value = maxPrice <= 3000 ? '0-3000' : maxPrice <= 4000 ? '3000-4000' : maxPrice <= 5000 ? '4000-5000' : '5000-999999';
  }

  qs('#applyFilters').addEventListener('click', () => {
    appliedFilters = readFilters();
    renderResults();
    setFiltersOpen(false);
  });
  qs('#resetFilters').addEventListener('click', () => {
    qs('#filterCity').selectedIndex = 0;
    qs('#filterEvent').selectedIndex = 0;
    qs('#guestCapacity').selectedIndex = 0;
    qs('#budgetRange').selectedIndex = 0;
    qs('#filterType').selectedIndex = 0;
    qs('#filterRating').selectedIndex = 0;
    qs('#eventDate').value = '';
    qsa('[data-facility]').forEach(input => { input.checked = false; });
    appliedFilters = readFilters();
    renderResults();
    setFiltersOpen(true);
  });
  qs('#sortBy').addEventListener('change', renderResults);
  openFiltersButton.addEventListener('click', () => setFiltersOpen(true));
  qs('#closeFilters').addEventListener('click', () => { setFiltersOpen(false); openFiltersButton.focus(); });

  setFiltersOpen(true);
  renderResults();
});
