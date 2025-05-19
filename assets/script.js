// Configurazione Firebase con le chiavi e identificatori del progetto
const firebaseConfig = {
  apiKey: "AIzaSyA1U8IL5gdwoKmsdZgANGR_646ZDbjU50c",       // Chiave API per autenticare le richieste
  authDomain: "proghtml-2e571.firebaseapp.com",             // Dominio per autenticazione Firebase
  projectId: "proghtml-2e571",                               // ID progetto Firebase
  storageBucket: "proghtml-2e571.appspot.com",              // Bucket di storage Firebase
  messagingSenderId: "1071205946034",                        // ID mittente messaggi (push)
  appId: "1:1071205946034:web:7b33935a4232f29abfefab",      // ID app Firebase
  measurementId: "G-Z1TKBCDZ0E"                              // ID per Google Analytics (opzionale)
};

// Inizializza Firebase con la configurazione specificata
firebase.initializeApp(firebaseConfig);

// Riferimenti a Firestore (database) e Authentication (gestione utenti)
const db = firebase.firestore();
const auth = firebase.auth();

// Funzione per animare il flip della card (ad esempio, form di login/registrazione)
function flipCard() {
  document.getElementById('formContainer').classList.toggle('flipped'); // Aggiunge/rimuove classe CSS per animazione
}

// Funzione per effettuare il login tramite email o username + password
function login() {
  // Prende i valori inseriti dall'utente
  const input = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (input.includes("@")) {
    // Caso: l'input è un'email
    auth.signInWithEmailAndPassword(input, password) // Login con email e password
      .then(() => {
        // Aggiunge una classe per animazione di transizione login
        document.body.classList.add('login-transition');
        // Dopo 800ms, reindirizza alla pagina home
        setTimeout(() => {
          window.location.href = "home.html";
        }, 800);
      })
      .catch(err => alert(err.message)); // Mostra errore in caso di fallimento
  } else {
    // Caso: l'input è uno username, quindi recupera l'email corrispondente da Firestore
    db.collection("users")
      .where("username", "==", input) // Query per trovare il documento con username uguale a input
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          throw new Error("Username non trovato."); // Username inesistente
        }
        // Prende il primo documento trovato e estrae l'email
        const userData = snapshot.docs[0].data();
        const email = userData.email;

        // Login con email recuperata e password
        return auth.signInWithEmailAndPassword(email, password);
      })
      .then(() => {
        // Stessa animazione e reindirizzamento come sopra
        document.body.classList.add('login-transition');
        setTimeout(() => {
          window.location.href = "home.html";
        }, 800);
      })
      .catch(err => alert("Errore: " + err.message)); // Mostra errore, es. username non trovato o password errata
  }
}

// Funzione per registrare un nuovo utente con email, password e username
function register() {
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const username = document.getElementById('regName').value;

  // Crea utente con email e password tramite Firebase Auth
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Aggiorna il profilo utente impostando lo username come displayName
      return user.updateProfile({ displayName: username }).then(() => {
        // Salva username e email nel database Firestore sotto la collezione "users"
        return db.collection("users").doc(user.uid).set({
          username: username,
          email: email
        });
      });
    })
    .then(() => {
      // Animazione di transizione e reindirizzamento alla home dopo registrazione riuscita
      document.body.classList.add('login-transition');
      setTimeout(() => {
        window.location.href = "home.html";
      }, 800);
    })
    .catch((error) => {
      // Gestione errori in fase di registrazione
      alert("Errore registrazione: " + error.message);
    });
}

// Funzione per effettuare il login tramite Google con popup
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider(); // Provider Google
  auth.signInWithPopup(provider) // Login con popup
    .then(() => {
      // Animazione e reindirizzamento al login riuscito
      document.body.classList.add('login-transition');
      setTimeout(() => {
        window.location.href = "home.html";
      }, 800);
    })
    .catch(err => alert(err.message)); // Mostra eventuale errore
}

// Funzione per effettuare il login tramite Apple con popup
function appleLogin() {
  const provider = new firebase.auth.OAuthProvider('apple.com'); // Provider Apple
  auth.signInWithPopup(provider) // Login con popup
    .then(() => {
      // Animazione e reindirizzamento
      document.body.classList.add('login-transition');
      setTimeout(() => {
        window.location.href = "home.html";
      }, 800);
    })
    .catch(err => alert(err.message)); // Mostra errore in caso di problemi
}

// Event listener per fare login premendo Invio mentre si è nel campo password login
document.getElementById('loginPassword').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    login(); // Chiama la funzione di login
  }
});

// Event listener per fare registrazione premendo Invio mentre si è nel campo password registrazione
document.getElementById('regPassword').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    register(); // Chiama la funzione di registrazione
  }
});