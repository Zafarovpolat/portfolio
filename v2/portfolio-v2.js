/* Portfolio V2 - Light editorial motion */
gsap.registerPlugin(ScrollTrigger);

const TWEAK_DEFAULTS_V2 = /*EDITMODE-BEGIN*/{
  "accent": "#FF5B2E",
  "blur": 120,
  "grain": 25,
  "font": "'Geist', system-ui"
}/*EDITMODE-END*/;

function applyTweaks2(t) {
  document.documentElement.style.setProperty('--accent', t.accent);
  document.documentElement.style.setProperty('--blur', t.blur + 'px');
  document.documentElement.style.setProperty('--grain-opacity', (t.grain/100));
  document.documentElement.style.setProperty('--font', t.font);
}
let tweaks2 = { ...TWEAK_DEFAULTS_V2 };
applyTweaks2(tweaks2);

// ---------- Split text into chars ----------
function splitChars(el) {
  if (el.dataset.split) return;
  el.dataset.split = '1';
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach(ch => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(s);
  });
}

// ---------- Cursor ----------
function setupCursor2() {
  const c = document.getElementById('cursor2');
  if (!c) return;
  if (matchMedia('(max-width: 900px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
  let settled = false;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; settled = false; }, { passive: true });

  // Single ticker loop drives the spring; pause once it settles to save CPU
  gsap.ticker.add(() => {
    if (settled) return;
    const dx = mx - cx, dy = my - cy;
    cx += dx * 0.2; cy += dy * 0.2;
    c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) settled = true;
  });

  const hovEls = document.querySelectorAll('a, button, [data-magnet]');
  hovEls.forEach(el => {
    el.addEventListener('mouseenter', () => c.classList.add('hover'));
    el.addEventListener('mouseleave', () => c.classList.remove('hover'));
  });

  // Magnet effect — use quickTo for high-frequency updates instead of new tween per event
  document.querySelectorAll('[data-magnet]').forEach(el => {
    const setX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const setY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      setX((e.clientX - r.left - r.width/2) * 0.2);
      setY((e.clientY - r.top - r.height/2) * 0.2);
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
    });
  });
}

// ---------- Reveal ----------
function setupReveals2() {
  document.querySelectorAll('[data-reveal]').forEach(el => splitChars(el));

  // Hero immediate
  gsap.from('.hero2-title [data-reveal] .char', {
    yPercent: 110,
    duration: 1,
    stagger: { amount: 0.8 },
    ease: "power4.out",
    delay: 0.2
  });
  gsap.from('.hero2-kicker', { opacity: 0, y: 20, duration: 0.8, delay: 0.2 });
  gsap.from('.hero2-sub', { opacity: 0, y: 20, duration: 0.8, delay: 0.6 });
  gsap.from('.hero2-cta > *', { opacity: 0, y: 20, duration: 0.6, stagger: 0.1, delay: 0.8 });
  gsap.from('.stage-main', { opacity: 0, y: 40, scale: 0.95, duration: 1.2, delay: 0.9, ease: "power3.out" });
  gsap.from('.stage-chip', { opacity: 0, y: 30, scale: 0.9, duration: 0.8, stagger: 0.15, delay: 1.4, ease: "back.out(1.4)" });

  // Section titles scroll-reveal
  document.querySelectorAll('.sec2-title [data-reveal] .char').forEach(c => {
    gsap.from(c, {
      yPercent: 110,
      duration: 0.8,
      ease: "power4.out",
      scrollTrigger: {
        trigger: c.closest('.sec2-title'),
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  });
}

// ---------- Parallax chips ----------
function setupStageParallax() {
  const stage = document.querySelector('.hero2-stage');
  if (!stage) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const stageMain = document.querySelector('.stage-main');
  const chip1 = document.querySelector('.chip-1');
  const chip2 = document.querySelector('.chip-2');
  const chip3 = document.querySelector('.chip-3');
  if (!stageMain) return;

  // Light scroll parallax — single scrub trigger reused across targets
  gsap.to(stageMain, {
    y: -40,
    scrollTrigger: { trigger: stage, start: 'top 80%', end: 'bottom top', scrub: 1 }
  });

  // High-frequency mouse parallax via quickTo (cheap; only schedules one tween)
  const ease = 'power2.out';
  const setRY = gsap.quickTo(stageMain, 'rotateY', { duration: 0.6, ease });
  const setRX = gsap.quickTo(stageMain, 'rotateX', { duration: 0.6, ease });
  gsap.set(stageMain, { transformPerspective: 1200, transformOrigin: 'center center' });

  const mk = (el) => el ? {
    x: gsap.quickTo(el, 'x', { duration: 0.8, ease }),
    y: gsap.quickTo(el, 'y', { duration: 0.8, ease })
  } : null;
  const c1 = mk(chip1), c2 = mk(chip2), c3 = mk(chip3);

  let nx = 0, ny = 0, raf = 0;
  const flush = () => {
    raf = 0;
    setRY(nx * 6); setRX(-ny * 4);
    if (c1) { c1.x(nx * 30); c1.y(ny * 20); }
    if (c2) { c2.x(-nx * 20); c2.y(-ny * 16); }
    if (c3) { c3.x(nx * 36); c3.y(ny * 22); }
  };

  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    nx = (e.clientX - r.left - r.width / 2) / r.width;
    ny = (e.clientY - r.top - r.height / 2) / r.height;
    if (!raf) raf = requestAnimationFrame(flush);
  }, { passive: true });
  stage.addEventListener('mouseleave', () => {
    nx = 0; ny = 0;
    if (!raf) raf = requestAnimationFrame(flush);
  });
}

// ---------- Soft blob drift ----------
function animateBlobs() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Pause blob/grain animations when the hero is offscreen so the rest of the
  // page doesn't pay for them while scrolling.
  const blobs = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
    .to('.b1', { x: 120, y: 80, duration: 14 }, 0)
    .to('.b2', { x: -100, y: 60, duration: 16 }, 0)
    .to('.b3', { x: 140, y: -80, duration: 18 }, 0);

  const hero = document.querySelector('.hero2');
  if (hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) en.isIntersecting ? blobs.play() : blobs.pause();
    }, { rootMargin: '200px' });
    io.observe(hero);
  }
}

// ---------- Counters ----------
function setupCounters2() {
  document.querySelectorAll('.stat2').forEach(el => {
    const to = parseInt(el.dataset.to, 10);
    const n = el.querySelector('.num');
    ScrollTrigger.create({
      trigger: el, start: "top 85%", once: true,
      onEnter: () => {
        gsap.fromTo({ v: 0 }, { v: 0 }, {
          v: to, duration: 1.4, ease: "power2.out",
          onUpdate() { n.textContent = Math.round(this.targets()[0].v); }
        });
      }
    });
  });
}

// ---------- Section reveals ----------
function setupProcAnim() {
  // Each project card has its own trigger so individual cards fade in as they
  // enter the viewport (instead of waiting for the whole list to be near the
  // top, which made the second/third cards feel delayed).
  document.querySelectorAll('.p2').forEach(card => {
    gsap.from(card, {
      opacity: 0, y: 40, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 90%', once: true }
    });
  });

  gsap.from('.proc-card', {
    opacity: 0, y: 40, duration: 0.6, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: '.proc-grid', start: 'top 85%', once: true }
  });
  gsap.from('.sk-cat', {
    opacity: 0, y: 30, duration: 0.5, stagger: 0.06, ease: 'power3.out',
    scrollTrigger: { trigger: '.stack2-grid', start: 'top 85%', once: true }
  });
  gsap.from('.compare-col', {
    opacity: 0, y: 40, duration: 0.7, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.compare-grid', start: 'top 85%', once: true }
  });
  // c2-card has [data-magnet] which owns the transform via quickTo. Avoid
  // tweening the same transform here — opacity-only fade-in keeps the reveal
  // clean and doesn't fight the magnet effect.
  gsap.set('.c2-card', { opacity: 0 });
  ScrollTrigger.create({
    trigger: '.c2-cards', start: 'top 90%', once: true,
    onEnter: () => gsap.to('.c2-card', {
      opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out'
    })
  });
}

// ---------- Smooth scroll for anchor clicks ----------
function setupSmoothScroll2() {
  const smoothScrollTo = (targetY, duration = 900) => {
    const startY = window.scrollY || document.documentElement.scrollTop;
    const delta = targetY - startY;
    if (Math.abs(delta) < 2) return;
    const startT = performance.now();
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (now) => {
      const elapsed = now - startT;
      const t = Math.min(1, elapsed / duration);
      window.scrollTo(0, startY + delta * ease(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (href === '#' || href.length < 2) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      const rect = target.getBoundingClientRect();
      const absTop = rect.top + (window.scrollY || 0) - 20;
      smoothScrollTo(absTop, 900);
      history.replaceState(null, '', href);
    });
  });

  // Nav scrolled state
  const nav = document.querySelector('.nav2');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', (window.scrollY || 0) > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

// ---------- Typed text helper (matches v1) ----------
function typeText2(el, text, speed = 18) {
  return new Promise(resolve => {
    el.classList.add('is-typing');
    el.textContent = '';
    const chars = [...text];
    let i = 0;
    const tick = () => {
      if (i >= chars.length) {
        el.classList.remove('is-typing');
        resolve();
        return;
      }
      el.textContent += chars[i++];
      const c = chars[i - 1];
      const d = (c === ',' || c === ';') ? speed * 4
              : (c === '.' || c === '!' || c === '?') ? speed * 6
              : c === ' ' ? speed * 0.6
              : speed;
      setTimeout(tick, d);
    };
    tick();
  });
}

// ---------- AI ---------- (real Gemini, same wiring as v1)
const GEMINI_API_KEY_V2 = 'AIzaSyDBkXSCP-OQE2ApCtvhmcFZyb_6WyT2vfs';
const GEMINI_URL_V2 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY_V2}`;

const aiContext = `You are "Polat.AI" — a live concierge embedded on Polat Zafarov's portfolio. Always answer in the same language the visitor uses (English / Russian / Uzbek). First-person about Polat ("Polat has…", "He's built…"). Be friendly, confident, concrete. Keep answers to 1–3 crisp sentences unless the question explicitly asks for detail.

ABOUT POLAT
- 19-year-old Frontend Developer based in Tashkent, Uzbekistan.
- 2+ years of commercial experience. Currently Frontend at Digital Agency RUSO (since July 2024) plus freelance on the side.
- 10+ production projects for clients across Russia, Uzbekistan, Azerbaijan.
- Studying Computer Engineering at TUIT, 2nd year, GPA 4.0, expected graduation 2028.
- Languages: Uzbek (native), Russian (C2), English (B2 upper-intermediate).
- Looking for: remote Frontend (React / Next.js), open to growing toward full-stack. Rate around $800/mo full-time, hourly negotiable for shorter engagements.

SHIPPED PROJECTS
- FUTURA Architects (futura-architects.com) — architecture studio site, GSAP + Swiper + October CMS + SCSS.
- Electro New Tech (electro.newtech.az) — e-commerce store, WordPress + WooCommerce + jQuery + SCSS, custom theme/cart/checkout.
- Dekor House (@DekorHouseUzBot) — Telegram Mini App, home-decor store, React + Telegram SDK + Firebase + Bot API + payments.
- Lecto (@lectoaibot) — AI study assistant Telegram Mini App. Stack: React 18 + FastAPI + PostgreSQL + Google Gemini 2.0. Features: PDF / DOCX / TXT upload, OCR for images, Smart Notes, quizzes, flashcards, RAG search across user library, PPTX generation.
- Other: WhatsApp bulk sender (Node.js + React + Socket.IO + Puppeteer, Docker on Railway), trainer-booking app (React + TS + Tailwind + Node/Express on Vercel Serverless), legal-company landing (SCSS, Bitrix-ready), Q&A platform migration WordPress → Next.js.

STACK
- Frontend Core: React, Next.js 15, Vue 3, TypeScript, JavaScript, HTML5, CSS3.
- Styling & Motion: Tailwind, SCSS, Framer Motion, GSAP, Swiper.
- State: Redux Toolkit, Zustand.
- Backend & DB: Node.js, Express, Python 3.11, FastAPI, PostgreSQL, Firebase/Firestore, Supabase.
- CMS & Commerce: WordPress, WooCommerce, REST, headless CMS.
- Integrations: Telegram Bot API, Stripe, Puppeteer, Socket.IO, OpenAI / Gemini APIs.
- DevOps: Git, Docker Compose, Vercel, Railway.
- AI-assisted daily driver: Claude Code, OpenCode.
- 50+ public GitHub repos.

CONTACT
- Email: atuin59354081@gmail.com
- Telegram: @zafarovpolat
- Phone: +998 95 973 88 88
- GitHub: github.com/Zafarovpolat

If asked something not covered above (random trivia, opinions on unrelated topics), politely steer back to Polat / his work.`;

function setupAI2() {
  const form = document.getElementById('ai2-form');
  const input = document.getElementById('ai2-input');
  const log = document.getElementById('ai2-log');
  if (!form || !input || !log) return;

  // Type-out welcome message when the section scrolls into view
  const welcomeRow = log.querySelector('.ai2-row');
  if (welcomeRow) {
    const msgEl = welcomeRow.querySelector('p');
    if (msgEl) {
      const full = msgEl.textContent;
      msgEl.textContent = '';
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            typeText2(msgEl, full, 20);
            obs.disconnect();
          }
        });
      }, { threshold: 0.35 });
      io.observe(welcomeRow);
    }
  }

  function addRow(who, text) {
    const r = document.createElement('div');
    r.className = 'ai2-row ' + (who === 'user' ? 'user' : '');
    r.innerHTML = `<span class="ai2-tag mono">${who === 'user' ? 'YOU' : 'POLAT.AI'}</span><p></p>`;
    r.querySelector('p').textContent = text;
    log.appendChild(r);
    log.scrollTop = log.scrollHeight;
    return r;
  }
  async function addRowTyped(who, text, speed = 16) {
    const r = document.createElement('div');
    r.className = 'ai2-row ' + (who === 'user' ? 'user' : '');
    r.innerHTML = `<span class="ai2-tag mono">${who === 'user' ? 'YOU' : 'POLAT.AI'}</span><p></p>`;
    log.appendChild(r);
    log.scrollTop = log.scrollHeight;
    await typeText2(r.querySelector('p'), text, speed);
    return r;
  }
  function addRowLoading() {
    const r = document.createElement('div');
    r.className = 'ai2-row';
    r.innerHTML = `<span class="ai2-tag mono">POLAT.AI</span><p><span class="ai-dots"><span></span><span></span><span></span></span></p>`;
    log.appendChild(r);
    log.scrollTop = log.scrollHeight;
    return r;
  }

  async function ask(q) {
    await addRowTyped('user', q, 14);
    const loadingRow = addRowLoading();
    let text = '';
    try {
      const res = await fetch(GEMINI_URL_V2, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: aiContext }] },
          contents: [{ role: 'user', parts: [{ text: q }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 320, topP: 0.95 }
        })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (!text) throw new Error('empty response');
    } catch (e) {
      console.error('Gemini error:', e);
      text = "I can't reach my brain right now — try again in a minute, or ping Polat directly at atuin59354081@gmail.com / @zafarovpolat.";
    }
    const msgEl = loadingRow.querySelector('p');
    msgEl.innerHTML = '';
    await typeText2(msgEl, text, 16);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim(); if (!q) return;
    input.value = '';
    ask(q);
  });
  document.querySelectorAll('.ai2-chip').forEach(b => {
    b.addEventListener('click', () => {
      if (b.disabled) return;
      document.querySelectorAll('.ai2-chip').forEach(x => x.disabled = true);
      ask(b.dataset.q).finally(() => {
        document.querySelectorAll('.ai2-chip').forEach(x => x.disabled = false);
      });
    });
  });
}

// ---------- Tweaks ----------
function setupTweaks2() {
  const panel = document.getElementById('tweaks2');
  const close = document.getElementById('tw2-close');
  window.addEventListener('message', e => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') panel.classList.remove('hidden');
    if (d.type === '__deactivate_edit_mode') panel.classList.add('hidden');
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}
  close.addEventListener('click', () => panel.classList.add('hidden'));
  function persist() { try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: tweaks2 }, '*'); } catch {} }

  document.querySelectorAll('.tw2-sws button').forEach(s =>
    s.addEventListener('click', () => { tweaks2.accent = s.dataset.accent; applyTweaks2(tweaks2); persist(); }));
  document.getElementById('tw2-blur').addEventListener('input', e => { tweaks2.blur = +e.target.value; applyTweaks2(tweaks2); persist(); });
  document.getElementById('tw2-grain').addEventListener('input', e => { tweaks2.grain = +e.target.value; applyTweaks2(tweaks2); persist(); });
  document.getElementById('tw2-font').addEventListener('change', e => { tweaks2.font = e.target.value; applyTweaks2(tweaks2); persist(); });

  document.getElementById('tw2-blur').value = tweaks2.blur;
  document.getElementById('tw2-grain').value = tweaks2.grain;
  document.getElementById('tw2-font').value = tweaks2.font;
}

window.addEventListener('load', () => {
  setupCursor2();
  setupSmoothScroll2();
  setupReveals2();
  animateBlobs();
  setupStageParallax();
  setupCounters2();
  setupProcAnim();
  setupAI2();
  setupTweaks2();
});
