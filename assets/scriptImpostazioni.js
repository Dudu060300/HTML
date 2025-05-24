document.addEventListener('DOMContentLoaded', () => {
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

  const userNameDisplay = document.getElementById("userName");
  const userIcon = document.getElementById("userIcon");
  const userMenu = document.getElementById("userMenu");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const logoutBtn = document.getElementById('logout');
  const editProfileBtn = document.getElementById('editProfile');

  document.getElementById('backButton').addEventListener('click', () => {
    window.history.back();
  });

  userMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = userMenu.classList.contains("open");
    userMenu.classList.toggle("open");
    userMenu.setAttribute("aria-expanded", !isOpen);
  });

  document.addEventListener("click", () => {
    userMenu.classList.remove("open");
    userMenu.setAttribute("aria-expanded", false);
  });

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

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
      location.href = 'index.html';
    });
  });
});