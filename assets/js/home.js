(() => {
  'use strict';
  const API = 'https://script.google.com/macros/s/AKfycbyxRmCCI8oBUcRClGjbV9tL9uPNzd5E3TJWK49GVrKLC_qdbJ4sxlnMlu30b10_-wwk/exec';

  const track = document.querySelector('.hero-track');
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.hero-dot')];
  const prev = document.querySelector('.hero-control.prev');
  const next = document.querySelector('.hero-control.next');
  let index = 0;
  let timer = null;
  let touchStartX = null;

  function show(nextIndex) {
    if (!slides.length) return;
    index = (nextIndex + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.setAttribute('aria-current', i === index ? 'true' : 'false'));
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(index + 1), 6500);
  }

  prev?.addEventListener('click', () => { show(index - 1); restart(); });
  next?.addEventListener('click', () => { show(index + 1); restart(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restart(); }));

  track?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track?.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 48) show(index + (dx < 0 ? 1 : -1));
    touchStartX = null;
    restart();
  }, { passive: true });

  document.querySelector('.hero')?.addEventListener('mouseenter', () => clearInterval(timer));
  document.querySelector('.hero')?.addEventListener('mouseleave', restart);
  show(0);
  restart();

  const form = document.querySelector('#signup-form');
  const message = document.querySelector('#signup-message');

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    message.textContent = 'Signing you up…';

    const data = new FormData(form);
    const payload = {
      action: 'signup',
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      marketing_consent: data.get('marketing_consent') === 'on'
    };

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || 'Unable to sign up.');
      form.reset();
      message.textContent = 'You’re on the Naughty List. Check your email for a welcome message.';
    } catch (error) {
      console.error(error);
      message.textContent = 'We could not complete your signup right now. Please try again.';
    }
  });
})();
