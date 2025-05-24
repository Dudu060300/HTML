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

  auth.onAuthStateChanged(async user => {
    if (user) {
      try {
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (userDoc.exists) {
          const username = userDoc.data().username || "Utente";
          userNameDisplay.textContent = username;
          userIcon.textContent = username.charAt(0).toUpperCase();
          console.log("Username caricato:", username);
        } else {
          console.warn("Documento utente non trovato.");
          userNameDisplay.textContent = "Utente";
          userIcon.textContent = "U";
        }
      } catch (error) {
        console.error("Errore recupero username:", error);
        userNameDisplay.textContent = "Utente";
        userIcon.textContent = "U";
      }
    } else {
      userNameDisplay.textContent = "Utente";
      userIcon.textContent = "U";
    }
  });

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
      location.href = 'index.html';
    });
  });
});