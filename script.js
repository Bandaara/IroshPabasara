/* ---------- Matrix rain (red) ---------- */
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
const chars = '01{}[]<>/;=+*#$%&ABCDEF'.split('');
const size = 16;
let drops = [];

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  drops = Array(Math.floor(canvas.width / size)).fill(0).map(() => Math.random() * -50);
}
resize();
addEventListener('resize', resize);

function rain() {
  ctx.fillStyle = 'rgba(7, 7, 10, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = size + 'px monospace';
  drops.forEach((y, i) => {
    ctx.fillStyle = Math.random() > 0.97 ? '#ffffff' : '#ff1e2d';
    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
    if (y * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i] += 1 + boost;
  });
}
let boost = 0;
setInterval(() => { boost *= 0.9; rain(); }, 50);

/* ---------- Typing effect ---------- */
const lines = ['බුද්දිමතා', 'හෙනම කැරියා', 'GAMER CREATOR', 'DEV'];
const typing = document.getElementById('typing');
let li = 0, ci = 0, deleting = false;

function type() {
  const word = lines[li];
  typing.textContent = word.slice(0, ci);
  if (!deleting && ci < word.length) { ci++; setTimeout(type, 110); }
  else if (!deleting) { deleting = true; setTimeout(type, 1400); }
  else if (ci > 0) { ci--; setTimeout(type, 55); }
  else { deleting = false; li = (li + 1) % lines.length; setTimeout(type, 300); }
}
type();

/* ---------- Scroll reveal + skill bars ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('show');
      e.target.querySelectorAll('.fill').forEach(f => f.style.width = f.dataset.w + '%');
      e.target.querySelectorAll('b[data-n]').forEach(countUp);
    }
  });
}, { threshold: 0.35 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Active side dot ---------- */
const dots = document.querySelectorAll('.dots a');
const sections = document.querySelectorAll('section');
const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.dots a, .menu a').forEach(d => d.classList.toggle('active', d.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
sections.forEach(s => spy.observe(s));

/* ---------- Scroll effects ---------- */
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cards = [...document.querySelectorAll('.terminal, .panel:not(.still)')];
const bar = document.querySelector('.progress');
let lastY = scrollY;

function onScroll() {
  const vh = innerHeight;
  // progress bar
  bar.style.width = (scrollY / (document.documentElement.scrollHeight - vh) * 100) + '%';
  // matrix speeds up while scrolling
  boost = Math.min(boost + Math.abs(scrollY - lastY) / 40, 4);
  lastY = scrollY;
  if (calm) return;
  // 3D fade / blur / scale as each card leaves or enters the screen
  cards.forEach(el => {
    const r = el.getBoundingClientRect();
    const c = (r.top + r.height / 2 - vh / 2) / vh;      // -1 .. 1
    const a = Math.min(Math.abs(c) * 1.3, 1);
    el.style.opacity = 1 - a;
    el.style.filter = `blur(${a * 8}px)`;
    el.style.transform = `perspective(900px) translateY(${c * 70}px) rotateX(${c * -14}deg) scale(${1 - a * 0.15})`;
  });
}
addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ---------- Eased scroll for menu / dots ---------- */
const root = document.documentElement;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (calm) { target.scrollIntoView(); return; }
    const from = scrollY, to = target.offsetTop, dur = 1100, t0 = performance.now();
    root.style.scrollSnapType = 'none';
    root.style.scrollBehavior = 'auto';
    (function step(now) {
      const t = Math.min((now - t0) / dur, 1);
      scrollTo(0, from + (to - from) * ease(t));
      if (t < 1) requestAnimationFrame(step);
      else { root.style.scrollSnapType = ''; root.style.scrollBehavior = ''; }
    })(t0);
  });
});

/* ---------- Live clock (Sri Lanka, UTC+5:30) ---------- */
const clock = document.getElementById('clock');
const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
});
function tick() { clock.textContent = fmt.format(new Date()) + ' UTC+5:30'; }
tick();
setInterval(tick, 1000);

/* ---------- Skill % count-up ---------- */
function countUp(b) {
  if (b.dataset.done) return;
  b.dataset.done = 1;
  const end = +b.dataset.n, t0 = performance.now();
  (function step(now) {
    const t = Math.min((now - t0) / 1400, 1);
    b.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))) + '%';
    if (t < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- Click to copy (Discord username, mail) ---------- */
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  fallbackCopy(text);
  return Promise.resolve();
}
function fallbackCopy(text) {
  const t = document.createElement('textarea');
  t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
  document.body.appendChild(t); t.select();
  try { document.execCommand('copy'); } catch (e) {}
  t.remove();
}
document.querySelectorAll('[data-copy]').forEach(el => {
  el.addEventListener('click', () => {
    copyText(el.dataset.copy);
    showToast(el.dataset.msg || 'Copied');
  });
});

/* ---------- ASCII codes row: BANDARA -> 66 65 78 68 65 82 65 ---------- */
const word = 'BANDARA';
const asciiBox = document.getElementById('ascii');
const chips = [...word].map(ch => {
  const s = document.createElement('span');
  s.className = 'chip';
  s.textContent = ch.charCodeAt(0);
  s.title = ch;
  asciiBox.appendChild(s);
  return { el: s, code: ch.charCodeAt(0), ch };
});
function swap(c, toLetter) {
  c.el.classList.remove('flip'); void c.el.offsetWidth; c.el.classList.add('flip');
  setTimeout(() => {
    c.el.textContent = toLetter ? c.ch : c.code;
    c.el.classList.toggle('letter', toLetter);
  }, 250);
}
function decodeCycle() {
  chips.forEach((c, i) => setTimeout(() => swap(c, true), i * 220));
  setTimeout(() => chips.forEach((c, i) => setTimeout(() => swap(c, false), i * 220)), 3200);
}
setTimeout(decodeCycle, 1800);
setInterval(decodeCycle, 7000);

/* ---------- Live Discord server stats (public invite API) ---------- */
function animNum(el, to) {
  const from = parseInt(el.textContent.replace(/\D/g, '')) || 0, t0 = performance.now();
  (function step(now) {
    const t = Math.min((now - t0) / 1000, 1);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3))).toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  })(t0);
}
async function loadServer(card) {
  const code = card.dataset.invite;
  const note = card.querySelector('.s-note');
  try {
    const res = await fetch('https://discord.com/api/v10/invites/' + code + '?with_counts=true');
    if (!res.ok) throw new Error('bad response');
    const d = await res.json();
    card.querySelector('.s-name').textContent = d.guild.name;
    animNum(card.querySelector('.s-online'), d.approximate_presence_count);
    animNum(card.querySelector('.s-members'), d.approximate_member_count);
    const joinText = document.querySelector('[data-join="' + code + '"] span');
    if (joinText) joinText.textContent = 'Join ' + d.guild.name;
    if (d.guild.icon) {
      const img = new Image();
      img.alt = d.guild.name;
      img.onload = () => {
        const box = card.querySelector('.s-icon'); box.textContent = ''; box.appendChild(img);
        // the "Join server" button gets the server logo too
        const ja = document.querySelector('[data-join="' + code + '"]');
        const old = ja && ja.querySelector('.join-ico');
        if (old) { const li = new Image(); li.className = 'join-logo'; li.alt = ''; li.src = img.src; li.style.setProperty('--d', old.style.getPropertyValue('--d')); old.replaceWith(li); }
      };
      img.src = 'https://cdn.discordapp.com/icons/' + d.guild.id + '/' + d.guild.icon + '.png?size=128';
    }
    note.textContent = 'Live. Updates every minute';
  } catch (err) {
    note.textContent = 'Live stats unavailable right now';
    if (!card.dataset.retried) { card.dataset.retried = 1; setTimeout(() => loadServer(card), 6000); }
  }
}
const serverCards = document.querySelectorAll('.server-card');
serverCards.forEach(c => c.addEventListener('click', () => window.open('https://discord.gg/' + c.dataset.invite, '_blank', 'noopener')));
const refreshServers = () => serverCards.forEach(loadServer);
refreshServers();
setInterval(refreshServers, 60000);

/* ---------- My PC wheel (inside the setup scene) ----------
   - parts are plain SVG groups moved with translate (never rotated), so they stay sharp
   - the rim/tyre is vector and turns; the side tread scrolls in step with it
   - scrolling or press-and-hold revs the wheel up, it settles back to a calm roll
   - the part you pick on the wheel also lights up in the desk scene */
(function () {
  const grp = document.querySelector('.wheelgrp');
  if (!grp) return;
  const ps = [...grp.querySelectorAll('.wpart')];
  const pts = [...document.querySelectorAll('.setup-svg .pt')];
  const rots = [...document.querySelectorAll('.setup-svg .rot')];
  const tread = document.getElementById('treadmove');
  const scene = document.querySelector('.scene');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover)').matches;
  const RADIUS = 106.4;                 // part orbit, in scene units

  let cur = 0, pick = false;
  function show(i) {
    ps.forEach((p, j) => p.classList.toggle('active', j === i));
    pts.forEach(t => t.classList.toggle('hl', t.dataset.k === ps[i].dataset.k));
    cur = i;
  }
  ps.forEach((p, i) => ['mouseenter', 'click', 'focus'].forEach(ev => p.addEventListener(ev, () => { pick = true; show(i); })));
  show(0);
  setInterval(() => { if (!pick) show((cur + 1) % ps.length); }, 2600);

  const base = ps.map(p => parseFloat(p.dataset.a));
  const NORMAL = 20;                     // deg/s, calm roll (one turn every 18s)
  let angle = 0, speed = NORMAL, hover = false, rev = false, scrollExtra = 0, lastSY = scrollY, visible = true;

  grp.addEventListener('mouseenter', () => { hover = canHover; });
  grp.addEventListener('mouseleave', () => { hover = false; pick = false; rev = false; });
  grp.addEventListener('pointerdown', () => { rev = true; });
  ['pointerup', 'pointercancel'].forEach(ev => addEventListener(ev, () => { rev = false; }));
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(scene);

  function layout() {
    ps.forEach((p, i) => {
      const a = (base[i] + angle) * Math.PI / 180;
      p.setAttribute('transform', 'translate(' + (RADIUS * Math.sin(a)).toFixed(2) + ' ' + (-RADIUS * Math.cos(a)).toFixed(2) + ')');
    });
    const rt = 'rotate(' + angle.toFixed(2) + ')';
    rots.forEach(r => r.setAttribute('transform', rt));
    tread.setAttribute('transform', 'translate(0 ' + (((angle / 360 * 80) % 1) * 7.854).toFixed(3) + ')');
  }

  let t0 = performance.now();
  function frame(now) {
    const dt = Math.min((now - t0) / 1000, 0.05); t0 = now;
    const sv = Math.abs(scrollY - lastSY); lastSY = scrollY;
    scrollExtra += (Math.min(sv * 16, 520) - scrollExtra) * Math.min(dt * 10, 1);
    // hovering only slows the wheel (never stops it); reduced-motion users get a gentle fixed roll
    const target = still ? 6 : (hover && !rev ? 6 : NORMAL) + scrollExtra + (rev ? 700 : 0);
    speed += (target - speed) * (1 - Math.exp(-dt * (target > speed ? 3.5 : 1.3)));
    if (visible) { angle = (angle + speed * dt) % 360; layout(); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ---------- Optional screen videos ----------
   Put screen-main.mp4 (landscape) and screen-girl.mp4 (portrait) next to index.html.
   If a file exists it plays on the monitor, otherwise the animated art stays. */
document.querySelectorAll('.screenvid').forEach(v => {
  const ok = () => { v.classList.add('ok'); v.play().catch(() => {}); };
  v.addEventListener('loadeddata', ok);
  if (v.readyState >= 2) ok();
});

/* ---------- PC power ----------
   Arrive at My PC            -> the PC boots (fans, lights, POST, boot logo, Windows desktop)
   Scroll / click to another  -> "Shutting down" for 5 seconds, then everything is off, screens included
   section                       (coming back during the shutdown boots it again once it has finished)
   Switch to another browser tab -> off straight away; back on when you return, like a real power cycle */
(function () {
  const svg = document.querySelector('.setup-svg');
  const scene = document.querySelector('.scene');
  if (!svg || !scene) return;
  const SHUTDOWN_MS = 5000;
  const stages = ['stage-off', 'stage-post', 'stage-winboot', 'stage-desk', 'stage-shut'];
  let timers = [], state = 'off', inView = false;
  const stage = n => { stages.forEach(s => svg.classList.remove(s)); svg.classList.add('stage-' + n); };
  const clear = () => { timers.forEach(clearTimeout); timers = []; };

  function powerOn() {
    if (state !== 'off') return;
    state = 'boot'; clear();
    svg.classList.add('pc-boot'); stage('off');
    timers.push(
      setTimeout(() => stage('post'), 900),
      setTimeout(() => stage('winboot'), 3600),
      setTimeout(() => { stage('desk'); svg.classList.add('pc-on'); state = 'on'; }, 6200)
    );
  }
  function powerOff() {
    clear(); state = 'off';
    svg.classList.remove('pc-boot', 'pc-on', 'pc-shut'); stage('off');
  }
  function shutDown() {
    if (state === 'off' || state === 'shutdown') return;
    clear(); state = 'shutdown';
    svg.classList.remove('pc-on'); svg.classList.add('pc-shut'); stage('shut');
    timers.push(setTimeout(() => {
      powerOff();
      if (inView && !document.hidden) powerOn();      // you came back while it was shutting down
    }, SHUTDOWN_MS));
  }

  // inView = at least a quarter of the scene is on screen (isIntersecting alone stays true while it scrolls away)
  new IntersectionObserver(e => {
    inView = e[0].intersectionRatio >= 0.25;
    if (inView) { if (!document.hidden) powerOn(); } else { shutDown(); }
  }, { threshold: [0, 0.25] }).observe(scene);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) powerOff();
    else if (inView) powerOn();
  });
  powerOff();

  /* Windows taskbar clock (Sri Lanka time) */
  const tc = document.getElementById('tclock'), td = document.getElementById('tdate');
  const ft = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Colombo', hour: 'numeric', minute: '2-digit', hour12: true });
  const fd = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Colombo', month: 'numeric', day: 'numeric', year: 'numeric' });
  function clockTick() { const d = new Date(); if (tc) tc.textContent = ft.format(d); if (td) td.textContent = fd.format(d); }
  clockTick(); setInterval(clockTick, 1000);
})();
