// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA1U8IL5gdwoKmsdZgANGR_646ZDbjU50c",
  authDomain: "proghtml-2e571.firebaseapp.com",
  projectId: "proghtml-2e571",
  storageBucket: "proghtml-2e571.appspot.com",
  messagingSenderId: "1071205946034",
  appId: "1:1071205946034:web:7b33935a4232f29abfefab",
  measurementId: "G-Z1TKBCDZ0E"
};

const db = firebase.firestore();

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Animazione flip
function flipCard() {
  document.getElementById('formContainer').classList.toggle('flipped');
}

// Login con email/password
function login() {
  const input = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (input.includes("@")) {
    // È un'email
    auth.signInWithEmailAndPassword(input, password)
      .then(() => {
        document.body.classList.add('login-transition');
        setTimeout(() => {
          window.location.href = "home.html";
        }, 800);
      })
      .catch(err => alert(err.message));
  } else {
    // È un username → recupera l'email da Firestore
    db.collection("users")
      .where("username", "==", input)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          throw new Error("Username non trovato.");
        }

        const userData = snapshot.docs[0].data();
        const email = userData.email;

        return auth.signInWithEmailAndPassword(email, password);
      })
      .then(() => {
        document.body.classList.add('login-transition');
        setTimeout(() => {
          window.location.href = "home.html";
        }, 800);
      })
      .catch(err => alert("Errore: " + err.message));
  }
}

// Registrazione con salvataggio del nome utente
function register() {
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const username = document.getElementById('regName').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Aggiorna il displayName
      return user.updateProfile({ displayName: username }).then(() => {
        // Salva lo username in Firestore
        return db.collection("users").doc(user.uid).set({
          username: username,
          email: email
        });
      });
    })
    .then(() => {
      document.body.classList.add('login-transition');
      setTimeout(() => {
        window.location.href = "home.html";
      }, 800);
    })
    .catch((error) => {
      alert("Errore registrazione: " + error.message);
    });
}

// Login con Google
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => {
      document.body.classList.add('login-transition');
      setTimeout(() => {
        window.location.href = "home.html";
      }, 800);
    })
    .catch(err => alert(err.message));
}


// Login con Apple
function appleLogin() {
  const provider = new firebase.auth.OAuthProvider('apple.com');
  auth.signInWithPopup(provider)
    .then(() => {
      document.body.classList.add('login-transition');
      setTimeout(() => {
        window.location.href = "home.html";
      }, 800);
    })
    .catch(err => alert(err.message));
}
 // Premendo Invio dentro la password del login, parte il login
  document.getElementById('loginPassword').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      login(); // chiama la funzione login()
    }
  });

  document.getElementById('regPassword').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      register(); // chiama la funzione register()
    }
  });
