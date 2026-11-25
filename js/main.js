import { initUI } from './ui.js';
import { initConsent } from './consent.js';
import { initContact } from './contact.js';
import { initIntro } from './intro.js';
import { initRing } from './ring.js';
import { initMotion } from './motion.js';
import { track } from './firebase.js';

initUI();
initMotion();
initConsent();
initContact();
initRing();
initIntro();
document.addEventListener('click', e => {
  const a = e.target.closest('[data-track]');
  if (a) track(a.dataset.track, { label: a.dataset.label || a.textContent.trim() });
});
