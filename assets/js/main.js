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
    // Close when focus leaves the header + menu (e.g. tabbing past the last link) or on a click/tap outside.
    const inMenu = (el) => !!el && (header.contains(el) || mobileNav.contains(el));
    const onFocusOut = e => { if (!mobileNav.hidden && e.relatedTarget && !inMenu(e.relatedTarget)) setOpen(false); };
    header.addEventListener('focusout', onFocusOut);
    mobileNav.addEventListener('focusout', onFocusOut);
    document.addEventListener('pointerdown', e => { if (!mobileNav.hidden && !inMenu(e.target)) setOpen(false); });
  }

  // ---------- Scroll progress bar ----------
  const prog = document.querySelector('.scroll-progress span');
  if (prog) {
    let ticking = false;
    const upd = () => { ticking = false; const h = document.documentElement.scrollHeight - innerHeight; prog.style.setProperty('--p', h > 0 ? (scrollY / h).toFixed(4) : 0); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  // ---------- Section titles: word-by-word reveal (award pattern: split headline). Text stays one heading for screen readers. ----------
  const splits = [...document.querySelectorAll('[data-split]')];
  if (!stillOnly()) {
    splits.forEach(h => {
      let i = 0;
      const walk = node => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(part => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part; frag.appendChild(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(h);
    });
  }

  // ---------- Reveal on scroll (gentle; siblings stagger) ----------
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    const k = sibs.indexOf(el); if (k > 0) el.style.setProperty('--d', Math.min(k, 5) * 0.08 + 's');
  });
  const lone = splits.filter(h => !h.closest('.reveal'));
  if (!stillOnly() && 'IntersectionObserver' in window) {
    const ro = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => ro.observe(el));
    lone.forEach(el => ro.observe(el));
  } else { reveals.forEach(el => el.classList.add('in')); lone.forEach(el => el.classList.add('in')); }

  // ---------- Pinned "How it works" steps with a progress rail ----------
  const howGrid = document.querySelector('.how-grid');
  const steps = [...document.querySelectorAll('.how .step')];
  if (howGrid && steps.length && 'IntersectionObserver' in window) {
    const setStep = i => { steps.forEach((s, j) => s.classList.toggle('is-current', j === i)); howGrid.style.setProperty('--p', ((i + 1) / steps.length).toFixed(3)); };
    setStep(0);
    const stepIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setStep(steps.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => stepIO.observe(s));
  }

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

  // ---------- Places scroller buttons, counter and progress bar ----------
  const track = document.querySelector('.place-track');
  const places = track ? [...track.querySelectorAll('.place')] : [];
  document.querySelectorAll('[data-scroll]').forEach(b => b.addEventListener('click', () => {
    if (!track) return;
    const step = places[1] ? places[1].offsetWidth + 18 : 340;
    track.scrollBy({ left: step * Number(b.dataset.scroll), behavior: stillOnly() ? 'auto' : 'smooth' });
  }));
  if (track && places.length) {
    const now = document.querySelector('.sc-now');
    const pbar = document.querySelector('.scroller-bar span');
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 1;
      if (pbar) pbar.style.setProperty('--p', Math.max(0.1, p).toFixed(3));
      const left = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
      let idx = 0; places.forEach((pl, i) => { if (pl.getBoundingClientRect().left - left < pl.offsetWidth / 2) idx = i; });
      if (p > 0.995) idx = places.length - 1;
      if (now) now.textContent = String(idx + 1).padStart(2, '0');
    };
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    addEventListener('resize', sync); sync();
  }

  // ---------- Ocean-light shimmer behind the hero (tiny WebGL, half-res, ~30fps, pauses off-screen) ----------
  const cv = document.querySelector('canvas.hero-shimmer');
  const startShimmer = () => {
    if (!cv || stillOnly()) return;
    const gl = cv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) return;
    const hex = h => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
    const cols = (cv.dataset.colors || '#0B2545,#38B6E8,#FF7FA8').split(',').map(hex);
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = 'precision mediump float;uniform vec2 r;uniform float t;uniform vec3 c1,c2;' +
      'float blob(vec2 uv,vec2 c,float s){return exp(-dot(uv-c,uv-c)*s);}' +
      'void main(){vec2 uv=gl_FragCoord.xy/r;uv.x*=r.x/r.y;' +
      'float w=sin(uv.x*9.+t*.6+sin(uv.y*7.-t*.4)*1.6)*sin(uv.y*11.-t*.5)*.5+.5;' +
      'float caust=pow(w,6.)*.35*smoothstep(.0,.9,uv.y);' +
      'float a=blob(uv,vec2(.25+.2*sin(t*.11),.75+.12*cos(t*.13)),3.5);' +
      'float b=blob(uv,vec2(1.3+.25*cos(t*.09),.85+.1*sin(t*.12)),3.);' +
      'vec3 col=c1*(a*.55+caust)+c2*b*.5;float al=clamp(a*.55+b*.5+caust,0.,1.);gl_FragColor=vec4(col,al);}';
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n);
    gl.uniform3fv(U('c1'), cols[1]); gl.uniform3fv(U('c2'), cols[2]);
    const scale = 0.4;
    const resize = () => { const w = Math.max(1, cv.clientWidth * scale | 0), h = Math.max(1, cv.clientHeight * scale | 0);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(U('r'), w, h); } };
    const draw = time => { resize(); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform1f(U('t'), time / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    let visible = true, last = 0, raf = 0;
    const loop = t => { raf = requestAnimationFrame(loop); if (t - last < 33) return; last = t; draw(t); };
    const run = () => { cancelAnimationFrame(raf); if (visible && !document.hidden && !reduce.matches) raf = requestAnimationFrame(loop); };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(cv);
    document.addEventListener('visibilitychange', run);
    reduce.addEventListener && reduce.addEventListener('change', run);
  };
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 600));
  if (document.readyState === 'complete') idle(startShimmer); else addEventListener('load', () => idle(startShimmer), { once: true });
})();
