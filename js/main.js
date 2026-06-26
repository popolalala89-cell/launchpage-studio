/* ============================================================
   LaunchPage Studio — Main JavaScript
   ============================================================ */

'use strict';

// ---- Utility Functions ----
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, ms = 200) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function throttle(fn, ms = 100) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}

// ---- Ripple Effect ----
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn, .fab-wa, .theme-toggle, .back-to-top, .chip');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// ---- Scroll Progress Bar ----
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
  window.addEventListener('scroll', throttle(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }, 20));
}

// ---- Navbar Scroll Effect ----
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', throttle(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, 50));
}

// ---- Mobile Hamburger ----
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

// ---- Dark Mode Toggle ----
const themeToggle = document.querySelector('.theme-toggle');
function getTheme() { return localStorage.getItem('launchpage-theme') || 'light'; }
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('launchpage-theme', theme);
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}
// Init theme
setTheme(getTheme());

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
}

// ---- Scroll Animations (AOS-like) ----
function observeAnimations() {
  const els = $$('.fade-up, .fade-in');
  if (els.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

// ---- Counter Animation ----
function animateCounters() {
  const counters = $$('.trust-number');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;
        const suffix = el.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * eased);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// ---- Portfolio Filter ----
function setupPortfolioFilter() {
  const chips = $$('.chip');
  const cards = $$('.portfolio-card');
  if (chips.length === 0) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.dataset.filter || 'all';

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            card.style.transition = 'all 0.4s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ---- Testimonial Carousel ----
function setupTestiCarousel() {
  const carousel = document.querySelector('.testi-carousel');
  const dots = $$('.testi-dot');
  if (!carousel || dots.length === 0) return;

  function updateDots() {
    const scrollLeft = carousel.scrollLeft;
    const cardWidth = carousel.children[0]?.offsetWidth + 24 || 1; // gap included
    const idx = Math.round(scrollLeft / cardWidth);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  carousel.addEventListener('scroll', throttle(updateDots, 100));

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const card = carousel.children[i];
      if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'start' });
    });
  });

  // Touch drag support
  let isDown = false;
  let startX;
  let scrollLeftStart;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.style.cursor = 'grabbing';
    startX = e.pageX - carousel.offsetLeft;
    scrollLeftStart = carousel.scrollLeft;
  });

  carousel.addEventListener('mouseleave', () => {
    isDown = false;
    carousel.style.cursor = 'grab';
  });

  carousel.addEventListener('mouseup', () => {
    isDown = false;
    carousel.style.cursor = 'grab';
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5;
    carousel.scrollLeft = scrollLeftStart - walk;
  });

  // Touch events
  carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX - carousel.offsetLeft;
    scrollLeftStart = carousel.scrollLeft;
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5;
    carousel.scrollLeft = scrollLeftStart - walk;
  }, { passive: true });
}

// ---- FAQ Accordion ----
function setupFAQ() {
  const items = $$('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => i.classList.remove('open'));
      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ---- Back to Top ----
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  window.addEventListener('scroll', throttle(() => {
    backToTop.classList.toggle('visible', window.scrollY > 300);
  }, 100));

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- Toast Notification ----
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// Copy phone/email to clipboard
document.addEventListener('click', (e) => {
  const copyEl = e.target.closest('[data-copy]');
  if (copyEl) {
    const text = copyEl.dataset.copy;
    navigator.clipboard?.writeText(text).then(() => {
      showToast('Tersalin: ' + text);
    }).catch(() => {});
  }
});

// ---- Smooth scroll for anchor links ----
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href');
  if (id === '#') return;
  const target = document.querySelector(id);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  }
});

// ---- Lazy loading images ----
if ('loading' in HTMLImageElement.prototype) {
  $$('img[loading="lazy"]').forEach(img => {
    img.src = img.dataset.src || img.src;
  });
} else {
  // Fallback: IntersectionObserver
  const lazyImages = $$('img[data-src]');
  if (lazyImages.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });
    lazyImages.forEach(img => observer.observe(img));
  }
}

// ---- Active nav link on scroll ----
function updateActiveNav() {
  const sections = $$('section[id]');
  const navLink = $$('.nav-links a[href^="#"]');
  if (sections.length === 0 || navLink.length === 0) return;

  const scrollPos = window.scrollY + 150;

  sections.forEach(section => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollPos >= top && scrollPos < bottom) {
      navLink.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }
  });
}

window.addEventListener('scroll', throttle(updateActiveNav, 100));

// ---- Initialize on DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
  observeAnimations();
  animateCounters();
  setupPortfolioFilter();
  setupTestiCarousel();
  setupFAQ();
  updateActiveNav();
});

// ---- Re-run animation observer for dynamic content ----
// If any new fade-up/fade-in elements are added later
const mutationObserver = new MutationObserver(() => observeAnimations());
mutationObserver.observe(document.body, { childList: true, subtree: true });
