const firebaseConfig = {
  apiKey: "AIzaSyA1U8IL5gdwoKmsdZgANGR_646ZDbjU50c",
  authDomain: "proghtml-2e571.firebaseapp.com",
  projectId: "proghtml-2e571",
  storageBucket: "proghtml-2e571.appspot.com",
  messagingSenderId: "771370443646",
  appId: "1:771370443646:web:5dd712f9e03448ebda2463"
};

// Configura Firebase (personalizza con i tuoi parametri)

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const emailInput = document.getElementById("emailInput");
const usernameInput = document.getElementById("usernameInput");
const oldPasswordInput = document.getElementById("oldPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");

const newPasswordLabel = document.getElementById("newPasswordLabel");
const confirmPasswordLabel = document.getElementById("confirmPasswordLabel");

const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");

const verifyPasswordBtn = document.getElementById("verifyPasswordBtn");
const changeUsernameBtn = document.getElementById("changeUsernameBtn");
const profileForm = document.getElementById("profileForm");
const userNameDisplay = document.getElementById("userName");
const userMenu = document.getElementById("userMenu");
const dropdownMenu = document.getElementById("dropdownMenu");

document.getElementById('logout');
const editProfileBtn = document.getElementById('editProfile');

// Stato di verifica password
let passwordVerified = false;

userMenu.addEventListener("click", (event) => {
  event.stopPropagation(); // Previene la chiusura immediata
  const isOpen = userMenu.classList.contains("open");
  userMenu.classList.toggle("open");
  userMenu.setAttribute("aria-expanded", !isOpen);
});

// Chiudi il menu cliccando fuori
document.addEventListener("click", () => {
  userMenu.classList.remove("open");
  userMenu.setAttribute("aria-expanded", false);
});

// Recupera dati utente
auth.onAuthStateChanged(async user => {
  if (user) {
    emailInput.value = user.email;

    // Ottieni username da Firestore
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (userDoc.exists) {
  const username = userDoc.data().username || "Utente";
  usernameInput.value = username;
  userNameDisplay.textContent = username;

  // Mostra l'iniziale nello userIcon
  const firstLetter = username.charAt(0).toUpperCase();
  document.getElementById("userIcon").textContent = firstLetter;
}
  }
});

// Cambia username
changeUsernameBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  const newUsername = usernameInput.value.trim();

  if (!newUsername) {
    showError("Lo username non può essere vuoto.");
    return;
  }

  try {
    // Controlla se username già esiste
    const existing = await db.collection("users")
      .where("username", "==", newUsername)
      .get();

    if (!existing.empty) {
      showError("Questo username è già in uso.");
      return;
    }

    await db.collection("users").doc(user.uid).update({ username: newUsername });
    showSuccess("Username aggiornato.");
    userNameDisplay.textContent = newUsername;
  } catch (error) {
    showError("Errore durante l'aggiornamento dello username.");
  }
});

// Verifica vecchia password
verifyPasswordBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  const credential = firebase.auth.EmailAuthProvider.credential(
    user.email,
    oldPasswordInput.value
  );

  try {
    await user.reauthenticateWithCredential(credential);
    showSuccess("Password verificata. Ora puoi cambiarla.");
    passwordVerified = true;
    setTimeout(() => {
        clearMessages();
      }, 2000);

    // Nascondi il gruppo della vecchia password
    document.querySelector(".old-password-group").parentElement.style.display = "none";

    // Mostra i campi per nuova password
    [newPasswordInput, confirmPasswordInput].forEach(el => el.classList.remove("hidden"));
    [newPasswordLabel, confirmPasswordLabel].forEach(el => el.classList.remove("hidden"));
  } catch (error) {
    showError("Password errata. Riprova.");
  }
});

// Salva modifiche (nuova password)
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;

  if (passwordVerified) {
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (newPassword.length < 6) {
      showError("La nuova password deve contenere almeno 6 caratteri.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Le password non coincidono.");
      return;
    }

    try {
      await user.updatePassword(newPassword);
      showSuccess("Password aggiornata con successo.");
      profileForm.reset();
    } catch (error) {
      showError("Errore durante l'aggiornamento della password.");
    }
  } else {
    showError("Devi prima verificare la vecchia password.");
  }
});

// Mostra messaggi
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

logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    location.href = 'index.html';
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

