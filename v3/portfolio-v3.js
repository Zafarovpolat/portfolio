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
  gsap.from('.c3-card', {
    opacity: 0, y: 30, duration: 0.6, stagger: 0.08,
    scrollTrigger: { trigger: '.c3-grid', start: "top 85%" }
  });
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

// AI
const aiCtx3 = `You are "Polat.AI", a live concierge on Polat Zafarov's portfolio.
Polat is a 19 y.o. Frontend Developer from Tashkent, Uzbekistan. 2+ years commercial. Works at Digital Agency RUSO since July 2024. Shipped 10+ projects for clients in Russia/Uzbekistan/Azerbaijan. 2 Telegram Mini Apps in prod (incl. Dekor House — home decor with Bot API & payments). Stack: React, Next.js 15, TypeScript, Tailwind, SCSS, GSAP, Framer Motion, Node.js, Express, FastAPI, PostgreSQL, Firebase, Supabase, WordPress, WooCommerce, Telegram Bot API, Stripe, Docker Compose, Puppeteer, Socket.IO. Built full-stack WhatsApp bulk sender. Studies Computer Engineering TUIT, GPA 4.0. Languages: Uzbek native, Russian C2, English B2. Seeks remote Frontend (React/Next.js), open to full-stack. Rate ~ $800/mo. Uses Claude Code & Cursor daily. Contact: atuin59354081@gmail.com, @zafarovpolat, +998 95 973 88 88.
Reply in 1–3 crisp sentences as Polat's concierge. Friendly, confident.`;

function setupAI3() {
  const form = document.getElementById('ai3-form');
  const input = document.getElementById('ai3-input');
  const log = document.getElementById('ai3-log');
  function add(who, text) {
    const r = document.createElement('div');
    r.className = 'ai3-row ' + (who === 'user' ? 'user' : '');
    r.innerHTML = `<span class="ai3-tag">${who==='user'?'YOU':'POLAT.AI'}</span><p></p>`;
    r.querySelector('p').textContent = text;
    log.appendChild(r); log.scrollTop = log.scrollHeight;
    return r;
  }
  async function ask(q) {
    add('user', q);
    const lr = add('polat', '…');
    try {
      const t = await window.claude.complete({ messages: [{ role: 'user', content: `${aiCtx3}\n\nQuestion: ${q}` }] });
      lr.querySelector('p').textContent = t;
    } catch {
      lr.querySelector('p').textContent = "I'm offline — email atuin59354081@gmail.com.";
    }
  }
  form.addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); if(!q) return; input.value=''; ask(q); });
  document.querySelectorAll('.ai3-chip').forEach(b => b.addEventListener('click', () => ask(b.dataset.q)));
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

window.addEventListener('load', () => {
  setupCursor3();
  setupReveals3();
  setupDemoParallax();
  setupAI3();
  setupTweaks3();
});
