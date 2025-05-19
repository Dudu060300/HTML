// Configurazione Firebase per collegarsi al progetto
const firebaseConfig = {
  apiKey: "AIzaSyA1U8IL5gdwoKmsdZgANGR_646ZDbjU50c",
  authDomain: "proghtml-2e571.firebaseapp.com",
  projectId: "proghtml-2e571",
  storageBucket: "proghtml-2e571.appspot.com",
  messagingSenderId: "771370443646",
  appId: "1:771370443646:web:5dd712f9e03448ebda2463"
};
// Inizializza Firebase con la configurazione sopra
firebase.initializeApp(firebaseConfig);

// Riferimenti ai servizi Firebase Auth e Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Riferimenti agli elementi DOM del menu utente e popup profilo
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

// --- Gestione apertura/chiusura e accessibilità menu utente ---
userMenu.addEventListener('click', async () => {
  // Toggle stato aria-expanded per accessibilità
  const expanded = userMenu.getAttribute('aria-expanded') === 'true';
  userMenu.setAttribute('aria-expanded', String(!expanded));
  userMenu.classList.toggle('open');

  if (!expanded) {
    // Se si apre il menu, aggiorna il nome utente visualizzato
    const user = auth.currentUser;
    if (user && userName) {
      if (user.displayName) {
        // Usa displayName da Firebase Auth
        userName.textContent = user.displayName;
      } else {
        // Se manca, recupera da Firestore la proprietà displayName
        try {
          const doc = await db.collection('users').doc(user.uid).get();
          if (doc.exists) {
            const data = doc.data();
            userName.textContent = data.displayName || 'Utente';
          } else {
            userName.textContent = 'Utente';
          }
        } catch {
          userName.textContent = 'Utente';
        }
      }
    }
  }
});

// Chiudi il menu se clicchi fuori
document.addEventListener('click', (e) => {
  if (!userMenu.contains(e.target)) {
    userMenu.setAttribute('aria-expanded', 'false');
    userMenu.classList.remove('open');
  }
});

// Supporto accessibilità da tastiera per il menu
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
    // Reindirizza a index.html dopo logout
    location.href = 'index.html';
  });
});

// --- Funzioni per apertura e chiusura popup profilo ---
function openProfilePopup() {
  overlay.classList.add('active');          // mostra overlay sfondo
  profilePopup.classList.add('show');       // mostra popup
  profilePopup.classList.remove('hidden');
  profilePopup.focus();                      // mette il focus nel popup
  clearMessages();                          // pulisce messaggi di errore/successo
  resetPasswordFields();                    // resetta i campi password
  loadUserProfile();                        // carica dati utente da Firebase
}

function closeProfilePopup() {
  overlay.classList.remove('active');       // nasconde overlay
  profilePopup.classList.remove('show');    // nasconde popup
  profilePopup.classList.add('hidden');
  clearMessages();                          // pulisce messaggi
  resetPasswordFields();                    // resetta campi password
  // svuota input form
  usernameInput.value = '';
  oldPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
}

// Apre popup profilo cliccando il bottone Modifica Profilo
editProfileBtn.addEventListener('click', (e) => {
  e.preventDefault();
  openProfilePopup();
});

// Chiudi popup cliccando la X o l'overlay
closePopupBtn.addEventListener('click', closeProfilePopup);
overlay.addEventListener('click', closeProfilePopup);

// Chiudi popup premendo ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && profilePopup.classList.contains('show')) {
    closeProfilePopup();
  }
});

// --- Funzioni di utilità per messaggi feedback utente ---
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

// --- Reset campi password e visibilità dei controlli ---
function resetPasswordFields() {
  oldPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';

  // Mostra il gruppo vecchia password e label
  oldPasswordInput.closest('.old-password-group').classList.remove('hidden');
  document.getElementById('oldPasswordLabel').classList.remove('hidden');

  // Nasconde nuovi campi password e label
  newPasswordInput.classList.add('hidden');
  confirmPasswordInput.classList.add('hidden');
  document.getElementById('newPasswordLabel').classList.add('hidden');
  document.getElementById('confirmPasswordLabel').classList.add('hidden');

  // Abilita bottone verifica vecchia password
  verifyPasswordBtn.disabled = false;
}

// --- Carica dati utente da Firebase Auth nel form ---
function loadUserProfile() {
  const user = auth.currentUser;
  if (!user) {
    showError ('Nessun utente autenticato.');
    return;
  }
  emailInput.value = user.email || '';
  usernameInput.value = user.displayName || '';
}

// --- Verifica vecchia password prima di cambiare ---
verifyPasswordBtn.addEventListener('click', () => {
  clearMessages();
  const oldPass = oldPasswordInput.value.trim();
  if (!oldPass) {
    showError('Inserisci la vecchia password.');
    return;
  }

  verifyPasswordBtn.disabled = true; // disabilita bottone per evitare doppie richieste
  const user = auth.currentUser;
  if (!user) {
    showError('Utente non autenticato.');
    verifyPasswordBtn.disabled = false;
    return;
  }

  // Crea credenziale con email e vecchia password
  const credential = firebase.auth.EmailAuthProvider.credential(
    user.email,
    oldPass
  );

  // Reautentica l'utente con la vecchia password
  user.reauthenticateWithCredential(credential)
    .then(() => {
      showSuccess('Password vecchia verificata. Inserisci la nuova password.');
      // Nasconde input vecchia password e label
      oldPasswordInput.closest('.old-password-group').classList.add('hidden');
      document.getElementById('oldPasswordLabel').classList.add('hidden');
      setTimeout(() => {
        clearMessages();
      }, 2000);
      // Mostra input nuova password e conferma + label
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

// --- Salva modifiche profilo (username + password) ---
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

  // Se cambia solo username senza cambio password, richiede di cliccare "Cambia Username"
  if (usernameChanged && !passwordChangeRequested) {
    showError('Cliccare su Cambia Username.');
    return;
  }

  // Se si cambia la password, esegue controlli base
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
      await user.updatePassword(newPassword);  // aggiorna password su Firebase Auth
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

  // Dopo 1 secondo chiude popup profilo
  setTimeout(() => {
    closeProfilePopup();
  }, 1000);
});

// --- Aggiorna UI quando cambia stato autenticazione ---
auth.onAuthStateChanged(user => {
  if (user) {
    // Verifica se l'utente ha effettuato login tramite provider social
    const providers = user.providerData.map(p => p.providerId);
    const isSocialLogin = providers.includes('google.com') || providers.includes('apple.com');

    // Nasconde il bottone modifica profilo per login social (password gestita da provider)
    if (isSocialLogin) {
      editProfileBtn.style.display = 'none';
    } else {
      editProfileBtn.style.display = 'inline-block';
    }

    // Aggiorna username e icona nell'header/menu
    if (userName) userName.textContent = user.displayName || 'Utente';
    if (userIcon) userIcon.textContent = (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U');
  } else {
    // Se non autenticato, reindirizza alla pagina di login
    location.href = 'index.html';
  }
});

// Blocca apertura popup profilo se il bottone non è visibile o disabilitato
editProfileBtn.addEventListener('click', (e) => {
  if (editProfileBtn.style.display === 'none' || editProfileBtn.disabled) {
    e.preventDefault();
    return;
  }
  openProfilePopup();
});

// --- Cambia username e aggiorna su Firebase Auth + Firestore ---
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

    // Controlla se username è già usato da un altro utente
    const snapshot = await db.collection('users')
      .where('username', '==', newUsername)
      .get();

    if (!snapshot.empty) {
      // Controlla se il documento trovato non è quello dell'utente corrente
      const docExists = snapshot.docs.some(doc => doc.id !== user.uid);
      if (docExists) {
        showError('Username già utilizzato da un altro utente.');
        return;
      }
    }

    // Aggiorna displayName su Firebase Auth
    await user.updateProfile({ displayName: newUsername });
    // Aggiorna displayName su Firestore nel documento utente
    await db.collection('users').doc(user.uid).update(
      { username: newUsername },
      { merge: true }
    );

    // Aggiorna UI username e icona
    if (userName) userName.textContent = newUsername;
    if (userIcon) userIcon.textContent = newUsername.charAt(0).toUpperCase();

    showSuccess('Username aggiornato con successo.');
  } catch (error) {
    showError('Errore: ' + error.message);
  }

  // Chiude popup dopo 1 secondo
  setTimeout(() => {
    closeProfilePopup();
  }, 1000);
});

// --- Funzioni globali per gestione tema (light/dark) ---

// Carica tema salvato da localStorage e applica
// Carica il tema salvato da localStorage e lo applica alla pagina
function loadThemeSetting() {
  // Recupera il tema salvato in precedenza
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    // Imposta l'attributo data-theme sull'elemento root <html>
    document.documentElement.setAttribute('data-theme', savedTheme);
    // Aggiunge o rimuove la classe 'dark' al body in base al tema salvato
    document.body.classList.toggle('dark', savedTheme === 'dark');
    // Sincronizza il valore del select nel popup impostandolo al tema salvato
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = savedTheme;
  }
}

// Salva il tema scelto su localStorage e aggiorna la pagina con il tema selezionato
function saveThemeSetting(theme) {
  // Salva il tema in locale per ricordarlo dopo refresh
  localStorage.setItem('theme', theme);
  // Imposta l'attributo data-theme sull'elemento root <html>
  document.documentElement.setAttribute('data-theme', theme);
  // Aggiunge o rimuove la classe 'dark' al body in base al tema selezionato
  document.body.classList.toggle('dark', theme === 'dark');
}

// Al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
  // Prendi gli elementi DOM relativi al popup impostazioni
  const settingsBtn = document.getElementById('openSettings');      // Bottone per aprire impostazioni
  const settingsPopup = document.getElementById('settingsPopup');   // Popup impostazioni
  const settingsOverlay = document.getElementById('settingsOverlay'); // Overlay dietro popup
  const closeSettingsBtn = document.getElementById('closeSettingsBtn'); // Bottone chiudi popup
  const themeSelect = document.getElementById('themeSelect');       // Select per tema

  // Se i pulsanti e popup esistono, aggiungi gestori eventi
  if (settingsBtn && settingsPopup && settingsOverlay) {
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loadThemeSetting();  // Carica tema salvato all'apertura popup
      settingsOverlay.classList.remove('hidden'); // Mostra overlay
      settingsPopup.classList.remove('hidden');   // Mostra popup
      settingsPopup.focus();                        // Focus sul popup per accessibilità
    });
  }

  // Gestisci chiusura popup con bottone o clic su overlay
  if (closeSettingsBtn && settingsPopup && settingsOverlay) {
    closeSettingsBtn.addEventListener('click', () => {
      settingsOverlay.classList.add('hidden');   // Nascondi overlay
      settingsPopup.classList.add('hidden');     // Nascondi popup
    });

    settingsOverlay.addEventListener('click', () => {
      settingsOverlay.classList.add('hidden');   // Nascondi overlay
      settingsPopup.classList.add('hidden');     // Nascondi popup
    });
  }

  // Cambia tema al variare del select e salva la scelta
  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      saveThemeSetting(themeSelect.value);
    });
  }

  // All'apertura pagina, carica e applica tema salvato
  loadThemeSetting();
});

// Altro event listener DOMContentLoaded per gestire toggle switch del tema
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle'); // Toggle switch per tema
  const themeLabel = document.getElementById('themeLabel');   // Label per indicare stato tema

  // Inizializza toggle switch in base alla classe 'dark' sul body
  themeToggle.checked = document.body.classList.contains('dark');

  // Funzione di utilità per aggiornare stato tema e attributi aria
  function updateTheme(isDark) {
    if (isDark) {
      document.body.classList.add('dark');
      themeToggle.setAttribute('aria-checked', 'true');
    } else {
      document.body.classList.remove('dark');
      themeToggle.setAttribute('aria-checked', 'false');
    }
  }

  // Quando l'utente cambia toggle switch
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      // Attiva modalità dark
      document.body.classList.add('dark');
      themeLabel.textContent = 'Dark mode attiva';          // Aggiorna label testo
      themeToggle.setAttribute('aria-checked', 'true');     // Aggiorna aria per accessibilità
      localStorage.setItem('theme', 'dark');                 // Salva scelta dark
    } else {
      // Attiva modalità light
      document.body.classList.remove('dark');
      themeLabel.textContent = 'Light mode attiva';         // Aggiorna label testo
      themeToggle.setAttribute('aria-checked', 'false');    // Aggiorna aria per accessibilità
      localStorage.setItem('theme', 'light');                // Salva scelta light
    }
  });
});