// Lazy Firebase access. Analytics only loads after the visitor consents.
import { firebaseConfig } from './config.js';
const base = 'https://www.gstatic.com/firebasejs/12.19.0/';
let appP, analyticsP;
const getApp = () => appP || (appP = import(base + 'firebase-app.js').then(m => m.initializeApp(firebaseConfig)));

export function enableAnalytics() {
  if (!analyticsP) analyticsP = Promise.all([getApp(), import(base + 'firebase-analytics.js')])
    .then(([app, m]) => ({ m, a: m.getAnalytics(app) }));
  return analyticsP;
}

export async function track(name, params = {}) {
  if (!analyticsP) return;
  try { const { m, a } = await analyticsP; m.logEvent(a, name, params); }
  catch (e) { console.warn('Analytics unavailable', e); }
}

export async function saveMessage(data) {
  const [app, fs] = await Promise.all([getApp(), import(base + 'firebase-firestore.js')]);
  return fs.addDoc(fs.collection(fs.getFirestore(app), 'contact_messages'),
    { ...data, createdAt: fs.serverTimestamp() });
}
