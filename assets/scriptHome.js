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
const userIcon = document.getElementById('userIcon');
const userName = document.getElementById('userName');

// --- Dropdown menu accessibility and toggle ---
const overlay = document.getElementById('overlay');

function toggleOverlay(show) {
  if (!overlay) return;
  if (show) overlay.classList.add('visible');
  else overlay.classList.remove('visible');
}

userMenu.addEventListener('click', () => {
  const expanded = userMenu.getAttribute('aria-expanded') === 'true';
  userMenu.setAttribute('aria-expanded', String(!expanded));
  userMenu.classList.toggle('open');

  toggleOverlay(!expanded); // mostra overlay se menu si apre

  if (!expanded) {
    const user = auth.currentUser;
    if (user && userName) {
      userName.textContent = user.displayName || 'Utente';
    }
  }
});

// Nascondi menu e overlay se clicchi fuori
document.addEventListener('click', (e) => {
  if (!userMenu.contains(e.target) && overlay && !overlay.contains(e.target)) {
    userMenu.setAttribute('aria-expanded', 'false');
    userMenu.classList.remove('open');
    toggleOverlay(false);
  }
});

// Nascondi menu e overlay se clicchi sull’overlay stesso
if (overlay) {
  overlay.addEventListener('click', () => {
    userMenu.setAttribute('aria-expanded', 'false');
    userMenu.classList.remove('open');
    toggleOverlay(false);
  });
}

// Eventi tastiera (Enter, Space, Escape) già gestiti, ma aggiungi toggle overlay qui:
userMenu.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const expanded = userMenu.getAttribute('aria-expanded') === 'true';
    userMenu.setAttribute('aria-expanded', String(!expanded));
    userMenu.classList.toggle('open');
    toggleOverlay(!expanded);
  } else if (e.key === 'Escape') {
    userMenu.setAttribute('aria-expanded', 'false');
    userMenu.classList.remove('open');
    toggleOverlay(false);
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

// Blocca apertura profilo.html se il bottone non è visibile o disabilitato
editProfileBtn.addEventListener('click', (e) => {
  if (editProfileBtn.style.display === 'none' || editProfileBtn.disabled) {
    e.preventDefault();
    return;
  }
  window.location.href = 'profilo.html';
});