// Login Page - Fresh JavaScript with Dynamic Scenarios

document.addEventListener('DOMContentLoaded', () => {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Login form handler
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }
    // Burada backend'e gönderim yapılabilir
    alert('Giriş başarılı! (Demo)');
} 