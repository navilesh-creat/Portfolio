/**
 * Admin panel logic
 * - Firebase Auth login/logout
 * - Live-updating list of contact_messages, newest first
 * - Mark as read, delete
 */

document.addEventListener('DOMContentLoaded', () => {
  const { auth, db, signInWithEmailAndPassword, onAuthStateChanged, signOut,
          collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } = window.firebaseAdmin;

  const loginScreen = document.getElementById('loginScreen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const signOutBtn = document.getElementById('signOutBtn');
  const adminUserEmail = document.getElementById('adminUserEmail');
  const messagesList = document.getElementById('messagesList');
  const messagesEmpty = document.getElementById('messagesEmpty');

  let unsubscribeMessages = null;

  // Auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginScreen.hidden = true;
      dashboard.hidden = false;
      adminUserEmail.textContent = user.email;
      subscribeToMessages();
    } else {
      loginScreen.hidden = false;
      dashboard.hidden = true;
      if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
      }
    }
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.hidden = true;
    const email = document.getElementById('adminEmail').value.trim().toLowerCase();
    const password = document.getElementById('adminPassword').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      loginForm.reset();
    } catch (err) {
      const hints = {
        'auth/invalid-credential': 'Wrong email or password.',
        'auth/unauthorized-domain': 'This domain is not authorized in Firebase (Authentication > Settings > Authorized domains).',
        'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase Authentication.',
        'auth/network-request-failed': 'Network problem. Check your connection and try again.',
        'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.'
      };
      loginError.textContent = 'Sign in failed. ' + (hints[err.code] || 'Error code: ' + (err.code || 'unknown'));
      loginError.hidden = false;
      console.error(err);
    }
  });

  // Show or hide the password while typing, to catch typos
  const pw = document.getElementById('adminPassword');
  const pwToggle = document.getElementById('pwToggle');
  pwToggle.addEventListener('click', () => {
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    pwToggle.textContent = show ? 'Hide' : 'Show';
    pwToggle.setAttribute('aria-pressed', show);
  });

  // Sign out
  signOutBtn.addEventListener('click', () => signOut(auth));

  // Live message list
  function subscribeToMessages() {
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));

    unsubscribeMessages = onSnapshot(q, (snapshot) => {
      messagesList.innerHTML = '';

      if (snapshot.empty) {
        messagesEmpty.hidden = false;
        return;
      }
      messagesEmpty.hidden = true;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        messagesList.appendChild(renderMessageCard(docSnap.id, data));
      });
    }, (err) => {
      console.error('Failed to load messages:', err);
    });
  }

  function renderMessageCard(id, data) {
    const card = document.createElement('article');
    card.className = 'admin-message-card' + (data.read ? ' admin-message-card--read' : '');

    const date = data.createdAt && data.createdAt.toDate
      ? data.createdAt.toDate().toLocaleString()
      : 'Unknown date';

    card.innerHTML = `
      <div class="admin-message-head">
        <div>
          <h3 class="admin-message-name">${escapeHtml(data.name || 'Unknown')}</h3>
          <a href="mailto:${escapeHtml(data.email || '')}" class="admin-message-email">${escapeHtml(data.email || '')}</a>
        </div>
        <span class="admin-message-date">${date}</span>
      </div>
      <p class="admin-message-subject"><strong>Subject:</strong> ${escapeHtml(data.subject || 'No Subject')}</p>
      <p class="admin-message-body">${escapeHtml(data.message || '')}</p>
      <div class="admin-message-actions">
        <button class="btn btn-secondary admin-btn-toggle-read">${data.read ? 'Mark Unread' : 'Mark Read'}</button>
        <button class="btn admin-btn-delete">Delete</button>
      </div>
    `;

    card.querySelector('.admin-btn-toggle-read').addEventListener('click', async () => {
      try {
        await updateDoc(doc(db, 'contact_messages', id), { read: !data.read });
      } catch (err) {
        console.error('Failed to update message:', err);
      }
    });

    card.querySelector('.admin-btn-delete').addEventListener('click', async () => {
      if (!confirm('Delete this message permanently?')) return;
      try {
        await deleteDoc(doc(db, 'contact_messages', id));
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    });

    return card;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
