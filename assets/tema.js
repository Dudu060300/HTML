            // theme.js

// Applica il tema salvato (chiamato da ogni pagina)
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.body.classList.toggle('dark', savedTheme === 'dark');
}

// Salva e applica il nuovo tema
function changeTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.toggle('dark', theme === 'dark');
}

// Funzione da usare per il logout (ripristina tema predefinito)
function resetThemeOnLogout() {
  localStorage.removeItem('theme');
}

// Esegui automaticamente al caricamento
document.addEventListener('DOMContentLoaded', applySavedTheme);