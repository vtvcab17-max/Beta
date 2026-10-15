/* Trụ sở Beta kiểu pixel 2.5D (isometric).
   Thế giới vẽ trên canvas 480×300 rồi phóng to giữ nét pixel; chữ (tên phòng, tên nhân vật, lời nói) là lớp HTML phía trên.
   API: HQ.init(el, rooms) · HQ.actor(id, nhãn, màu, laNguoi) · HQ.moveTo(id, phòng) · HQ.say(id, chữ) · HQ.setSleep(id, ngủ)
        HQ.pulse(phòng, chữ) · HQ.setRoomInfo(phòng, cấp, dòng phụ) · HQ.anchor(id) → phần tử HTML đặt tại nhân vật */
(function () {
  "use strict";
  const W = 480, H = 300, TW = 22, TH = 11, COLS = 25, ROWS = 18, WALL = 26, RS = 7, SC = 2;
  const OX = (W - (COLS + ROWS) * TW / 2) / 2 + ROWS * TW / 2, OY = 40;
  const P = (x, y) => [OX + (x - y) * TW / 2, OY + (x + y) * TH / 2];
  const LAYOUT = { bravin: [0, 0], antifact: [1, 0], micron: [2, 0], micow: [0, 1], hq: [1, 1], web: [2, 1] };
  const CY = 8.95; // hành lang giữa hai dãy phòng
  let cv, ctx, ov, rooms = {}, actors = {}, deco = [], night = false, last = 0, t = 0;

  const hex = (h, k) => { const n = parseInt(h.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)))); return `rgb(${f(r)},${f(g)},${f(b)})`; };
  const mix = (a, b, k) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const c = s => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k); return `rgb(${c(16)},${c(8)},${c(0)})`; };
  const poly = (pts, fill) => { ctx.beginPath(); ctx.moveTo(Math.round(pts[0][0]), Math.round(pts[0][1])); for (const p of pts.slice(1)) ctx.lineTo(Math.round(p[0]), Math.round(p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  const up = (p, h) => [p[0], p[1] - h];
  // khối hộp isometric: chân tại (gx,gy), rộng w theo x, sâu d theo y, cao h px, nổi z px
  function box(gx, gy, w, d, h, col, z = 0) {
    const A = up(P(gx, gy), z), B = up(P(gx + w, gy), z), C = up(P(gx + w, gy + d), z), D = up(P(gx, gy + d), z);
    poly([D, C, up(C, h), up(D, h)], hex(col, -.15));
    poly([B, C, up(C, h), up(B, h)], hex(col, -.38));
    poly([up(A, h), up(B, h), up(C, h), up(D, h)], hex(col, .12));
  }
  const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

  // ---------- phòng ----------
  function buildRooms(defs) {
    for (const [k, [i, j]] of Object.entries(LAYOUT)) {
      const x0 = 1 + i * 8, y0 = j === 0 ? 1 : 10, def = defs[k] || {};
      rooms[k] = { k, x0, y0, c: def.c || "#7b6cf6", name: def.name || k, sub: def.sub || "", flash: 0,
        seats: [[x0 + 2.1, y0 + 3.4], [x0 + 4.9, y0 + 3.4], [x0 + 2.6, y0 + 5.7], [x0 + 4.6, y0 + 5.9]],
        door: [x0 + 3.5, j === 0 ? y0 + 6.9 : y0 + .1] };
      const lab = document.createElement("div"); lab.className = "hq-sign"; lab.style.setProperty("--c", rooms[k].c);
      const [sx, sy] = P(x0 + 3.5, y0); lab.style.left = (sx / W * 100) + "%"; lab.style.top = ((sy - WALL - 4) / H * 100) + "%";
      lab.innerHTML = '<b></b><span class="lv"></span>';
      lab.querySelector("b").textContent = rooms[k].name; lab.title = rooms[k].sub;
      ov.append(lab); rooms[k].lab = lab;
      // đồ đạc chung: 2 bàn + màn hình + ghế, chậu cây
      const R = rooms[k];
      R.items = [
        { d: x0 + 2 + y0 + 2, f: () => desk(x0 + 1.1, y0 + 1.9, R, 0) },
        { d: x0 + 5 + y0 + 2, f: () => desk(x0 + 3.9, y0 + 1.9, R, 1) },
        { d: x0 + 6.4 + y0 + .6, f: () => plant(x0 + 6.1, y0 + .3) },
        { d: x0 + .6 + y0 + 6.4, f: () => plant(x0 + .3, y0 + 6.1) },
        { d: x0 + 5.8 + y0 + 5.6, f: () => prop(k, x0 + 5.4, y0 + 5.0, R) }
      ];
    }
  }
  function desk(gx, gy, R, idx) {
    box(gx, gy, 2, .9, 6, "#5b4a3a");               // mặt bàn gỗ
    const on = R.screens && R.screens[idx];
    box(gx + .7, gy + .15, .7, .15, 7, "#22232c", 6); // màn hình
    const [mx, my] = P(gx + 1.05, gy + .32); const flick = on ? (Math.sin(t * 12 + idx * 3) > .85 ? .25 : .55) : -.6;
    px(mx - 4, my - 12, 7, 4, on ? hex(R.c, flick) : "#15161c");
    if (on) { px(mx - 3, my - 11, 3, 1, "#ffffff"); px(mx - 3, my - 9, 4, 1, hex(R.c, .8)); }
    box(gx + .7, gy + 1.15, .6, .5, 3, "#2c2d38");    // ghế
  }
  function plant(gx, gy) { box(gx, gy, .6, .6, 4, "#8a5a3c"); const [x, y] = P(gx + .3, gy + .3); px(x - 3, y - 10, 6, 4, "#3ddc97"); px(x - 2, y - 13, 4, 3, "#2fbf7f"); px(x - 1, y - 15, 2, 2, "#3ddc97"); }
  function prop(k, gx, gy, R) {
    const [x, y] = P(gx + .5, gy + .5);
    if (k === "bravin") { box(gx + .4, gy + .4, .2, .2, 9, "#3a3b46"); box(gx + .15, gy + .25, .8, .5, 4, "#2a2b35", 9); px(x + 3, y - 12, 2, 2, "#ff4f6d"); }
    else if (k === "antifact") { box(gx, gy + .3, 1, .15, 14, "#c9a27a"); const [a, b] = P(gx + .5, gy + .45); px(a - 4, b - 13, 3, 3, "#2fd0ee"); px(a - 1, b - 11, 3, 3, "#ff4f99"); px(a + 1, b - 14, 3, 3, "#ffd43b"); }
    else if (k === "micron") { box(gx, gy, 1, .8, 18, "#23242e"); for (let i = 0; i < 4; i++) px(x + 1, y - 16 + i * 4, 2, 1, Math.sin(t * 6 + i * 2) > 0 ? "#2fd4e8" : "#1b4950"); }
    else if (k === "micow") { box(gx, gy, .7, .7, 9, "#1d1e26"); box(gx + 1, gy - .4, .7, .7, 9, "#1d1e26"); const b = R.screens && R.screens.some(Boolean) ? 1 + Math.round(Math.abs(Math.sin(t * 7))) : 1; px(x - 5, y - 9, 3, b + 1, "#7b6cf6"); px(x + 2, y - 12, 3, b + 1, "#7b6cf6"); }
    else if (k === "hq") { box(gx - .4, gy - .2, 1.6, 1.2, 4, "#6b5a46"); px(x - 3, y - 7, 2, 1, "#f2c14e"); px(x + 1, y - 6, 2, 1, "#f2c14e"); }
    else if (k === "web") { box(gx + .2, gy + .2, .6, .6, 5, "#2c2d38"); px(x - 3, y - 13, 6, 6, "#3ddc97"); px(x - 1, y - 12, 2, 4, "#1f8a5f"); }
  }
  function floor() {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      let R = null; for (const r of Object.values(rooms)) if (x >= r.x0 && x < r.x0 + RS && y >= r.y0 && y < r.y0 + RS) R = r;
      const base = R ? mix(night ? "#191a24" : "#22232f", R.c, .16 + ((x + y) % 2) * .04) : ((x + y) % 2 ? "#15161d" : "#17181f");
      poly([P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)], base);
      if (R && R.flash > 0) poly([P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)], `rgba(255,255,255,${R.flash * .16})`);
    }
  }
  function walls() {
    for (const R of Object.values(rooms)) {
      const wc = mix("#2a2b38", R.c, .25);
      for (let y = R.y0; y < R.y0 + RS; y++) { const a = P(R.x0, y), b = P(R.x0, y + 1); poly([a, b, up(b, WALL), up(a, WALL)], hex(wc, -.05)); }
      for (let x = R.x0; x < R.x0 + RS; x++) { const a = P(x, R.y0), b = P(x + 1, R.y0); poly([a, b, up(b, WALL), up(a, WALL)], hex(wc, -.25)); }
      // viền trên tường + cửa sổ
      const a = up(P(R.x0, R.y0 + RS), WALL), c = up(P(R.x0, R.y0), WALL), b = up(P(R.x0 + RS, R.y0), WALL);
      ctx.strokeStyle = hex(R.c, .2); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      for (const wx of [R.x0 + 1.2, R.x0 + 4.6]) { const p1 = P(wx, R.y0), p2 = P(wx + 1.2, R.y0); poly([up(p1, 20), up(p2, 20), up(p2, 10), up(p1, 10)], night ? "#2a3560" : "#8fb4ff"); }
    }
  }

  // ---------- nhân vật ----------
  function drawActor(a) {
    const [sx, sy] = P(a.x, a.y), X = Math.round(sx), Y = Math.round(sy) - (a.sit ? 3 : 0);
    const q = (x, y, w, h, c) => px(X + x * SC, Y + y * SC, w * SC, h * SC, c);
    const c = a.color, dark = hex(c, -.35), step = a.moving ? (Math.floor(t * 8) % 2) : 0;
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(X - 8, Y - 2, 16, 4);
    if (a.human) {
      q(-3, -4 - step, 2, 4, "#2a2a38"); q(1, -4 - (1 - step), 2, 4, "#2a2a38");
      q(-4, -10, 8, 6, c); q(-3, -15, 6, 5, "#f3c9a0"); q(-3, -16, 6, 2, "#2a2030"); q(-2, -13, 1, 1, "#2a2030"); q(1, -13, 1, 1, "#2a2030");
    } else {
      if (!a.sit) { q(-3, -3 - step, 2, 3, "#2a2a38"); q(1, -3 - (1 - step), 2, 3, "#2a2a38"); }
      q(-4, -9, 8, 6, dark); q(-3, -8, 6, 4, c);
      const type = a.sit && a.working && !a.sleep ? (Math.floor(t * 10) % 2) : 0;
      q(-5, -8 + type, 1, 3, c); q(4, -8 + (1 - type), 1, 3, c);
      const hy = -15 + (a.sleep ? 1 : 0);
      q(-4, hy, 8, 6, c); q(-3, hy + 2, 6, 2, "#111216");
      if (!a.sleep) { q(-2, hy + 2, 1, 1, "#7ff0ff"); q(1, hy + 2, 1, 1, "#7ff0ff"); }
      q(0, hy - 3, 1, 3, dark); q(0, hy - 4, 1, 1, "#f2c14e");
    }
    if (a.sleep) { const k = (t * .7) % 1; ctx.fillStyle = `rgba(200,200,220,${1 - k})`; ctx.font = "bold 9px monospace"; ctx.fillText("z", X + 10 + k * 6, Y - 32 - k * 10); }
  }
  function route(a, roomKey) {
    const R = rooms[roomKey]; if (!R) return [];
    const seatIdx = Object.values(actors).filter(o => o !== a && o.room === roomKey).length % R.seats.length;
    const seat = R.seats[seatIdx];
    if (a.room === roomKey && a.x) return [seat];
    const pts = [];
    if (a.room && rooms[a.room]) { const S = rooms[a.room]; pts.push(S.door, [S.door[0], CY]); }
    pts.push([R.door[0], CY], R.door, seat);
    return pts;
  }

  // ---------- vòng lặp ----------
  function frame(ts) {
    const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; t += dt;
    for (const R of Object.values(rooms)) { R.flash = Math.max(0, R.flash - dt * .6); R.screens = [false, false]; }
    for (const a of Object.values(actors)) {
      if (a.path.length) {
        const [tx, ty] = a.path[0], dx = tx - a.x, dy = ty - a.y, dist = Math.hypot(dx, dy), sp = 3 * dt;
        if (dist <= sp) { a.x = tx; a.y = ty; a.path.shift(); } else { a.x += dx / dist * sp; a.y += dy / dist * sp; }
        a.moving = a.path.length > 0; a.sit = !a.moving;
      } else { a.moving = false; a.sit = true; }
      const R = rooms[a.room];
      if (R && a.sit && !a.sleep) { const near = R.seats.findIndex(s => Math.abs(s[0] - a.x) < .3 && Math.abs(s[1] - a.y) < .3); if (near === 0 || near === 1) R.screens[near] = true; }
      // xu trang trí khi đang làm (không kèm số)
      if (a.sit && a.working && !a.sleep && Math.random() < dt * .5) deco.push({ x: a.x - .4, y: a.y - 1.2, life: 1 });
      const [sx, sy] = P(a.x, a.y); a.lab.style.left = (sx / W * 100) + "%"; a.lab.style.top = (sy / H * 100) + "%";
    }
    ctx.fillStyle = night ? "#0a0b12" : "#101119"; ctx.fillRect(0, 0, W, H);
    floor(); walls();
    const list = [];
    for (const R of Object.values(rooms)) for (const it of R.items) list.push(it);
    for (const a of Object.values(actors)) list.push({ d: a.x + a.y + .2, f: () => drawActor(a) });
    list.sort((p, q) => p.d - q.d).forEach(o => o.f());
    deco = deco.filter(c => (c.life -= dt * .7) > 0);
    for (const c of deco) { const [x, y] = P(c.x, c.y); const yy = y - 18 - (1 - c.life) * 14; px(x - 1, yy, 3, 3, `rgba(242,193,78,${c.life})`); px(x, yy + 1, 1, 1, `rgba(255,240,190,${c.life})`); }
    requestAnimationFrame(frame);
  }

  // ---------- API ----------
  const HQ = window.HQ = {
    init(el, defs) {
      el.classList.add("hq");
      cv = document.createElement("canvas"); cv.width = W; cv.height = H; ctx = cv.getContext("2d"); ctx.imageSmoothingEnabled = false;
      ov = document.createElement("div"); ov.className = "hq-ov"; el.append(cv, ov);
      buildRooms(defs);
      cv.addEventListener("click", ev => {
        const r = cv.getBoundingClientRect(), mx = (ev.clientX - r.left) / r.width * W, my = (ev.clientY - r.top) / r.height * H;
        let best = null, bd = 22; for (const [id, a] of Object.entries(actors)) { const [sx, sy] = P(a.x, a.y), d = Math.hypot(sx - mx, sy - 18 - my); if (d < bd) { bd = d; best = id; } }
        if (best) HQ.say(best, actors[best].task || "Đang chờ việc");
      });
      requestAnimationFrame(frame);
    },
    setNight(v) { night = v; },
    actor(id, label, color, human) {
      if (actors[id]) return actors[id];
      const lab = document.createElement("div"); lab.className = "hq-name" + (human ? " human" : "");
      const bub = document.createElement("div"); bub.className = "hq-bub"; const nm = document.createElement("span"); nm.textContent = label;
      lab.append(bub, nm); ov.append(lab);
      const start = rooms.hq.seats[Object.keys(actors).length % 4];
      return actors[id] = { id, label, color, human, x: start[0], y: start[1], path: [], room: null, lab, bub, task: "", working: false, sleep: false, el: lab };
    },
    moveTo(id, roomKey) { const a = actors[id]; if (!a || !rooms[roomKey]) return; if (a.room === roomKey && a.path.length) return; a.path = route(a, roomKey); a.room = roomKey; },
    say(id, text, ms = 5000) { const a = actors[id]; if (!a) return; a.bub.textContent = text; a.lab.classList.add("say"); clearTimeout(a.tm); a.tm = setTimeout(() => a.lab.classList.remove("say"), ms); },
    setSleep(id, on) { const a = actors[id]; if (a) { a.sleep = !!on; a.working = !on; } },
    pulse(roomKey, text) {
      const R = rooms[roomKey]; if (!R) return; R.flash = 1;
      const f = document.createElement("div"); f.className = "hq-float"; f.textContent = text;
      const [sx, sy] = P(R.x0 + 3.5, R.y0 + 3); f.style.left = (sx / W * 100) + "%"; f.style.top = (sy / H * 100) + "%";
      ov.append(f); setTimeout(() => f.remove(), 1900);
    },
    setRoomInfo(roomKey, lv, sub) { const R = rooms[roomKey]; if (!R) return; R.lab.querySelector(".lv").textContent = lv; if (sub) R.lab.title = sub; },
    anchor(id) { return actors[id] ? actors[id].lab : null; },
    get actors() { return actors; }
  };
})();
