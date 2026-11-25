// Hero particle ring: ~1500 dots on a thick ring, slow rotation, gentle pointer tilt.
export function initRing() {
  const c = document.getElementById('ring');
  if (!c) return;
  const ctx = c.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pts = Array.from({ length: 1500 }, () => {
    const a = Math.random() * Math.PI * 2, r = 1 + (Math.random() - 0.5) * 0.3;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: (Math.random() - 0.5) * 0.35 };
  });
  let w, h, rotY = 0.6, rotX = 0.9, tx = 0.9, ty = 0, color = '111,214,168', run = true;

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const readColor = () => {
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const n = parseInt(hex.slice(1), 16);
    if (!isNaN(n)) color = `${n >> 16},${(n >> 8) & 255},${n & 255}`;
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const cy = Math.cos(rotY + ty), sy = Math.sin(rotY + ty), cx = Math.cos(rotX), sx = Math.sin(rotX);
    const R = Math.min(w, h) * 0.36;
    ctx.fillStyle = `rgb(${color})`;
    for (const p of pts) {
      const x = p.x * cy + p.z * sy;
      let z = -p.x * sy + p.z * cy;
      const y = p.y * cx - z * sx;
      z = p.y * sx + z * cx;
      const k = 1 / (1 + z * 0.35);
      ctx.globalAlpha = Math.max(0.1, 0.2 + 0.6 * (0.5 - z / 2.6));
      ctx.fillRect(w / 2 + x * R * k, h / 2 + y * R * k, 1.6 * k, 1.6 * k);
    }
    ctx.globalAlpha = 1;
  };
  const loop = () => {
    if (!run) return;
    rotY += 0.0025;
    rotX += (tx - rotX) * 0.04;
    draw();
    requestAnimationFrame(loop);
  };
  const start = () => { if (!run) { run = true; loop(); } };

  size(); readColor(); draw();
  new MutationObserver(() => { readColor(); if (reduce) draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  addEventListener('resize', () => { size(); if (reduce || !run) draw(); });
  if (reduce) return;

  addEventListener('pointermove', e => {
    tx = 0.9 + (e.clientY / innerHeight - 0.5) * 0.35;
    ty = (e.clientX / innerWidth - 0.5) * 0.5;
  }, { passive: true });
  new IntersectionObserver(([en]) => { en.isIntersecting ? start() : (run = false); }).observe(c);
  document.addEventListener('visibilitychange', () => { document.hidden ? (run = false) : start(); });
  run = false; start();
}
