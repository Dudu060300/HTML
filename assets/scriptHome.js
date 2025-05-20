const firebaseConfig = {
  apiKey: "AIzaSyA1U8IL5gdwoKmsdZgANGR_646ZDbjU50c",
  authDomain: "proghtml-2e571.firebaseapp.com",
  projectId: "proghtml-2e571",
  storageBucket: "proghtml-2e571.appspot.com",
  messagingSenderId: "771370443646",
  appId: "1:771370443646:web:5dd712f9e03448ebda2463"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const userMenu = document.getElementById('userMenu');
const logoutBtn = document.getElementById('logout');
const editProfileBtn = document.getElementById('editProfile');

const overlay = document.getElementById('overlay');
const profilePopup = document.getElementById('profilePopup');
const closePopupBtn = document.getElementById('closePopupBtn');

const emailInput = document.getElementById('emailInput');
const usernameInput = document.getElementById('usernameInput');
const oldPasswordInput = document.getElementById('oldPasswordInput');
const verifyPasswordBtn = document.getElementById('verifyPasswordBtn');
const newPasswordInput = document.getElementById('newPasswordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const profileForm = document.getElementById('profileForm');

const changeUsernameBtn = document.getElementById('changeUsernameBtn');

const userIcon = document.getElementById('userIcon');
const userName = document.getElementById('userName');

// --- Dropdown menu accessibility and toggle ---
userMenu.addEventListener('click', () => {
  const expanded = userMenu.getAttribute('aria-expanded') === 'true';
  userMenu.setAttribute('aria-expanded', String(!expanded));
  userMenu.classList.toggle('open');
  // Aggiorna il nome utente ogni volta che si apre il menu
  if (!expanded) { // solo se il menu sta per aprirsi
    const user = auth.currentUser;
    if (user && userName) {
      userName.textContent = user.displayName || 'Utente';
    }
}
});

document.addEventListener('click', (e) => {
  if (!userMenu.contains(e.target)) {
    userMenu.setAttribute('aria-expanded', 'false');
    userMenu.classList.remove('open');
  }
});

userMenu.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const expanded = userMenu.getAttribute('aria-expanded') === 'true';
    userMenu.setAttribute('aria-expanded', String(!expanded));
    userMenu.classList.toggle('open');
  } else if (e.key === 'Escape') {
    userMenu.setAttribute('aria-expanded', 'false');
    userMenu.classList.remove('open');
    userMenu.focus();
  }
});

// --- Logout ---
logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    location.href = 'index.html';
  });
});

// --- Open/Close popup functions ---
function openProfilePopup() {
  overlay.classList.add('active');
  profilePopup.classList.add('show');
  profilePopup.classList.remove('hidden');
  profilePopup.focus();
  clearMessages();
  resetPasswordFields();
  loadUserProfile();
}

function closeProfilePopup() {
  overlay.classList.remove('active');
  profilePopup.classList.remove('show');
  profilePopup.classList.add('hidden');
  clearMessages();
  resetPasswordFields();
  usernameInput.value = '';
  oldPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
}

editProfileBtn.addEventListener('click', (e) => {
  e.preventDefault();
  openProfilePopup();
});

closePopupBtn.addEventListener('click', closeProfilePopup);
overlay.addEventListener('click', closeProfilePopup);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && profilePopup.classList.contains('show')) {
    closeProfilePopup();
  }
});

// --- Utility functions ---
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('visible');
  successMsg.textContent = '';
  successMsg.classList.remove('visible');
}

function showSuccess(message) {
  successMsg.textContent = message;
  successMsg.classList.add('visible');
  errorMsg.textContent = '';
  errorMsg.classList.remove('visible');
}

function clearMessages() {
  errorMsg.textContent = '';
  errorMsg.classList.remove('visible');
  successMsg.textContent = '';
  successMsg.classList.remove('visible');
}

function resetPasswordFields() {
  oldPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';

  oldPasswordInput.closest('.old-password-group').classList.remove('hidden');
  document.getElementById('oldPasswordLabel').classList.remove('hidden');

  newPasswordInput.classList.add('hidden');
  confirmPasswordInput.classList.add('hidden');
  document.getElementById('newPasswordLabel').classList.add('hidden');
  document.getElementById('confirmPasswordLabel').classList.add('hidden');

  verifyPasswordBtn.disabled = false;
}

// --- Load profile from Firebase Auth ---
function loadUserProfile() {
  const user = auth.currentUser;
  if (!user) {
    showError ('Nessun utente autenticato.');
    return;
  }
  emailInput.value = user.email || '';
  usernameInput.value = user.displayName || '';
}

// --- Verify old password before allowing password change ---
verifyPasswordBtn.addEventListener('click', () => {
  clearMessages();
  const oldPass = oldPasswordInput.value.trim();
  if (!oldPass) {
    showError('Inserisci la vecchia password.');
    return;
  }

  verifyPasswordBtn.disabled = true;
  const user = auth.currentUser;
  if (!user) {
    showError('Utente non autenticato.');
    verifyPasswordBtn.disabled = false;
    return;
  }

  const credential = firebase.auth.EmailAuthProvider.credential(
    user.email,
    oldPass
  );

  user.reauthenticateWithCredential(credential)
    .then(() => {
      showSuccess('Password vecchia verificata. Inserisci la nuova password.');
      oldPasswordInput.closest('.old-password-group').classList.add('hidden');
      document.getElementById('oldPasswordLabel').classList.add('hidden');
      setTimeout(() => {
        clearMessages();
      }, 2000);
      newPasswordInput.classList.remove('hidden');
      confirmPasswordInput.classList.remove('hidden');
      document.getElementById('newPasswordLabel').classList.remove('hidden');
      document.getElementById('confirmPasswordLabel').classList.remove('hidden');
    })
    .catch(() => {
      showError('Password errata. Riprova.');
    })
    .finally(() => {
      verifyPasswordBtn.disabled = false;
      oldPasswordInput.value = '';
    });
});

// --- Save profile changes (username + password) ---
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const user = auth.currentUser;
  if (!user) {
    showError('Utente non autenticato.');
    return;
  }
  const newUsername = usernameInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  const usernameChanged = newUsername && newUsername !== user.displayName;
  const passwordChangeRequested = !newPasswordInput.classList.contains('hidden');

  if (!passwordChangeRequested && !usernameChanged) {
    showError('Nessuna modifica da salvare.');
    return;
  }

  if (usernameChanged && !passwordChangeRequested) {
    showError('Cliccare su Cambia Username.');
    return;
  }

  if (passwordChangeRequested) {
    if (newPassword.length < 6) {
      showError('La nuova password deve contenere almeno 6 caratteri.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Le password non corrispondono.');
      return;
    }
    try {
      await user.updatePassword(newPassword);
      showSuccess('Password aggiornata con successo.');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        showError('Devi eseguire nuovamente il login prima di cambiare la password.');
      } else {
        showError('Errore durante l\'aggiornamento della password: ' + err.message);
      }
      return;
    }
  }

  setTimeout(() => {
    closeProfilePopup();
  }, 1000);
});

// --- Aggiorna UI username al login ---
auth.onAuthStateChanged(user => {
  if (user) {
    const providers = user.providerData.map(p => p.providerId);
    const isSocialLogin = providers.includes('google.com') || providers.includes('apple.com');

    if (isSocialLogin) {
      editProfileBtn.style.display = 'none';
    } else {
      editProfileBtn.style.display = 'inline-block';
    }

    if (userName) userName.textContent = user.displayName || 'Utente';
    if (userIcon) userIcon.textContent = (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U');
  } else {
    location.href = 'index.html';
  }
});

// Blocca apertura popup se il bottone non è visibile o disabilitato
editProfileBtn.addEventListener('click', (e) => {
  if (editProfileBtn.style.display === 'none' || editProfileBtn.disabled) {
    e.preventDefault();
    return;
  }
  window.location.href = 'profilo.html';
});

changeUsernameBtn.addEventListener('click', async () => {
  clearMessages();

  const user = auth.currentUser;
  const newUsername = usernameInput.value.trim();
  const usernameChanged = newUsername && newUsername !== user.displayName;

  if (!newUsername) {
    showError('Inserisci un username valido.');
    return;
  }

  if (!usernameChanged) {
    showError('Nessuna modifica effettuata');
    return;
  }

  try {
    if (!user) throw new Error('Utente non autenticato.');

    await user.updateProfile({ displayName: newUsername });
    await db.collection('users').doc(user.uid).update(
      { displayName: newUsername },
      { merge: true }
    );

    if (userName) userName.textContent = newUsername;
    if (userIcon) userIcon.textContent = newUsername.charAt(0).toUpperCase();

    showSuccess('Username aggiornato con successo.');
  } catch (error) {
    showError('Errore: ' + error.message);
  }

  setTimeout(() => {
    closeProfilePopup();
  }, 1000);
});


  // Funzioni globali per tema
function loadThemeSetting() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.classList.toggle('dark', savedTheme === 'dark'); // aggiunto
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = savedTheme;
  }
}

function saveThemeSetting(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.toggle('dark', theme === 'dark'); // aggiunto
}

document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.getElementById('openSettings');
  const settingsPopup = document.getElementById('settingsPopup');
  const settingsOverlay = document.getElementById('settingsOverlay');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const themeSelect = document.getElementById('themeSelect');

  if (settingsBtn && settingsPopup && settingsOverlay) {
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loadThemeSetting();
      settingsOverlay.classList.remove('hidden');
      settingsPopup.classList.remove('hidden');
      settingsPopup.focus();
    });
  }

  if (closeSettingsBtn && settingsPopup && settingsOverlay) {
    closeSettingsBtn.addEventListener('click', () => {
      settingsOverlay.classList.add('hidden');
      settingsPopup.classList.add('hidden');
    });

    settingsOverlay.addEventListener('click', () => {
      settingsOverlay.classList.add('hidden');
      settingsPopup.classList.add('hidden');
    });
  }

  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      saveThemeSetting(themeSelect.value);
    });
  }

  loadThemeSetting();
});

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');

  // Inizializza toggle in base al tema corrente
  themeToggle.checked = document.body.classList.contains('dark');

  // Funzione per aggiornare il tema
  function updateTheme(isDark) {
    if (isDark) {
      document.body.classList.add('dark');
      themeToggle.setAttribute('aria-checked', 'true');
    } else {
      document.body.classList.remove('dark');
      themeToggle.setAttribute('aria-checked', 'false');
    }
  }

  // Cambia tema al toggle
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      // Attiva dark mode
      document.body.classList.add('dark');
      themeLabel.textContent = 'Dark mode attiva';
      themeToggle.setAttribute('aria-checked', 'true');
      localStorage.setItem('theme', 'dark');
    } else {
      // Attiva light mode
      document.body.classList.remove('dark');
      themeLabel.textContent = 'Light mode attiva';
      themeToggle.setAttribute('aria-checked', 'false');
      localStorage.setItem('theme', 'light');
    }
  });
});