document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#adminLogin')?.addEventListener('submit', event => {
    event.preventDefault();
    localStorage.setItem('hallhubAdmin', 'true');
    location.href = '../dashboard/dashboard.html';
  });

  const password = document.querySelector('#adminPassword');
  const toggle = document.querySelector('#toggleAdminPassword');
  toggle?.addEventListener('click', () => {
    const visible = password.type === 'text';
    password.type = visible ? 'password' : 'text';
    toggle.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
    toggle.setAttribute('aria-pressed', String(!visible));
    toggle.innerHTML = `<i data-lucide="${visible ? 'eye' : 'eye-off'}"></i>`;
    window.lucide?.createIcons();
  });
});
