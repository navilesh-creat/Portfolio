export function toast(text, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = text;
  t.classList.toggle('error', isError);
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 3500);
}

export function initUI() {
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('nb_theme', next); } catch { /* ignore */ }
    themeBtn.setAttribute('aria-pressed', next === 'dark');
  });
  themeBtn.setAttribute('aria-pressed', root.dataset.theme === 'dark');

  const menuBtn = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const setMenu = open => { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  const bar = document.getElementById('progress');
  const top = document.getElementById('toTop');
  addEventListener('scroll', () => {
    const max = root.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
    top.classList.toggle('show', scrollY > 600);
  }, { passive: true });
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const links = [...nav.querySelectorAll('a')];
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) links.forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => io.observe(s));

  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); toast(b.dataset.copy.includes('@') ? 'Email address copied' : 'Phone number copied'); }
    catch { toast('Copy failed, please select it manually', true); }
  }));
}
