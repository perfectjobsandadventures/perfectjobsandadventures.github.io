/* Perfect Jobs & Adventures — main.js (vanilla, no build step) */

/* ============================================================
   SITE CONFIG — edit contact details here.
   whatsappNumber: international format, digits only (no +, spaces or leading 0).
   Every element with data-wa="Your pre-written message" gets a wa.me link built
   from this number, and every [data-email] / [data-tel] link is refreshed too,
   so changing a value here updates the whole page.
   ============================================================ */
const SITE = {
  whatsappNumber: '61413161195',          // Melissa's WhatsApp: 0413 161 195
  phoneDisplay: '0413 161 195',
  phoneTel: '+61413161195',
  email: 'info@perfectadventures.com.au',
  defaultMessage: 'Hi Perfect Jobs & Adventures!'
};

document.documentElement.classList.add('js');

(() => {
  const waLink = (msg) => `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg || SITE.defaultMessage)}`;

  // ---------- Contact links from SITE ----------
  document.querySelectorAll('[data-wa]').forEach(a => {
    a.href = waLink(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  document.querySelectorAll('[data-email]').forEach(a => {
    const subject = a.dataset.email ? `?subject=${encodeURIComponent(a.dataset.email)}` : '';
    a.href = `mailto:${SITE.email}${subject}`;
    if (a.hasAttribute('data-show')) a.textContent = SITE.email;
  });
  document.querySelectorAll('[data-tel]').forEach(a => {
    a.href = `tel:${SITE.phoneTel}`;
    if (a.hasAttribute('data-show')) a.textContent = SITE.phoneDisplay;
  });
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fineHover = matchMedia('(hover: hover) and (pointer: fine)');
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const stillOnly = () => reduce.matches || saveData;
  const small = () => matchMedia('(max-width: 767px)').matches;

  // ---------- Header: solid after scrolling, mobile menu ----------
  const header = document.querySelector('.site-header');
  const bar = document.querySelector('.bottom-bar');
  const hero = document.querySelector('[data-hero]');
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('is-solid', y > 40);
    if (bar && hero) bar.classList.toggle('is-visible', y > hero.offsetHeight * 0.7);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = document.querySelector('.menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    const setOpen = (open) => {
      mobileNav.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) header.classList.add('is-solid'); else onScroll();
    };
    menuBtn.addEventListener('click', () => setOpen(mobileNav.hidden));
    mobileNav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !mobileNav.hidden) { setOpen(false); menuBtn.focus(); } });
  }

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll('.reveal');
  if (!stillOnly() && 'IntersectionObserver' in window) {
    const ro = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => ro.observe(el));
  } else reveals.forEach(el => el.classList.add('in'));

  // ---------- Live photos ----------
  const cards = [...document.querySelectorAll('[data-live]')];

  function loadSources(video) {
    if (video.dataset.loaded) return;
    const size = small() ? '480' : '720';
    for (const [ext, type] of [['webm', 'video/webm'], ['mp4', 'video/mp4']]) {
      const s = document.createElement('source');
      s.src = `${video.dataset.base}-${size}.${ext}`;
      s.type = type;
      video.appendChild(s);
    }
    video.dataset.loaded = '1';
    video.load();
  }
  function setBadge(card, playing) {
    const b = card.querySelector('.live-badge');
    if (!b) return;
    b.setAttribute('aria-pressed', String(playing));
    b.setAttribute('aria-label', b.getAttribute('aria-label').replace(/^(Play|Pause)/, playing ? 'Pause' : 'Play'));
  }
  function play(card) {
    if (stillOnly()) return;
    for (const c of cards) if (c !== card && c.classList.contains('is-playing')) pause(c);
    const v = card.querySelector('video');
    loadSources(v);
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
    card.classList.add('is-playing');
    setBadge(card, true);
  }
  function pause(card) {
    const v = card.querySelector('video');
    if (v) v.pause();
    card.classList.remove('is-playing');
    setBadge(card, false);
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const e of entries) {
      const v = e.target.querySelector('video');
      if (e.isIntersecting) { if (!stillOnly() && fineHover.matches) loadSources(v); }
      else pause(e.target);
    }
  }, { rootMargin: '200px 0px' }) : null;

  for (const card of cards) {
    if (stillOnly()) { card.classList.add('is-static'); continue; }
    io && io.observe(card);
    const hoverEl = card.closest('.trip-card, .place') || card;
    hoverEl.addEventListener('pointerenter', e => { if (fineHover.matches && e.pointerType === 'mouse') play(card); });
    hoverEl.addEventListener('pointerleave', e => { if (fineHover.matches && e.pointerType === 'mouse') pause(card); });
    const badge = card.querySelector('.live-badge');
    badge && badge.addEventListener('click', () => card.classList.contains('is-playing') ? pause(card) : play(card));
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) cards.forEach(pause); });
  reduce.addEventListener && reduce.addEventListener('change', () => {
    if (reduce.matches) cards.forEach(c => { pause(c); c.classList.add('is-static'); });
  });

  // ---------- Hero loop (the only video that plays by itself; has a Pause button) ----------
  if (hero && !stillOnly()) {
    const hv = hero.querySelector('video');
    const btn = hero.querySelector('.hero-pause');
    const label = btn.querySelector('span');
    let userPaused = false;
    const heroPlay = () => { const p = hv.play(); if (p && p.catch) p.catch(() => {}); };
    const start = () => {
      if (hv.dataset.loaded) return;
      const size = small() ? '720' : '1080';
      for (const [ext, type] of [['webm', 'video/webm'], ['mp4', 'video/mp4']]) {
        const s = document.createElement('source');
        s.src = `${hv.dataset.base}-${size}.${ext}`; s.type = type; hv.appendChild(s);
      }
      hv.dataset.loaded = '1'; hv.load();
      hv.addEventListener('playing', () => hero.classList.add('is-playing'), { once: true });
      heroPlay();
      btn.hidden = false;
    };
    btn.addEventListener('click', () => {
      userPaused = !hv.paused;
      if (userPaused) { hv.pause(); label.textContent = 'Play video'; btn.setAttribute('aria-pressed', 'true'); }
      else { heroPlay(); label.textContent = 'Pause video'; btn.setAttribute('aria-pressed', 'false'); }
    });
    if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => {
      if (!hv.dataset.loaded) return;
      if (e.isIntersecting && !userPaused) heroPlay(); else hv.pause();
    }).observe(hero);
    document.addEventListener('visibilitychange', () => {
      if (!hv.dataset.loaded) return;
      if (document.hidden) hv.pause(); else if (!userPaused) heroPlay();
    });
    reduce.addEventListener && reduce.addEventListener('change', () => {
      if (reduce.matches) { hv.pause(); hero.classList.remove('is-playing'); btn.hidden = true; }
    });
  }

  // ---------- Pointer extras: card tilt + magnetic buttons (mouse only, motion allowed) ----------
  if (fineHover.matches && !stillOnly()) {
    document.querySelectorAll('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(x / r.width * 10).toFixed(1)}px, ${(y / r.height * 8).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- Places scroller buttons ----------
  const track = document.querySelector('.place-track');
  document.querySelectorAll('[data-scroll]').forEach(b => b.addEventListener('click', () => {
    if (!track) return;
    const step = track.querySelector('.place').offsetWidth + 16;
    track.scrollBy({ left: step * Number(b.dataset.scroll), behavior: stillOnly() ? 'auto' : 'smooth' });
  }));
})();
