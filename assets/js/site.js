(() => {
  'use strict';

  const MAIL = 'theilluminaughtystore@gmail.com';
  const defaultSubject = document.body.dataset.emailSubject || 'RE: Illuminaughty®';

  function ensureFavicons() {
    const definitions = [
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', href: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { rel: 'icon', href: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { rel: 'icon', href: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { rel: 'icon', href: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
      { rel: 'manifest', href: '/site.webmanifest' }
    ];

    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="manifest"]').forEach(link => link.remove());

    definitions.forEach(def => {
      const link = document.createElement('link');
      Object.entries(def).forEach(([key, value]) => link.setAttribute(key, value));
      document.head.appendChild(link);
    });
  }



  const AGE_GATE_KEY = 'illuminaughty_age_gate';
  const AGE_GATE_DAYS = 30;

  function ageGateIsValid() {
    try {
      const saved = JSON.parse(localStorage.getItem(AGE_GATE_KEY) || 'null');
      return !!(saved && saved.verified === true && Number(saved.expiresAt) > Date.now());
    } catch (_) {
      return false;
    }
  }

  function isAtLeast18(year, month, day) {
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;

    const dob = new Date(y, m - 1, d);
    if (dob.getFullYear() !== y || dob.getMonth() !== m - 1 || dob.getDate() !== d) return false;

    const today = new Date();
    let age = today.getFullYear() - y;
    const birthdayPassed =
      today.getMonth() > (m - 1) ||
      (today.getMonth() === (m - 1) && today.getDate() >= d);
    if (!birthdayPassed) age -= 1;
    return age >= 18;
  }

  function showAgeGate() {
    if (ageGateIsValid()) return;

    document.documentElement.classList.add('age-gate-active');

    const overlay = document.createElement('div');
    overlay.className = 'age-gate';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'age-gate-title');
    overlay.innerHTML = `
      <div class="age-gate__panel">
        <img class="age-gate__logo" src="/IlluminaughtyLogo.webp" alt="Illuminaughty® Store">
        <h1 id="age-gate-title">Adults Only — 18+</h1>
        <p>This website contains adult-oriented products and is intended only for persons 18 years of age or older.</p>

        <form class="age-gate__form" novalidate>
          <fieldset class="age-gate__dob">
            <legend>Date of Birth</legend>
            <label>
              <span>Month</span>
              <select name="month" required aria-label="Birth month">
                <option value="">MM</option>
                ${Array.from({length:12}, (_, i) => `<option value="${i+1}">${String(i+1).padStart(2,'0')}</option>`).join('')}
              </select>
            </label>
            <label>
              <span>Day</span>
              <select name="day" required aria-label="Birth day">
                <option value="">DD</option>
                ${Array.from({length:31}, (_, i) => `<option value="${i+1}">${String(i+1).padStart(2,'0')}</option>`).join('')}
              </select>
            </label>
            <label>
              <span>Year</span>
              <input name="year" type="number" inputmode="numeric" min="1900" max="9999" placeholder="YYYY" required aria-label="Birth year">
            </label>
          </fieldset>

          <label class="age-gate__certify">
            <input name="certify" type="checkbox" required>
            <span>I certify, under penalties for perjury, that the date of birth entered above is true and correct and that I am at least 18 years of age.</span>
          </label>

          <button class="age-gate__enter" type="submit">Enter Site</button>
          <p class="age-gate__message" role="alert" aria-live="polite"></p>
        </form>
      </div>`;

    document.body.appendChild(overlay);

    const form = overlay.querySelector('.age-gate__form');
    const message = overlay.querySelector('.age-gate__message');
    const firstField = overlay.querySelector('select[name="month"]');
    if (firstField) firstField.focus();

    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      const month = data.get('month');
      const day = data.get('day');
      const year = data.get('year');
      const certified = data.get('certify') === 'on';

      if (!month || !day || !year || !certified) {
        message.textContent = 'Please enter your date of birth and complete the certification.';
        return;
      }

      if (!isAtLeast18(year, month, day)) {
        message.textContent = 'Access denied. You must be at least 18 years of age to enter this website.';
        form.querySelector('.age-gate__enter').disabled = true;
        form.querySelectorAll('select, input').forEach(el => { el.disabled = true; });
        return;
      }

      try {
        localStorage.setItem(AGE_GATE_KEY, JSON.stringify({
          verified: true,
          expiresAt: Date.now() + AGE_GATE_DAYS * 24 * 60 * 60 * 1000
        }));
      } catch (_) {}

      overlay.remove();
      document.documentElement.classList.remove('age-gate-active');
    });
  }

  async function injectShell(selector, path) {
    const target = document.querySelector(selector);
    if (!target) return;
    try {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Unable to load ${path}`);
      target.innerHTML = await response.text();
    } catch (error) {
      console.error(error);
      return;
    }
  }

  function applyEmailSubjects() {
    document.querySelectorAll('.footer-email, .legal-email').forEach(link => {
      const subject = link.dataset.subject || defaultSubject;
      link.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}`;
    });
  }

  async function init() {
    ensureFavicons();
    showAgeGate();
    await Promise.all([
      injectShell('#site-header', '/shell/header.html'),
      injectShell('#site-footer', '/shell/footer.html')
    ]);
    applyEmailSubjects();
  }

  init();
})();
