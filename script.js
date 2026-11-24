/**
 * ARRIBA LABS — ARCHITECTURAL MONOLITH INTERACTION ENGINE (V3)
 * Refined motion, Lenis + GSAP sync, interactive case ledger, accordion, and form dispatch.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. LENIS SMOOTH SCROLL + GSAP SCROLLTRIGGER SYNC
  // =========================================================================
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.4
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(500, 33);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Smooth Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -72, duration: 1.05 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        closeMobileDrawer();
      }
    });
  });

  // =========================================================================
  // 2. REFINED SPLASH PRELOADER (BRIEF & NON-INTRUSIVE)
  // =========================================================================
  function initSplash() {
    const splash = document.getElementById('splash-preloader');
    if (!splash) return;

    const top = document.getElementById('splash-top');
    const mid = document.getElementById('splash-mid');
    const bot = document.getElementById('splash-bot');
    const wm = document.getElementById('splash-wordmark');

    if (typeof gsap !== 'undefined') {
      gsap.set([bot, mid, top], { opacity: 0, y: 18 });
      if (wm) gsap.set(wm, { opacity: 0, y: 10 });

      const tl = gsap.timeline();
      tl.to(bot, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' }, 0.08)
        .to(mid, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' }, 0.22)
        .to(top, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' }, 0.36)
        .to(wm, { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' }, 0.5)
        .to(splash, {
          opacity: 0,
          duration: 0.55,
          ease: 'power2.inOut',
          onComplete: () => {
            splash.classList.add('is-faded');
            if (splash.parentNode) splash.parentNode.removeChild(splash);
          }
        }, 1.15);
    } else {
      setTimeout(() => {
        splash.classList.add('is-faded');
        setTimeout(() => splash.remove(), 600);
      }, 900);
    }
  }

  // =========================================================================
  // 3. PRECISION CURSOR (DESKTOP POINTER ONLY)
  // =========================================================================
  function initPrecisionCursor() {
    const cursor = document.getElementById('precision-cursor');
    if (!cursor || !window.matchMedia('(pointer: fine)').matches) return;

    let mx = -100, my = -100, cx = -100, cy = -100;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.classList.add('is-visible');
    });

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-visible');
    });

    const interactiveSelector = 'a, button, input, textarea, .brand-row, .case-tab, .service-trigger';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.add('is-hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.remove('is-hovering');
      }
    });

    function loop() {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // =========================================================================
  // 4. HERO CHEVRON ARCHITECTURAL RIG (SUBTLE KINETIC TILT)
  // =========================================================================
  function initHeroRig() {
    const hero = document.getElementById('hero');
    const rig = document.getElementById('hero-chevron-rig');
    if (!hero || !rig) return;

    let targetX = 8, targetY = -10, curX = 8, curY = -10;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = 8 + ny * -14;
      targetY = -10 + nx * 18;
    });

    hero.addEventListener('mouseleave', () => {
      targetX = 8;
      targetY = -10;
    });

    function loop() {
      curX += (targetX - curX) * 0.07;
      curY += (targetY - curY) * 0.07;
      rig.style.transform = `rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // =========================================================================
  // 5. SCROLL-TRIGGERED EDITORIAL REVEALS
  // =========================================================================
  function initScrollReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            once: true
          }
        }
      );
    });
  }

  // =========================================================================
  // 6. CAPABILITIES EDITORIAL ACCORDION
  // =========================================================================
  function initServiceAccordion() {
    const items = document.querySelectorAll('.service-item');
    items.forEach((item) => {
      const trigger = item.querySelector('.service-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach((other) => {
          other.classList.remove('is-open');
          const btn = other.querySelector('.service-trigger');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // =========================================================================
  // 7. CASE LEDGER TABS + BRAND DIRECTORY JUMP
  // =========================================================================
  function activateCase(caseId) {
    const tabs = document.querySelectorAll('.case-tab');
    const panels = document.querySelectorAll('.case-panel');
    tabs.forEach((t) => {
      const match = t.getAttribute('data-case-tab') === caseId;
      t.classList.toggle('is-active', match);
      t.setAttribute('aria-selected', match ? 'true' : 'false');
    });
    panels.forEach((p) => {
      p.classList.toggle('is-active', p.id === caseId);
    });
  }

  function initCaseLedger() {
    document.querySelectorAll('.case-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        activateCase(tab.getAttribute('data-case-tab'));
      });
    });

    document.querySelectorAll('[data-case-jump]').forEach((row) => {
      row.addEventListener('click', () => {
        activateCase(row.getAttribute('data-case-jump'));
      });
    });
  }

  // =========================================================================
  // 8. MOBILE DRAWER NAVIGATION
  // =========================================================================
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileToggle = document.getElementById('mobile-toggle');
  const drawerClose = document.getElementById('drawer-close');

  function closeMobileDrawer() {
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
    drawerClose.addEventListener('click', closeMobileDrawer);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileDrawer();
  });

  // =========================================================================
  // 9. THEME TOGGLE (DARK OBSIDIAN / SWISS PAPER LIGHT)
  // =========================================================================
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');

  function applyTheme(mode) {
    const isLight = mode === 'light';
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (themeLabel) themeLabel.textContent = isLight ? 'Dark' : 'Light';

    // Swap partner SVGs that have dedicated light/dark variants
    document.querySelectorAll('.partner-img[data-partner]').forEach((img) => {
      const p = img.getAttribute('data-partner');
      if (p === 'meta') img.src = isLight ? 'logos/partners/meta-light.svg' : 'logos/partners/meta.svg';
      if (p === '3bf') img.src = isLight ? 'logos/partners/3bf-light.svg' : 'logos/partners/3bf.svg';
      if (p === 'krafting') img.src = isLight ? 'logos/partners/krafting-networks-light.svg' : 'logos/partners/krafting-networks.svg';
    });
  }

  applyTheme('dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light');
    });
  }

  // =========================================================================
  // 10. CONSULTATION FORM VALIDATION & FORMSUBMIT DISPATCH
  // =========================================================================
  function initContactForm() {
    const form = document.getElementById('strategy-form');
    if (!form) return;

    const submitBtn = document.getElementById('submit-btn');
    const successBox = document.getElementById('form-success');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let valid = true;
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach((field) => {
        const group = field.closest('.field-group');
        const val = field.value.trim();
        let fieldValid = val.length > 0;
        if (fieldValid && field.type === 'email') {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        }
        if (group) group.classList.toggle('has-error', !fieldValid);
        if (!fieldValid) valid = false;
      });

      if (!valid) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        const span = submitBtn.querySelector('span');
        if (span) span.textContent = 'Dispatching...';
      }

      try {
        const formData = new FormData(form);
        const resp = await fetch('https://formsubmit.co/ajax/manas.pawar@arribalabs.com', {
          method: 'POST',
          body: formData,
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
          const span = submitBtn.querySelector('span');
          if (span) span.textContent = 'Confirm Strategy Session';
        }
      }
    });
  }

  // =========================================================================
  // 11. LIVE PUNE IST CLOCK
  // =========================================================================
  function initClock() {
    const el = document.getElementById('ist-clock');
    if (!el) return;

    function tick() {
      try {
        const now = new Date();
        const ist = now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        el.textContent = `Pune, India \u00B7 ${ist} IST`;
      } catch (_) {}
    }
    tick();
    setInterval(tick, 30000);
  }

  // =========================================================================
  // 12. MINIMAL COOKIE NOTICE
  // =========================================================================
  function initCookieBar() {
    const bar = document.getElementById('cookie-banner');
    if (!bar) return;

    try {
      if (localStorage.getItem('arriba_cookie_pref')) return;
    } catch (_) {}

    setTimeout(() => bar.classList.add('is-visible'), 2200);

    const dismiss = (val) => {
      try {
        localStorage.setItem('arriba_cookie_pref', val);
      } catch (_) {}
      bar.classList.remove('is-visible');
    };

    const essentialBtn = document.getElementById('cookie-essential-btn');
    const acceptBtn = document.getElementById('cookie-accept-btn');
    if (essentialBtn) essentialBtn.addEventListener('click', () => dismiss('essential'));
    if (acceptBtn) acceptBtn.addEventListener('click', () => dismiss('all'));
  }

  // =========================================================================
  // BOOTSTRAP
  // =========================================================================
  function init() {
    initSplash();
    initPrecisionCursor();
    initHeroRig();
    initScrollReveals();
    initServiceAccordion();
    initCaseLedger();
    initContactForm();
    initClock();
    initCookieBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
