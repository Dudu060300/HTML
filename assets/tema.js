            document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default light
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.classList.toggle('dark', savedTheme === 'dark');
  });