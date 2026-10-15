/* Văn phòng Beta: minh hoạ isometric phẳng theo phong cách Material của Google.
   Thế giới tính theo toạ độ 480×300 và vẽ ở độ phân giải cao (nét mịn); chữ (biển phòng, tên, lời nói) là lớp HTML phía trên.
   Hai tầng: tầng 1 là 6 phòng sản phẩm; tầng 2 là xưởng, mỗi repo mới tự thành một phòng (HQ.addRoom). Nhân vật đi thang máy ở sảnh để đổi tầng.
   API: HQ.init(el, rooms) · HQ.actor(id, nhãn, màu, laNguoi) · HQ.moveTo(id, phòng) · HQ.say(id, chữ) · HQ.setSleep(id, ngủ)
        HQ.pulse(phòng, chữ) · HQ.setRoomInfo(phòng, cấp, chú thích) · HQ.anchor(id) → phần tử HTML đặt tại nhân vật */
(function () {
  "use strict";
  const W = 480, H = 300, TW = 22, TH = 11, COLS = 25, ROWS = 18, WALL = 28, RS = 7;
  const OX = (W - (COLS + ROWS) * TW / 2) / 2 + ROWS * TW / 2, OY = 42;
  const P = (x, y) => [OX + (x - y) * TW / 2, OY + (x + y) * TH / 2];
  const SLOTS = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]];
  const F1 = { bravin: 0, antifact: 1, micron: 2, micow: 3, hq: 4, web: 5 };
  const LOBBY = { 1: "hq", 2: "san2" }, LOBBY_SLOT = 4;
  const CY = 8.95;
  const dark = matchMedia("(prefers-color-scheme: dark)");
  const THEMES = {
    light: { bg: "#f8f9fc", corridor: "#eceff4", grid: "rgba(60,64,67,.06)", wallL: "#ffffff", wallR: "#eef0f3", wallEdge: "#dadce0", win: "#d2e3fc", winF: "#ffffff",
      deskTop: "#ffffff", deskL: "#e8eaed", deskR: "#d2d5da", mon: "#3c4043", monOff: "#5f6368", chairK: .1, pot: "#ffffff", leaf: "#34a853", leaf2: "#1e8e3e", shadow: "rgba(60,64,67,.16)", floorMix: .1, face: "#202124", skin: "#f6c7a0", hair: "#3c4043", zzz: "#5f6368" },
    dark: { bg: "#141218", corridor: "#1d1b20", grid: "rgba(255,255,255,.04)", wallL: "#2b2930", wallR: "#24222a", wallEdge: "#49454f", win: "#2f3b5c", winF: "#36343b",
      deskTop: "#49454f", deskL: "#3a3740", deskR: "#2e2c33", mon: "#1d1b20", monOff: "#36343b", chairK: -.2, pot: "#49454f", leaf: "#6dd58c", leaf2: "#37be5f", shadow: "rgba(0,0,0,.35)", floorMix: .14, face: "#141218", skin: "#e8b48f", hair: "#1d1b20", zzz: "#cac4d0" }
  };
  let T = dark.matches ? THEMES.dark : THEMES.light;
  let cv, ctx, ov, K = 3, rooms = {}, actors = {}, deco = [], last = 0, t = 0, floorNow = 1;
  const activity = { 1: 0, 2: 0 };
  const onFloor = R => R.floor === floorNow;
  const col = R => R.old ? mix(R.c, "#9aa0a6", .72) : R.c;

  const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, k) => { const A = rgb(a), B = rgb(b); return `rgb(${A.map((v, i) => Math.round(v * (1 - k) + B[i] * k)).join(",")})`; };
  const shade = (h, k) => k >= 0 ? mix(h, "#ffffff", k) : mix(h, "#000000", -k);
  const path = pts => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath(); };
  const poly = (pts, fill) => { path(pts); ctx.fillStyle = fill; ctx.fill(); };
  const up = (p, h) => [p[0], p[1] - h];
  const shadow = (gx, gy, w, d, blur = 3) => { ctx.save(); ctx.filter = `blur(${blur}px)`; poly([P(gx + .1, gy + .2), P(gx + w + .25, gy + .2), P(gx + w + .25, gy + d + .35), P(gx + .1, gy + d + .35)], T.shadow); ctx.restore(); };
  // khối hộp: chân (gx,gy), rộng w theo x, sâu d theo y, cao h, nổi z; màu mặt trên / trái / phải
  function box(gx, gy, w, d, h, top, left, right, z = 0) {
    const A = up(P(gx, gy), z), B = up(P(gx + w, gy), z), C = up(P(gx + w, gy + d), z), D = up(P(gx, gy + d), z);
    poly([D, C, up(C, h), up(D, h)], left); poly([B, C, up(C, h), up(B, h)], right);
    poly([up(A, h), up(B, h), up(C, h), up(D, h)], top);
  }
  const tone = (c, h) => [shade(c, .12), shade(c, -.08), shade(c, -.22)];
  const circle = (x, y, r, c) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); };
  const rr = (x, y, w, h, r, c) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); };

  // ---------- phòng ----------
  function makeRoom(k, def, floor, slot) {
    const [i, j] = SLOTS[slot], x0 = 1 + i * 8, y0 = j === 0 ? 1 : 10;
    const R = rooms[k] = { k, floor, slot, x0, y0, c: def.c || "#4285f4", name: def.name || k, sub: def.sub || "", flash: 0, screens: [false, false],
      seats: [[x0 + 2.1, y0 + 3.4], [x0 + 4.9, y0 + 3.4], [x0 + 2.6, y0 + 5.7], [x0 + 4.6, y0 + 5.9]],
      door: [x0 + 3.5, j === 0 ? y0 + 6.9 : y0 + .1], lift: [x0 + .9, y0 + 4.5] };
    const lab = document.createElement("div"); lab.className = "hq-sign"; lab.style.setProperty("--c", R.c);
    const [sx, sy] = P(x0 + 3.5, y0); lab.style.left = (sx / W * 100) + "%"; lab.style.top = ((sy - WALL - 6) / H * 100) + "%";
    lab.innerHTML = '<b></b><span class="lv"></span>'; lab.querySelector("b").textContent = R.name; lab.title = R.sub;
    lab.style.display = floor === floorNow ? "" : "none";
    ov.append(lab); R.lab = lab;
    R.items = [
      { d: x0 + 2 + y0 + 2, f: () => desk(x0 + 1.1, y0 + 1.9, R, 0) },
      { d: x0 + 5 + y0 + 2, f: () => desk(x0 + 3.9, y0 + 1.9, R, 1) },
      { d: x0 + 6.4 + y0 + .6, f: () => plant(x0 + 6.1, y0 + .3) },
      { d: x0 + .6 + y0 + 6.4, f: () => plant(x0 + .3, y0 + 6.1) },
      { d: x0 + 5.8 + y0 + 5.6, f: () => prop(k === "san2" ? "hq" : (F1[k] != null ? k : "new"), x0 + 5.4, y0 + 5.0, R) }
    ];
    return R;
  }
  function buildRooms(defs) {
    for (const [k, slot] of Object.entries(F1)) makeRoom(k, defs[k] || {}, 1, slot);
    makeRoom("san2", { name: "Sảnh tầng 2", sub: "thang máy · xưởng của các tác nhân", c: "#5f6368" }, 2, LOBBY_SLOT);
  }
  function desk(gx, gy, R, idx) {
    shadow(gx, gy, 2, .9);
    box(gx, gy, 2, .9, 7, T.deskTop, T.deskL, T.deskR);
    // màn hình
    const on = R.screens[idx], [mx, my] = P(gx + 1.05, gy + .3);
    rr(mx - 1, my - 10, 2, 4, 1, T.mon);
    rr(mx - 7, my - 19, 14, 10, 2, T.mon);
    const glow = on ? (Math.sin(t * 9 + idx * 2) > .9 ? shade(R.c, .55) : shade(R.c, .35)) : T.monOff;
    rr(mx - 6, my - 18, 12, 8, 1.5, glow);
    if (on) { rr(mx - 4.5, my - 16.5, 6, 1.2, .6, "#ffffff"); rr(mx - 4.5, my - 14.2, 8, 1.2, .6, shade(R.c, .8)); rr(mx - 4.5, my - 12, 4, 1.2, .6, shade(R.c, .8)); }
    // ghế
    const [cx, cy] = P(gx + 1, gy + 1.45);
    ctx.save(); ctx.filter = "blur(2px)"; ctx.beginPath(); ctx.ellipse(cx, cy + 1, 6, 3, 0, 0, Math.PI * 2); ctx.fillStyle = T.shadow; ctx.fill(); ctx.restore();
    rr(cx - 5, cy - 6, 10, 5, 2.5, shade(R.c, T.chairK)); rr(cx - 1, cy - 2, 2, 3, 1, T.deskR);
  }
  function plant(gx, gy) {
    shadow(gx, gy, .6, .6, 2); box(gx, gy, .6, .6, 5, T.pot, shade(T.pot, -.06), shade(T.pot, -.14));
    const [x, y] = P(gx + .3, gy + .3);
    circle(x - 2.5, y - 9, 3.4, T.leaf2); circle(x + 2.5, y - 9.5, 3.4, T.leaf); circle(x, y - 13, 3.8, T.leaf);
  }
  function prop(k, gx, gy, R) {
    const [x, y] = P(gx + .5, gy + .5), c = R.c;
    shadow(gx, gy, 1, 1, 3);
    if (k === "bravin") { // máy quay trên chân
      ctx.strokeStyle = T.mon; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x - 4, y); ctx.moveTo(x, y - 12); ctx.lineTo(x + 4, y); ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 1); ctx.stroke();
      rr(x - 6, y - 19, 11, 7, 2, T.mon); circle(x + 6, y - 15.5, 3, shade(c, .2)); circle(x - 3, y - 17, 1, "#ea4335");
    } else if (k === "antifact") { // giá vẽ
      ctx.strokeStyle = shade("#8d6e63", T === THEMES.dark ? -.2 : 0); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 5, y + 1); ctx.lineTo(x - 1, y - 22); ctx.moveTo(x + 5, y + 1); ctx.lineTo(x + 1, y - 22); ctx.stroke();
      rr(x - 8, y - 22, 16, 13, 1.5, "#ffffff"); circle(x - 3, y - 15, 3, "#4285f4"); circle(x + 1, y - 17, 3, "#ea4335"); circle(x + 3, y - 13, 3, "#fbbc04");
    } else if (k === "micron") { // tủ máy chủ
      box(gx, gy, 1, .8, 22, shade(T.mon, .1), T.mon, shade(T.mon, -.2));
      for (let i = 0; i < 5; i++) { const [a, b] = P(gx + .5, gy + .8); circle(a - 2 + 0, b - 18 + i * 3.6, 1, Math.sin(t * 5 + i * 1.7) > 0 ? c : shade(c, -.55)); }
    } else if (k === "micow") { // hai loa nhún theo nhạc
      const busy = R.screens.some(Boolean), b = busy ? Math.abs(Math.sin(t * 7)) * 1.2 : 0;
      box(gx, gy, .7, .7, 12, shade(T.mon, .1), T.mon, shade(T.mon, -.2)); box(gx + 1, gy - .3, .7, .7, 12, shade(T.mon, .1), T.mon, shade(T.mon, -.2));
      const [a1, b1] = P(gx + .35, gy + .7), [a2, b2] = P(gx + 1.35, gy + .4);
      circle(a1 - 1, b1 - 6, 2.2 + b, shade(c, .3)); circle(a2 - 1, b2 - 6, 2.2 + b, shade(c, .3));
    } else if (k === "hq") { // bàn họp tròn + bảng
      ctx.beginPath(); ctx.ellipse(x, y - 6, 12, 6, 0, 0, Math.PI * 2); ctx.fillStyle = T.deskTop; ctx.fill(); rr(x - 1.5, y - 6, 3, 6, 1, T.deskR);
      circle(x - 4, y - 7, 1.6, "#4285f4"); circle(x + 1, y - 8, 1.6, "#ea4335"); circle(x + 5, y - 6.5, 1.6, "#34a853");
    } else if (k === "new") { // thùng hàng vừa chuyển tới
      box(gx, gy, .8, .8, 8, shade("#c8a27a", .1), "#b08a62", "#94714d"); box(gx + .1, gy + .1, .6, .6, 6, shade("#c8a27a", .2), "#bb956c", "#9c7853", 8);
      const [a1, b1] = P(gx + .4, gy + .4); rr(a1 - 3, b1 - 16, 6, 2, 1, shade(c, .3));
    } else if (k === "web") { // quả địa cầu
      rr(x - 1, y - 6, 2, 6, 1, T.deskR); circle(x, y - 13, 7, shade(c, .2));
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y - 13, 3, 7, 0, 0, Math.PI * 2); ctx.moveTo(x - 7, y - 13); ctx.lineTo(x + 7, y - 13); ctx.stroke();
    }
  }
  function floor() {
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
    poly([P(0, 0), P(COLS, 0), P(COLS, ROWS), P(0, ROWS)], T.corridor);
    if (floorNow === 2) { // chỗ trống cho repo mới
      const used = Object.values(rooms).filter(r => r.floor === 2).map(r => r.slot);
      ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = T.wallEdge; ctx.lineWidth = 1;
      SLOTS.forEach(([i, j], slot) => { if (used.includes(slot)) return; const x0 = 1 + i * 8, y0 = j === 0 ? 1 : 10;
        path([P(x0, y0), P(x0 + RS, y0), P(x0 + RS, y0 + RS), P(x0, y0 + RS)]); ctx.stroke();
        const [cx, cy] = P(x0 + 3.5, y0 + 3.5); ctx.fillStyle = T.zzz; ctx.font = "500 7px Roboto Flex, sans-serif"; ctx.textAlign = "center"; ctx.fillText("Chỗ trống cho repo mới", cx, cy); ctx.textAlign = "left"; });
      ctx.restore();
    }
    for (const R of Object.values(rooms).filter(onFloor)) {
      poly([P(R.x0, R.y0), P(R.x0 + RS, R.y0), P(R.x0 + RS, R.y0 + RS), P(R.x0, R.y0 + RS)], mix(T === THEMES.dark ? "#211f26" : "#ffffff", col(R), T.floorMix));
      ctx.strokeStyle = T.grid; ctx.lineWidth = .5; ctx.beginPath();
      for (let i = 1; i < RS; i++) { let a = P(R.x0 + i, R.y0), b = P(R.x0 + i, R.y0 + RS); ctx.moveTo(...a); ctx.lineTo(...b); a = P(R.x0, R.y0 + i); b = P(R.x0 + RS, R.y0 + i); ctx.moveTo(...a); ctx.lineTo(...b); }
      ctx.stroke();
      if (R.flash > 0) poly([P(R.x0, R.y0), P(R.x0 + RS, R.y0), P(R.x0 + RS, R.y0 + RS), P(R.x0, R.y0 + RS)], `rgba(${rgb(R.c).join(",")},${R.flash * .28})`);
    }
  }
  function walls() {
    for (const R of Object.values(rooms).filter(onFloor)) {
      const a = P(R.x0, R.y0 + RS), c = P(R.x0, R.y0), b = P(R.x0 + RS, R.y0);
      poly([a, c, up(c, WALL), up(a, WALL)], T.wallL);
      poly([c, b, up(b, WALL), up(c, WALL)], T.wallR);
      // sọc màu trên đỉnh tường (dấu hiệu phòng)
      ctx.lineCap = "round"; ctx.strokeStyle = col(R); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(...up(a, WALL)); ctx.lineTo(...up(c, WALL)); ctx.lineTo(...up(b, WALL)); ctx.stroke();
      ctx.strokeStyle = T.wallEdge; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(...c); ctx.lineTo(...up(c, WALL)); ctx.stroke();
      for (const wx of [R.x0 + 1.2, R.x0 + 4.6]) { // cửa sổ
        const p1 = P(wx, R.y0), p2 = P(wx + 1.3, R.y0);
        poly([up(p1, 22), up(p2, 22), up(p2, 9), up(p1, 9)], T.winF);
        poly([up([p1[0] + 1, p1[1] + .5], 21), up([p2[0] - 1, p2[1] - .5], 21), up([p2[0] - 1, p2[1] - .5], 10), up([p1[0] + 1, p1[1] + .5], 10)], T.win);
      }
      if (R.k === LOBBY[R.floor]) { // thang máy trên tường trái của sảnh
        const q1 = P(R.x0, R.y0 + 3.7), q2 = P(R.x0, R.y0 + 5.3), qm = P(R.x0, R.y0 + 4.5);
        poly([q1, q2, up(q2, 22), up(q1, 22)], T.wallEdge);
        poly([[q1[0] - .4, q1[1] + .6], [qm[0] - .2, qm[1]], up([qm[0] - .2, qm[1]], 20), up([q1[0] - .4, q1[1] + .6], 20)], shade(T.monOff, .35));
        poly([[qm[0] + .2, qm[1]], [q2[0] + .4, q2[1] - .6], up([q2[0] + .4, q2[1] - .6], 20), up([qm[0] + .2, qm[1]], 20)], shade(T.monOff, .25));
        const top = up(qm, 25); rr(top[0] - 5, top[1] - 3, 10, 6, 2, T.mon);
        ctx.fillStyle = "#fbbc04"; ctx.font = "600 5px Roboto Flex, sans-serif"; ctx.textAlign = "center"; ctx.fillText(R.floor === 1 ? "1 ▲" : "2 ▼", top[0], top[1] + 2); ctx.textAlign = "left";
      }
    }
  }

  // ---------- nhân vật ----------
  function drawActor(a) {
    const [sx, sy] = P(a.x, a.y), X = sx, Y = sy - (a.sit ? 3 : 0), c = a.color;
    const bob = a.moving ? Math.abs(Math.sin(t * 10)) * 1.5 : (a.working && !a.sleep ? Math.sin(t * 3) * .4 : 0);
    ctx.save(); ctx.filter = "blur(2px)"; ctx.beginPath(); ctx.ellipse(X, sy + 1, 8, 3.5, 0, 0, Math.PI * 2); ctx.fillStyle = T.shadow; ctx.fill(); ctx.restore();
    const step = a.moving ? Math.sin(t * 12) * 2 : 0;
    if (!a.sit) { rr(X - 4 + step * .3, Y - 6, 3, 6, 1.5, shade(c, -.35)); rr(X + 1 - step * .3, Y - 6, 3, 6, 1.5, shade(c, -.35)); }
    rr(X - 6, Y - 17 - bob, 12, 12, 5, c);                                      // thân
    const typ = a.sit && a.working && !a.sleep ? Math.sin(t * 18) * 1.2 : 0;
    rr(X - 8, Y - 14 - bob + typ, 3, 7, 1.5, shade(c, -.15)); rr(X + 5, Y - 14 - bob - typ, 3, 7, 1.5, shade(c, -.15));
    const hy = Y - 30 - bob + (a.sleep ? 1.5 : 0);
    if (a.human) {
      circle(X, hy + 6, 7, T.skin);
      ctx.beginPath(); ctx.arc(X, hy + 5, 7.2, Math.PI * 1.05, Math.PI * 1.95); ctx.fillStyle = T.hair; ctx.fill();
      circle(X - 2.5, hy + 7, .9, "#202124"); circle(X + 2.5, hy + 7, .9, "#202124");
    } else {
      rr(X - 8, hy - 1, 16, 13, 6, "#ffffff");                                  // đầu robot
      rr(X - 6, hy + 2, 12, 7, 3.5, T.face);
      if (a.sleep) { ctx.strokeStyle = shade(c, .4); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X - 4, hy + 5.5); ctx.lineTo(X - 1.5, hy + 5.5); ctx.moveTo(X + 1.5, hy + 5.5); ctx.lineTo(X + 4, hy + 5.5); ctx.stroke(); }
      else { const blink = (t % 4) > 3.85; circle(X - 2.7, hy + 5.5, blink ? .4 : 1.5, shade(c, .5)); circle(X + 2.7, hy + 5.5, blink ? .4 : 1.5, shade(c, .5)); }
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X, hy - 1); ctx.lineTo(X, hy - 5); ctx.stroke(); circle(X, hy - 6, 1.8, c);
    }
    if (a.sleep) { const k = (t * .6) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = T.zzz; ctx.font = "600 8px Roboto Flex, sans-serif"; ctx.fillText("z", X + 9 + k * 6, hy - 2 - k * 10); ctx.globalAlpha = 1; }
  }
  function route(a, roomKey) {
    const R = rooms[roomKey]; if (!R) return [];
    const seatIdx = Object.values(actors).filter(o => o !== a && o.room === roomKey).length % R.seats.length, seat = R.seats[seatIdx];
    if (a.room === roomKey && a.floor === R.floor) return [seat];
    const pts = [], from = rooms[a.room];
    const exit = S => { pts.push(S.door, [S.door[0], CY]); };
    if (from && from.floor === a.floor) exit(from);
    if (R.floor !== a.floor) { // đi thang máy: tới sảnh tầng hiện tại, lên/xuống, ra khỏi sảnh tầng kia
      const L1 = rooms[LOBBY[a.floor]], L2 = rooms[LOBBY[R.floor]];
      pts.push([L1.door[0], CY], L1.door, L1.lift, { floor: R.floor, x: L2.lift[0], y: L2.lift[1] });
      if (roomKey === L2.k) { pts.push(seat); return pts; }
      exit(L2);
    }
    pts.push([R.door[0], CY], R.door, seat); return pts;
  }

  // ---------- vòng lặp ----------
  function resize() {
    const r = cv.getBoundingClientRect(); K = Math.max(2, Math.min(4, Math.ceil((r.width / W) * (devicePixelRatio || 1))));
    cv.width = W * K; cv.height = H * K;
  }
  function frame(ts) {
    const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; t += dt;
    for (const R of Object.values(rooms)) { R.flash = Math.max(0, R.flash - dt * .6); R.screens = [false, false]; }
    for (const a of Object.values(actors)) {
      if (a.path.length && !Array.isArray(a.path[0])) { const j = a.path.shift(); a.floor = j.floor; a.x = j.x; a.y = j.y; }
      if (a.path.length) {
        const [tx, ty] = a.path[0], dx = tx - a.x, dy = ty - a.y, dist = Math.hypot(dx, dy), sp = 3 * dt;
        if (dist <= sp) { a.x = tx; a.y = ty; a.path.shift(); } else { a.x += dx / dist * sp; a.y += dy / dist * sp; }
        a.moving = a.path.length > 0;
      } else a.moving = false;
      a.sit = !a.moving;
      const R = rooms[a.room];
      if (R && a.sit && !a.sleep) { const n = R.seats.findIndex(s => Math.abs(s[0] - a.x) < .3 && Math.abs(s[1] - a.y) < .3); if (n === 0 || n === 1) R.screens[n] = true; }
      if (a.sit && a.working && !a.sleep && Math.random() < dt * .5) deco.push({ x: a.x - .4, y: a.y - 1.2, life: 1, floor: a.floor });
      const [sx, sy] = P(a.x, a.y); a.lab.style.left = (sx / W * 100) + "%"; a.lab.style.top = (sy / H * 100) + "%"; a.lab.style.display = a.floor === floorNow ? "" : "none";
    }
    ctx.setTransform(K, 0, 0, K, 0, 0); ctx.imageSmoothingEnabled = true;
    floor(); walls();
    const list = [];
    for (const R of Object.values(rooms).filter(onFloor)) for (const it of R.items) list.push(it);
    for (const a of Object.values(actors)) if (a.floor === floorNow) list.push({ d: a.x + a.y + .2, f: () => drawActor(a) });
    list.sort((p, q) => p.d - q.d).forEach(o => o.f());
    deco = deco.filter(c => (c.life -= dt * .7) > 0);
    for (const c of deco) { if (c.floor !== floorNow) continue; const [x, y] = P(c.x, c.y), yy = y - 34 - (1 - c.life) * 16; ctx.globalAlpha = c.life; circle(x, yy, 3, "#fbbc04"); circle(x, yy, 1.6, "#fde293"); ctx.globalAlpha = 1; }
    requestAnimationFrame(frame);
  }

  // ---------- API ----------
  const HQ = window.HQ = {
    init(el, defs) {
      el.classList.add("hq");
      cv = document.createElement("canvas"); ctx = cv.getContext("2d");
      ov = document.createElement("div"); ov.className = "hq-ov"; el.append(cv, ov);
      buildRooms(defs); resize(); addEventListener("resize", resize);
      dark.addEventListener("change", e => { T = e.matches ? THEMES.dark : THEMES.light; });
      cv.addEventListener("click", ev => {
        const r = cv.getBoundingClientRect(), mx = (ev.clientX - r.left) / r.width * W, my = (ev.clientY - r.top) / r.height * H;
        let best = null, bd = 22; for (const [id, a] of Object.entries(actors)) { const [sx, sy] = P(a.x, a.y), d = Math.hypot(sx - mx, sy - 18 - my); if (d < bd) { bd = d; best = id; } }
        if (best) HQ.say(best, actors[best].task || "Đang chờ việc");
      });
      requestAnimationFrame(frame);
    },
    setNight() { /* giao diện theo chế độ sáng/tối của máy */ },
    setFloor(n) {
      floorNow = n; activity[n] = 0;
      for (const R of Object.values(rooms)) R.lab.style.display = R.floor === n ? "" : "none";
    },
    get floor() { return floorNow; },
    get activity() { return activity; },
    hasRoom(k) { return !!rooms[k]; },
    setRoomOld(k, days) { const R = rooms[k]; if (!R) return; R.old = days > 0; R.lab.classList.toggle("old", R.old); },
    removeRoom(k) { // nhường chỗ ở tầng 2 cho repo mới hơn; ai đang ở đó ra sảnh
      const R = rooms[k]; if (!R || R.floor !== 2 || R.k === LOBBY[2]) return false;
      R.lab.remove(); delete rooms[k];
      for (const a of Object.values(actors)) if (a.room === k) { a.room = LOBBY[2]; a.path = a.floor === 2 ? [rooms[LOBBY[2]].seats[2]] : []; }
      return true;
    },
    roomFloor(k) { return rooms[k] ? rooms[k].floor : null; },
    addRoom(k, def) { // phòng mới ở tầng 2 (tối đa 5 phòng + sảnh)
      if (rooms[k]) return true;
      const used = Object.values(rooms).filter(r => r.floor === 2).map(r => r.slot);
      const slot = SLOTS.map((_, i) => i).find(i => i !== LOBBY_SLOT && !used.includes(i));
      if (slot == null) return false;
      makeRoom(k, def, 2, slot); return true;
    },
    actor(id, label, color, human) {
      if (actors[id]) return actors[id];
      const lab = document.createElement("div"); lab.className = "hq-name" + (human ? " human" : "");
      const bub = document.createElement("div"); bub.className = "hq-bub"; const nm = document.createElement("span"); nm.textContent = label;
      lab.append(bub, nm); ov.append(lab);
      const start = rooms.hq.seats[Object.keys(actors).length % 4];
      return actors[id] = { id, label, color, human, x: start[0], y: start[1], floor: 1, path: [], room: null, lab, bub, task: "", working: false, sleep: false, el: lab };
    },
    place(id, roomKey) { // đặt thẳng vào phòng (vị trí ban đầu khi mở trang), không đi bộ
      const a = actors[id], R = rooms[roomKey]; if (!a || !R) return;
      const seat = R.seats[Object.values(actors).filter(o => o !== a && o.room === roomKey).length % R.seats.length];
      a.floor = R.floor; a.room = roomKey; a.path = []; a.x = seat[0]; a.y = seat[1];
    },
    moveTo(id, roomKey) { const a = actors[id]; if (!a || !rooms[roomKey]) return; if (a.room === roomKey && a.path.length) return; a.path = route(a, roomKey); a.room = roomKey; if (rooms[roomKey].floor !== floorNow) activity[rooms[roomKey].floor]++; },
    say(id, text, ms = 5000) { const a = actors[id]; if (!a) return; a.bub.textContent = text; a.lab.classList.add("say"); clearTimeout(a.tm); a.tm = setTimeout(() => a.lab.classList.remove("say"), ms); },
    setSleep(id, on) { const a = actors[id]; if (a) { a.sleep = !!on; a.working = !on; } },
    pulse(roomKey, text) {
      const R = rooms[roomKey]; if (!R) return; R.flash = 1;
      if (R.floor !== floorNow) { activity[R.floor]++; return; }
      const f = document.createElement("div"); f.className = "hq-float"; f.textContent = text;
      const [sx, sy] = P(R.x0 + 3.5, R.y0 + 3); f.style.left = (sx / W * 100) + "%"; f.style.top = (sy / H * 100) + "%";
      ov.append(f); setTimeout(() => f.remove(), 1900);
    },
    setRoomInfo(roomKey, lv, sub) { const R = rooms[roomKey]; if (!R) return; R.lab.querySelector(".lv").textContent = lv; if (sub) R.lab.title = sub; },
    anchor(id) { return actors[id] ? actors[id].lab : null; },
    get actors() { return actors; }
  };
})();
