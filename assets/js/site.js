(() => {
  'use strict';

  const MAIL = 'theilluminaughtystore@gmail.com';
  const defaultSubject = document.body.dataset.emailSubject || 'RE: Illuminaughty®';

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
    await Promise.all([
      injectShell('#site-header', '/shell/header.html'),
      injectShell('#site-footer', '/shell/footer.html')
    ]);
    applyEmailSubjects();
  }

  init();
})();
