// Authentication functionality for Health Management System

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.initializeAuth();
    }

    initializeAuth() {
        // Check if user is already logged in
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            // Redirect to dashboard if on login page
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                window.location.href = 'dashboard.html';
            }
        }

        // Set up event listeners
        this.setupEventListeners();
    }

    loadUsers() {
        const defaultUsers = [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@hms.com',
                password: 'admin123',
                role: 'admin',
                phone: '+1234567890',
                registrationDate: '2024-01-01'
            },
            {
                id: 2,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'patient123',
                role: 'patient',
                phone: '+1234567891',
                registrationDate: '2024-01-15'
            },
            {
                id: 3,
                name: 'Dr. Smith',
                email: 'dr.smith@hms.com',
                password: 'doctor123',
                role: 'doctor',
                phone: '+1234567892',
                registrationDate: '2024-01-10',
                specialty: 'Cardiology',
                experience: 15
            }
        ];

        const storedUsers = localStorage.getItem('hms_users');
        return storedUsers ? JSON.parse(storedUsers) : defaultUsers;
    }

    saveUsers() {
        localStorage.setItem('hms_users', JSON.stringify(this.users));
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Form switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('switch-link')) {
                e.preventDefault();
                if (e.target.onclick) {
                    e.target.onclick();
                }
            }
        });
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        try {
            // Simulate API call delay
            await this.delay(1000);

            const user = this.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', email);
                }

                this.showSuccess('Login successful! Redirecting...');
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showError('Invalid email or password');
            }
        } catch (error) {
            this.showError('An error occurred during login');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validate form
        if (!this.validateRegistration(name, email, phone, password, confirmPassword, agreeTerms)) {
            return;
        }

        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;

        try {
            // Simulate API call delay
            await this.delay(1500);

            // Check if email already exists
            if (this.users.find(u => u.email === email)) {
                this.showError('An account with this email already exists');
                return;
            }

            // Create new user
            const newUser = {
                id: this.users.length + 1,
                name,
                email,
                phone,
                password,
                role: 'patient',
                registrationDate: new Date().toISOString().split('T')[0]
            };

            this.users.push(newUser);
            this.saveUsers();
            
            this.showSuccess('Account created successfully! You can now log in.');
            
            // Switch to login form after delay
            setTimeout(() => {
                switchToLogin();
                document.getElementById('loginEmail').value = email;
            }, 2000);
            
        } catch (error) {
            this.showError('An error occurred during registration');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateRegistration(name, email, phone, password, confirmPassword, agreeTerms) {
        if (!name.trim()) {
            this.showError('Please enter your full name');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        if (!this.isValidPhone(phone)) {
            this.showError('Please enter a valid phone number');
            return false;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return false;
        }

        if (!agreeTerms) {
            this.showError('You must agree to the Terms & Conditions');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[+]?[(]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)'};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid ${type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'};
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .notification-close {
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                margin-left: auto;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }
}

// Form switching functions (global scope for onclick handlers)
function switchToRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
}

function switchToLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
}

// Initialize auth manager
const authManager = new AuthManager();

// Make it available globally
window.authManager = authManager;

// Check for remembered user on page load
document.addEventListener('DOMContentLoaded', () => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const loginEmail = document.getElementById('loginEmail');
        const rememberMe = document.getElementById('rememberMe');
        if (loginEmail) loginEmail.value = rememberedUser;
        if (rememberMe) rememberMe.checked = true;
    }

    // Add smooth transitions
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.style.transition = 'all 0.5s ease';
    });
});