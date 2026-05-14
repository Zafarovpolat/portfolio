/* =========================================
   POLAT ZAFAROV — PORTFOLIO / MOTION
   ========================================= */

gsap.registerPlugin(ScrollTrigger);

// ---------- Tweakable defaults (persisted via host) ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#D4FF3A",
  "noise": 40,
  "grid": true,
  "cursor": true,
  "font": "'Inter Tight', system-ui"
}/*EDITMODE-END*/;

function applyTweaks(t) {
  document.documentElement.style.setProperty('--accent', t.accent);
  document.documentElement.style.setProperty('--noise-opacity', (t.noise / 100).toString());
  document.querySelector('.grid-bg')?.style.setProperty('display', t.grid ? '' : 'none');
  document.querySelectorAll('.grid-bg').forEach(el => el.style.display = t.grid ? '' : 'none');
  document.documentElement.style.setProperty('--font-display', t.font);
  // Legacy custom cursor disabled (SVG cursors via CSS now). Leave body cursor alone.
}
let tweaks = { ...TWEAK_DEFAULTS };
applyTweaks(tweaks);

// ---------- Pre-hide hero so there's no FOUC while curtain is up ----------
function prepHero() {
  const lines = document.querySelectorAll('.hero [data-reveal]');
  lines.forEach(line => {
    const spans = line.querySelectorAll('span, em');
    spans.forEach(s => {
      if (!s.querySelector('.char') && s.children.length === 0) splitToChars(s);
    });
  });
  const chars = document.querySelectorAll('.hero [data-reveal] .char');
  gsap.set(chars, { yPercent: 110, willChange: 'transform' });
  gsap.set(['.hero-bottom', '.nav'], { autoAlpha: 0 });
}

// ---------- Curtain intro ----------
function runCurtain() {
  const fill = document.getElementById('curtain-fill');
  const pct = document.getElementById('curtain-pct');
  const curtain = document.getElementById('curtain');
  const obj = { v: 0 };
  gsap.to(obj, {
    v: 100,
    duration: 1.8,
    ease: "power2.inOut",
    onUpdate() {
      fill.style.width = obj.v + '%';
      pct.textContent = String(Math.round(obj.v)).padStart(3, '0');
    },
    onComplete() {
      // Kick off hero animation AT THE SAME TIME as the curtain slides away,
      // so there is no static “normal” frame between curtain end and hero start.
      kickoffHero();
      gsap.to(curtain, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
        onComplete: () => { curtain.style.display = 'none'; }
      });
    }
  });
}

// ---------- Hero reveal ----------
function splitToChars(el) {
  const text = el.textContent;
  el.textContent = '';
  return [...text].map(ch => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(span);
    return span;
  });
}

function kickoffHero() {
  // prepHero already split + pre-set yPercent:110; just animate to 0.
  const chars = document.querySelectorAll('.hero [data-reveal] .char');
  gsap.to(chars, {
    yPercent: 0,
    duration: 1,
    stagger: { amount: 0.8 },
    ease: "power4.out"
  });

  gsap.to('.hero-bottom', { autoAlpha: 1, y: 0, duration: 1, delay: 0.5, ease: "power3.out" });
  gsap.fromTo('.hero-bottom', { y: 20 }, { y: 0, duration: 1, delay: 0.5, ease: "power3.out" });
  gsap.to('.nav', { autoAlpha: 1, yPercent: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
  gsap.fromTo('.nav', { yPercent: -100 }, { yPercent: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
}

// Walk all text nodes inside el and wrap every char in <span class="char">
function splitAllTextToChars(el) {
  const textNodes = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);
  textNodes.forEach(tn => {
    if (!tn.nodeValue) return;
    const frag = document.createDocumentFragment();
    [...tn.nodeValue].forEach(ch => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      frag.appendChild(span);
    });
    tn.parentNode.replaceChild(frag, tn);
  });
}

// ---------- Scroll reveal for headings: ONLY italic <em class="serif-i"> words ----------
function setupScrollReveals() {
  document.querySelectorAll('section:not(.hero) [data-reveal]').forEach(line => {
    const ems = line.querySelectorAll('em.serif-i');
    if (!ems.length) return; // no italic word to animate in this line
    ems.forEach(em => {
      if (!em.querySelector('.char')) splitAllTextToChars(em);
    });
    const chars = line.querySelectorAll('em.serif-i .char');
    if (!chars.length) return;
    gsap.set(chars, { yPercent: 110, willChange: 'transform' });
    gsap.to(chars, {
      yPercent: 0,
      duration: 0.9,
      stagger: { amount: 0.4 },
      ease: "power4.out",
      scrollTrigger: {
        trigger: line,
        start: "top 92%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true
      }
    });
  });
}

// ---------- Nav: scroll state, sliding lime indicator, smooth-scroll links ----------
function setupNavUX() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const pill = document.getElementById('nav-pill');
  const indicator = document.getElementById('nav-pill-indicator');
  const links = [...document.querySelectorAll('.nav-links a')];

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle('is-scrolled', y > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Smooth-scroll on nav link click
  const smoothScrollTo = (targetY, duration = 900) => {
    const startY = window.scrollY || document.documentElement.scrollTop;
    const delta = targetY - startY;
    if (Math.abs(delta) < 2) return;
    const startT = performance.now();
    // easeInOutCubic
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (now) => {
      const elapsed = now - startT;
      const t = Math.min(1, elapsed / duration);
      window.scrollTo(0, startY + delta * ease(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      const rect = target.getBoundingClientRect();
      const absTop = rect.top + (window.scrollY || 0);
      smoothScrollTo(absTop, 900);
      history.replaceState(null, '', href);
    });
  });

  if (!pill || !indicator || !links.length) return;

  // Active section tracking via IntersectionObserver
  const linkMap = new Map();
  links.forEach(a => {
    const id = (a.getAttribute('href') || '').replace('#','');
    const sec = document.getElementById(id);
    if (sec) linkMap.set(sec, a);
  });

  let activeLink = null;
  let hoverLink = null;

  const moveTo = (el) => {
    if (!el) {
      indicator.style.width = '0px';
      pill.classList.remove('is-ready');
      links.forEach(l => l.classList.remove('is-lit'));
      return;
    }
    const pillRect = pill.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const left = elRect.left - pillRect.left;
    const width = elRect.width;
    indicator.style.transform = `translate3d(${left}px, 0, 0)`;
    indicator.style.width = `${width}px`;
    pill.classList.add('is-ready');
    // Text under the lime pill becomes black instantly; all others return to white
    links.forEach(l => l.classList.toggle('is-lit', l === el));
  };

  const render = () => moveTo(hoverLink || activeLink);

  const setActive = (link) => {
    if (link === activeLink) return;
    activeLink = link;
    links.forEach(l => l.classList.toggle('is-active', l === link));
    render();
  };

  // Hover follows cursor, returns to active on leave
  links.forEach(a => {
    a.addEventListener('mouseenter', () => { hoverLink = a; render(); });
    a.addEventListener('mouseleave', () => { hoverLink = null; render(); });
    a.addEventListener('focus', () => { hoverLink = a; render(); });
    a.addEventListener('blur', () => { hoverLink = null; render(); });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      const a = linkMap.get(en.target);
      if (!a) return;
      if (en.isIntersecting) setActive(a);
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  linkMap.forEach((_, sec) => io.observe(sec));

  // Also clear the lime indicator state when in hero zone
  const heroEl = document.getElementById('hero');
  const heroBottom = () => heroEl ? heroEl.offsetTop + heroEl.offsetHeight : window.innerHeight;
  const onScrollClear = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y < heroBottom() * 0.5) setActive(null);
  };
  onScrollClear();
  window.addEventListener('scroll', onScrollClear, { passive: true });

  const schedule = () => requestAnimationFrame(render);
  window.addEventListener('resize', schedule);
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(schedule).observe(pill);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule);
  }
  setTimeout(() => {
    if (!activeLink) {
      const hash = location.hash?.replace('#','');
      const hashLink = hash && links.find(l => l.getAttribute('href') === `#${hash}`);
      setActive(hashLink || null);
    } else {
      render();
    }
  }, 150);
}

// ---------- Counters ----------
function setupCounters() {
  document.querySelectorAll('.stat').forEach(stat => {
    const to = parseInt(stat.dataset.countTo, 10);
    const from = parseInt(stat.dataset.countFrom, 10);
    const numEl = stat.querySelector('.num');
    ScrollTrigger.create({
      trigger: stat,
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.fromTo({ v: from }, { v: from }, {
          v: to,
          duration: 1.6,
          ease: "power3.out",
          onUpdate() {
            numEl.textContent = Math.round(this.targets()[0].v);
          }
        });
      }
    });
  });
}

// ---------- Stack bars ----------
function setupStackBars() {
  document.querySelectorAll('[data-stack]').forEach(row => {
    ScrollTrigger.create({
      trigger: row,
      start: "top 85%",
      once: true,
      onEnter: () => row.classList.add('is-visible')
    });
  });
}

// ---------- Pinned horizontal work ----------
function setupWorkPin() {
  const track = document.getElementById('work-track');
  const pin = document.getElementById('work-pin');
  if (!track || !pin) return;

  // Use matchMedia so the pin auto-activates on desktop and fully tears down
  // on mobile/tablet — including clearing any inline transforms that would
  // otherwise push projects 2-4 off-screen after a viewport resize.
  ScrollTrigger.matchMedia({
    "(min-width: 1025px)": function () {
      const projects = track.querySelectorAll('.proj');
      const totalWidth = projects.length * window.innerWidth;
      const scrollDist = totalWidth - window.innerWidth;

      gsap.to(track, {
        x: -scrollDist,
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          pin: true,
          start: "top top",
          end: () => `+=${scrollDist}`,
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      });

      projects.forEach((proj) => {
        const mock = proj.querySelector('.proj-frame');
        gsap.fromTo(mock,
          { y: 60, rotate: -1 },
          {
            y: -60, rotate: 1,
            ease: "none",
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: () => `+=${scrollDist}`,
              scrub: 1
            }
          });
      });

      // Cleanup runs when media query no longer matches (e.g. resize to mobile)
      return function cleanup() {
        gsap.set(track, { clearProps: "transform,x" });
        track.querySelectorAll('.proj-frame').forEach(mock => {
          gsap.set(mock, { clearProps: "transform,y,rotate" });
        });
      };
    }
  });
}

// ---------- Custom cursor ----------
function setupCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  gsap.ticker.add(() => {
    cx += (mx - cx) * 0.25;
    cy += (my - cy) * 0.25;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
  });

  document.querySelectorAll('a, button, [data-magnet]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Magnetic effect
  document.querySelectorAll('[data-magnet]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: 0.4, ease: "power2.out" });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
    });
  });
}

// ---------- Clock ----------
function setupClock() {
  const els = [document.getElementById('tz-clock'), document.getElementById('tz-clock-2')].filter(Boolean);
  function tick() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const tsk = new Date(utc + 5 * 3600 * 1000);
    const hh = String(tsk.getHours()).padStart(2, '0');
    const mm = String(tsk.getMinutes()).padStart(2, '0');
    const ss = String(tsk.getSeconds()).padStart(2, '0');
    const s = `${hh}:${mm}:${ss} UTC+5`;
    els.forEach(el => el.textContent = s);
  }
  tick();
  setInterval(tick, 1000);
}

// ---------- AI concierge ----------
function typeText(el, text, speed = 18) {
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

function setupAI() {
  const form = document.getElementById('ai-form');
  const input = document.getElementById('ai-input');
  const log = document.getElementById('ai-log');

  // Type out the welcome message once the AI section scrolls into view.
  const welcomeRow = log.querySelector('[data-welcome]');
  if (welcomeRow) {
    const msgEl = welcomeRow.querySelector('.ai-msg');
    const full = msgEl.dataset.full || msgEl.textContent || '';
    msgEl.textContent = '';
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          typeText(msgEl, full, 20);
          obs.disconnect();
        }
      });
    }, { threshold: 0.35 });
    io.observe(welcomeRow);
  }

  const GEMINI_API_KEY = 'AIzaSyDBkXSCP-OQE2ApCtvhmcFZyb_6WyT2vfs';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

  const systemContext = `You are "Polat.AI" — a live concierge embedded on Polat Zafarov's portfolio. Always answer in the same language the visitor uses (English / Russian / Uzbek). First-person about Polat ("Polat has…", "He's built…"). Be friendly, confident, concrete. Keep answers to 1–3 crisp sentences unless the question explicitly asks for detail.

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

  async function ask(q) {
    await addRowTyped('user', q, 14);
    const loadingRow = addRowLoading();
    let text = '';
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemContext }] },
          contents: [{ role: 'user', parts: [{ text: q }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 320,
            topP: 0.95
          }
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
    const msgEl = loadingRow.querySelector('.ai-msg');
    msgEl.innerHTML = '';
    await typeText(msgEl, text, 16);
  }

  function addRow(who, text) {
    const row = document.createElement('div');
    row.className = 'ai-row ' + (who === 'user' ? 'user' : '');
    row.innerHTML = `<span class="ai-role mono sm">${who === 'user' ? 'YOU' : 'POLAT.AI'}</span><p class="ai-msg"></p>`;
    row.querySelector('.ai-msg').textContent = text;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  async function addRowTyped(who, text, speed = 16) {
    const row = document.createElement('div');
    row.className = 'ai-row ' + (who === 'user' ? 'user' : '');
    row.innerHTML = `<span class="ai-role mono sm">${who === 'user' ? 'YOU' : 'POLAT.AI'}</span><p class="ai-msg"></p>`;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    await typeText(row.querySelector('.ai-msg'), text, speed);
    return row;
  }

  function addRowLoading() {
    const row = document.createElement('div');
    row.className = 'ai-row';
    row.innerHTML = `<span class="ai-role mono sm">POLAT.AI</span><p class="ai-msg"><span class="ai-dots"><span></span><span></span><span></span></span></p>`;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    ask(q);
  });

  document.querySelectorAll('.ai-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      document.querySelectorAll('.ai-chip').forEach(b => b.disabled = true);
      const q = btn.dataset.q;
      ask(q).finally(() => {
        document.querySelectorAll('.ai-chip').forEach(b => b.disabled = false);
      });
    });
  });
}

// ---------- Tweaks panel ----------
function setupTweaks() {
  const panel = document.getElementById('tweaks-panel');
  const close = document.getElementById('tw-close');

  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') panel.classList.remove('hidden');
    if (d.type === '__deactivate_edit_mode') panel.classList.add('hidden');
  });

  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (_) {}

  close.addEventListener('click', () => panel.classList.add('hidden'));

  function persist() {
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: tweaks }, '*'); } catch (_) {}
  }

  document.querySelectorAll('.tw-sw').forEach(sw => {
    sw.addEventListener('click', () => {
      tweaks.accent = sw.dataset.accent;
      applyTweaks(tweaks); persist();
    });
  });
  document.getElementById('tw-noise').addEventListener('input', (e) => {
    tweaks.noise = parseInt(e.target.value, 10);
    applyTweaks(tweaks); persist();
  });
  document.getElementById('tw-grid').addEventListener('change', (e) => {
    tweaks.grid = e.target.checked;
    applyTweaks(tweaks); persist();
  });
  document.getElementById('tw-cursor').addEventListener('change', (e) => {
    tweaks.cursor = e.target.checked;
    applyTweaks(tweaks); persist();
  });
  document.getElementById('tw-font').addEventListener('change', (e) => {
    tweaks.font = e.target.value;
    applyTweaks(tweaks); persist();
  });

  // Sync initial form values
  document.getElementById('tw-noise').value = tweaks.noise;
  document.getElementById('tw-grid').checked = tweaks.grid;
  document.getElementById('tw-cursor').checked = tweaks.cursor;
  document.getElementById('tw-font').value = tweaks.font;
}

// ---------- Boot ----------
let __booted = false;
function boot() {
  if (__booted) return;
  __booted = true;
  prepHero();              // split + hide hero chars / nav / bottom BEFORE curtain so there's no FOUC
  setupCursor();
  setupClock();
  setupNavUX();
  setupWorkPin();          // pin first, so ScrollTrigger knows about the pin space
  setupScrollReveals();    // then create reveals with correct positions
  setupCounters();
  setupStackBars();
  setupAI();
  setupTweaks();
  // Refresh once everything is wired so later sections (stack, contact) get correct trigger offsets
  requestAnimationFrame(() => ScrollTrigger.refresh());
  // Expose a guarded refresher for late-loading embeds (iframes, images) so they
  // can request a re-measure without crashing pin-spacers mid-mutation.
  window.__refreshScrollTrigger = () => {
    requestAnimationFrame(() => {
      try { ScrollTrigger.refresh(); } catch (_) { /* ignore stale refs */ }
    });
  };
  runCurtain();
}
// Boot on DOMContentLoaded so Google Fonts / external assets cannot stall the curtain.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
// Safety: if for any reason boot never ran within 1500ms, force it.
setTimeout(boot, 1500);
