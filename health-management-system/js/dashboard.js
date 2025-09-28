// Dashboard functionality for Health Management System

class Dashboard {
    constructor() {
        this.currentUser = null;
        this.initialize();
    }

    initialize() {
        // Check authentication
        this.checkAuth();
        
        // Setup dashboard
        this.setupDashboard();
        
        // Load user data
        this.loadUserData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize features
        this.initializeFeatures();
    }

    checkAuth() {
        const authManager = window.authManager;
        if (!authManager || !authManager.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }
        this.currentUser = authManager.getCurrentUser();
    }

    setupDashboard() {
        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${this.currentUser.name}!`;
        }

        // Show admin panel option if user is admin
        if (this.currentUser.role === 'admin') {
            const adminCard = document.querySelector('.admin-only');
            if (adminCard) {
                adminCard.style.display = 'block';
            }
        }

        // Update profile information
        this.updateProfileInfo();
    }

    updateProfileInfo() {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        
        if (profileName) profileName.textContent = this.currentUser.name;
        if (profileEmail) profileEmail.textContent = this.currentUser.email;
    }

    loadUserData() {
        // Load appointment statistics
        this.loadAppointmentStats();
        
        // Load recent activities
        this.loadRecentActivities();
        
        // Update notification count
        this.updateNotificationCount();
    }

    loadAppointmentStats() {
        // Simulated data - in real app, this would come from API
        const stats = {
            upcomingAppointments: 3,
            nearbyHospitals: 12,
            availableDoctors: 35
        };

        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            const h4 = card.querySelector('h4');
            if (h4) {
                switch(index) {
                    case 0:
                        h4.textContent = stats.upcomingAppointments;
                        break;
                    case 1:
                        h4.textContent = stats.nearbyHospitals;
                        break;
                    case 2:
                        h4.textContent = stats.availableDoctors;
                        break;
                }
            }
        });
    }

    loadRecentActivities() {
        const activities = [
            {
                icon: 'fa-calendar-check',
                text: 'Appointment confirmed with Dr. Smith',
                time: '2 hours ago',
                color: '#10b981'
            },
            {
                icon: 'fa-user-plus',
                text: 'Profile updated successfully',
                time: '1 day ago',
                color: '#3b82f6'
            },
            {
                icon: 'fa-star',
                text: 'Feedback submitted for Dr. Johnson',
                time: '2 days ago',
                color: '#f59e0b'
            }
        ];

        // This would typically update a recent activities section
        // Implementation depends on the specific dashboard layout
    }

    updateNotificationCount() {
        const notificationBell = document.querySelector('.notification-count');
        if (notificationBell) {
            // Simulated notification count
            const count = Math.floor(Math.random() * 5) + 1;
            notificationBell.textContent = count;
        }
    }

    setupEventListeners() {
        // Profile picture change
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            profileImage.addEventListener('click', () => this.changeProfilePicture());
        }

        // Add hover effects to cards
        this.addCardHoverEffects();
    }

    addCardHoverEffects() {
        const cards = document.querySelectorAll('.option-card, .stat-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    initializeFeatures() {
        // Initialize any dashboard-specific features
        this.startStatsAnimation();
        this.setupQuickActions();
    }

    startStatsAnimation() {
        const statNumbers = document.querySelectorAll('.stat-content h4');
        statNumbers.forEach(stat => {
            const finalValue = parseInt(stat.textContent) || 0;
            this.animateValue(stat, 0, finalValue, 1500);
        });
    }

    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }

    setupQuickActions() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'h':
                        e.preventDefault();
                        navigateToHospitals();
                        break;
                    case 'd':
                        e.preventDefault();
                        navigateToDoctors();
                        break;
                    case 'a':
                        e.preventDefault();
                        navigateToAppointments();
                        break;
                    case 'p':
                        e.preventDefault();
                        toggleSidebar();
                        break;
                }
            }
        });
    }

    changeProfilePicture() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const profileImages = document.querySelectorAll('#profileImage, .profile-menu img');
                    profileImages.forEach(img => {
                        img.src = e.target.result;
                    });
                    
                    // Save to localStorage
                    localStorage.setItem(`profile_picture_${this.currentUser.id}`, e.target.result);
                    
                    this.showNotification('Profile picture updated successfully!', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: 'rgba(16, 185, 129, 0.9)',
            error: 'rgba(239, 68, 68, 0.9)',
            warning: 'rgba(251, 191, 36, 0.9)',
            info: 'rgba(59, 130, 246, 0.9)'
        };
        return colors[type] || colors.info;
    }
}

// Navigation functions (global scope for onclick handlers)
function navigateToHospitals() {
    window.location.href = 'hospitals.html';
}

function navigateToDoctors() {
    window.location.href = 'doctors.html';
}

function navigateToAppointments() {
    window.location.href = 'appointments.html';
}

function navigateToAdmin() {
    if (window.authManager && window.authManager.hasRole('admin')) {
        window.location.href = 'admin.html';
    } else {
        alert('Access denied. Admin privileges required.');
    }
}

function navigateToPatientRegistration() {
    window.location.href = 'patient-registration.html';
}

function goBack() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = 'dashboard.html';
    }
}

function goHome() {
    window.location.href = 'dashboard.html';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        if (window.authManager) {
            window.authManager.logout();
        } else {
            window.location.href = 'index.html';
        }
    }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
    
    // Load saved profile picture
    const currentUser = window.authManager?.getCurrentUser();
    if (currentUser) {
        const savedPicture = localStorage.getItem(`profile_picture_${currentUser.id}`);
        if (savedPicture) {
            const profileImages = document.querySelectorAll('#profileImage, .profile-menu img');
            profileImages.forEach(img => {
                img.src = savedPicture;
            });
        }
    }

    // Add loading animation for cards
    const cards = document.querySelectorAll('.option-card, .stat-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Make dashboard available globally
window.dashboard = dashboard;