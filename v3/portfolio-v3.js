gsap.registerPlugin(ScrollTrigger);

const TWEAK_DEFAULTS_V3 = /*EDITMODE-BEGIN*/{
  "accent": "#6366F1",
  "grad": 60,
  "spark": true
}/*EDITMODE-END*/;

function applyTweaks3(t) {
  document.documentElement.style.setProperty('--accent', t.accent);
  document.documentElement.style.setProperty('--grad-opacity', (t.grad/100));
  document.querySelectorAll('.sparkle').forEach(s => s.style.display = t.spark ? '' : 'none');
}
let tweaks3 = { ...TWEAK_DEFAULTS_V3 };
applyTweaks3(tweaks3);

// Split chars
function split3(el) {
  if (el.dataset.split) return;
  el.dataset.split = '1';
  const t = el.textContent; el.textContent = '';
  [...t].forEach(c => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = c === ' ' ? '\u00A0' : c;
    el.appendChild(s);
  });
}

// Cursor
function setupCursor3() {
  const c = document.getElementById('cursor3');
  if (!c) return;
  let mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  gsap.ticker.add(() => {
    cx += (mx-cx)*0.22; cy += (my-cy)*0.22;
    c.style.transform = `translate(${cx}px, ${cy}px)`;
  });
  document.querySelectorAll('a, button, [data-magnet], summary').forEach(el => {
    el.addEventListener('mouseenter', () => c.classList.add('hover'));
    el.addEventListener('mouseleave', () => c.classList.remove('hover'));
  });
  document.querySelectorAll('[data-magnet]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x:(e.clientX-r.left-r.width/2)*0.2, y:(e.clientY-r.top-r.height/2)*0.2, duration:0.4 });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { x:0, y:0, duration:0.5, ease:"elastic.out(1,0.4)" }));
  });
}

// Reveals
function setupReveals3() {
  document.querySelectorAll('[data-reveal]').forEach(el => split3(el));

  // Hero reveal
  gsap.from('.hero3-title [data-reveal] .char', {
    yPercent: 110, opacity: 0, duration: 0.9,
    stagger: { amount: 0.8 }, ease: "power4.out", delay: 0.2
  });
  gsap.from('.hero3-badge', { opacity: 0, y: 20, duration: 0.7, delay: 0.1 });
  gsap.from('.hero3-sub', { opacity: 0, y: 20, duration: 0.7, delay: 0.7 });
  gsap.from('.hero3-cta > *', { opacity: 0, y: 20, duration: 0.6, stagger: 0.1, delay: 0.9 });
  gsap.from('.demo-main', { opacity: 0, y: 60, scale: 0.95, duration: 1.1, delay: 1.0, ease: "power3.out" });
  gsap.from('.float-card', { opacity: 0, y: 40, scale: 0.85, duration: 0.7, stagger: 0.12, delay: 1.5, ease: "back.out(1.6)" });
  gsap.from('.hero3-logos', { opacity: 0, y: 30, duration: 0.8, delay: 1.6 });

  // Section titles
  document.querySelectorAll('.sec3-title [data-reveal] .char').forEach(c => {
    gsap.from(c, {
      yPercent: 110, opacity: 0, duration: 0.8, ease: "power4.out",
      scrollTrigger: { trigger: c.closest('.sec3-title'), start: "top 85%", toggleActions: "play none none reverse" }
    });
  });

  // c3-huge reveal
  document.querySelectorAll('.c3-huge [data-reveal] .char').forEach(c => {
    gsap.from(c, {
      yPercent: 110, opacity: 0, duration: 0.8, ease: "power4.out",
      scrollTrigger: { trigger: c.closest('.c3-huge'), start: "top 85%" }
    });
  });

  // Feature rows
  gsap.utils.toArray('.feat-row').forEach((row, i) => {
    gsap.from(row, {
      opacity: 0, y: 60, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 85%" }
    });
  });
  gsap.from('.w3-card', {
    opacity: 0, y: 40, duration: 0.8, stagger: 0.1, ease: "power3.out",
    scrollTrigger: { trigger: '.work3-list', start: "top 80%" }
  });
  gsap.from('.m3-cell', {
    opacity: 0, y: 30, duration: 0.7, stagger: 0.1, ease: "power3.out",
    scrollTrigger: { trigger: '.m3-row', start: "top 85%" }
  });
  gsap.from('.faq3-list details', {
    opacity: 0, y: 20, duration: 0.6, stagger: 0.08,
    scrollTrigger: { trigger: '.faq3-list', start: "top 85%" }
  });
  // c3-cards: explicit set + onEnter (more reliable than gsap.from when many
  // triggers compete for layout on page load)
  gsap.set('.c3-card', { opacity: 0, y: 30 });
  ScrollTrigger.create({
    trigger: '.c3-grid', start: "top 90%", once: true,
    onEnter: () => gsap.to('.c3-card', {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out"
    })
  });
}

// Smooth scroll for in-page anchor links + sticky-nav scrolled state
function setupNav3() {
  const smoothScrollTo = (targetY, duration = 900) => {
    const startY = window.scrollY || document.documentElement.scrollTop;
    const delta = targetY - startY;
    if (Math.abs(delta) < 2) return;
    const startT = performance.now();
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (now) => {
      const t = Math.min(1, (now - startT) / duration);
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
      smoothScrollTo(rect.top + (window.scrollY || 0) - 20, 900);
      history.replaceState(null, '', href);
    });
  });
  const nav = document.querySelector('.nav3');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', (window.scrollY || 0) > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

// Demo parallax (mouse + scroll)
function setupDemoParallax() {
  const stage = document.getElementById('hero3Demo');
  if (!stage) return;

  gsap.to('.demo-main', {
    y: -40,
    scrollTrigger: { trigger: stage, start: "top 80%", end: "bottom top", scrub: 1 }
  });
  gsap.to('.fc-1', { y: -80, x: 30, scrollTrigger: { trigger: stage, start: "top 80%", end: "bottom top", scrub: 1 } });
  gsap.to('.fc-2', { y: -60, x: -30, scrollTrigger: { trigger: stage, start: "top 80%", end: "bottom top", scrub: 1 } });
  gsap.to('.fc-3', { y: -100, x: 40, scrollTrigger: { trigger: stage, start: "top 80%", end: "bottom top", scrub: 1.5 } });
  gsap.to('.fc-4', { y: -50, x: -50, scrollTrigger: { trigger: stage, start: "top 80%", end: "bottom top", scrub: 1.2 } });

  // Gentle float
  gsap.to('.fc-1', { y: "+=10", duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to('.fc-2', { y: "+=12", duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to('.fc-3', { y: "+=8", duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to('.fc-4', { y: "+=14", duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });

  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) / r.width;
    const y = (e.clientY - r.top - r.height/2) / r.height;
    gsap.to('.demo-main', { rotateY: x * 6, rotateX: -y * 4, duration: 0.6, transformPerspective: 1200 });
  });
  stage.addEventListener('mouseleave', () => gsap.to('.demo-main', { rotateY: 0, rotateX: 0, duration: 0.8 }));
}

// Typed text helper (matches v1/v2)
function typeText3(el, text, speed = 18) {
  return new Promise(resolve => {
    el.classList.add('is-typing');
    el.textContent = '';
    const chars = [...text];
    let i = 0;
    const tick = () => {
      if (i >= chars.length) { el.classList.remove('is-typing'); resolve(); return; }
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

// AI — real Gemini, same wiring as v1/v2
const GEMINI_API_KEY_V3 = 'AIzaSyDBkXSCP-OQE2ApCtvhmcFZyb_6WyT2vfs';
const GEMINI_URL_V3 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY_V3}`;

const aiCtx3 = `You are "Polat.AI" — a live concierge embedded on Polat Zafarov's portfolio. Always answer in the same language the visitor uses (English / Russian / Uzbek). First-person about Polat ("Polat has…", "He's built…"). Be friendly, confident, concrete. Keep answers to 1–3 crisp sentences unless the question explicitly asks for detail.

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

function setupAI3() {
  const form = document.getElementById('ai3-form');
  const input = document.getElementById('ai3-input');
  const log = document.getElementById('ai3-log');
  if (!form || !input || !log) return;

  // Type-out welcome message when the AI section scrolls into view
  const welcomeRow = log.querySelector('.ai3-row');
  if (welcomeRow) {
    const msgEl = welcomeRow.querySelector('p');
    if (msgEl) {
      const full = msgEl.textContent;
      msgEl.textContent = '';
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            typeText3(msgEl, full, 20);
            obs.disconnect();
          }
        });
      }, { threshold: 0.35 });
      io.observe(welcomeRow);
    }
  }

  function addRow(who, text) {
    const r = document.createElement('div');
    r.className = 'ai3-row ' + (who === 'user' ? 'user' : '');
    r.innerHTML = `<span class="ai3-tag">${who === 'user' ? 'YOU' : 'POLAT.AI'}</span><p></p>`;
    r.querySelector('p').textContent = text;
    log.appendChild(r);
    log.scrollTop = log.scrollHeight;
    return r;
  }
  async function addRowTyped(who, text, speed = 16) {
    const r = document.createElement('div');
    r.className = 'ai3-row ' + (who === 'user' ? 'user' : '');
    r.innerHTML = `<span class="ai3-tag">${who === 'user' ? 'YOU' : 'POLAT.AI'}</span><p></p>`;
    log.appendChild(r);
    log.scrollTop = log.scrollHeight;
    await typeText3(r.querySelector('p'), text, speed);
    return r;
  }
  function addRowLoading() {
    const r = document.createElement('div');
    r.className = 'ai3-row';
    r.innerHTML = `<span class="ai3-tag">POLAT.AI</span><p><span class="ai-dots"><span></span><span></span><span></span></span></p>`;
    log.appendChild(r);
    log.scrollTop = log.scrollHeight;
    return r;
  }

  async function ask(q) {
    await addRowTyped('user', q, 14);
    const loadingRow = addRowLoading();
    let text = '';
    try {
      const res = await fetch(GEMINI_URL_V3, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: aiCtx3 }] },
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
    await typeText3(msgEl, text, 16);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim(); if (!q) return;
    input.value = '';
    ask(q);
  });
  document.querySelectorAll('.ai3-chip').forEach(b => {
    b.addEventListener('click', () => {
      if (b.disabled) return;
      document.querySelectorAll('.ai3-chip').forEach(x => x.disabled = true);
      ask(b.dataset.q).finally(() => {
        document.querySelectorAll('.ai3-chip').forEach(x => x.disabled = false);
      });
    });
  });
}

// Tweaks
function setupTweaks3() {
  const panel = document.getElementById('tweaks3');
  window.addEventListener('message', e => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') panel.classList.remove('hidden');
    if (d.type === '__deactivate_edit_mode') panel.classList.add('hidden');
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}
  document.getElementById('tw3-close').addEventListener('click', () => panel.classList.add('hidden'));
  function persist() { try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: tweaks3 }, '*'); } catch {} }

  document.querySelectorAll('.tw3-sws button').forEach(s =>
    s.addEventListener('click', () => { tweaks3.accent = s.dataset.accent; applyTweaks3(tweaks3); persist(); }));
  document.getElementById('tw3-grad').addEventListener('input', e => { tweaks3.grad = +e.target.value; applyTweaks3(tweaks3); persist(); });
  document.getElementById('tw3-spark').addEventListener('change', e => { tweaks3.spark = e.target.checked; applyTweaks3(tweaks3); persist(); });

  document.getElementById('tw3-grad').value = tweaks3.grad;
  document.getElementById('tw3-spark').checked = tweaks3.spark;
}

// Rotating chip (alive / instant / crisp ...): width + translateY stay in sync
// so the pill hugs the current word instead of being stuck at the widest one.
function setupChipRotator3() {
  const chip = document.querySelector('.chip-inline');
  if (!chip) return;
  const stack = chip.querySelector('.ci-stack');
  if (!stack) return;
  const words = [...stack.children];
  if (!words.length) return;

  // Off-screen measurer in chip context (inherits font, size, weight)
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;white-space:nowrap;';
  chip.appendChild(probe);

  let widths = [];
  const measure = () => {
    const cs = getComputedStyle(chip);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    widths = words.map(w => {
      probe.textContent = w.textContent;
      return probe.getBoundingClientRect().width + padX;
    });
  };
  measure();

  let i = 0;
  const apply = () => {
    chip.style.setProperty('--ci-w', widths[i] + 'px');
    stack.style.transform = `translateY(-${i}em)`;
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    apply();
    return;
  }

  apply();
  setInterval(() => {
    i = (i + 1) % words.length;
    apply();
  }, 2000);

  // Re-measure on viewport resize since the chip font-size is responsive (clamp/vw)
  let rT;
  window.addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      measure();
      apply();
    }, 100);
  });
}

window.addEventListener('load', () => {
  setupCursor3();
  setupNav3();
  setupReveals3();
  setupDemoParallax();
  setupAI3();
  setupTweaks3();
  setupChipRotator3();
});
