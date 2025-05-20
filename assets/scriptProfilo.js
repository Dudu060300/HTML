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

    const emailField = document.getElementById("email");
    const usernameField = document.getElementById("username");
    const changeUsernameBtn = document.getElementById("changeUsernameBtn");

    const oldPasswordInput = document.getElementById("oldPassword");
    const verifyPasswordBtn = document.getElementById("verifyPasswordBtn");
    const newPasswordGroup = document.getElementById("newPasswordGroup");
    const newPasswordInput = document.getElementById("newPassword");

    const errorMsg = document.getElementById("errorMsg");
    const successMsg = document.getElementById("successMsg");

    const profileForm = document.getElementById("profileForm");

    let currentUser;

    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      currentUser = user;
      emailField.value = user.email;

      // Carica username da Firestore
      const doc = await db.collection("utenti").doc(user.uid).get();
      if (doc.exists) {
        usernameField.value = doc.data().username || "";
      }
    });

    changeUsernameBtn.addEventListener("click", async () => {
      const newUsername = usernameField.value.trim();
      if (!newUsername) {
        showError("Inserisci un username valido.");
        return;
      }

      try {
        await db.collection("utenti").doc(currentUser.uid).update({ username: newUsername });
        showSuccess("Username aggiornato!");
      } catch (error) {
        showError("Errore durante il salvataggio dell'username.");
      }
    });

    verifyPasswordBtn.addEventListener("click", async () => {
      const oldPassword = oldPasswordInput.value;
      const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, oldPassword);

      try {
        await currentUser.reauthenticateWithCredential(credential);
        newPasswordGroup.classList.remove("hidden");
        showSuccess("Verifica riuscita. Inserisci la nuova password.");
      } catch (error) {
        showError("Password errata.");
      }
    });

    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPassword = newPasswordInput.value.trim();
      if (newPasswordGroup.classList.contains("hidden") || newPassword === "") {
        return;
      }

      try {
        await currentUser.updatePassword(newPassword);
        showSuccess("Password aggiornata con successo!");
        oldPasswordInput.value = "";
        newPasswordInput.value = "";
        newPasswordGroup.classList.add("hidden");
      } catch (error) {
        showError("Errore durante l'aggiornamento della password.");
      }
    });

    function showError(message) {
      errorMsg.textContent = message;
      errorMsg.style.color = "red";
      successMsg.textContent = "";
    }

    function showSuccess(message) {
      successMsg.textContent = message;
      successMsg.style.color = "green";
      errorMsg.textContent = "";
    }