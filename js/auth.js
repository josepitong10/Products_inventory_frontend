// Authentication Logic
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in using the new isLoggedIn method
    const isLoggedIn = api.isLoggedIn();
    const currentUser = api.getCurrentUser();
    const isAuthPage = window.location.pathname.includes('login.html') || 
                       window.location.pathname.includes('register.html');

    console.log('Auth Check:', { isLoggedIn, currentUser, isAuthPage, path: window.location.pathname });

    // Redirect if logged in on auth pages
    if (isAuthPage && isLoggedIn) {
        console.log('User already logged in, redirecting to dashboard');
        window.location.href = 'dashboard.html';
        return;
    }

    // Redirect if not logged in on protected pages
    if (!isAuthPage && !isLoggedIn && !window.location.pathname.includes('index.html')) {
        console.log('User not logged in, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Validate fields
            if (!email || !password) {
                showToast('Please enter both email and password', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            try {
                const result = await api.login(email, password);
                console.log('Login result:', result);
                
                // Check if login was successful
                if (result && result.success === true) {
                    // Store login time for session management
                    localStorage.setItem('loginTime', Date.now().toString());
                    
                    showToast('Login successful! Redirecting...', 'success');
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                } else {
                    throw new Error(result.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast(error.message || 'Login failed. Please check your credentials.', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Handle register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullname = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate all fields
            if (!fullname || !email || !password || !confirmPassword) {
                showToast('All fields are required', 'error');
                return;
            }
            
            // Validate email format
            if (!email.includes('@') || !email.includes('.')) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Validate passwords match
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            // Validate password length
            if (password.length < 6) {
                showToast('Password must be at least 6 characters long', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;
            
            try {
                // Try registration with fullname field
                const result = await api.register({ 
                    fullname: fullname, 
                    email: email, 
                    password: password 
                });
                
                console.log('Registration result:', result);
                
                if (result && result.success === true) {
                    showToast('Registration successful! Redirecting to login...', 'success');
                    
                    // Clear form
                    registerForm.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    
                    // Redirect to login page after successful registration
                    setTimeout(() => {
                        window.location.href = 'login.html?registered=true';
                    }, 1500);
                } else {
                    throw new Error(result.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                
                // If registration failed with 'fullname', try with 'name'
                if (error.message.includes('fullname') || error.message.includes('validation')) {
                    try {
                        const result = await api.register({ 
                            name: fullname, 
                            email: email, 
                            password: password 
                        });
                        
                        if (result && result.success === true) {
                            showToast('Registration successful! Redirecting to login...', 'success');
                            registerForm.reset();
                            submitBtn.textContent = originalText;
                            submitBtn.disabled = false;
                            
                            setTimeout(() => {
                                window.location.href = 'login.html?registered=true';
                            }, 1500);
                            return;
                        }
                    } catch (secondError) {
                        // If both attempts fail, show the error
                        showToast(secondError.message || 'Registration failed. Please try again.', 'error');
                    }
                } else {
                    showToast(error.message || 'Registration failed. Please try again.', 'error');
                }
                
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            api.logout();
            localStorage.removeItem('userRole');
            localStorage.removeItem('loginTime');
            window.location.href = 'index.html';
        });
    }

    // Display user name in dashboard
    const userName = document.getElementById('userName');
    if (userName && currentUser) {
        const displayName = currentUser.fullname || currentUser.name || currentUser.fullName || currentUser.email;
        userName.textContent = displayName;
    }
    
    // Show registration success message on login page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        showToast('Registration successful! Please login with your credentials.', 'success');
    }
});

// Toast notification system
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideUp 0.3s ease',
        maxWidth: '400px',
        fontSize: '14px',
    });

    // Set colors based on type
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        info: '#2563eb',
        warning: '#f59e0b',
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}