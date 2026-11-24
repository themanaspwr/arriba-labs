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

  // 9. 6-Column Independent Lucky-Draw Roller Animation for Client Logos (No Machine / No Lever)
  const reelGrid = document.getElementById('client-reel-grid');
  if (reelGrid && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const sourceImgs = Array.from(reelGrid.querySelectorAll('img.specimen-logo'));
    if (sourceImgs.length >= 6) {
      const catalog = sourceImgs.map((img) => ({
        alt: img.alt || '',
        lightSrc: img.getAttribute('data-light-src') || img.getAttribute('src'),
        darkSrc: img.getAttribute('data-dark-src') || img.getAttribute('src'),
        hasDual: img.hasAttribute('data-light-src') && img.hasAttribute('data-dark-src'),
        monoWhite: img.classList.contains('logo--mono-white')
      }));

      const COLS = 6;
      const SLOT_H = 124;
      const reels = [];
      let isVisible = false;
      let isHovered = false;

      function createLogoSlot(item) {
        const slot = document.createElement('div');
        slot.className = 'logo-reel-slot';
        const img = document.createElement('img');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        img.src = isDark ? item.darkSrc : item.lightSrc;
        img.alt = item.alt;
        img.className = 'specimen-logo' + (item.monoWhite ? ' logo--mono-white' : '');
        if (item.hasDual) {
          img.setAttribute('data-light-src', item.lightSrc);
          img.setAttribute('data-dark-src', item.darkSrc);
        }
        slot.appendChild(img);
        return slot;
      }

      // Build 6 independent vertical roller columns (alternating UP / DOWN directions)
      // Each column owns strictly its own 3 logos (c, c+6, c+12) so duplicates across columns are impossible
      reelGrid.innerHTML = '';
      reelGrid.classList.add('is-reel-mode');

      for (let c = 0; c < COLS; c++) {
        const colItems = catalog.filter((_, idx) => idx % COLS === c);
        const win = document.createElement('div');
        win.className = 'logo-reel-window';
        const strip = document.createElement('div');
        strip.className = 'logo-reel-strip';
        strip.appendChild(createLogoSlot(colItems[0]));
        win.appendChild(strip);
        reelGrid.appendChild(win);
        reels.push({
          strip,
          items: colItems,
          currentIdx: 0,
          dir: c % 2 === 0 ? 'up' : 'down',
          spinning: false,
          timer: null
        });
      }

      function spinSingleReel(colIdx) {
        const reel = reels[colIdx];
        if (!isVisible || isHovered || reel.spinning) {
          scheduleReel(colIdx, 900 + Math.floor(Math.random() * 700));
          return;
        }

        const count = reel.items.length; // 3 logos dedicated to this column
        // Pick one of the other 2 logos in this column
        const stepOffset = 1 + Math.floor(Math.random() * Math.max(1, count - 1));
        const targetIdx = (reel.currentIdx + stepOffset) % count;

        // Spin 1-2 full loops through this column's own 3 logos before landing on targetIdx
        const fullLoops = 1 + Math.floor(Math.random() * 2);
        const totalSteps = fullLoops * count + stepOffset;
        const durationMs = 1150 + Math.floor(Math.random() * 750);
        const movingDown = reel.dir === 'down';

        reel.spinning = true;

        const strip = reel.strip;
        const targetItem = reel.items[targetIdx];

        // Sequence of logos from currentIdx -> targetIdx strictly within this column's 3 logos
        const seq = [];
        for (let s = 0; s <= totalSteps; s++) {
          seq.push(reel.items[(reel.currentIdx + s) % count]);
        }

        strip.style.transition = 'none';
        strip.innerHTML = '';

        if (movingDown) {
          // Moving DOWN: reverse so target is at top (index 0) and current is at bottom (index totalSteps)
          for (let s = seq.length - 1; s >= 0; s--) {
            strip.appendChild(createLogoSlot(seq[s]));
          }
          strip.style.transform = `translate3d(0, -${totalSteps * SLOT_H}px, 0)`;

          void strip.offsetHeight;

          strip.style.transition = `transform ${durationMs}ms cubic-bezier(0.15, 1.03, 0.28, 1)`;
          strip.style.transform = 'translate3d(0, 0, 0)';
        } else {
          // Moving UP: current at top (index 0), target at bottom (index totalSteps)
          for (let s = 0; s < seq.length; s++) {
            strip.appendChild(createLogoSlot(seq[s]));
          }
          strip.style.transform = 'translate3d(0, 0, 0)';

          void strip.offsetHeight;

          strip.style.transition = `transform ${durationMs}ms cubic-bezier(0.15, 1.03, 0.28, 1)`;
          strip.style.transform = `translate3d(0, -${totalSteps * SLOT_H}px, 0)`;
        }

        setTimeout(() => {
          // Settle cleanly onto target logo so DOM stays minimal
          strip.style.transition = 'none';
          strip.innerHTML = '';
          strip.appendChild(createLogoSlot(targetItem));
          strip.style.transform = 'translate3d(0, 0, 0)';
          reel.currentIdx = targetIdx;
          reel.spinning = false;

          // Independent dwell before this column's next spin (1.8s - 3.6s)
          if (isVisible) {
            scheduleReel(colIdx, 1800 + Math.floor(Math.random() * 1800));
          }
        }, durationMs + 60);
      }

      function scheduleReel(colIdx, delayMs) {
        const reel = reels[colIdx];
        if (reel.timer) clearTimeout(reel.timer);
        reel.timer = setTimeout(() => spinSingleReel(colIdx), delayMs);
      }

      function startAllReels() {
        for (let c = 0; c < COLS; c++) {
          // Staggered independent start times so every column rolls on its own rhythm
          const initialDelay = 250 + c * 260 + Math.floor(Math.random() * 450);
          scheduleReel(c, initialDelay);
        }
      }

      function stopAllReels() {
        reels.forEach((reel) => {
          if (reel.timer) {
            clearTimeout(reel.timer);
            reel.timer = null;
          }
        });
      }

      reelGrid.addEventListener('mouseenter', () => { isHovered = true; });
      reelGrid.addEventListener('mouseleave', () => { isHovered = false; });

      if ('IntersectionObserver' in window) {
        const reelObserver = new IntersectionObserver(
          (entries) => {
            const wasVisible = isVisible;
            isVisible = entries[0].isIntersecting;
            if (isVisible && !wasVisible) {
              startAllReels();
            } else if (!isVisible) {
              stopAllReels();
            }
          },
          { threshold: 0.15 }
        );
        reelObserver.observe(reelGrid);
      } else {
        isVisible = true;
        startAllReels();
      }
    }
  }

  /* --------------------------------------------------------------------------
     10. OUR EXPERTISE — RIGID-BODY FALLING INDUSTRY BRICKS (MATTER.JS)
         12 industry blocks drop naturally inside #expertise, collide & tumble
         on each other like weighted bricks, and stay readable on the floor.
     -------------------------------------------------------------------------- */
  const brickStage = document.getElementById('expertise-physics-stage');

  if (brickStage) {
    const INDUSTRIES = [
      { name: 'Kids Clothing', theme: 'brick--cream' },
      { name: 'FMCG', theme: 'brick--vermilion' },
      { name: 'Footwear', theme: 'brick--ink' },
      { name: 'Fashion & Apparel', theme: 'brick--plum' },
      { name: 'Beauty & Personal Care', theme: 'brick--violet' },
      { name: 'Home Decor & Luxury Living', theme: 'brick--cream' },
      { name: 'Real Estate', theme: 'brick--cobalt' },
      { name: 'Artisan & Handcrafted Goods', theme: 'brick--plum' },
      { name: 'Consumer Electronics & Audio', theme: 'brick--ink' },
      { name: 'Jewellery & Accessories', theme: 'brick--violet' },
      { name: 'Health & Wellness', theme: 'brick--cobalt' },
      { name: 'Global Non-Profits', theme: 'brick--vermilion' }
    ];

    const reduceMotionBricks =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotionBricks || typeof window.Matter === 'undefined') {
      // Static readable fallback for reduced-motion or missing engine
      brickStage.style.display = 'flex';
      brickStage.style.flexWrap = 'wrap';
      brickStage.style.alignContent = 'flex-end';
      brickStage.style.gap = '12px';
      brickStage.style.padding = '24px clamp(20px, 3.6vw, 48px) 32px';
      INDUSTRIES.forEach((item) => {
        const el = document.createElement('div');
        el.className = `industry-brick ${item.theme} is-dropped`;
        el.style.position = 'relative';
        el.innerHTML = `<span class="industry-brick-dot" aria-hidden="true"></span><span>${item.name}</span>`;
        brickStage.appendChild(el);
      });
    } else {
      const { Engine, World, Bodies, Body, Events } = window.Matter;

      const engine = Engine.create({
        gravity: { x: 0, y: 1.45, scale: 0.001 }
      });

      const WALL_T = 120;
      let walls = [];
      let brickEntries = []; // { el, body, w, h, dropped }
      let dropTimeouts = [];
      let hasTriggered = false;
      let rafId = null;
      let lastTs = 0;
      let quietFrames = 0;

      // Measure & build DOM bricks once so colliders match exact text dimensions
      function createDomBricks() {
        brickStage.innerHTML = '';
        brickEntries = INDUSTRIES.map((item) => {
          const el = document.createElement('div');
          el.className = `industry-brick ${item.theme}`;
          el.innerHTML = `<span class="industry-brick-dot" aria-hidden="true"></span><span>${item.name}</span>`;
          brickStage.appendChild(el);
          return {
            el,
            body: null,
            w: el.offsetWidth,
            h: el.offsetHeight,
            dropped: false
          };
        });
      }

      function buildWalls() {
        if (walls.length) {
          World.remove(engine.world, walls);
        }
        const W = brickStage.clientWidth;
        const H = brickStage.clientHeight;

        // Flush edge-to-edge boundaries (zero invisible side padding)
        const floor = Bodies.rectangle(W / 2, H + WALL_T / 2 - 2, W + WALL_T * 2, WALL_T, {
          isStatic: true,
          friction: 0.45,
          restitution: 0.14
        });
        const leftWall = Bodies.rectangle(-WALL_T / 2, H / 2 - 200, WALL_T, H + 900, {
          isStatic: true,
          friction: 0.15,
          restitution: 0.22
        });
        const rightWall = Bodies.rectangle(W + WALL_T / 2, H / 2 - 200, WALL_T, H + 900, {
          isStatic: true,
          friction: 0.15,
          restitution: 0.22
        });

        walls = [floor, leftWall, rightWall];
        World.add(engine.world, walls);
      }

      function syncDom() {
        for (let i = 0; i < brickEntries.length; i++) {
          const entry = brickEntries[i];
          if (!entry.body || !entry.dropped) continue;
          const x = entry.body.position.x - entry.w / 2;
          const y = entry.body.position.y - entry.h / 2;
          entry.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${entry.body.angle.toFixed(4)}rad)`;
        }
      }

      function stepPhysics(ts) {
        if (!lastTs) lastTs = ts;
        const dt = Math.min(24, Math.max(8, ts - lastTs));
        lastTs = ts;

        Engine.update(engine, dt);
        syncDom();

        // Pause RAF automatically once all dropped bricks settle on the floor (0% resting CPU)
        const allDropped = brickEntries.every((e) => e.dropped);
        if (allDropped) {
          let maxMotion = 0;
          for (let i = 0; i < brickEntries.length; i++) {
            const b = brickEntries[i].body;
            if (!b) continue;
            maxMotion = Math.max(maxMotion, b.speed, Math.abs(b.angularVelocity) * 18);
          }
          if (maxMotion < 0.12) {
            quietFrames++;
          } else {
            quietFrames = 0;
          }
          if (quietFrames > 75) {
            rafId = null;
            lastTs = 0;
            return;
          }
        }

        rafId = requestAnimationFrame(stepPhysics);
      }

      function startLoop() {
        if (!rafId) {
          lastTs = 0;
          rafId = requestAnimationFrame(stepPhysics);
        }
      }

      function dropBricks() {
        // Clear any pending staggered drops & old rigid bodies
        dropTimeouts.forEach((id) => clearTimeout(id));
        dropTimeouts = [];

        brickEntries.forEach((entry) => {
          if (entry.body) {
            World.remove(engine.world, entry.body);
            entry.body = null;
          }
          entry.dropped = false;
          entry.el.classList.remove('is-dropped');
          entry.w = entry.el.offsetWidth;
          entry.h = entry.el.offsetHeight;
        });

        buildWalls();
        quietFrames = 0;
        startLoop();

        const W = brickStage.clientWidth;

        // Shuffle drop order so every drop spreads naturally across the whole section
        const order = brickEntries.map((_, i) => i);
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }

        order.forEach((entryIdx, seq) => {
          const delay = seq * 110 + Math.floor(Math.random() * 60);
          const tid = setTimeout(() => {
            const entry = brickEntries[entryIdx];
            const minX = entry.w / 2 + 6;
            const maxX = Math.max(minX + 4, W - entry.w / 2 - 6);
            // Pure random X spread across the entire section width
            const spawnX = minX + Math.random() * (maxX - minX);
            const spawnY = -entry.h - 14 - Math.random() * 40;

            const body = Bodies.rectangle(spawnX, spawnY, entry.w, entry.h, {
              chamfer: { radius: 2 },
              restitution: 0.22,
              friction: 0.24,
              frictionStatic: 0.30,
              frictionAir: 0.008,
              density: 0.0028
            });

            Body.setAngle(body, (Math.random() - 0.5) * 0.36);
            Body.setVelocity(body, {
              x: (Math.random() - 0.5) * 2.4,
              y: 1.5 + Math.random() * 1.5
            });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.045);

            entry.body = body;
            entry.dropped = true;
            World.add(engine.world, body);
            entry.el.classList.add('is-dropped');
            quietFrames = 0;
            startLoop();
          }, delay);
          dropTimeouts.push(tid);
        });
      }

      createDomBricks();
      buildWalls();

      // Trigger first natural brick drop when #expertise scrolls into view
      const expertiseSection = document.getElementById('expertise') || brickStage;
      if ('IntersectionObserver' in window) {
        const brickObserver = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && !hasTriggered) {
              hasTriggered = true;
              dropBricks();
            }
          },
          { threshold: 0.2 }
        );
        brickObserver.observe(expertiseSection);
      } else {
        hasTriggered = true;
        dropBricks();
      }

      // Rebuild bounds cleanly if viewport width changes significantly
      let resizeTimer = null;
      let lastWidth = brickStage.clientWidth;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const newW = brickStage.clientWidth;
          if (Math.abs(newW - lastWidth) > 36) {
            lastWidth = newW;
            if (hasTriggered) {
              dropBricks();
            } else {
              buildWalls();
            }
          }
        }, 220);
      });
    }
  }

  /* --------------------------------------------------------------------------
     11. PRE-ONBOARDING AUDIT — ALTERNATING DOTTED ARROW FORMATION
         01 -> 02 (Left), 02 -> 03 (Right), 03 -> 04 (Left), 04 -> 05 (Right)
         Uses SVG mask reveal so dots form sequentially one by one along each
         curved path, followed by the arrowhead landing at the next step.
     -------------------------------------------------------------------------- */
  const auditRowsWrap = document.getElementById('audit-rows');
  const auditSvg = document.getElementById('audit-flow-svg');

  if (auditRowsWrap && auditSvg) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const rows = Array.from(auditRowsWrap.querySelectorAll('.audit-row'));
    const reduceMotionAudit =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let arrowSteps = [];
    let auditTimers = [];
    let auditVisible = false;

    function clearAuditTimers() {
      auditTimers.forEach((id) => clearTimeout(id));
      auditTimers = [];
    }

    function buildAuditArrows() {
      if (rows.length < 2) return;
      const W = auditRowsWrap.clientWidth;
      const H = auditRowsWrap.clientHeight;
      const isMobile = window.innerWidth < 720;
      const isNarrow = window.innerWidth < 1100;
      const edgeGap = isMobile ? 7 : isNarrow ? 10 : 18;
      const curveDepth = isMobile ? 16 : isNarrow ? 22 : 54;

      auditSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      auditSvg.innerHTML = '';

      const defs = document.createElementNS(SVG_NS, 'defs');
      auditSvg.appendChild(defs);

      arrowSteps = [];

      for (let i = 0; i < rows.length - 1; i++) {
        const isLeft = i % 2 === 0; // 01->02 Left, 02->03 Right, 03->04 Left, 04->05 Right
        const y1 = rows[i].offsetTop + rows[i].offsetHeight * 0.52;
        const y2 = rows[i + 1].offsetTop + rows[i + 1].offsetHeight * 0.52;
        const dy = y2 - y1;

        const xTip = isLeft ? -edgeGap : W + edgeGap;
        const cx = isLeft ? xTip - curveDepth : xTip + curveDepth;
        const c1y = y1 + dy * 0.14;
        const c2y = y2 - dy * 0.14;

        // Exact cubic Bezier arrival tangent angle at (xTip, y2) is direction (P3 - C2)
        const angle = Math.atan2(y2 - c2y, xTip - cx);
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Stop the dotted curve 7px before the arrowhead tip so no dot overlaps the wings
        const endX = xTip - cosA * 7;
        const endY = y2 - sinA * 7;
        const dPath = `M ${xTip} ${y1} C ${cx} ${c1y}, ${cx} ${c2y}, ${endX.toFixed(2)} ${endY.toFixed(2)}`;

        // Sleek filled arrowhead dart aligned dead-center with the curve's arrival tangent
        const headLen = 10;
        const headHalfW = 4.6;
        const notchBack = 7.2;
        const bx = xTip - cosA * headLen;
        const by = y2 - sinA * headLen;
        const lx = bx - sinA * headHalfW;
        const ly = by + cosA * headHalfW;
        const rx = bx + sinA * headHalfW;
        const ry = by - cosA * headHalfW;
        const nx = xTip - cosA * notchBack;
        const ny = y2 - sinA * notchBack;
        const dHead = `M ${xTip.toFixed(2)} ${y2.toFixed(2)} L ${lx.toFixed(2)} ${ly.toFixed(2)} L ${nx.toFixed(2)} ${ny.toFixed(2)} L ${rx.toFixed(2)} ${ry.toFixed(2)} Z`;

        // Mask path that smoothly reveals dots one-by-one from start to end
        const maskId = `audit-arrow-mask-${i}`;
        const mask = document.createElementNS(SVG_NS, 'mask');
        mask.setAttribute('id', maskId);
        mask.setAttribute('maskUnits', 'userSpaceOnUse');
        mask.setAttribute('x', String(-curveDepth - 40));
        mask.setAttribute('y', '-20');
        mask.setAttribute('width', String(W + (curveDepth + 40) * 2));
        mask.setAttribute('height', String(H + 40));

        const maskPath = document.createElementNS(SVG_NS, 'path');
        maskPath.setAttribute('d', dPath);
        maskPath.setAttribute('fill', 'none');
        maskPath.setAttribute('stroke', '#ffffff');
        maskPath.setAttribute('stroke-width', '12');
        maskPath.setAttribute('stroke-linecap', 'round');
        mask.appendChild(maskPath);
        defs.appendChild(mask);

        // Dotted visible stroke revealed by the mask
        const dotsPath = document.createElementNS(SVG_NS, 'path');
        dotsPath.setAttribute('d', dPath);
        dotsPath.setAttribute('class', 'audit-arrow-dots');
        dotsPath.setAttribute('mask', `url(#${maskId})`);
        auditSvg.appendChild(dotsPath);

        // Arrowhead at destination step
        const headPath = document.createElementNS(SVG_NS, 'path');
        headPath.setAttribute('d', dHead);
        headPath.setAttribute('class', 'audit-arrow-head');
        auditSvg.appendChild(headPath);

        const len = Math.ceil(maskPath.getTotalLength() || 180);
        maskPath.style.strokeDasharray = `${len} ${len}`;
        maskPath.style.strokeDashoffset = reduceMotionAudit ? '0' : `${len}`;

        if (reduceMotionAudit) {
          headPath.classList.add('is-visible');
        }

        arrowSteps.push({ maskPath, headPath, len, targetRow: rows[i + 1] });
      }
    }

    function resetAuditSequence() {
      rows.forEach((r) => r.classList.remove('is-step-active'));
      arrowSteps.forEach((step) => {
        step.maskPath.style.transition = 'none';
        step.maskPath.style.strokeDashoffset = `${step.len}`;
        step.headPath.classList.remove('is-visible');
      });
    }

    function runAuditSequence() {
      if (reduceMotionAudit || !auditVisible) return;
      clearAuditTimers();
      resetAuditSequence();

      // Highlight step 01 as the starting point
      if (rows[0]) rows[0].classList.add('is-step-active');

      const STEP_DRAW_MS = 820;
      const STEP_GAP_MS = 140;

      arrowSteps.forEach((step, idx) => {
        const startMs = 180 + idx * (STEP_DRAW_MS + STEP_GAP_MS);

        const tDraw = setTimeout(() => {
          void step.maskPath.getBoundingClientRect();
          step.maskPath.style.transition = `stroke-dashoffset ${STEP_DRAW_MS}ms cubic-bezier(0.35, 0, 0.25, 1)`;
          step.maskPath.style.strokeDashoffset = '0';
        }, startMs);

        const tHead = setTimeout(() => {
          step.headPath.classList.add('is-visible');
          if (step.targetRow) step.targetRow.classList.add('is-step-active');
        }, startMs + STEP_DRAW_MS - 90);

        auditTimers.push(tDraw, tHead);
      });

      // Hold all formed arrows cleanly for 3.6s, then re-form in sequence while visible
      const totalCycleMs = 180 + arrowSteps.length * (STEP_DRAW_MS + STEP_GAP_MS) + 3600;
      const tLoop = setTimeout(() => {
        if (auditVisible) runAuditSequence();
      }, totalCycleMs);
      auditTimers.push(tLoop);
    }

    buildAuditArrows();

    const auditSection = document.getElementById('approach') || auditRowsWrap;
    if ('IntersectionObserver' in window) {
      const auditObserver = new IntersectionObserver(
        (entries) => {
          const wasVisible = auditVisible;
          auditVisible = entries[0].isIntersecting;
          if (auditVisible && !wasVisible) {
            buildAuditArrows();
            runAuditSequence();
          } else if (!auditVisible) {
            clearAuditTimers();
          }
        },
        { threshold: 0.2 }
      );
      auditObserver.observe(auditSection);
    } else {
      auditVisible = true;
      runAuditSequence();
    }

    let auditResizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(auditResizeTimer);
      auditResizeTimer = setTimeout(() => {
        buildAuditArrows();
        if (auditVisible) runAuditSequence();
      }, 200);
    });
  }
})();
