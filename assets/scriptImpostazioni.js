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

const userNameDisplay = document.getElementById("userName");
const userMenu = document.getElementById("userMenu");
const dropdownMenu = document.getElementById("dropdownMenu");
const logoutBtn = 
document.getElementById('logout');
const editProfileBtn = document.getElementById('editProfile');

document.getElementById('backButton').addEventListener('click', () => {
  window.history.back();
});

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

logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    location.href = 'index.html';
  });
});

