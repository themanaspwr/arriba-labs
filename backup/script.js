/**
 * ARRIBA LABS - JAVASCRIPT INTERACTIONS
 * Pure Vanilla JS • No Frameworks • Fast & Accessible
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. STICKY NAVIGATION & ACTIVE SCROLL SPY
  // =========================================================================
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  const handleHeaderScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  const handleScrollSpy = () => {
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', () => {
    handleHeaderScroll();
    handleScrollSpy();
  }, { passive: true });

  handleHeaderScroll();

  // =========================================================================
  // 2. MOBILE NAVIGATION MENU
  // =========================================================================
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-menu-footer .btn');

  const toggleMobileMenu = (forceState) => {
    const isOpen = typeof forceState === 'boolean' 
      ? !forceState 
      : hamburgerBtn.classList.contains('active');

    if (!isOpen) {
      hamburgerBtn.classList.add('active');
      mobileMenu.classList.add('active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else {
      hamburgerBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  hamburgerBtn.addEventListener('click', () => toggleMobileMenu());

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMobileMenu(false);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburgerBtn.classList.contains('active')) {
      toggleMobileMenu(false);
    }
  });

  // =========================================================================
  // 3. SMOOTH SCROLL FOR ALL ANCHORS
  // =========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // =========================================================================
  // 4. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // =========================================================================
  // 5. ANIMATED STATS COUNTER
  // =========================================================================
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersAnimated = false;

  const easeOutQuad = (t) => t * (2 - t);

  const animateCounters = () => {
    const duration = 2000; // ms
    const startTime = performance.now();

    const updateCounts = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);

      statNumbers.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
        const suffix = counter.getAttribute('data-suffix') || '';

        const currentValue = easedProgress * target;

        if (decimals > 0) {
          counter.textContent = currentValue.toFixed(decimals) + suffix;
        } else {
          counter.textContent = Math.floor(currentValue) + suffix;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(updateCounts);
      } else {
        // Ensure final targets are exact
        statNumbers.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
          const suffix = counter.getAttribute('data-suffix') || '';
          counter.textContent = (decimals > 0 ? target.toFixed(decimals) : target) + suffix;
        });
      }
    };

    requestAnimationFrame(updateCounts);
  };

  const resultsSection = document.getElementById('results');
  if (resultsSection && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.25
    });

    statsObserver.observe(resultsSection);
  } else {
    animateCounters();
  }

  // =========================================================================
  // 6. TESTIMONIALS (GRID DISPLAY)
  // =========================================================================
  // Clean multi-card grid layout with hover animations, no carousel JS required.

  // =========================================================================
  // 7. CONTACT FORM VALIDATION & HANDLING
  // =========================================================================
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('full-name');
  const emailInput = document.getElementById('work-email');
  const companyInput = document.getElementById('company-name');
  const spendSelect = document.getElementById('ad-spend');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const companyError = document.getElementById('company-error');
  const spendError = document.getElementById('spend-error');

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const clearFieldError = (input, errorEl) => {
    input.classList.remove('has-error');
    if (errorEl) errorEl.classList.remove('active');
  };

  const showFieldError = (input, errorEl) => {
    input.classList.add('has-error');
    if (errorEl) errorEl.classList.add('active');
  };

  // Real-time error cleanup on input
  if (nameInput) nameInput.addEventListener('input', () => clearFieldError(nameInput, nameError));
  if (emailInput) emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
  if (companyInput) companyInput.addEventListener('input', () => clearFieldError(companyInput, companyError));
  if (spendSelect) spendSelect.addEventListener('change', () => clearFieldError(spendSelect, spendError));

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        showFieldError(nameInput, nameError);
        isValid = false;
      } else {
        clearFieldError(nameInput, nameError);
      }

      // Validate Email
      if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
        showFieldError(emailInput, emailError);
        isValid = false;
      } else {
        clearFieldError(emailInput, emailError);
      }

      // Validate Company
      if (!companyInput.value.trim()) {
        showFieldError(companyInput, companyError);
        isValid = false;
      } else {
        clearFieldError(companyInput, companyError);
      }

      // Validate Ad Spend
      if (!spendSelect.value) {
        showFieldError(spendSelect, spendError);
        isValid = false;
      } else {
        clearFieldError(spendSelect, spendError);
      }

      if (!isValid) return;

      // Submit feedback simulation
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="3" fill="none" style="animation: spin 0.8s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        <span>Securing Your Audit Slot...</span>
      `;

      // Simulating async submission
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;

        formStatus.className = 'form-status success';
        formStatus.textContent = '🎉 Strategy audit requested! A growth director will review your metrics and reach out within 24 hours.';
        
        form.reset();

        setTimeout(() => {
          formStatus.className = 'form-status';
          formStatus.textContent = '';
        }, 8000);
      }, 900);
    });
  }

  // Helper keyframe for submit spinner
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
});
