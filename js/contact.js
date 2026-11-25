import { saveMessage, track } from './firebase.js';
import { toast } from './ui.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rules = {
  name: v => v.trim() ? '' : 'Please enter your name.',
  email: v => EMAIL.test(v.trim()) ? '' : 'Please enter a valid email address.',
  message: v => v.trim().length >= 10 ? '' : 'Please write at least 10 characters.'
};

function setError(field, msg) {
  field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  field.closest('.field').querySelector('.err').textContent = msg;
}

export function initContact() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const btn = form.querySelector('button[type=submit]');
  Object.keys(rules).forEach(k => form[k].addEventListener('input', () => setError(form[k], '')));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.textContent = '';
    let first = null;
    for (const k of Object.keys(rules)) {
      const msg = rules[k](form[k].value);
      setError(form[k], msg);
      if (msg && !first) first = form[k];
    }
    if (first) { first.focus(); track('contact_error', { reason: 'validation' }); return; }
    if (form.website.value) return; // honeypot

    btn.disabled = true; btn.textContent = 'Sending...';
    try {
      await saveMessage({
        name: form.name.value.trim(), email: form.email.value.trim(),
        subject: form.subject.value.trim() || 'No subject', message: form.message.value.trim()
      });
      form.reset();
      status.textContent = 'Thanks, your message is in. I usually reply within a day.';
      toast('Message sent');
      track('contact_submit');
    } catch (err) {
      console.error('Contact form failed', err);
      status.textContent = 'Could not send the message. Please email me directly instead.';
      toast('Message failed to send', true);
      track('contact_error', { reason: 'network' });
    } finally {
      btn.disabled = false; btn.textContent = 'Send message';
    }
  });
}
