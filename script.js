/**
 * ARRIBA LABS - MOTION ENGINE
 * Lenis Smooth Scroll, 3-Arrow Logo Scroll-Stacking Rig, GSAP Counters & Reveals
 */

(function () {
  'use strict';

  // =========================================================================
  // 0. DEFAULT DARK THEME ENFORCEMENT (Do not persist or restore theme)
  // =========================================================================
  try {
    localStorage.removeItem('arriba_theme');
  } catch (_) {}
  document.documentElement.removeAttribute('data-theme');

  // =========================================================================
  // 1. LENIS SMOOTH SCROLL & GSAP SYNC
  // =========================================================================
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(500, 33);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Smooth Anchor Navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -70, duration: 1.1 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        // Close mobile drawer if open
        const drawer = document.getElementById('mobile-drawer');
        if (drawer && drawer.classList.contains('open')) {
          drawer.classList.remove('open');
        }
      }
    });
  });

  // =========================================================================
  // 2. INITIALIZATION ON DOM READY
  // =========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollAnimations();
    });
  } else {
    initScrollAnimations();
  }

  // =========================================================================
  // 3. CINEMATIC SPLASH PRELOADER (Loads, breathes for 1.35s, fades into site)
  // =========================================================================
  function initSplashPreloader() {
    const splash = document.getElementById('splash-preloader');
    if (!splash) return;

    const top = document.getElementById('splash-top');
    const mid = document.getElementById('splash-mid');
    const bot = document.getElementById('splash-bot');
    const wm = document.getElementById('splash-wordmark');
    const cluster = document.getElementById('splash-cluster');
    const glow = document.getElementById('splash-glow');

    if (typeof gsap !== 'undefined') {
      // Set initial hidden states with elegant downward offsets
      gsap.set(bot, { opacity: 0, y: 28, scale: 0.96 });
      gsap.set(mid, { opacity: 0, y: 28, scale: 0.97 });
      gsap.set(top, { opacity: 0, y: 28, scale: 0.98 });
      if (wm) gsap.set(wm, { opacity: 0, y: 16 });

      const tl = gsap.timeline();

      // Logo formation sequence:
      // 1. Smaller Chevron (inner) appears first
      tl.to(bot, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: 'power3.out'
      }, 0.20);

      // 2. Medium Chevron appears next
      tl.to(mid, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: 'power3.out'
      }, 0.65);

      // 3. Biggest Chevron (outer) appears third
      tl.to(top, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: 'power3.out'
      }, 1.10);

      // 4. ARRIBA Wordmark glides up into crisp focus
      if (wm) {
        tl.to(wm, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out'
        }, 1.55);
      }

      // Fully assembled logo breathes
      tl.to(cluster, {
        scale: 1.045,
        duration: 0.65,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1
      }, 2.05);

      if (glow) {
        tl.to(glow, {
          scale: 1.18,
          opacity: 0.95,
          duration: 0.65,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: 1
        }, 2.05);
      }

      // Smooth cinematic fade into the actual website
      tl.to(splash, {
        opacity: 0,
        duration: 0.75,
        ease: 'power2.inOut',
        onComplete: () => {
          splash.classList.add('is-faded');
          if (splash.parentNode) {
            splash.parentNode.removeChild(splash);
          }
        }
      }, 3.35);

    } else {
      // Fallback if GSAP is unavailable
      setTimeout(() => {
        splash.style.transition = 'opacity 0.75s ease';
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.classList.add('is-faded');
          if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 750);
      }, 3350);
    }
  }

  // =========================================================================
  // 4. COUNTER ANIMATION FOR STATS & NUMBERS
  // =========================================================================
  function initCounterStats() {
    const counterElements = document.querySelectorAll('.counter-stat');
    if (!counterElements.length) return;

    counterElements.forEach((el) => {
      const targetStr = el.getAttribute('data-target');
      if (!targetStr) return;
      const targetNum = parseFloat(targetStr);
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

      const obj = { val: 0 };

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: targetNum,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = decimals > 0 ? obj.val.toFixed(decimals) : Math.round(obj.val).toString();
              }
            });
          }
        });
      } else {
        // Fallback IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const start = performance.now();
              const duration = 1800;
              function updateCount(time) {
                const elapsed = time - start;
                const progress = Math.min(elapsed / duration, 1);
                const current = targetNum * (1 - Math.pow(1 - progress, 3));
                el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();
                if (progress < 1) requestAnimationFrame(updateCount);
              }
              requestAnimationFrame(updateCount);
              observer.unobserve(el);
            }
          });
        }, { threshold: 0.2 });
        observer.observe(el);
      }
    });
  }

  // =========================================================================
  // 5. SCROLL-TRIGGERED REVEALS ([data-reveal])
  // =========================================================================
  function initScrollAnimations() {
    // 1. Initialize Splash Preloader
    initSplashPreloader();

    // 2. Initialize Ambient 3D Glass Stack in Hero
    initHeroGlassStack();

    // 3. Initialize Counters
    initCounterStats();

    // 4. Initialize 5-Step Audit Sequential Animation
    initProtocolSequence();

    // 4. Initialize One-Time Typewriter Animation on Right-Column Descriptions
    initTypewriterDescriptions();

    // 5. Batch reveals for sections
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      const revealElements = document.querySelectorAll('[data-reveal]');
      revealElements.forEach((el) => {
        gsap.fromTo(el, 
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }
  }

  // =========================================================================
  // 5A. HERO 3D AMBIENT GLASS STACK ANIMATION (EMERGE FROM DEPTH TO FRONT)
  // =========================================================================
  function initHeroGlassStack() {
    const scene = document.getElementById('hero-glass-scene');
    if (!scene) return;

    const plates = scene.querySelectorAll('.glass-plate');
    if (!plates.length) return;

    let hasRevealed = false;

    // Set initial dark depth state for all plates immediately
    // plates are in DOM order: plate-3 (layer 2) to plate-1 (layer 0)
    // platesArr reversed: plate-1 (layer 0, base) -> plate-2 (layer 1, mid) -> plate-3 (layer 2, top)
    const platesArr = Array.from(plates).reverse();
    platesArr.forEach((plate) => {
      const layerIdx = parseFloat(plate.style.getPropertyValue('--layer-idx') || '0');
      const tx = 0;
      const ty = layerIdx * -85;
      const tz = layerIdx * -45;
      plate.style.opacity = '0';
      plate.style.filter = 'blur(14px) brightness(0.15)';
      plate.style.transform = `translate3d(${tx}px, ${ty + 50}px, ${tz - 300}px) scale(0.85)`;
    });

    function revealPlatesFromDarkDepth() {
      if (hasRevealed) return;
      hasRevealed = true;

      // Reveal bottom to top: Plate 1 (base) -> Plate 2 (mid) -> Plate 3 (top) stacking upwards
      platesArr.forEach((plate, i) => {
        const layerIdx = parseFloat(plate.style.getPropertyValue('--layer-idx') || '0');
        const tx = 0;
        const ty = layerIdx * -85;
        const tz = layerIdx * -45;
        const baseOpacity = 0.88 - (layerIdx * 0.08);

        setTimeout(() => {
          plate.classList.add('is-plate-visible');
          plate.style.transition = 'opacity 1.05s cubic-bezier(0.16, 1, 0.3, 1), transform 1.05s cubic-bezier(0.16, 1, 0.3, 1), filter 1.05s ease';
          plate.style.opacity = baseOpacity.toString();
          plate.style.filter = 'blur(0px) brightness(1)';
          plate.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) scale(1)`;
        }, i * 240); // 240ms stagger: stacks upwards layer by layer
      });

      setTimeout(() => {
        scene.classList.add('is-assembled');
      }, platesArr.length * 240 + 500);
    }

    // Trigger after splash preloader fades, or on load
    const splash = document.getElementById('splash-preloader');
    if (splash && !splash.classList.contains('is-faded')) {
      const checkSplash = setInterval(() => {
        const sp = document.getElementById('splash-preloader');
        if (!sp || sp.classList.contains('is-faded')) {
          clearInterval(checkSplash);
          setTimeout(revealPlatesFromDarkDepth, 200);
        }
      }, 100);
    } else {
      setTimeout(revealPlatesFromDarkDepth, 350);
    }
  }

  // =========================================================================
  // 5B. PRE-ONBOARDING AUDIT: 5-CARD SEQUENTIAL ANIMATION
  // =========================================================================
  function initProtocolSequence() {
    const track = document.getElementById('protocol-track');
    if (!track) return;

    // Enable sequence animation state
    track.classList.add('is-animated');

    const card2 = track.querySelector('.protocol-card[data-step="2"]');
    const card3 = track.querySelector('.protocol-card[data-step="3"]');
    const card4 = track.querySelector('.protocol-card[data-step="4"]');
    const card5 = track.querySelector('.protocol-card[data-step="5"]');
    const conn1 = track.querySelector('.protocol-connector[data-connector="1"]');
    const conn2 = track.querySelector('.protocol-connector[data-connector="2"]');
    const conn3 = track.querySelector('.protocol-connector[data-connector="3"]');
    const conn4 = track.querySelector('.protocol-connector[data-connector="4"]');

    let hasPlayed = false;

    function runStepSequenceOnce() {
      if (hasPlayed) return;
      hasPlayed = true;

      // Step 1: Connector 1 activates (Card 1 points to Card 2)
      setTimeout(() => {
        if (conn1) conn1.classList.add('is-active');

        // Step 2: Card 2 appears
        setTimeout(() => {
          if (card2) card2.classList.add('is-step-active');

          // Step 3: Connector 2 activates (Card 2 points to Card 3)
          setTimeout(() => {
            if (conn2) conn2.classList.add('is-active');

            // Step 4: Card 3 appears
            setTimeout(() => {
              if (card3) card3.classList.add('is-step-active');

              // Step 5: Connector 3 activates (Card 3 points to Card 4)
              setTimeout(() => {
                if (conn3) conn3.classList.add('is-active');

                // Step 6: Card 4 appears
                setTimeout(() => {
                  if (card4) card4.classList.add('is-step-active');

                  // Step 7: Connector 4 activates (Card 4 points to Card 5)
                  setTimeout(() => {
                    if (conn4) conn4.classList.add('is-active');

                    // Step 8: Card 5 appears and all cards remain permanently visible
                    setTimeout(() => {
                      if (card5) card5.classList.add('is-step-active');
                    }, 350);
                  }, 520);
                }, 350);
              }, 520);
            }, 350);
          }, 520);
        }, 350);
      }, 450);
    }

    // Trigger via GSAP ScrollTrigger (synced with Lenis) or IntersectionObserver fallback
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: track,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const splash = document.getElementById('splash-preloader');
          if (splash && !splash.classList.contains('is-faded')) {
            const checkSplash = setInterval(() => {
              const sp = document.getElementById('splash-preloader');
              if (!sp || sp.classList.contains('is-faded')) {
                clearInterval(checkSplash);
                runStepSequenceOnce();
              }
            }, 100);
          } else {
            runStepSequenceOnce();
          }
        }
      });
    } else if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasPlayed) {
            runStepSequenceOnce();
            observer.unobserve(track);
          }
        });
      }, { threshold: 0.15 });
      observer.observe(track);
    } else {
      runStepSequenceOnce();
    }
  }

  // =========================================================================
  // 5C. ONE-TIME TYPEWRITER ANIMATION FOR SECTION RIGHT DESCRIPTIONS
  // =========================================================================
  function initTypewriterDescriptions() {
    const elements = document.querySelectorAll('[data-typewriter]');
    if (!elements.length) return;

    elements.forEach((el) => {
      const fullText = el.textContent.replace(/\s+/g, ' ').trim();
      if (!fullText) return;

      el.textContent = '';
      const charSpans = [];

      for (let i = 0; i < fullText.length; i++) {
        const span = document.createElement('span');
        span.className = 'tw-char';
        span.textContent = fullText[i];
        el.appendChild(span);
        charSpans.push(span);
      }

      let hasTyped = false;

      function playTypewriterOnce() {
        if (hasTyped) return;
        hasTyped = true;

        let idx = 0;
        const speedMs = 18;

        function typeNextChar() {
          if (idx > 0) {
            charSpans[idx - 1].classList.remove('is-cursor');
          }
          if (idx < charSpans.length) {
            charSpans[idx].classList.add('is-typed', 'is-cursor');
            idx++;
            setTimeout(typeNextChar, speedMs);
          } else {
            // Keep blinking caret briefly at the end, then remove so text stays clean
            setTimeout(() => {
              if (charSpans.length) {
                charSpans[charSpans.length - 1].classList.remove('is-cursor');
              }
            }, 900);
          }
        }

        typeNextChar();
      }

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasTyped) {
              playTypewriterOnce();
              observer.unobserve(el);
            }
          });
        }, { threshold: 0.35 });
        observer.observe(el);
      } else {
        playTypewriterOnce();
      }
    });
  }

  // =========================================================================
  // 6. AMBIENT CHROMATIC CANVAS
  // =========================================================================
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetX = mouseX;
    let targetY = mouseY;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    const orbs = [
      { x: width * 0.2, y: height * 0.3, r: 420, color: 'rgba(95, 61, 131, 0.22)', vx: 0.3, vy: 0.2 },
      { x: width * 0.8, y: height * 0.4, r: 460, color: 'rgba(123, 67, 151, 0.18)', vx: -0.2, vy: 0.3 },
      { x: width * 0.5, y: height * 0.8, r: 480, color: 'rgba(56, 189, 248, 0.14)', vx: 0.25, vy: -0.2 }
    ];

    function draw() {
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -100 || orb.x > width + 100) orb.vx *= -1;
        if (orb.y < -100 || orb.y > height + 100) orb.vy *= -1;

        const dx = mouseX - orb.x;
        const dy = mouseY - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 550) {
          orb.x += (dx / dist) * 0.6;
          orb.y += (dy / dist) * 0.6;
        }

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(7, 7, 9, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // =========================================================================
  // 7. EDITORIAL CURSOR & MAGNETIC BUTTONS
  // =========================================================================
  const cursorWrap = document.getElementById('editorial-cursor');
  const cursorDot = cursorWrap ? cursorWrap.querySelector('.cursor-dot') : null;
  const cursorRing = cursorWrap ? cursorWrap.querySelector('.cursor-ring') : null;
  const cursorTag = document.getElementById('cursor-tag');

  if (cursorWrap && window.matchMedia('(hover: hover)').matches) {
    let mouse = { x: -100, y: -100 };
    let pos = { x: -100, y: -100 };
    let ringPos = { x: -100, y: -100 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function loop() {
      pos.x += (mouse.x - pos.x) * 0.35;
      pos.y += (mouse.y - pos.y) * 0.35;
      ringPos.x += (mouse.x - ringPos.x) * 0.15;
      ringPos.y += (mouse.y - ringPos.y) * 0.15;

      if (cursorDot) cursorDot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (cursorRing) cursorRing.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      if (cursorTag) cursorTag.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Hover triggers
    document.querySelectorAll('a, button, input, select, textarea, [data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-active');
        const tag = el.getAttribute('data-cursor');
        if (tag && cursorTag) {
          cursorTag.textContent = tag;
          document.body.classList.add('cursor-tag-active');
        }
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active', 'cursor-tag-active');
      });
    });

    // Magnetic physics on buttons
    document.querySelectorAll('.magnetic-target').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate3d(${x * 0.22}px, ${y * 0.22}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  // =========================================================================
  // 8. MOBILE DRAWER NAVIGATION
  // =========================================================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');

  function openDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
  }

  function closeDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-item, .drawer-action').forEach((item) => {
    item.addEventListener('click', closeDrawer);
  });

  // =========================================================================
  // 9. CONSULTATION FORM WITH BOT DEFENSE & FORMSUBMIT INTEGRATION
  // =========================================================================
  const form = document.getElementById('strategy-form');
  const successBanner = document.getElementById('form-success');
  const formLoadedAt = Date.now();
  let isSubmitting = false;

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (isSubmitting) return;

      // 1. Bot check: Honeypot trap
      const honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value.trim() !== '') {
        // Drop automated spam submission silently
        return;
      }

      // 2. Bot check: Time-trap (reject submissions completed in < 1.2 seconds)
      if (Date.now() - formLoadedAt < 1200) {
        return;
      }

      let valid = true;
      const name = document.getElementById('full-name');
      const email = document.getElementById('work-email');
      const url = document.getElementById('brand-name');
      const spend = document.getElementById('ad-spend-select');
      const phone = document.getElementById('phone-number');
      const goal = document.getElementById('growth-goal');

      form.querySelectorAll('.input-wrap').forEach((wrap) => wrap.classList.remove('has-error'));

      // Validate Name (2-100 characters)
      const cleanName = name ? name.value.trim().slice(0, 100) : '';
      if (!cleanName || cleanName.length < 2) {
        if (name) name.closest('.input-wrap').classList.add('has-error');
        valid = false;
      }

      // Validate Work Email (strict RFC regex)
      const cleanEmail = email ? email.value.trim().slice(0, 120) : '';
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        if (email) email.closest('.input-wrap').classList.add('has-error');
        valid = false;
      }

      // Validate URL (safe http/https only, no javascript: or data:)
      let cleanUrl = url ? url.value.trim().slice(0, 250) : '';
      let isValidUrl = false;
      if (cleanUrl) {
        if (!/^https?:\/\//i.test(cleanUrl)) {
          cleanUrl = 'https://' + cleanUrl;
        }
        try {
          const parsed = new URL(cleanUrl);
          isValidUrl = (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
        } catch (_) {
          isValidUrl = false;
        }
      }
      if (!cleanUrl || !isValidUrl) {
        if (url) url.closest('.input-wrap').classList.add('has-error');
        valid = false;
      }

      // Validate Monthly Ad Spend
      const cleanSpend = spend ? spend.value.trim().slice(0, 80) : '';
      if (!cleanSpend) {
        if (spend) spend.closest('.input-wrap').classList.add('has-error');
        valid = false;
      }

      // Validate Phone (optional, but if provided check safe format)
      const cleanPhone = phone ? phone.value.trim().slice(0, 30) : '';
      if (cleanPhone && !/^[+\d\s().-]{7,25}$/.test(cleanPhone)) {
        if (phone) phone.closest('.input-wrap').classList.add('has-error');
        valid = false;
      }

      const cleanGoal = goal ? goal.value.trim().slice(0, 2000) : '';

      if (valid) {
        isSubmitting = true;
        const submitBtn = document.getElementById('submit-btn');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Confirming Session...</span>';
        }

        const payload = {
          "Full Name": cleanName,
          "Work Email": cleanEmail,
          "Brand Website": cleanUrl,
          "Phone / WhatsApp": cleanPhone || 'Not provided',
          "Monthly Ad Spend": cleanSpend,
          "Primary Challenge / Goal": cleanGoal || 'Not specified',
          _subject: `New Growth Consultation Request - ${cleanName} (${cleanUrl})`,
          _template: 'table',
          _captcha: 'false'
        };

        fetch('https://formsubmit.co/ajax/manas.pawar@arribalabs.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then(() => {
          if (submitBtn) submitBtn.style.display = 'none';
          if (successBanner) {
            successBanner.classList.add('active');
            successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          form.reset();
        })
        .catch(() => {
          // Graceful fallback to standard POST submission
          form.submit();
        })
        .finally(() => {
          isSubmitting = false;
        });
      } else {
        const firstInvalid = form.querySelector('.input-wrap.has-error input, .input-wrap.has-error textarea');
        if (firstInvalid) firstInvalid.focus();
      }
    });

    // Real-time error state removal on input
    form.querySelectorAll('input, textarea').forEach((input) => {
      input.addEventListener('input', () => {
        const wrap = input.closest('.input-wrap');
        if (wrap) wrap.classList.remove('has-error');
      });
    });
  }


  // =========================================================================
  // 10. WHAT WE OFFER: ARRIBA PERFORMANCE ACCORDION TOGGLE
  // =========================================================================
  const perfCard = document.getElementById('card-performance');
  const perfToggle = document.getElementById('performance-toggle');
  if (perfCard && perfToggle) {
    function togglePerformance() {
      const isExpanded = perfCard.classList.toggle('is-expanded');
      perfToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      const drawer = document.getElementById('performance-strategies');
      if (drawer) drawer.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
      const label = perfToggle.querySelector('.trigger-label');
      if (label) {
        label.textContent = isExpanded ? 'Collapse Services' : 'View All Services';
      }
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(() => ScrollTrigger.refresh(), 300);
      }
    }

    perfToggle.addEventListener('click', togglePerformance);
    perfToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePerformance();
      }
    });
  }

  // =========================================================================
  // 10B. CASE LEDGER MOBILE ACCORDION (Click to view full case study)
  // =========================================================================
  const caseCards = document.querySelectorAll('.case-card');
  if (caseCards.length) {
    caseCards.forEach((card) => {
      const header = card.querySelector('.case-card-header');
      if (!header) return;

      function toggleCaseCard() {
        // Only active on mobile screens (width <= 860px)
        if (window.innerWidth > 860) return;

        const isExpanded = card.classList.toggle('is-expanded');
        header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

        const label = card.querySelector('.case-expand-label');
        if (label) {
          label.textContent = isExpanded ? 'Close Case' : 'View Case';
        }

        if (typeof ScrollTrigger !== 'undefined') {
          setTimeout(() => ScrollTrigger.refresh(), 350);
        }
      }

      header.addEventListener('click', toggleCaseCard);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCaseCard();
        }
      });
    });
  }

  // =========================================================================
  // 11. COOKIE & PRIVACY CONSENT BANNER
  // =========================================================================
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept-btn');
  const essentialBtn = document.getElementById('cookie-essential-btn');

  if (cookieBanner) {
    let consent = null;
    try {
      consent = localStorage.getItem('arriba_cookie_consent');
    } catch (_) {}

    if (!consent) {
      setTimeout(() => {
        cookieBanner.classList.add('is-visible');
        cookieBanner.setAttribute('aria-hidden', 'false');
      }, 1500);
    }

    function dismissCookieBanner(choice) {
      try {
        localStorage.setItem('arriba_cookie_consent', choice);
      } catch (_) {}
      cookieBanner.classList.remove('is-visible');
      cookieBanner.setAttribute('aria-hidden', 'true');
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => dismissCookieBanner('all'));
    }
    if (essentialBtn) {
      essentialBtn.addEventListener('click', () => dismissCookieBanner('essential'));
    }
  }

  // =========================================================================
  // 12. THEME SWITCHER (DARK / LIGHT MODE)
  // =========================================================================
  const themeToggle = document.getElementById('theme-toggle');
  const drawerThemeToggle = document.getElementById('drawer-theme-toggle');

  function getPreferredTheme() {
    return 'dark'; // Always dark by default, never restore from storage
  }

  function applyTheme(theme) {
    const isLight = theme === 'light';

    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
      if (themeToggle) {
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        themeToggle.setAttribute('title', 'Switch to dark mode');
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) {
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
        themeToggle.setAttribute('title', 'Switch to light mode');
      }
    }

    // Wordmark and brand logos use matching logo gradient palette in both dark and light mode
    document.querySelectorAll('.arriba-wordmark-img').forEach((wmImg) => {
      wmImg.src = 'images/arriba-wordmark-gradient.png';
    });
    const brandLogos = document.querySelectorAll('.brand-logo-img, .footer-logo, .drawer-header img');
    brandLogos.forEach((img) => {
      img.src = 'images/arriba-logo-gradient.png';
    });

    // Sync client brand logos with full authentic colors in light mode
    document.querySelectorAll('.client-logo-img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.includes('nykaa-fashion')) {
        img.src = isLight ? 'logos/nykaa-fashion-light.svg' : 'logos/nykaa-fashion.svg';
      } else if (src.includes('pro-nature-organic')) {
        img.src = isLight ? 'logos/pro-nature-organic-light.png' : 'logos/pro-nature-organic.png';
      } else if (src.includes('av-store')) {
        img.src = isLight ? 'logos/av-store-light.png' : 'logos/av-store.png';
      } else if (src.includes('tiber-taber')) {
        img.src = isLight ? 'logos/tiber-taber.svg' : 'logos/tiber-taber.png';
      } else if (src.includes('sr-store')) {
        img.src = isLight ? 'logos/sr-store-color.png' : 'logos/sr-store.png';
      }
    });

    // Sync partner brand logos with authentic brand colors in light mode
    document.querySelectorAll('.partner-grid-img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.includes('meta')) {
        img.src = isLight ? 'logos/partners/meta-light.svg' : 'logos/partners/meta.svg';
      } else if (src.includes('3bf')) {
        img.src = isLight ? 'logos/partners/3bf-light.svg' : 'logos/partners/3bf.svg';
      } else if (src.includes('krafting-networks')) {
        img.src = isLight ? 'logos/partners/krafting-networks-light.svg' : 'logos/partners/krafting-networks.svg';
      }
    });

    // Sync drawer toggle state if present
    if (drawerThemeToggle) {
      const darkBtn = drawerThemeToggle.querySelector('[data-mode="dark"]');
      const lightBtn = drawerThemeToggle.querySelector('[data-mode="light"]');
      if (darkBtn) darkBtn.classList.toggle('active', !isLight);
      if (lightBtn) lightBtn.classList.toggle('active', isLight);
    }
  }

  // Initial sync with default dark state
  applyTheme('dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isCurrentlyLight = document.documentElement.getAttribute('data-theme') === 'light';
      applyTheme(isCurrentlyLight ? 'dark' : 'light');
    });
  }

  if (drawerThemeToggle) {
    drawerThemeToggle.addEventListener('click', (e) => {
      const modeBtn = e.target.closest('[data-mode]');
      if (modeBtn) {
        const mode = modeBtn.getAttribute('data-mode');
        applyTheme(mode);
      }
    });
  }
})();