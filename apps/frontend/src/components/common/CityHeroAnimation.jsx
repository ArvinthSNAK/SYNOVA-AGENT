import React, { useEffect, useRef } from 'react';

/**
 * Scroll-driven isometric city hero animation.
 * Ported from a standalone canvas script; kept self-contained (own effect,
 * own rAF loop, own listeners) so it can be dropped into any page safely.
 */
export default function CityHeroAnimation() {
  const trackRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const track = trackRef.current;
    if (!cv || !track) return undefined;
    const ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // PITCH 0.5 = classic isometric. Higher = camera rises toward straight down.
    const PITCH = 0.72;
    const SPEED = 1.15; // traffic pace

    const ROADS = [2, 6, 10, 14], BLOCKS = [4, 8, 12], HUB = { x: 8, z: 8 };
    let W = 0, H = 0, DPR = 1, TW = 0, TH = 0, VS = 0;

    let seed = 20260826;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function ease(t) { return t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3); }
    function win(t, a, b) { return ease((t - a) / (b - a)); }
    function shade(hex, amt) {
      const n = parseInt(hex.slice(1), 16);
      return 'rgb(' + clamp(((n >> 16) & 255) + amt, 0, 255) + ',' + clamp(((n >> 8) & 255) + amt, 0, 255) + ',' + clamp((n & 255) + amt, 0, 255) + ')';
    }

    // ---------- city blocks ----------
    let CITY = [], BUILDINGS = [];
    function buildCity() {
      seed = 4411; CITY = []; BUILDINGS = [];
      let idx = 0;
      for (let i = 0; i < BLOCKS.length; i++) {
        for (let j = 0; j < BLOCKS.length; j++) {
          const bx = BLOCKS[i], bz = BLOCKS[j];
          if (bx === HUB.x && bz === HUB.z) continue;
          const d = Math.hypot(bx - HUB.x, bz - HUB.z) / 6;
          const block = { x: bx, z: bz, d: d, at: 0.10 + idx * 0.030, rise: 0.03 + d * 0.10 };
          CITY.push(block);

          // one centred volume per block, sitting on a lavender pad
          BUILDINGS.push({
            x: bx, z: bz, w: 0.46, h: 1.05,
            block: block, lag: 0
          });

          idx++;
        }
      }
    }

    // ---------- traffic ----------
    const RING_DEFS = [
      { pts: [[2, 2], [6, 2], [6, 6], [2, 6]], dir: 1, speed: 0.95 },
      { pts: [[10, 2], [14, 2], [14, 6], [10, 6]], dir: -1, speed: 1.10 },
      { pts: [[2, 10], [6, 10], [6, 14], [2, 14]], dir: -1, speed: 1.02 },
      { pts: [[10, 10], [14, 10], [14, 14], [10, 14]], dir: 1, speed: 0.88 }
    ];
    const RINGS = RING_DEFS.map(function (def) {
      const segs = []; let total = 0;
      for (let i = 0; i < def.pts.length; i++) {
        const a = def.pts[i], b = def.pts[(i + 1) % def.pts.length];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        segs.push({ a: a, b: b, L: L }); total += L;
      }
      return { segs: segs, total: total, dir: def.dir, speed: def.speed };
    });

    const PAINT = ['#2B7FD4', '#F2F3F5', '#C7CAD2', '#2E3140', '#D9D3EC', '#E05B4A', '#8E94A8', '#4CA07A'];
    const JACKET = ['#3E3A5C', '#2E3140', '#5A5478'];
    const HELMET = ['#6B4EE6', '#F4F4F6', '#E05B4A'];

    let vehicles = [];
    function buildVehicles() {
      seed = 20260826; vehicles = [];
      const PLACEMENT = [
        { ring: 0, bike: false }, { ring: 1, bike: true },
        { ring: 2, bike: false }, { ring: 3, bike: true }
      ];
      for (let n = 0; n < PLACEMENT.length; n++) {
        vehicles.push({
          ring: PLACEMENT[n].ring, off: 0, bike: PLACEMENT[n].bike,
          col: PAINT[Math.floor(rnd() * PAINT.length)],
          jacket: JACKET[Math.floor(rnd() * JACKET.length)],
          helmet: HELMET[Math.floor(rnd() * HELMET.length)],
          at: 0.52 + n * 0.10
        });
      }
    }

    const LANE = 0.32;
    function vehiclePos(v, t) {
      const R = RINGS[v.ring];
      const s = ((v.off + t * SPEED * R.speed) % R.total + R.total) % R.total; let run = 0;
      for (let i = 0; i < R.segs.length; i++) {
        const sg = R.segs[i];
        if (run + sg.L >= s) {
          const k = (s - run) / sg.L;
          let dx = (sg.b[0] - sg.a[0]) / sg.L, dz = (sg.b[1] - sg.a[1]) / sg.L;
          if (R.dir < 0) { dx = -dx; dz = -dz; }
          const px = sg.a[0] + (sg.b[0] - sg.a[0]) * (R.dir < 0 ? 1 - k : k);
          const pz = sg.a[1] + (sg.b[1] - sg.a[1]) * (R.dir < 0 ? 1 - k : k);
          return { x: px - dz * LANE, z: pz + dx * LANE, fx: dx, fz: dz };
        }
        run += sg.L;
      }
      return { x: R.segs[0].a[0], z: R.segs[0].a[1], fx: 1, fz: 0 };
    }

    // ---------- projection ----------
    const cam = { cx: 0, cy: 0 };
    function iso(gx, gz, h) { h = h || 0; return { x: cam.cx + (gx - gz) * (TW / 2), y: cam.cy + (gx + gz) * (TH / 2) - h }; }
    function quad(gx, gz, rx, rz, h) {
      const a = iso(gx - rx, gz - rz, h), b = iso(gx + rx, gz - rz, h), c = iso(gx + rx, gz + rz, h), d = iso(gx - rx, gz + rz, h);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath();
    }
    function prism(gx, gz, rx, rz, h0, h1, top, left, right) {
      const t0 = iso(gx - rx, gz - rz, h1), t1 = iso(gx + rx, gz - rz, h1), t2 = iso(gx + rx, gz + rz, h1), t3 = iso(gx - rx, gz + rz, h1);
      const b1 = iso(gx + rx, gz - rz, h0), b2 = iso(gx + rx, gz + rz, h0), b3 = iso(gx - rx, gz + rz, h0);
      ctx.fillStyle = right; ctx.beginPath(); ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(b1.x, b1.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = left; ctx.beginPath(); ctx.moveTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(b2.x, b2.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = top; ctx.beginPath(); ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.closePath(); ctx.fill();
    }
    function box(gx, gz, rx, rz, h, t, l, r) { prism(gx, gz, rx, rz, 0, h, t, l, r); }

    function pt(P, f, s, h) {
      const sx = -P.fz, sz = P.fx;
      return iso(P.x + f * P.fx + s * sx, P.z + f * P.fz + s * sz, h * VS);
    }
    function poly(points, fill) {
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) i ? ctx.lineTo(points[i].x, points[i].y) : ctx.moveTo(points[i].x, points[i].y);
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    }
    function nearSide(P, w) {
      const sx = -P.fz, sz = P.fx;
      return ((P.x + sx * w) + (P.z + sz * w)) > ((P.x - sx * w) + (P.z - sz * w)) ? 1 : -1;
    }
    function local(P, f0, f1, s0, s1, h0, h1, col) {
      const A = pt(P, f0, s0, h1), B = pt(P, f1, s0, h1), C = pt(P, f1, s1, h1), D = pt(P, f0, s1, h1);
      const b = pt(P, f1, s0, h0), c = pt(P, f1, s1, h0), d = pt(P, f0, s1, h0);
      poly([B, C, c, b], shade(col, -10)); poly([C, D, d, c], shade(col, -24)); poly([A, B, C, D], shade(col, 10));
    }
    function extrude(P, prof, roles, w, body) {
      const near = nearSide(P, w) * w, far = -near;
      function side(s, fill) {
        const pts = [];
        for (let i = 0; i < prof.length; i++) pts.push(pt(P, prof[i][0], s, prof[i][1]));
        poly(pts, fill);
      }
      side(far, shade(body, -34));
      for (let i = 0; i < prof.length - 1; i++) {
        const a = prof[i], b = prof[i + 1], role = roles[i]; let fill;
        if (role === 'glass') fill = i < prof.length / 2 ? '#39404F' : '#2F3543';
        else if (role === 'roof') fill = shade(body, 22);
        else if (role === 'bonnet') fill = shade(body, 15);
        else if (role === 'boot') fill = shade(body, 12);
        else if (role === 'nose') fill = shade(body, 8);
        else if (role === 'inner') fill = shade(body, -20);
        else fill = shade(body, -6);
        poly([pt(P, a[0], far, a[1]), pt(P, b[0], far, b[1]), pt(P, b[0], near, b[1]), pt(P, a[0], near, a[1])], fill);
      }
      side(near, shade(body, -14));
    }
    function wheel(P, f, s, r, rim) {
      const c = pt(P, f, s, r);
      const fwd = { x: (P.fx - P.fz) * TW / 2, y: (P.fx + P.fz) * TH / 2 };
      const rot = Math.atan2(fwd.y, fwd.x), rx = r * Math.hypot(fwd.x, fwd.y), ry = r * VS;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, rx * 1.32, ry * 1.30, rot, 0, 6.284);
      ctx.fillStyle = 'rgba(24,24,30,.90)'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(c.x, c.y, rx, ry, rot, 0, 6.284);
      ctx.fillStyle = '#22222A'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(c.x, c.y, rx * 0.52, ry * 0.52, rot, 0, 6.284);
      ctx.fillStyle = rim; ctx.fill();
      ctx.beginPath(); ctx.ellipse(c.x, c.y, rx * 0.17, ry * 0.17, rot, 0, 6.284);
      ctx.fillStyle = '#9A9AA4'; ctx.fill();
    }

    // ---------- car ----------
    const CAR = [
      [0.50, 0.10], [0.50, 0.27], [0.42, 0.32], [0.20, 0.36],
      [0.02, 0.55], [-0.24, 0.57], [-0.38, 0.43], [-0.48, 0.36], [-0.50, 0.17]
    ];
    const CAR_ROLE = ['fascia', 'nose', 'bonnet', 'glass', 'roof', 'glass', 'boot', 'fascia'];

    function drawCar(v, P) {
      const body = v.col, w = 0.21, r = 0.115, ns = nearSide(P, w);
      ctx.globalAlpha = .17; quad(P.x, P.z, 0.34, 0.34, 0); ctx.fillStyle = '#413C58'; ctx.fill(); ctx.globalAlpha = 1;

      wheel(P, 0.30, -ns * w * 0.94, r, '#E9E9EE');
      wheel(P, -0.30, -ns * w * 0.94, r, '#E9E9EE');
      extrude(P, CAR, CAR_ROLE, w, body);

      const sg = ns * w * 1.01;
      poly([pt(P, 0.14, sg, 0.38), pt(P, 0.02, sg, 0.53), pt(P, -0.22, sg, 0.545), pt(P, -0.24, sg, 0.38)], '#39404F');
      poly([pt(P, -0.26, sg, 0.38), pt(P, -0.27, sg, 0.535), pt(P, -0.355, sg, 0.435), pt(P, -0.35, sg, 0.38)], '#2F3543');

      const ff = 0.505, rf = -0.505;
      poly([pt(P, ff, -w * 0.86, 0.20), pt(P, ff, -w * 0.40, 0.20), pt(P, ff, -w * 0.40, 0.27), pt(P, ff, -w * 0.86, 0.27)], '#FFF3CE');
      poly([pt(P, ff, w * 0.40, 0.20), pt(P, ff, w * 0.86, 0.20), pt(P, ff, w * 0.86, 0.27), pt(P, ff, w * 0.40, 0.27)], '#FFF3CE');
      poly([pt(P, ff, -w * 0.34, 0.13), pt(P, ff, w * 0.34, 0.13), pt(P, ff, w * 0.34, 0.22), pt(P, ff, -w * 0.34, 0.22)], '#26262E');
      poly([pt(P, rf, -w * 0.86, 0.22), pt(P, rf, -w * 0.34, 0.22), pt(P, rf, -w * 0.34, 0.30), pt(P, rf, -w * 0.86, 0.30)], '#D64B42');
      poly([pt(P, rf, w * 0.34, 0.22), pt(P, rf, w * 0.86, 0.22), pt(P, rf, w * 0.86, 0.30), pt(P, rf, w * 0.34, 0.30)], '#D64B42');
      poly([pt(P, -0.02, -w * 0.62, 0.575), pt(P, -0.20, -w * 0.62, 0.585),
      pt(P, -0.20, w * 0.62, 0.585), pt(P, -0.02, w * 0.62, 0.575)], shade(body, 30));

      wheel(P, 0.30, ns * w * 0.94, r, '#F2F2F6');
      wheel(P, -0.30, ns * w * 0.94, r, '#F2F2F6');
    }

    // ---------- scooter ----------
    const BIKE = [
      [0.22, 0.14], [0.24, 0.47], [0.14, 0.48], [0.10, 0.23],
      [-0.04, 0.22], [-0.09, 0.43], [-0.28, 0.44], [-0.30, 0.21]
    ];
    const BIKE_ROLE = ['fascia', 'roof', 'inner', 'boot', 'nose', 'roof', 'fascia'];

    function drawBike(v, P) {
      const body = v.col, w = 0.078, r = 0.105;
      ctx.globalAlpha = .15; quad(P.x, P.z, 0.24, 0.24, 0); ctx.fillStyle = '#413C58'; ctx.fill(); ctx.globalAlpha = 1;

      wheel(P, -0.24, 0, r, '#DCDCE2');
      extrude(P, BIKE, BIKE_ROLE, w, body);

      local(P, 0.17, 0.23, -0.058, 0.058, 0.10, 0.30, '#4A4A55');
      local(P, 0.185, 0.225, -0.155, 0.155, 0.50, 0.535, '#33303F');
      local(P, 0.195, 0.215, -0.185, -0.155, 0.535, 0.60, '#33303F');
      local(P, 0.195, 0.215, 0.155, 0.185, 0.535, 0.60, '#33303F');
      poly([pt(P, 0.245, -w * 0.62, 0.33), pt(P, 0.245, w * 0.62, 0.33), pt(P, 0.245, w * 0.62, 0.42), pt(P, 0.245, -w * 0.62, 0.42)], '#FFF3CE');

      local(P, -0.03, 0.09, -0.085, 0.085, 0.22, 0.46, shade(v.jacket, -14));
      local(P, -0.14, 0.01, -0.090, 0.090, 0.44, 0.76, v.jacket);
      local(P, -0.02, 0.19, -0.115, -0.075, 0.58, 0.66, shade(v.jacket, 6));
      local(P, -0.02, 0.19, 0.075, 0.115, 0.58, 0.66, shade(v.jacket, 6));

      const hp = pt(P, -0.06, 0, 0.88), hr = Math.max(4.5, TW * 0.030);
      ctx.beginPath(); ctx.arc(hp.x, hp.y, hr, 0, 6.284); ctx.fillStyle = v.helmet; ctx.fill();
      const fwd = { x: (P.fx - P.fz) * TW / 2, y: (P.fx + P.fz) * TH / 2 }, a = Math.atan2(fwd.y, fwd.x);
      ctx.beginPath(); ctx.arc(hp.x + Math.cos(a) * hr * 0.34, hp.y + Math.sin(a) * hr * 0.34, hr * 0.60, 0, 6.284);
      ctx.fillStyle = 'rgba(28,26,40,.48)'; ctx.fill();

      wheel(P, 0.235, 0, r, '#F2F2F6');
    }

    function drawShield(P, cov) {
      if (cov <= 0.01) return;
      ctx.globalAlpha = 0.30 * cov;
      quad(P.x, P.z, 0.50, 0.50, 1);
      ctx.strokeStyle = '#6B4EE6'; ctx.lineWidth = Math.max(1.3, TW * 0.011); ctx.stroke();
      ctx.globalAlpha = 1;

      const sp = pt(P, 0, 0, 1.35 + 0.35 * ease(Math.min(1, cov * 2))), rr = Math.max(8, TW * 0.052);
      ctx.globalAlpha = Math.min(1, cov * 2.2);
      ctx.beginPath(); ctx.arc(sp.x, sp.y, rr, 0, 6.284); ctx.fillStyle = '#6B4EE6'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.94)'; ctx.lineWidth = Math.max(1.5, rr * 0.17);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(sp.x - rr * 0.38, sp.y + rr * 0.03);
      ctx.lineTo(sp.x - rr * 0.08, sp.y + rr * 0.34);
      ctx.lineTo(sp.x + rr * 0.42, sp.y - rr * 0.34);
      ctx.stroke(); ctx.globalAlpha = 1;
    }

    function blockRoute(B) { return [iso(HUB.x, HUB.z, VS * 0.9), iso(B.x, HUB.z, VS * 0.10), iso(B.x, B.z, VS * 0.10)]; }
    function drawRoute(pts, t) {
      const segs = []; let total = 0;
      for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); segs.push(L); total += L; }
      const want = total * t; let run = 0;
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let j = 0; j < segs.length; j++) {
        if (run + segs[j] <= want) { ctx.lineTo(pts[j + 1].x, pts[j + 1].y); run += segs[j]; }
        else {
          const k = (want - run) / segs[j];
          ctx.lineTo(pts[j].x + (pts[j + 1].x - pts[j].x) * k, pts[j].y + (pts[j + 1].y - pts[j].y) * k); break;
        }
      }
      ctx.strokeStyle = 'rgba(107,78,230,' + (0.72 * t).toFixed(3) + ')';
      ctx.lineWidth = Math.max(1.5, TW * 0.013); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
      return { segs: segs, total: total };
    }
    function pointAt(pts, m, t) {
      const want = m.total * t; let run = 0;
      for (let i = 0; i < m.segs.length; i++) {
        if (run + m.segs[i] >= want) {
          const k = (want - run) / m.segs[i];
          return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k };
        }
        run += m.segs[i];
      }
      return pts[pts.length - 1];
    }

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    let target = 0, cur = 0;
    function progress() {
      const d = track.offsetHeight - window.innerHeight;
      return clamp(d > 0 ? -track.getBoundingClientRect().top / d : 0, 0, 1);
    }

    function draw(p, t) {
      const base = Math.max(W * 0.112, H * 0.132);
      TW = base * (0.96 + ease(clamp(p / 0.9, 0, 1)) * 0.22);
      TH = TW * PITCH;
      VS = TW * Math.sqrt(1 - PITCH * PITCH) * 0.55;

      cam.cx = 0; cam.cy = 0;
      const hub = iso(HUB.x, HUB.z, 0);
      cam.cx = W / 2 - hub.x;
      cam.cy = H * 0.52 - hub.y;

      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
      g.addColorStop(0, '#EFEDF6'); g.addColorStop(0.55, '#EAE9F1'); g.addColorStop(1, '#E6E6EA');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // tarmac, lanes, crossings — always present
      quad(8, 8, 8.2, 8.2, 0); ctx.fillStyle = '#E3E1EA'; ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,.78)'; ctx.lineWidth = Math.max(1, TW * 0.011);
      ctx.setLineDash([TW * 0.10, TW * 0.13]);
      for (let r = 0; r < ROADS.length; r++) {
        const a1 = iso(ROADS[r], 0.5), a2 = iso(ROADS[r], 15.5);
        ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke();
        const b1 = iso(0.5, ROADS[r]), b2 = iso(15.5, ROADS[r]);
        ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255,255,255,.85)';
      const JUNC = [[6, 6], [10, 6], [6, 10], [10, 10]];
      for (let jn = 0; jn < JUNC.length; jn++) {
        for (let st = 0; st < 4; st++) {
          const o = -0.30 + st * 0.20;
          quad(JUNC[jn][0] + o, JUNC[jn][1] - 0.85, 0.06, 0.26, 0); ctx.fill();
          quad(JUNC[jn][0] - 0.85, JUNC[jn][1] + o, 0.26, 0.06, 0); ctx.fill();
        }
      }

      // block plates — tint toward lavender as each one links up
      for (let c1 = 0; c1 < CITY.length; c1++) {
        const B = CITY[c1], lk = win(p, B.at, B.at + 0.14);
        quad(B.x, B.z, 1.5, 1.5, VS * 0.10);
        ctx.fillStyle = 'rgb(' + Math.round(252 - lk * 8) + ',' + Math.round(252 - lk * 10) + ',' + Math.round(253 - lk * 4) + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(107,78,230,' + (0.06 + 0.16 * lk).toFixed(3) + ')';
        ctx.lineWidth = 1.2; ctx.stroke();

        // lavender pad inset
        quad(B.x, B.z, 1.02, 1.02, VS * 0.12);
        ctx.fillStyle = 'rgba(222,216,237,' + (0.72 + 0.28 * lk).toFixed(3) + ')'; ctx.fill();
        ctx.strokeStyle = 'rgba(150,132,214,' + (0.24 + 0.30 * lk).toFixed(3) + ')';
        ctx.lineWidth = 1.1; ctx.stroke();
      }

      // hub → block links
      for (let c2 = 0; c2 < CITY.length; c2++) {
        const B2 = CITY[c2], lt = win(p, B2.at, B2.at + 0.14);
        if (lt <= 0) continue;
        const rp = blockRoute(B2), m = drawRoute(rp, lt);
        if (lt >= 1) {
          const ph = ((t / 3.4) + c2 * 0.13) % 1, pos2 = pointAt(rp, m, ph);
          ctx.beginPath(); ctx.arc(pos2.x, pos2.y, Math.max(2.3, TW * 0.016), 0, 6.284);
          ctx.fillStyle = 'rgba(107,78,230,.9)'; ctx.fill();
        }
      }

      // ---- depth-sorted actors ----
      const actors = [];
      for (let bi = 0; bi < BUILDINGS.length; bi++) actors.push({ d: BUILDINGS[bi].x + BUILDINGS[bi].z, kind: 'bldg', ref: BUILDINGS[bi] });
      actors.push({ d: HUB.x + HUB.z, kind: 'hub' });
      for (let vi = 0; vi < vehicles.length; vi++) {
        const v = vehicles[vi], pos = vehiclePos(v, t);
        actors.push({ d: pos.x + pos.z, kind: 'veh', ref: v, pos: pos, cov: win(p, v.at, v.at + 0.10) });
      }
      actors.sort(function (m2, n2) { return m2.d - n2.d; });

      for (let i = 0; i < actors.length; i++) {
        const A = actors[i];
        if (A.kind === 'bldg') {
          const Bd = A.ref;
          const rise = win(p, Bd.block.rise, Bd.block.rise + 0.30);
          const hgt = VS * Bd.h * (0.10 + 0.90 * rise); // starts as a low plinth
          ctx.globalAlpha = 0.10 + 0.06 * rise;
          quad(Bd.x, Bd.z, Bd.w * 1.12, Bd.w * 1.12, VS * 0.125);
          ctx.fillStyle = '#5B5480'; ctx.fill(); ctx.globalAlpha = 1;
          box(Bd.x, Bd.z, Bd.w, Bd.w, hgt, '#FFFFFF', '#DAD6E6', '#EFEDF5');
        }
        else if (A.kind === 'hub') {
          const hr2 = win(p, 0.02, 0.34);
          const hh = 0.10 + 0.90 * hr2;
          for (let s2 = 0; s2 < 6; s2++) {
            box(HUB.x, HUB.z, 0.60 - s2 * 0.027, 0.60 - s2 * 0.027, VS * (0.20 + s2 * 0.30) * hh,
              s2 === 5 ? '#DED8ED' : '#FFFFFF', '#DAD6E4', '#F1EFF6');
          }
          box(HUB.x, HUB.z, 0.29, 0.29, VS * 2.20 * hh, '#6B4EE6', '#5439C4', '#8B72F0');
        }
        else {
          if (A.ref.bike) drawBike(A.ref, A.pos); else drawCar(A.ref, A.pos);
          drawShield(A.pos, A.cov);
          const flash = Math.sin(clamp(A.cov, 0, 1) * Math.PI);
          if (flash > 0.02) {
            const h1 = iso(HUB.x, HUB.z, VS * 2.4), v1 = iso(A.pos.x, A.pos.z, VS * 0.6);
            ctx.beginPath(); ctx.moveTo(h1.x, h1.y); ctx.lineTo(v1.x, v1.y);
            ctx.strokeStyle = 'rgba(107,78,230,' + (0.5 * flash).toFixed(3) + ')';
            ctx.lineWidth = Math.max(1.2, TW * 0.012); ctx.stroke();
          }
        }
      }
    }

    let t0 = 0;
    let rafId = 0;
    let alive = true;
    function frame(ms) {
      if (!alive) return;
      if (!t0) t0 = ms;
      cur += (target - cur) * 0.085;
      if (Math.abs(target - cur) < 0.0002) cur = target;
      draw(cur, (ms - t0) / 1000);
      rafId = requestAnimationFrame(frame);
    }

    const handleResize = () => { resize(); if (reduce) draw(1, 6); };
    const handleScroll = () => { target = progress(); };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    resize(); buildCity(); buildVehicles();
    const fadeInId = requestAnimationFrame(function () { cv.classList.add('in'); });

    if (reduce) {
      draw(1, 6);
    } else {
      target = progress(); cur = target;
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      alive = false;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      cancelAnimationFrame(fadeInId);
    };
  }, []);

  return (
    <div className="city-hero-track" ref={trackRef}>
      <section className="city-hero-viewport">
        <canvas className="city-hero-canvas" ref={canvasRef} />
      </section>
    </div>
  );
}
