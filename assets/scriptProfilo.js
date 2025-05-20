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

// Verifica autenticazione e carica dati utente
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  emailField.value = user.email;

  try {
    const doc = await db.collection("utenti").doc(user.uid).get();
    if (doc.exists) {
      const username = doc.data().username || "";
      usernameField.value = username;

      // Icona utente
      if (userIcon) {
        userIcon.textContent = username ? username.charAt(0).toUpperCase() : 'U';
      }

      // Nome visualizzato
      if (userName) {
        userName.textContent = user.displayName || username || "Utente";
      }
    } else {
      if (userIcon) userIcon.textContent = 'U';
      if (userName) userName.textContent = "Utente";
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
    showSuccess("Username aggiornato!");
    if (userIcon) userIcon.textContent = newUsername.charAt(0).toUpperCase();
    if (userName) userName.textContent = newUsername;
  } catch (error) {
    showError("Errore durante il salvataggio dell'username.");
  }
});

// Verifica vecchia password
verifyPasswordBtn.addEventListener("click", async () => {
  const oldPassword = oldPasswordInput.value;
  const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, oldPassword);

  try {
    await currentUser.reauthenticateWithCredential(credential);

    // Mostra campi nuova password
    newPasswordLabel.classList.remove("hidden");
    newPasswordInput.classList.remove("hidden");
    confirmPasswordLabel.classList.remove("hidden");
    confirmPasswordInput.classList.remove("hidden");

    showSuccess("Verifica riuscita. Inserisci la nuova password.");
  } catch (error) {
    showError("Password errata.");
  }
});

// Cambio password
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (newPasswordInput.classList.contains("hidden")) {
    showError("Verifica la password corrente prima.");
    return;
  }

  if (!newPassword || !confirmPassword) {
    showError("Compila entrambi i campi della nuova password.");
    return;
  }

  if (newPassword !== confirmPassword) {
    showError("Le password non coincidono.");
    return;
  }

  try {
    await currentUser.updatePassword(newPassword);
    showSuccess("Password aggiornata con successo!");

    // Reset campi e nascondi
    oldPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";

    newPasswordLabel.classList.add("hidden");
    newPasswordInput.classList.add("hidden");
    confirmPasswordLabel.classList.add("hidden");
    confirmPasswordInput.classList.add("hidden");
  } catch (error) {
    showError("Errore durante l'aggiornamento della password.");
  }
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