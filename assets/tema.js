// tema.js

// Applica il tema salvato da localStorage
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.body.classList.toggle('dark', savedTheme === 'dark');

  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = savedTheme;
  }
}

// Cambia e salva il tema
function changeTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.toggle('dark', theme === 'dark');
}

// Reset del tema al logout
function resetThemeOnLogout() {
  localStorage.removeItem('theme');
}

// Quando la pagina è pronta
document.addEventListener('DOMContentLoaded', () => {
  applySavedTheme();

  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      const selectedTheme = themeSelect.value;
      changeTheme(selectedTheme);
    });
  }

  // Gestione logout
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetThemeOnLogout();
      firebase.auth().signOut().then(() => {
        location.href = 'index.html';
      });
    });
  }
});