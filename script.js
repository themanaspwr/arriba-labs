/**
 * ARRIBA LABS - MOTION ENGINE
 * Lenis Smooth Scroll, 3-Arrow Logo Scroll-Stacking Rig, GSAP Counters & Reveals
 */

(function () {
  'use strict';

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

      gsap.ticker.lagSmoothing(0);
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
  // 3. 3-ARROW LOGO AUTO-STACK INTRO ANIMATION (Smooth entrance on load)
  // =========================================================================
  function initLogoStackingAnimation() {
    const chevMid = document.getElementById('chev-mid');
    const chevBot = document.getElementById('chev-bot');
    const chevWordmark = document.getElementById('chev-wordmark');
    const chevGlow = document.getElementById('chev-glow');
    const scrollPill = document.getElementById('scroll-pill');

    if (!chevMid || !chevBot) return;

    // Luxurious, deliberate timing for auto-stack sequence
    const tl = gsap.timeline({ delay: 0.45 });

    // 1. Middle Chevron rises smoothly from below
    tl.to(chevMid, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.85,
      ease: 'power3.out'
    }, 0.1);

    // 2. Lower Chevron rises smoothly into stack
    tl.to(chevBot, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.85,
      ease: 'power3.out'
    }, 0.65);

    // 3. ARRIBA Wordmark glides up into crisp white
    if (chevWordmark) {
      tl.to(chevWordmark, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out'
      }, 1.15);
    }

    // 4. Subtle bloom pulse on full assembly
    if (chevGlow) {
      tl.to(chevGlow, {
        opacity: 0.9,
        scale: 1.12,
        duration: 0.45,
        ease: 'power2.out'
      }, 1.3);

      tl.to(chevGlow, {
        opacity: 0.5,
        scale: 1.0,
        duration: 0.7,
        ease: 'power1.inOut'
      }, 1.75);
    }

    // 5. Scroll pill fades in gracefully
    if (scrollPill) {
      tl.to(scrollPill, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.out'
      }, 1.55);

      window.addEventListener('scroll', function hidePill() {
        if (window.scrollY > 15) {
          gsap.to(scrollPill, { opacity: 0, y: 8, duration: 0.25 });
          window.removeEventListener('scroll', hidePill);
        }
      }, { passive: true });
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
    // 1. Initialize Logo Stacking
    initLogoStackingAnimation();

    // 2. Initialize Counters
    initCounterStats();

    // 3. Initialize 5-Step Audit Sequential Animation
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
  // 5B. THE 4-STAGE PROTOCOL: 4-CARD SEQUENTIAL ANIMATION
  // =========================================================================
  function initProtocolSequence() {
    const track = document.getElementById('protocol-track');
    if (!track) return;

    // Progressive enhancement: add is-animated class so CSS activates sequence mode
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

    // Play sequence once when user reaches the section
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasPlayed) {
            runStepSequenceOnce();
            observer.unobserve(track);
          }
        });
      }, { threshold: 0.25 });
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
  // 9. CONSULTATION FORM WITH FORMSUBMIT INTEGRATION
  // =========================================================================
  const form = document.getElementById('strategy-form');
  const successBanner = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;
      const name = document.getElementById('full-name');
      const email = document.getElementById('work-email');
      const url = document.getElementById('brand-name');
      const spend = document.getElementById('ad-spend-select');

      form.querySelectorAll('.input-wrap').forEach((wrap) => wrap.classList.remove('has-error'));

      if (!name || !name.value.trim()) {
        if (name) name.closest('.input-wrap').classList.add('has-error');
        valid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.value.trim())) {
        if (email) email.closest('.input-wrap').classList.add('has-error');
        valid = false;
      }

      if (!url || !url.value.trim()) {
        if (url) url.closest('.input-wrap').classList.add('has-error');
        valid = false;
      }

      if (!spend || !spend.value) {
        if (spend) spend.closest('.input-wrap').classList.add('has-error');
        valid = false;
      }

      if (valid) {
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Confirming Session...</span>';
        }

        const payload = {
          "Full Name": name.value.trim(),
          "Work Email": email.value.trim(),
          "Brand Website": url.value.trim(),
          "Phone / WhatsApp": document.getElementById('phone-number') ? document.getElementById('phone-number').value.trim() : 'Not provided',
          "Monthly Ad Spend": (spend.options && spend.selectedIndex >= 0) ? spend.options[spend.selectedIndex].text : spend.value,
          "Primary Challenge / Goal": document.getElementById('growth-goal') ? document.getElementById('growth-goal').value.trim() : 'Not specified',
          _subject: `New Growth Consultation Request - ${name.value.trim()} (${url.value.trim()})`,
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
        .then((res) => res.json())
        .then(() => {
          if (submitBtn) submitBtn.style.display = 'none';
          if (successBanner) {
            successBanner.classList.add('active');
            successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          form.reset();
        })
        .catch(() => {
          form.submit();
        });
      }
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
})();