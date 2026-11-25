// Tasteful motion: headline reveal trigger, scroll reveals, card spotlight, magnetic primary buttons.
export function initMotion() {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('[data-reveal]');
  if (reduce) { items.forEach(e => e.classList.add('in')); return; }

  setTimeout(() => root.classList.add('ready'), root.classList.contains('intro-on') ? 1300 : 50);

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  items.forEach((e, i) => { e.style.setProperty('--d', (i % 3) * 90 + 'ms'); io.observe(e); });

  document.querySelectorAll('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', e.clientX - r.left + 'px');
    c.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  if (matchMedia('(pointer: fine)').matches) document.querySelectorAll('.btn.primary').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px,${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}
