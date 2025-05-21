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

// Campi del DOM
const userMenu = document.getElementById('userMenu');
const logoutBtn = document.getElementById('logout');
const editProfileBtn = document.getElementById('editProfile');

const emailField = document.getElementById("emailInput");
const usernameField = document.getElementById("usernameInput");
const changeUsernameBtn = document.getElementById("changeUsernameBtn");

const oldPasswordInput = document.getElementById("oldPasswordInput");
const verifyPasswordBtn = document.getElementById("verifyPasswordBtn");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");

const newPasswordLabel = document.getElementById("newPasswordLabel");
const confirmPasswordLabel = document.getElementById("confirmPasswordLabel");

const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");

const profileForm = document.getElementById("profileForm");

const userIcon = document.getElementById("userIcon");
const userName = document.getElementById("userName");

let currentUser;

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

// Verifica autenticazione e carica dati utente
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  emailField.value = user.email;

  // Mostra subito qualcosa
  if (userIcon) {
    const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
    userIcon.textContent = initial;
  }

  if (userName) {
    userName.textContent = user.displayName || "Utente";
  }

  // Poi prova a caricare username da Firestore
  try {
    const doc = await db.collection("utenti").doc(user.uid).get();
    if (doc.exists) {
      const username = doc.data().username || "";

      usernameField.value = username;

      // Sincronizza se necessario
      if (!user.displayName || user.displayName !== username) {
        await user.updateProfile({ displayName: username });
      }

      if (userIcon) {
        userIcon.textContent = username.charAt(0).toUpperCase();
      }

      if (userName) {
        userName.textContent = username;
      }
    }
  } catch (error) {
    showError("Errore nel recupero dati utente.");
  }
});

// Cambio username
changeUsernameBtn.addEventListener("click", async () => {
  const newUsername = usernameField.value.trim();
  if (!newUsername) {
    showError("Inserisci un username valido.");
    return;
  }

  try {
    await db.collection("utenti").doc(currentUser.uid).update({ username: newUsername });
await currentUser.updateProfile({ displayName: newUsername });
    showSuccess("Username aggiornato!");
    if (userIcon) userIcon.textContent = newUsername.charAt(0).toUpperCase();
    if (userName) userName.textContent = newUsername;
  } catch (error) {
    showError("Errore durante il salvataggio dell'username.");
  }
});

// Verifica vecchia password
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

// Mostra messaggio di errore
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.color = "red";
  successMsg.textContent = "";
}

// Mostra messaggio di successo
function showSuccess(message) {
  successMsg.textContent = message;
  successMsg.style.color = "green";
  errorMsg.textContent = "";
}