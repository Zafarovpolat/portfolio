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
  let mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  gsap.ticker.add(() => {
    cx += (mx-cx)*0.2; cy += (my-cy)*0.2;
    c.style.transform = `translate(${cx}px, ${cy}px)`;
  });
  document.querySelectorAll('a, button, [data-magnet]').forEach(el => {
    el.addEventListener('mouseenter', () => c.classList.add('hover'));
    el.addEventListener('mouseleave', () => c.classList.remove('hover'));
  });
  document.querySelectorAll('[data-magnet]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width/2)*0.2, y: (e.clientY - r.top - r.height/2)*0.2, duration: 0.4 });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" }));
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

// ---------- Stage mouse-parallax (no scroll-driven motion — user wants stage to only move on mousemove) ----------
function setupStageParallax() {
  const stage = document.querySelector('.hero2-stage');
  if (!stage) return;

  // Mouse-parallax only — no ScrollTrigger here.
  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) / r.width;
    const y = (e.clientY - r.top - r.height/2) / r.height;
    gsap.to('.stage-main', { rotateY: x * 6, rotateX: -y * 4, duration: 0.6, transformPerspective: 1200 });
    gsap.to('.chip-1', { x: x * 30, y: y * 20, duration: 0.8 });
    gsap.to('.chip-2', { x: -x * 20, y: -y * 16, duration: 0.8 });
    gsap.to('.chip-3', { x: x * 36, y: y * 22, duration: 0.8 });
  });
  stage.addEventListener('mouseleave', () => {
    gsap.to('.stage-main', { rotateY: 0, rotateX: 0, duration: 0.8 });
    gsap.to('.chip-1, .chip-2, .chip-3', { x: 0, y: 0, duration: 0.8 });
  });
}

// ---------- Soft blob drift ----------
function animateBlobs() {
  gsap.to('.b1', { x: 120, y: 80, duration: 14, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to('.b2', { x: -100, y: 60, duration: 16, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to('.b3', { x: 140, y: -80, duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut" });
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

// ---------- Process cards slide-in ----------
function setupProcAnim() {
  gsap.from('.proc-card', {
    opacity: 0, y: 40, duration: 0.7, stagger: 0.1, ease: "power3.out",
    scrollTrigger: { trigger: '.proc-grid', start: "top 80%" }
  });
  gsap.from('.p2', {
    opacity: 0, y: 60, duration: 0.9, stagger: 0.15, ease: "power3.out",
    scrollTrigger: { trigger: '.work2-list', start: "top 80%" }
  });
  gsap.from('.sk-cat', {
    opacity: 0, y: 30, duration: 0.7, stagger: 0.08, ease: "power3.out",
    scrollTrigger: { trigger: '.stack2-grid', start: "top 80%" }
  });
  gsap.from('.compare-col', {
    opacity: 0, y: 40, duration: 0.9, stagger: 0.15, ease: "power3.out",
    scrollTrigger: { trigger: '.compare-grid', start: "top 80%" }
  });
  gsap.from('.c2-card', {
    opacity: 0, y: 20, duration: 0.5, stagger: 0.06, ease: "power2.out",
    scrollTrigger: { trigger: '.c2-cards', start: "top 85%" }
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
