// First-visit loading counter (skipped for reduced motion and repeat visits in a session).
export function initIntro() {
  const el = document.getElementById('intro');
  const pct = document.getElementById('introPct');
  if (!document.documentElement.classList.contains('intro-on')) return;
  try { sessionStorage.setItem('nb_intro', '1'); } catch { /* ignore */ }
  const t0 = performance.now(), dur = 1000;
  const tick = now => {
    const p = Math.min((now - t0) / dur, 1);
    pct.textContent = Math.round(p * 100) + '%';
    if (p < 1) return requestAnimationFrame(tick);
    el.classList.add('done');
    setTimeout(() => document.documentElement.classList.remove('intro-on'), 500);
  };
  requestAnimationFrame(tick);
}
