document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});


async function handleLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!emailInput || !passwordInput) {
        if (typeof showToast === 'function') showToast('Form fields missing', 'error');
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const errorElement = document.getElementById('loginError');
    const successElement = document.getElementById('loginSuccess');

    if (errorElement) errorElement.textContent = '';
    if (successElement) successElement.textContent = '';

    try {
        const result = await api.login(email, password);

        if (!result || (result.success === false)) {
            throw new Error(result?.message || 'Login failed');
        }

        if (successElement) {
            successElement.textContent = 'Login successful. Redirecting...';
        } else if (typeof showToast === 'function') {
            showToast('Login successful! Redirecting...', 'success');
        }

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);

    } catch (error) {
        console.error('Login error:', error);

        const msg = error.message || 'Invalid email or password';
        if (errorElement) {
            errorElement.textContent = msg;
        } else if (typeof showToast === 'function') {
            showToast(msg, 'error');
        }
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const nameInput = document.getElementById('fullName') || document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (!nameInput || !emailInput || !passwordInput) {
        if (typeof showToast === 'function') showToast('Please fill in all required fields', 'error');
        return;
    }

    const fullname = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (confirmPasswordInput && confirmPasswordInput.value !== password) {
        if (typeof showToast === 'function') {
            showToast('Passwords do not match', 'error');
        } else {
            alert('Passwords do not match');
        }
        return;
    }

    const errorElement = document.getElementById('registerError');
    if (errorElement) errorElement.textContent = '';

    try {
        const result = await api.register(fullname, email, password);

        if (result && result.success === false) {
            throw new Error(result.message || 'Registration failed');
        }

        if (typeof showToast === 'function') {
            showToast('Registration successful! Redirecting to login...', 'success');
        } else {
            alert('Registration successful. Please login.');
        }

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        console.error('Registration error:', error);
        const msg = error.message || 'Unable to register';

        if (errorElement) {
            errorElement.textContent = msg;
        } else if (typeof showToast === 'function') {
            showToast(msg, 'error');
        }
    }
}

// Add this to auth.js to check session validity
async function validateSession() {
    try {
        const result = await api.getMe();
        return result && result.success;
    } catch (error) {
        return false;
    }
}

// Call this periodically or on sensitive actions
window.validateSession = validateSession;