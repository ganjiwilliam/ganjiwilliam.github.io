/* ============================================================
   wcganji.github.io — portfolio interactions
   1. Theme toggle (persisted)
   2. Project category filtering
   3. Smooth anchor scrolling
   4. Scroll-reveal animations
   5. Active nav highlighting
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. THEME TOGGLE ---------- */
  const root   = document.documentElement;
  const toggle = document.getElementById('theme-toggle');

  const ICONS = { dark: '🌙', light: '☀️' };

  // Priority: saved choice > OS preference > dark
  const saved = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = saved || (prefersLight ? 'light' : 'dark');

  applyTheme(initial);

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.textContent = ICONS[theme];
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  // Follow the OS only if the user hasn't picked manually
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'light' : 'dark');
  });


  /* ---------- 2. PROJECT FILTERING ---------- */
  const filters = document.querySelectorAll('.filter');
  const cards   = document.querySelectorAll('.card[data-cat]');

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.filter;

      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on);
      });

      cards.forEach((card) => {
        const match = target === 'all' || card.dataset.cat === target;
        card.classList.toggle('hide', !match);

        // replay the reveal animation on newly shown cards
        if (match) {
          card.classList.remove('revealed');
          void card.offsetWidth;          // force reflow
          card.classList.add('revealed');
        }
      });
    });
  });


  /* ---------- 3. SMOOTH SCROLLING ---------- */
  const NAV_OFFSET = 70; // sticky header height

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET,
        behavior: 'smooth'
      });
      history.replaceState(null, '', id);
    });
  });


  /* ---------- 4. SCROLL REVEAL ---------- */
  const revealTargets = document.querySelectorAll('.card, .skill-group, .section-head');
  const reduceMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('revealed'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('revealed'), i * 70);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach((el) => observer.observe(el));
  }


  /* ---------- 5. ACTIVE NAV LINK ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav nav a[href^="#"]');

  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((l) => {
          l.classList.toggle('current', l.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { threshold: 0.3, rootMargin: '-70px 0px -50% 0px' });

    sections.forEach((s) => navObserver.observe(s));
  }

})();