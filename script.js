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
})();
