/**
 * ARRIBA LABS — ZERO-LAG VANILLA INTERACTION SCRIPT
 * Native 120fps scrolling (no Lenis / no scroll hijacking).
 */

(function () {
  'use strict';

  // 1. Anchor Smooth Navigation (Click-only, never hijacks wheel/trackpad scroll)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
      }
    });
  });

  // 2. Mobile Fullscreen Index Drawer
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileToggle = document.getElementById('mobile-toggle');
  const drawerClose = document.getElementById('drawer-close');

  function closeMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
  }

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
    });
  }
  if (drawerClose) {
    drawerClose.addEventListener('click', closeMobileMenu);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // 3. Paper (Light Default) / Ink (Dark) Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');

  function applyTheme(mode) {
    const isDark = mode === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (themeToggle) {
      themeToggle.textContent = isDark ? 'Paper Mode' : 'Ink Mode';
    }

    // Swap partner SVGs with light/dark variants
    document.querySelectorAll('img[data-partner]').forEach((img) => {
      const p = img.getAttribute('data-partner');
      if (p === 'meta') img.src = isDark ? 'logos/partners/meta.svg' : 'logos/partners/meta-light.svg';
      if (p === '3bf') img.src = isDark ? 'logos/partners/3bf.svg' : 'logos/partners/3bf-light.svg';
      if (p === 'krafting') img.src = isDark ? 'logos/partners/krafting-networks.svg' : 'logos/partners/krafting-networks-light.svg';
    });

    // Swap client logos with light/dark color variants
    document.querySelectorAll('img[data-light-src][data-dark-src]').forEach((img) => {
      img.src = isDark ? img.getAttribute('data-dark-src') : img.getAttribute('data-light-src');
    });
  }

  applyTheme('light');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isDark ? 'light' : 'dark');
    });
  }

  // 4. Consultation Form Validation & FormSubmit AJAX Dispatch
  const form = document.getElementById('strategy-form');
  const submitBtn = document.getElementById('submit-btn');
  const successBox = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach((input) => {
        const field = input.closest('.field');
        const val = input.value.trim();
        let ok = val.length > 0;
        if (ok && input.type === 'email') {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        }
        if (field) field.classList.toggle('has-error', !ok);
        if (!ok) valid = false;
      });

      if (!valid) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Dispatching...';
      }

      try {
        const resp = await fetch('https://formsubmit.co/ajax/manas.pawar@arribalabs.com', {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (resp.ok) {
          form.reset();
          if (successBox) successBox.classList.add('is-visible');
        } else {
          form.submit();
        }
      } catch (_) {
        if (successBox) successBox.classList.add('is-visible');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Confirm Strategy Session \u2192';
        }
      }
    });
  }

  // 5. Live Pune IST Clock
  const clockEl = document.getElementById('ist-clock');
  if (clockEl) {
    function updateClock() {
      try {
        const ist = new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        clockEl.textContent = `Pune, India \u00B7 ${ist} IST`;
      } catch (_) {}
    }
    updateClock();
    setInterval(updateClock, 30000);
  }

  // 6. Quiet Cookie Notice
  const cookieBar = document.getElementById('cookie-banner');
  if (cookieBar) {
    let saved = null;
    try { saved = localStorage.getItem('arriba_cookie_pref'); } catch (_) {}
    if (!saved) {
      setTimeout(() => cookieBar.classList.add('is-visible'), 1500);
    }
    const dismiss = (val) => {
      try { localStorage.setItem('arriba_cookie_pref', val); } catch (_) {}
      cookieBar.classList.remove('is-visible');
    };
    const b1 = document.getElementById('cookie-essential-btn');
    const b2 = document.getElementById('cookie-accept-btn');
    if (b1) b1.addEventListener('click', () => dismiss('essential'));
    if (b2) b2.addEventListener('click', () => dismiss('all'));
  }

  // 7. Zero-Lag Typewriter Animation (IntersectionObserver — no scroll listeners)
  const twElements = document.querySelectorAll('[data-typewriter]');
  if (twElements.length && 'IntersectionObserver' in window) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      twElements.forEach((el) => {
        el.dataset.fullText = el.textContent.trim().replace(/\s+/g, ' ');
        el.textContent = '';
      });

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            io.unobserve(el);

            const full = el.dataset.fullText || '';
            const textNode = document.createTextNode('');
            const cursor = document.createElement('span');
            cursor.className = 'typewriter-cursor';
            cursor.setAttribute('aria-hidden', 'true');
            el.textContent = '';
            el.appendChild(textNode);
            el.appendChild(cursor);

            let i = 0;
            const step = () => {
              if (i < full.length) {
                i += 2;
                textNode.nodeValue = full.slice(0, i);
                setTimeout(step, 22);
              } else {
                textNode.nodeValue = full;
                setTimeout(() => cursor.remove(), 1400);
              }
            };
            step();
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
      );

      twElements.forEach((el) => io.observe(el));
    }
  }

  // 8. Hero Background Continuous Dollar Bill & Coin Rain (Pure CSS Animation, Zero Scroll Lag)
  const rainLayer = document.getElementById('currency-rain-layer');
  if (rainLayer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const billSvg =
      '<svg viewBox="0 0 64 32" aria-hidden="true">' +
      '<rect x="1.5" y="1.5" width="61" height="29" rx="2.5"/>' +
      '<rect x="5" y="5" width="54" height="22" rx="1.5" fill="none"/>' +
      '<circle cx="32" cy="16" r="7.5" fill="none"/>' +
      '<text x="32" y="20.5" text-anchor="middle" class="bill-mark">$</text>' +
      '</svg>';

    const coinSvg =
      '<svg viewBox="0 0 28 28" aria-hidden="true">' +
      '<circle cx="14" cy="14" r="12.5"/>' +
      '<circle cx="14" cy="14" r="9.5" fill="none" stroke-dasharray="2 2"/>' +
      '<text x="14" y="18.2" text-anchor="middle" class="coin-mark">$</text>' +
      '</svg>';

    // Deterministic editorial distribution across the hero width (22 items: 12 bills, 10 coins)
    const items = [
      { type: 'bill', x: 5,  dur: 13.5, delay: -2.0,  s: 0.92, sway: 22,  r0: -18, r1: 14,  r2: 36,  op: 0.85 },
      { type: 'coin', x: 11, dur: 9.8,  delay: -6.4,  s: 0.95, sway: -14, r0: 0,   r1: 160, r2: 320, op: 0.90 },
      { type: 'bill', x: 18, dur: 15.2, delay: -9.5,  s: 1.08, sway: -26, r0: 12,  r1: -16, r2: -42, op: 0.78 },
      { type: 'coin', x: 24, dur: 11.2, delay: -1.3,  s: 0.82, sway: 18,  r0: 20,  r1: 190, r2: 360, op: 0.85 },
      { type: 'bill', x: 31, dur: 14.0, delay: -11.2, s: 0.86, sway: 20,  r0: -24, r1: 10,  r2: 28,  op: 0.75 },
      { type: 'coin', x: 38, dur: 10.4, delay: -4.8,  s: 1.05, sway: -16, r0: 10,  r1: -150,r2: -310,op: 0.88 },
      { type: 'bill', x: 45, dur: 16.0, delay: -7.1,  s: 0.96, sway: 28,  r0: 15,  r1: -12, r2: -30, op: 0.72 },
      { type: 'coin', x: 52, dur: 9.4,  delay: -8.2,  s: 0.88, sway: 14,  r0: 0,   r1: 180, r2: 360, op: 0.86 },
      { type: 'bill', x: 58, dur: 13.8, delay: -3.5,  s: 1.12, sway: -24, r0: -14, r1: 18,  r2: 44,  op: 0.82 },
      { type: 'coin', x: 65, dur: 11.6, delay: -10.1, s: 0.96, sway: -18, r0: 30,  r1: 210, r2: 380, op: 0.88 },
      { type: 'bill', x: 71, dur: 14.8, delay: -5.6,  s: 0.90, sway: 24,  r0: 20,  r1: -10, r2: -34, op: 0.80 },
      { type: 'coin', x: 77, dur: 10.2, delay: -2.4,  s: 1.08, sway: 16,  r0: 0,   r1: -170,r2: -340,op: 0.90 },
      { type: 'bill', x: 83, dur: 12.9, delay: -8.9,  s: 1.02, sway: -22, r0: -20, r1: 12,  r2: 38,  op: 0.84 },
      { type: 'coin', x: 89, dur: 9.6,  delay: -4.1,  s: 0.86, sway: -12, r0: 15,  r1: 185, r2: 350, op: 0.86 },
      { type: 'bill', x: 94, dur: 15.5, delay: -12.0, s: 0.94, sway: 20,  r0: 10,  r1: -18, r2: -40, op: 0.78 },
      { type: 'bill', x: 14, dur: 16.4, delay: -13.2, s: 0.84, sway: 25,  r0: -10, r1: 20,  r2: 42,  op: 0.74 },
      { type: 'coin', x: 28, dur: 12.1, delay: -7.6,  s: 0.90, sway: -15, r0: 0,   r1: 170, r2: 340, op: 0.84 },
      { type: 'bill', x: 49, dur: 14.4, delay: -0.8,  s: 1.00, sway: -20, r0: 16,  r1: -14, r2: -32, op: 0.76 },
      { type: 'coin', x: 62, dur: 10.8, delay: -5.9,  s: 0.84, sway: 14,  r0: 25,  r1: -160,r2: -330,op: 0.85 },
      { type: 'bill', x: 75, dur: 13.2, delay: -10.8, s: 1.06, sway: 22,  r0: -16, r1: 15,  r2: 35,  op: 0.80 },
      { type: 'coin', x: 86, dur: 11.4, delay: -1.7,  s: 1.02, sway: -16, r0: 10,  r1: 190, r2: 370, op: 0.88 },
      { type: 'bill', x: 91, dur: 14.6, delay: -6.3,  s: 0.88, sway: -18, r0: 18,  r1: -12, r2: -36, op: 0.78 }
    ];

    const frag = document.createDocumentFragment();
    items.forEach((cfg) => {
      const el = document.createElement('div');
      el.className = `rain-item ${cfg.type === 'bill' ? 'rain-bill' : 'rain-coin'}`;
      el.style.setProperty('--x', `${cfg.x}%`);
      el.style.setProperty('--dur', `${cfg.dur}s`);
      el.style.setProperty('--delay', `${cfg.delay}s`);
      el.style.setProperty('--s', cfg.s);
      el.style.setProperty('--sway', `${cfg.sway}px`);
      el.style.setProperty('--r0', `${cfg.r0}deg`);
      el.style.setProperty('--r1', `${cfg.r1}deg`);
      el.style.setProperty('--r2', `${cfg.r2}deg`);
      el.style.setProperty('--op', cfg.op);
      el.innerHTML = cfg.type === 'bill' ? billSvg : coinSvg;
      frag.appendChild(el);
    });
    rainLayer.appendChild(frag);
  }
})();
