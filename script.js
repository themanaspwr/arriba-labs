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

  // 8. Hero Background Aerodynamic Paper Bill & 3D Coin Physics Engine (Hero Only)
  const rainCanvas = document.getElementById('currency-rain-canvas');
  if (rainCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = rainCanvas.getContext('2d');
    const heroSection = rainCanvas.parentElement;
    let cw = 0, ch = 0, dpr = 1;
    let isHeroVisible = true;
    let rafId = null;

    function resizeCanvas() {
      const rect = heroSection.getBoundingClientRect();
      cw = Math.max(rect.width, 320);
      ch = Math.max(rect.height, 400);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      rainCanvas.width = Math.round(cw * dpr);
      rainCanvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Create 13 aerodynamic curling bills + 9 3D tumbling coins
    const particles = [];
    const BILL_COUNT = 13;
    const COIN_COUNT = 9;

    function makeBill(startY) {
      return {
        kind: 'bill',
        x: Math.random() * cw,
        y: startY !== undefined ? startY : -50 - Math.random() * 140,
        w: 56 + Math.random() * 18,
        h: 26 + Math.random() * 8,
        baseVy: 0.42 + Math.random() * 0.34,
        glideAmp: 0.65 + Math.random() * 0.75,
        glidePhase: Math.random() * Math.PI * 2,
        glideFreq: 0.012 + Math.random() * 0.011,
        // 3D aerodynamic tumble angles
        rx: (Math.random() - 0.5) * 0.8,
        ry: Math.random() * Math.PI * 2,
        rz: (Math.random() - 0.5) * 0.6,
        vrx: (Math.random() - 0.5) * 0.014,
        vry: (Math.random() - 0.5) * 0.018,
        // Paper curl & flutter wave under air resistance
        curlBase: 7 + Math.random() * 8,
        wavePhase: Math.random() * Math.PI * 2,
        waveSpeed: 0.045 + Math.random() * 0.035,
        opacity: 0.55 + Math.random() * 0.25
      };
    }

    function makeCoin(startY) {
      return {
        kind: 'coin',
        x: Math.random() * cw,
        y: startY !== undefined ? startY : -30 - Math.random() * 120,
        r: 9.5 + Math.random() * 4,
        vy: 0.78 + Math.random() * 0.55,
        vx: (Math.random() - 0.5) * 0.25,
        spin: Math.random() * Math.PI * 2,
        vSpin: 0.045 + Math.random() * 0.055,
        tilt: (Math.random() - 0.5) * 0.6,
        vTilt: (Math.random() - 0.5) * 0.012,
        opacity: 0.58 + Math.random() * 0.24
      };
    }

    for (let i = 0; i < BILL_COUNT; i++) particles.push(makeBill(Math.random() * ch));
    for (let i = 0; i < COIN_COUNT; i++) particles.push(makeCoin(Math.random() * ch));

    // Project a 3D point on the flexible paper sheet
    function projectPoint(lx, ly, lz, cosX, sinX, cosY, sinY, cosZ, sinZ) {
      // Rotate X
      const y1 = ly * cosX - lz * sinX;
      const z1 = ly * sinX + lz * cosX;
      // Rotate Y
      const x2 = lx * cosY + z1 * sinY;
      const z2 = -lx * sinY + z1 * cosY;
      // Rotate Z
      const x3 = x2 * cosZ - y1 * sinZ;
      const y3 = x2 * sinZ + y1 * cosZ;
      const persp = 320 / (320 - z2);
      return { x: x3 * persp, y: y3 * persp, z: z2 };
    }

    function drawCurlingBill(b, isDark) {
      const segs = 10;
      const halfW = b.w * 0.5;
      const halfH = b.h * 0.5;

      // Bank/tilt smoothly with horizontal glide like real falling paper
      const bank = Math.sin(b.glidePhase) * 0.42;
      const cosX = Math.cos(b.rx + Math.cos(b.glidePhase) * 0.35);
      const sinX = Math.sin(b.rx + Math.cos(b.glidePhase) * 0.35);
      const cosY = Math.cos(b.ry);
      const sinY = Math.sin(b.ry);
      const cosZ = Math.cos(b.rz + bank);
      const sinZ = Math.sin(b.rz + bank);

      // Dynamic U-curl from upward air pressure + traveling flutter ripple
      const dynamicCurl = b.curlBase * (0.75 + 0.45 * Math.sin(b.wavePhase));

      const topPts = [];
      const botPts = [];
      const zVals = [];

      for (let i = 0; i <= segs; i++) {
        const t = i / segs;          // 0 .. 1
        const u = t * 2 - 1;         // -1 .. +1
        const lx = u * halfW;
        // Parabolic upward curl at edges + S-wave flutter from air resistance
        const lz = dynamicCurl * (u * u - 0.35) + Math.sin(u * 2.6 + b.wavePhase) * 4.2;
        // Slight edge taper curl along Y as well
        const edgePinch = 1 - Math.abs(u) * 0.04;
        const pTop = projectPoint(lx, -halfH * edgePinch, lz, cosX, sinX, cosY, sinY, cosZ, sinZ);
        const pBot = projectPoint(lx, halfH * edgePinch, lz, cosX, sinX, cosY, sinY, cosZ, sinZ);
        topPts.push(pTop);
        botPts.push(pBot);
        zVals.push(lz);
      }

      // Vertical edge fade near top & bottom of hero section
      const edgeFade = Math.min(1, Math.max(0, Math.min(b.y / 80, (ch - b.y) / 90)));
      const alpha = b.opacity * edgeFade;
      if (alpha <= 0.01) return;

      ctx.save();
      ctx.translate(b.x, b.y);

      // Draw each curved paper segment with directional fold shading
      for (let i = 0; i < segs; i++) {
        const slope = (zVals[i + 1] - zVals[i]) * 0.09;
        const shade = Math.max(-0.12, Math.min(0.14, slope));

        ctx.beginPath();
        ctx.moveTo(topPts[i].x, topPts[i].y);
        ctx.lineTo(topPts[i + 1].x, topPts[i + 1].y);
        ctx.lineTo(botPts[i + 1].x, botPts[i + 1].y);
        ctx.lineTo(botPts[i].x, botPts[i].y);
        ctx.closePath();

        if (isDark) {
          const lum = Math.round(138 + shade * 240);
          ctx.fillStyle = `rgba(${lum - 24}, ${lum + 38}, ${lum}, ${(0.11 + shade * 0.16) * alpha})`;
        } else {
          const lum = Math.round(62 + shade * 200);
          ctx.fillStyle = `rgba(${lum - 12}, ${lum + 56}, ${lum + 14}, ${(0.14 + shade * 0.14) * alpha})`;
        }
        ctx.fill();
      }

      // Crisp curved outer outline of the curled paper note
      ctx.beginPath();
      ctx.moveTo(topPts[0].x, topPts[0].y);
      for (let i = 1; i <= segs; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
      for (let i = segs; i >= 0; i--) ctx.lineTo(botPts[i].x, botPts[i].y);
      ctx.closePath();
      ctx.lineWidth = 1.15;
      ctx.strokeStyle = isDark
        ? `rgba(148, 220, 176, ${0.32 * alpha})`
        : `rgba(34, 98, 64, ${0.38 * alpha})`;
      ctx.stroke();

      // Curved inner engraved frame line
      ctx.beginPath();
      for (let i = 1; i < segs; i++) {
        const ix = topPts[i].x * 0.78 + botPts[i].x * 0.22;
        const iy = topPts[i].y * 0.78 + botPts[i].y * 0.22;
        if (i === 1) ctx.moveTo(ix, iy);
        else ctx.lineTo(ix, iy);
      }
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = isDark
        ? `rgba(148, 220, 176, ${0.18 * alpha})`
        : `rgba(34, 98, 64, ${0.22 * alpha})`;
      ctx.stroke();

      // Center $ seal following the middle curved segment's position & tilt
      const midTop = topPts[segs / 2];
      const midBot = botPts[segs / 2];
      const cx = (midTop.x + midBot.x) * 0.5;
      const cy = (midTop.y + midBot.y) * 0.5;
      const dx = topPts[segs / 2 + 1].x - topPts[segs / 2 - 1].x;
      const dy = topPts[segs / 2 + 1].y - topPts[segs / 2 - 1].y;
      const segAngle = Math.atan2(dy, dx);
      const scaleX = Math.max(0.2, Math.hypot(dx, dy) / (b.w * 0.2));

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(segAngle);
      ctx.scale(Math.min(1, scaleX), 1);
      ctx.fillStyle = isDark
        ? `rgba(162, 232, 188, ${0.42 * alpha})`
        : `rgba(30, 92, 58, ${0.48 * alpha})`;
      ctx.font = `700 ${Math.round(b.h * 0.48)}px "Instrument Serif", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);
      ctx.restore();

      ctx.restore();
    }

    function draw3DCoin(c, isDark) {
      const edgeFade = Math.min(1, Math.max(0, Math.min(c.y / 70, (ch - c.y) / 80)));
      const alpha = c.opacity * edgeFade;
      if (alpha <= 0.01) return;

      const cosSpin = Math.cos(c.spin);
      const absCos = Math.max(0.14, Math.abs(cosSpin));
      const thickness = (1 - absCos) * 3.2;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.tilt);

      // Coin milled brass edge thickness
      if (thickness > 0.3) {
        ctx.beginPath();
        ctx.ellipse(cosSpin >= 0 ? thickness : -thickness, 0, c.r * absCos, c.r, 0, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(186, 148, 64, ${0.32 * alpha})`
          : `rgba(146, 102, 20, ${0.36 * alpha})`;
        ctx.fill();
      }

      // Coin front face with metallic glint
      const glint = Math.pow(absCos, 3) * 0.14;
      ctx.beginPath();
      ctx.ellipse(0, 0, c.r * absCos, c.r, 0, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(240, 206, 118, ${(0.12 + glint) * alpha})`
        : `rgba(214, 168, 56, ${(0.18 + glint) * alpha})`;
      ctx.fill();
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = isDark
        ? `rgba(242, 210, 126, ${0.38 * alpha})`
        : `rgba(164, 116, 24, ${0.48 * alpha})`;
      ctx.stroke();

      // Inner ring & $ stamp when visible face-on
      if (absCos > 0.35) {
        ctx.beginPath();
        ctx.ellipse(0, 0, c.r * 0.72 * absCos, c.r * 0.72, 0, 0, Math.PI * 2);
        ctx.lineWidth = 0.65;
        ctx.strokeStyle = isDark
          ? `rgba(242, 210, 126, ${0.22 * alpha})`
          : `rgba(164, 116, 24, ${0.28 * alpha})`;
        ctx.stroke();

        ctx.save();
        ctx.scale(absCos, 1);
        ctx.fillStyle = isDark
          ? `rgba(248, 222, 148, ${0.46 * alpha})`
          : `rgba(148, 100, 16, ${0.56 * alpha})`;
        ctx.font = `700 ${Math.round(c.r * 1.15)}px "Instrument Serif", Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 1);
        ctx.restore();
      }

      ctx.restore();
    }

    function stepFrame() {
      if (!isHeroVisible) {
        rafId = null;
        return;
      }

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.clearRect(0, 0, cw, ch);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.kind === 'bill') {
          p.glidePhase += p.glideFreq;
          p.wavePhase += p.waveSpeed;
          p.rx += p.vrx;
          p.ry += p.vry;

          // Aerodynamic falling-leaf motion: wide sideways glide + pitch-modulated descent
          const glideVel = Math.cos(p.glidePhase) * p.glideAmp;
          const airLift = 0.62 + 0.52 * Math.abs(Math.sin(p.glidePhase));
          p.x += glideVel;
          p.y += p.baseVy * airLift;

          if (p.y > ch + 60) {
            particles[i] = makeBill(-50);
          } else if (p.x < -80) {
            p.x = cw + 60;
          } else if (p.x > cw + 80) {
            p.x = -60;
          }
          drawCurlingBill(p, isDark);
        } else {
          p.spin += p.vSpin;
          p.tilt += p.vTilt;
          p.x += p.vx;
          p.y += p.vy;

          if (p.y > ch + 40) {
            particles[i] = makeCoin(-30);
          }
          draw3DCoin(p, isDark);
        }
      }

      rafId = requestAnimationFrame(stepFrame);
    }

    // Pause physics loop automatically when hero is scrolled out of view (zero scroll lag!)
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          isHeroVisible = entries[0].isIntersecting;
          if (isHeroVisible && !rafId) {
            rafId = requestAnimationFrame(stepFrame);
          }
        },
        { threshold: 0.01 }
      );
      heroObserver.observe(heroSection);
    }

    rafId = requestAnimationFrame(stepFrame);
  }
})();
