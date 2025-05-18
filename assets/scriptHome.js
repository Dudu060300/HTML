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

  // Se nessuna modifica è stata fatta
  if (!passwordChangeRequested && !usernameChanged) {
    showError('Nessuna modifica da salvare.');
    return;
  }

  if (usernameChanged && !passwordChangeRequested) {
    showError('Cliccare su Cambia Username.');
    return;
  }

  // Gestione cambio password
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

  // Chiudi popup dopo 1 secondo (solo se ci sono successi)
  setTimeout(() => {
    closeProfilePopup();
  }, 1000);
});


// --- Aggiorna UI username al login ---
auth.onAuthStateChanged(user => {
  if (user) {
    if (userName) userName.textContent = user.displayName || 'Utente';
    if (userIcon) userIcon.textContent = (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U');
  } else {
    location.href = 'index.html';
  }
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
    const user = auth.currentUser;
    if (!user) throw new Error('Utente non autenticato.');

    // Aggiorna displayName su Firebase Authentication
    await user.updateProfile({ displayName: newUsername });

    // Aggiorna Firestore
    await db.collection('users').doc(user.uid).update(
      { displayName: newUsername },
      { merge: true }
    );

    // Aggiorna UI
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

