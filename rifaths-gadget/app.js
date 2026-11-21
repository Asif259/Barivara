(() => {
  const WA_NUMBER = '8801888888888';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= language ================= */
  let lang = 'bn';
  try { lang = localStorage.getItem('rg-lang') || 'bn'; } catch (e) {}
  if (!I18N[lang]) lang = 'bn';
  const t = (k) => I18N[lang][k] ?? I18N.en[k] ?? k;
  const digits = (s) => lang === 'bn' ? String(s).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : String(s);
  const taka = (n) => '৳' + digits(n.toLocaleString('en-IN'));
  const waUrl = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if (v.includes('<em>')) el.innerHTML = v; else el.textContent = v;
    });
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $$('.wa-link').forEach(a => { a.href = waUrl(t('wa.hello')); });
    try { localStorage.setItem('rg-lang', lang); } catch (e) {}
    renderShelfText();
    buildRuler();
    showFeature(false);
    setBenchLabels();
    benchUpdate(true);
    const d = new Date();
    $('#slipDate').textContent = digits(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
  }
  $$('.lang button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  /* ================= shelf (hero) ================= */
  // Example laptops by approximate budget (BDT). Not stock: these show what a budget can find.
  const LAPTOPS = [
    { brand: 'Dell', model: 'Latitude 7480', cpu: 'Core i5-7300U', ram: '8GB', ssd: '256GB', gpu: '', use: 'study', b: 28000, sp: '#2B2E36', ink: '#ECE8DD' },
    { brand: 'Lenovo', model: 'ThinkPad T470', cpu: 'Core i5-6300U', ram: '8GB', ssd: '256GB', gpu: '', use: 'study', b: 30000, sp: '#141414', ink: '#ECE8DD' },
    { brand: 'HP', model: 'EliteBook 840 G5', cpu: 'Core i5-8350U', ram: '8GB', ssd: '256GB', gpu: '', use: 'study', b: 38000, sp: '#C9C5BA', ink: '#16182A' },
    { brand: 'Dell', model: 'Latitude 7490', cpu: 'Core i5-8350U', ram: '16GB', ssd: '256GB', gpu: '', use: 'code', b: 42000, sp: '#2440A8', ink: '#ECE8DD' },
    { brand: 'Lenovo', model: 'ThinkPad T480', cpu: 'Core i5-8350U', ram: '16GB', ssd: '512GB', gpu: '', use: 'code', b: 52000, sp: '#141414', ink: '#ECE8DD' },
    { brand: 'Dell', model: 'G3 15', cpu: 'Core i5-9300H', ram: '16GB', ssd: '512GB', gpu: 'GTX 1650', use: 'gaming', b: 60000, sp: '#7E2B1C', ink: '#ECE8DD' },
    { brand: 'Lenovo', model: 'ThinkPad T14 Gen 1', cpu: 'Ryzen 5 Pro 4650U', ram: '16GB', ssd: '512GB', gpu: '', use: 'code', b: 62000, sp: '#2F5A43', ink: '#ECE8DD' },
    { brand: 'HP', model: 'ZBook 15 G5', cpu: 'Core i7-8850H', ram: '16GB', ssd: '512GB', gpu: 'Quadro P1000', use: 'creative', b: 70000, sp: '#55657A', ink: '#ECE8DD' },
    { brand: 'Apple', model: 'MacBook Air M1', cpu: 'Apple M1', ram: '8GB', ssd: '256GB', gpu: '', use: 'study', b: 78000, sp: '#DCD8CD', ink: '#16182A' },
    { brand: 'Lenovo', model: 'Legion 5', cpu: 'Ryzen 5 5600H', ram: '16GB', ssd: '512GB', gpu: 'RTX 3050', use: 'gaming', b: 90000, sp: '#1D2230', ink: '#E5562A' },
    { brand: 'Apple', model: 'MacBook Pro 13 M1', cpu: 'Apple M1', ram: '16GB', ssd: '512GB', gpu: '', use: 'creative', b: 100000, sp: '#B5AF9F', ink: '#16182A' },
    { brand: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 9', cpu: 'Core i7-1165G7', ram: '16GB', ssd: '512GB', gpu: '', use: 'code', b: 105000, sp: '#141414', ink: '#ECE8DD' },
    { brand: 'Apple', model: 'MacBook Pro 14 M1 Pro', cpu: 'Apple M1 Pro', ram: '16GB', ssd: '512GB', gpu: '', use: 'creative', b: 150000, sp: '#3A3D45', ink: '#ECE8DD' },
  ];
  const MIN = 25000, MAX = 160000;
  const shelf = $('#shelf'), wrap = $('.shelf-wrap');
  let filter = 'all';
  let visible = LAPTOPS.map((_, i) => i);
  let active = 4; // index into LAPTOPS (ThinkPad T480)
  let booted = false;

  const specLine = (l) => [l.cpu, l.ram, l.ssd, l.gpu].filter(Boolean).join(' · ');

  LAPTOPS.forEach((l, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'tape';
    el.dataset.i = i;
    el.style.setProperty('--sp', l.sp);
    el.style.setProperty('--sp-ink', l.ink);
    el.innerHTML = `
      <span class="spine" aria-hidden="true"><span class="spine-brand">${l.brand}</span><span class="spine-model">${l.model}</span><span class="spine-tag">RG</span></span>
      <span class="cover">
        <span class="cover-top"><span class="c-ex"></span><span>${String(i + 1).padStart(2, '0')} / ${LAPTOPS.length}</span></span>
        <span class="cover-model">${l.brand}<br>${l.model}</span>
        <span class="cover-art"><svg viewBox="0 0 220 150"><use href="#lap"/></svg></span>
        <span class="cover-specs"><b>${l.cpu}</b><br>${l.ram} RAM · ${l.ssd} SSD${l.gpu ? ' · ' + l.gpu : ''}</span>
        <span class="cover-foot"><span class="b"></span><span class="t"></span></span>
      </span>`;
    el.setAttribute('aria-label', `${l.brand} ${l.model}`);
    el.addEventListener('click', () => { if (+el.dataset.i !== active) setActive(+el.dataset.i); });
    shelf.appendChild(el);
  });
  const tapes = $$('.tape', shelf);

  function renderShelfText() {
    tapes.forEach((el, i) => {
      const l = LAPTOPS[i];
      $('.c-ex', el).textContent = t('ex');
      $('.cover-foot .b', el).textContent = '≈ ' + taka(l.b);
      $('.cover-foot .t', el).textContent = t('use.' + l.use);
    });
  }

  function layout() {
    const vh = innerHeight, vw = innerWidth;
    const H = clamp(Math.round(vh * (vw < 600 ? 0.42 : 0.37)), 250, 380);
    wrap.style.setProperty('--shelf-h', H + 'px');
    const coverH = H - 12;
    const coverW = Math.round(coverH * 0.68);
    const spineW = Math.max(30, Math.round(coverH * 0.125));
    const half = wrap.clientWidth / 2;
    const a = Math.max(0, visible.indexOf(active));

    tapes.forEach((el, i) => {
      const pos = visible.indexOf(i);
      el.tabIndex = -1;
      if (pos === -1) {
        el.classList.add('gone'); el.classList.remove('on');
        el.style.transform = 'translate(-50%, -50%) scale(.6)';
        return;
      }
      el.classList.remove('gone');
      const d = pos - a, k = Math.abs(d), s = Math.sign(d);
      let w, h, x = 0, ry = 0;
      if (k === 0) { w = coverW; h = coverH; }
      else {
        w = spineW * Math.pow(0.93, k - 1);
        h = coverH * 0.9 * Math.pow(0.955, k - 1);
        let off = coverW / 2 + 12;
        for (let m = 1; m < k; m++) off += spineW * Math.pow(0.93, m - 1) + 5;
        x = s * (off + w / 2);
        ry = -s * Math.min(10 + k * 5, 55);
      }
      const out = Math.abs(x) + w / 2 > half - 4;
      el.classList.toggle('on', k === 0);
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.style.zIndex = 60 - k;
      el.style.opacity = out ? 0 : 1;
      el.style.pointerEvents = out ? 'none' : '';
      el.style.setProperty('--spine-fs', Math.min(18, w * 0.38) + 'px');
      el.style.setProperty('--cover-fs', Math.round(coverW * 0.13) + 'px');
      el.style.transform = `translate(-50%, -50%) translateX(${x}px) rotateY(${ry}deg)`;
      if (!out && k > 0) el.tabIndex = 0;
      if (!booted && !reduce) el.style.transitionDelay = (k * 55) + 'ms';
    });
    placeDot();
  }

  function setActive(i, animate = true) {
    active = i;
    layout();
    showFeature(animate);
  }

  function showFeature(animate = true) {
    const l = LAPTOPS[active];
    const name = $('#fName'), meta = $('.feature-meta'), bud = $('.feature-budget');
    name.textContent = `${l.brand} ${l.model}`;
    $('#fUse').textContent = t('use.' + l.use);
    $('#fSpec').textContent = specLine(l);
    $('#fBudget').textContent = taka(l.b);
    if (animate && !reduce) [name, meta, bud].forEach(e => { e.classList.remove('swap'); void e.offsetWidth; e.classList.add('swap'); });
    const msg = `${t('wa.hello')}\n${t('wa.like')} ${l.brand} ${l.model} (${specLine(l)})\n${t('wa.budget')}: ≈ ৳${l.b.toLocaleString('en-IN')}`;
    $('#askLike').href = waUrl(msg);
    const r = $('#ruler');
    r.setAttribute('aria-valuenow', l.b);
    r.setAttribute('aria-valuetext', `${l.brand} ${l.model}, ${l.b} taka`);
  }

  function step(dir) {
    const p = visible.indexOf(active);
    const n = clamp(p + dir, 0, visible.length - 1);
    if (n !== p) setActive(visible[n]);
  }
  $('#prev').addEventListener('click', () => step(-1));
  $('#next').addEventListener('click', () => step(1));
  $('.hero').addEventListener('keydown', (e) => {
    if (e.target.closest('.uses')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  // use filter
  const useBtns = $$('.uses button');
  useBtns.forEach(btn => btn.addEventListener('click', () => {
    filter = btn.dataset.use;
    useBtns.forEach(b => b.setAttribute('aria-checked', String(b === btn)));
    visible = LAPTOPS.map((l, i) => i).filter(i => filter === 'all' || LAPTOPS[i].use === filter);
    if (!visible.includes(active)) {
      const cur = LAPTOPS[active].b;
      active = visible.reduce((best, i) => Math.abs(LAPTOPS[i].b - cur) < Math.abs(LAPTOPS[best].b - cur) ? i : best, visible[0]);
    }
    buildRuler();
    setActive(active);
  }));

  // budget ruler
  const ruler = $('#ruler'), ticks = $('#rulerTicks'), dot = $('#rulerDot'), dotVal = $('#rulerVal');
  const pct = (b) => (b - MIN) / (MAX - MIN) * 100;
  function buildRuler() {
    let html = '';
    for (let b = MIN; b <= MAX; b += 5000) {
      const major = (b % 25000) === 0;
      html += `<span class="tick${major ? ' major' : ''}" style="left:${pct(b)}%"></span>`;
      if (major) html += `<span class="tick-l" style="left:${pct(b)}%">${taka(b / 1000)}k</span>`;
    }
    visible.forEach(i => { html += `<span class="tick ex" style="left:${pct(LAPTOPS[i].b)}%"></span>`; });
    ticks.innerHTML = html;
    placeDot();
  }
  function placeDot(b = LAPTOPS[active].b) {
    dot.style.left = pct(clamp(b, MIN, MAX)) + '%';
    dotVal.textContent = taka(Math.round(b / 1000) * 1000);
  }
  function budgetAt(clientX) {
    const r = ticks.getBoundingClientRect();
    return MIN + clamp((clientX - r.left) / r.width, 0, 1) * (MAX - MIN);
  }
  function nearest(b) {
    return visible.reduce((best, i) => Math.abs(LAPTOPS[i].b - b) < Math.abs(LAPTOPS[best].b - b) ? i : best, visible[0]);
  }
  let dragging = false;
  ruler.addEventListener('pointerdown', (e) => {
    dragging = true; ruler.classList.add('drag'); ruler.setPointerCapture(e.pointerId);
    const b = budgetAt(e.clientX); placeDot(b);
    const n = nearest(b); if (n !== active) setActive(n);
    placeDot(b);
  });
  ruler.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const b = budgetAt(e.clientX);
    const n = nearest(b); if (n !== active) setActive(n);
    placeDot(b);
  });
  const endDrag = () => { if (!dragging) return; dragging = false; ruler.classList.remove('drag'); placeDot(); };
  ruler.addEventListener('pointerup', endDrag);
  ruler.addEventListener('pointercancel', endDrag);

  addEventListener('resize', () => layout());

  /* ================= hunt timeline ================= */
  const hunt = $('#hunt'), track = $('#huntTrack'), stops = $$('.stop'), huntFill = $('#huntFill'), huntPin = $('.hunt-pin');
  function huntUpdate() {
    const r = hunt.getBoundingClientRect(), vh = innerHeight;
    const pinned = getComputedStyle(huntPin).position === 'sticky';
    let p, act;
    if (pinned) {
      p = clamp(-r.top / (r.height - vh), 0, 1);
      const vp = $('.hunt-viewport');
      const dist = Math.max(0, track.scrollWidth - vp.clientWidth);
      track.style.transform = `translateX(${-p * dist}px)`;
      act = Math.min(stops.length - 1, Math.floor(p * stops.length * 0.999));
    } else {
      p = clamp((vh * 0.6 - $('#stops').getBoundingClientRect().top) / $('#stops').offsetHeight, 0, 1);
      act = -1;
      stops.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * 0.6) act = i; });
    }
    huntFill.style.setProperty('--p', (p * 100) + '%');
    stops.forEach((s, i) => { s.classList.toggle('on', i === act); s.classList.toggle('past', i < act); });
  }

  /* ================= inspection bench ================= */
  const svg = $('#rig');
  const NS = 'http://www.w3.org/2000/svg';
  const P = (x, y, z) => [0.866 * (x - y), 0.5 * (x + y) - z];
  const pts = (arr) => arr.map(([x, y, z]) => P(x, y, z).map(n => n.toFixed(1)).join(',')).join(' ');
  const poly = (arr, cls) => `<polygon class="${cls}" points="${pts(arr)}"/>`;
  const line = (a, b, cls = 'p-det') => { const [x1, y1] = P(...a), [x2, y2] = P(...b); return `<line class="${cls}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; };
  const rectTop = (x0, x1, y0, y1, z, cls = 'p-det') => poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], cls);
  function slab(x0, x1, y0, y1, z, t) {
    return poly([[x0, y1, z], [x1, y1, z], [x1, y1, z + t], [x0, y1, z + t]], 'p-side')
      + poly([[x1, y0, z], [x1, y1, z], [x1, y1, z + t], [x1, y0, z + t]], 'p-side')
      + rectTop(x0, x1, y0, y1, z + t, 'p-face');
  }
  // parts: key, explode distance, label anchor [x,y,z], label side, svg
  const parts = [];
  const keysGrid = () => {
    let s = '';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) {
      const x0 = -132 + c * 19, y0 = -86 + r * 18;
      s += rectTop(x0, x0 + 15, y0, y0 + 14, 16, 'p-det');
    }
    return s;
  };
  parts.push({ k: 'base', dz: 0, svg: slab(-150, 150, -100, 100, 0, 10) });
  parts.push({ k: 'memo', check: 0, dz: 50, anchor: [-100, 120, 2], side: -1, off: 40,
    svg: slab(-145, -55, 112, 196, 0, 1.5) + [124, 136, 148, 160].map(y => line([-135, y, 1.5], [-75 - (y % 3) * 8, y, 1.5])).join('') + rectTop(-90, -62, 170, 188, 1.5, 'p-detf') });
  parts.push({ k: 'battery', check: 4, dz: 55, anchor: [60, 92, 18], side: 1,
    svg: slab(-120, 120, 28, 92, 10, 8) + [-60, 0, 60].map(x => line([x, 28, 18], [x, 92, 18])).join('') + rectTop(96, 110, 52, 68, 18, 'p-detf') });
  parts.push({ k: 'mobo', check: 1, dz: 95, anchor: [-120, -20, 13], side: -1,
    svg: slab(-140, 140, -94, 18, 10, 3) + rectTop(-30, 12, -72, -32, 13, 'p-detf') + rectTop(-115, -85, -82, -62, 13, 'p-detf') + rectTop(-115, -85, -52, -34, 13, 'p-detf')
      + rectTop(62, 84, -18, 2, 13, 'p-detf') + line([12, -52, 13], [30, -52, 13]) + line([-85, -72, 13], [-30, -60, 13]) + line([-85, -43, 13], [-30, -44, 13]) + line([-10, -32, 13], [-10, 8, 13]) + line([-10, 8, 13], [62, 8, 13]) },
  );
  parts.push({ k: 'ssd', check: 3, dz: 130, anchor: [-120, 5, 16], side: -1,
    svg: slab(-122, -58, -22, 5, 13, 3) + rectTop(-112, -78, -16, -2, 16, 'p-detf') });
  parts.push({ k: 'ram', check: 2, dz: 140, anchor: [125, -56, 17], side: 1,
    svg: slab(32, 126, -84, -72, 13, 4) + slab(32, 126, -64, -52, 13, 4)
      + [40, 58, 76, 94, 112].map(x => rectTop(x, x + 10, -82, -74, 17, 'p-detf') + rectTop(x, x + 10, -62, -54, 17, 'p-detf')).join('') });
  parts.push({ k: 'deck', dz: 215, svg: slab(-150, 150, -100, 100, 10, 6) + keysGrid() + rectTop(-45, 45, 32, 84, 16, 'p-detf') });
  parts.push({ k: 'lid', dz: 320, svg: slab(-150, 150, -100, 100, 16, 5) + rectTop(-18, 18, -14, 14, 21, 'p-detf') });

  svg.innerHTML = parts.map(p => `<g class="part" data-k="${p.k}"${p.check !== undefined ? ` data-check="${p.check}"` : ''}>${p.svg}</g>`).join('')
    + `<g class="labels">${parts.map((p, i) => p.anchor ? `<g class="part lbl-wrap" data-i="${i}" data-check="${p.check}">${labelSvg(p)}</g>` : '').join('')}</g>`;
  function labelSvg(p) {
    const [ax, ay] = P(...p.anchor);
    const lx = ax + p.side * (p.off || 92), ly = ay - 22;
    const tx = p.side > 0 ? lx + 12 : lx - 12;
    return `<g class="lbl" opacity="0"><line x1="${ax}" y1="${ay}" x2="${lx}" y2="${ly}"/><circle cx="${ax}" cy="${ay}" r="2.5" fill="currentColor"/><rect x="${lx - 4}" y="${ly - 4}" width="8" height="8"/><text x="${tx}" y="${ly + 4}" text-anchor="${p.side > 0 ? 'start' : 'end'}"></text></g>`;
  }
  const partEls = $$(':scope > .part', svg);
  const lblEls = $$('.lbl-wrap', svg);
  const CHECK_KEYS = ['c1.t', 'c2.t', 'c3.t', 'c4.t', 'c5.t'];
  const READ = ['MEMO ✓', 'PASS', '0 ERRORS', 'HEALTH 96%', '142 CYCLES'];
  function setBenchLabels() {
    lblEls.forEach(g => {
      const c = g.dataset.check;
      const txt = $('text', g);
      txt.textContent = lang === 'en' ? t(CHECK_KEYS[c]).toUpperCase() : t(CHECK_KEYS[c]);
      txt.style.fontFamily = lang === 'bn' ? "'Anek Bangla', sans-serif" : '';
      txt.style.fontSize = lang === 'bn' ? '14px' : '';
    });
  }
  const bench = $('#bench'), benchPin = $('.bench-pin'), chks = $$('.chk');
  const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  let lastBenchKey = '';
  function benchUpdate(force = false) {
    const r = bench.getBoundingClientRect(), vh = innerHeight;
    const pinned = getComputedStyle(benchPin).position === 'sticky';
    const p = pinned ? clamp(-r.top / (r.height - vh), 0, 1) : clamp((vh * 0.85 - r.top) / (r.height * 0.9), 0, 1);
    const e = reduce ? (p > 0 ? 1 : 0) : ease(clamp(p / 0.3, 0, 1));
    partEls.forEach((g, i) => g.setAttribute('transform', `translate(0 ${(-parts[i].dz * e).toFixed(1)})`));
    lblEls.forEach(g => {
      g.setAttribute('transform', `translate(0 ${(-parts[+g.dataset.i].dz * e).toFixed(1)})`);
      $('.lbl', g).setAttribute('opacity', clamp((e - 0.6) / 0.4, 0, 1).toFixed(2));
    });
    // check sequence: 5 checks between p .34 and .9
    const seg = (p - 0.34) / 0.11;
    const cur = p < 0.34 ? -1 : Math.min(5, Math.floor(seg));
    const key = cur + lang;
    $('#hudBar').style.setProperty('--p', (p * 100).toFixed(1) + '%');
    if (key === lastBenchKey && !force) return;
    lastBenchKey = key;
    chks.forEach(c => {
      const k = +c.dataset.k, read = $('.read', c);
      c.classList.toggle('on', k === cur);
      c.classList.toggle('done', k < cur);
      read.textContent = k <= cur ? READ[k] : '—';
      read.style.setProperty('--w', k < cur ? '100%' : k === cur ? '60%' : '0%');
    });
    [...partEls, ...lblEls].forEach(g => g.classList.toggle('hot', g.dataset.check !== undefined && +g.dataset.check === cur));
    const done = cur >= 5;
    $('#hudStage').textContent = cur < 0 ? t('bench.opening') : done ? t('bench.done') : t(CHECK_KEYS[cur]);
    const st = $('#hudStatus');
    st.textContent = done ? t('bench.pass') : cur < 0 ? t('bench.waiting') : t('bench.checking');
    st.classList.toggle('pass', done);
    $('#stamp').classList.toggle('on', done);
  }

  /* ================= scroll loop ================= */
  let ticking = false;
  const onScroll = () => { huntUpdate(); benchUpdate(); ticking = false; };
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    if (document.hidden) onScroll(); else requestAnimationFrame(onScroll);
  }, { passive: true });

  /* ================= reveal + receipt ================= */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.2 });
  $$('.reveal').forEach(el => io.observe(el));
  const slipIO = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); slipIO.unobserve(en.target); } });
  }, { threshold: 0.15 });
  slipIO.observe($('#slip'));

  /* ================= faq: one open ================= */
  $$('.qa').forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('.qa').forEach(o => { if (o !== d) o.open = false; }); }));

  /* ================= boot ================= */
  $('#yr').textContent = new Date().getFullYear();
  // start collapsed in the centre, then fan out
  tapes.forEach(el => { el.style.transform = 'translate(-50%, -50%) scale(.4)'; el.style.opacity = 0; el.style.width = '40px'; el.style.height = '200px'; });
  applyLang(lang);
  huntUpdate();
  setTimeout(() => {
    document.body.classList.add('ready');
    layout();
    showFeature(false);
    booted = true;
    setTimeout(() => tapes.forEach(el => { el.style.transitionDelay = ''; }), 1400);
  }, 80);
})();
