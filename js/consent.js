import { enableAnalytics } from './firebase.js';
const KEY = 'nb_consent';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage blocked */ } };

export function initConsent() {
  const banner = document.getElementById('consent');
  const dlg = document.getElementById('prefs');
  const box = document.getElementById('prefAnalytics');
  const apply = analytics => {
    write({ analytics });
    banner.hidden = true;
    if (analytics) enableAnalytics();
  };
  const saved = read();
  if (saved) { if (saved.analytics) enableAnalytics(); } else banner.hidden = false;

  document.getElementById('consentAccept').onclick = () => apply(true);
  document.getElementById('consentReject').onclick = () => apply(false);
  const open = () => { box.checked = !!(read() || {}).analytics; dlg.showModal(); };
  document.getElementById('consentPrefs').onclick = open;
  document.getElementById('openPrefs').onclick = open;
  document.getElementById('prefSave').onclick = () => { apply(box.checked); dlg.close(); };
  document.getElementById('prefClose').onclick = () => dlg.close();
}
