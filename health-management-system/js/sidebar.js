// Sidebar functionality for Health Management System

class Sidebar {
    constructor() {
        this.isOpen = false;
        this.currentUser = null;
        this.initialize();
    }

    initialize() {
        this.currentUser = window.authManager?.getCurrentUser();
        this.setupEventListeners();
        this.setupSidebar();
    }

    setupEventListeners() {
        // Toggle sidebar
        document.addEventListener('click', (e) => {
            if (e.target.closest('.menu-toggle') || e.target.closest('.profile-menu')) {
                e.preventDefault();
                this.toggle();
            }
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.profile-sidebar') && 
                !e.target.closest('.menu-toggle') && !e.target.closest('.profile-menu')) {
                this.close();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
    }

    setupSidebar() {
        const sidebar = document.getElementById('profileSidebar');
        if (!sidebar) return;

        // Add transition
        sidebar.style.transition = 'left 0.3s ease';

        // Update profile information
        this.updateProfileInfo();
    }

    updateProfileInfo() {
        if (!this.currentUser) return;

        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileImage = document.getElementById('profileImage');

        if (profileName) profileName.textContent = this.currentUser.name;
        if (profileEmail) profileEmail.textContent = this.currentUser.email;

        // Load saved profile picture
        const savedPicture = localStorage.getItem(`profile_picture_${this.currentUser.id}`);
        if (savedPicture && profileImage) {
            profileImage.src = savedPicture;
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const sidebar = document.getElementById('profileSidebar');
        if (!sidebar) return;

        sidebar.classList.add('active');
        this.isOpen = true;

        // Add backdrop
        this.addBackdrop();

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        const sidebar = document.getElementById('profileSidebar');
        if (!sidebar) return;

        sidebar.classList.remove('active');
        this.isOpen = false;

        // Remove backdrop
        this.removeBackdrop();

        // Restore body scroll
        document.body.style.overflow = '';
    }

    addBackdrop() {
        if (document.querySelector('.sidebar-backdrop')) return;

        const backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
            z-index: 999;
            animation: fadeIn 0.3s ease;
        `;

        backdrop.addEventListener('click', () => this.close());
        document.body.appendChild(backdrop);
    }

    removeBackdrop() {
        const backdrop = document.querySelector('.sidebar-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }
}

// Sidebar functions (global scope for onclick handlers)
function toggleSidebar() {
    if (window.sidebar) {
        window.sidebar.toggle();
    }
}

function showUpdateProfile() {
    closeAllModals();
    showModal('updateProfileModal', createUpdateProfileModal());
}

function showMessages() {
    closeAllModals();
    showModal('messagesModal', createMessagesModal());
}

function showCalendar() {
    closeAllModals();
    showModal('calendarModal', createCalendarModal());
}

function showHabits() {
    closeAllModals();
    showModal('habitsModal', createHabitsModal());
}

function showFeedback() {
    closeAllModals();
    showModal('feedbackModal', createFeedbackModal());
}

function changeProfilePicture() {
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
                const currentUser = window.authManager?.getCurrentUser();
                if (currentUser) {
                    localStorage.setItem(`profile_picture_${currentUser.id}`, e.target.result);
                }
                
                showNotification('Profile picture updated successfully!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Modal creation functions
function createUpdateProfileModal() {
    const currentUser = window.authManager?.getCurrentUser();
    return `
        <div class="modal-header">
            <h2><i class="fas fa-user-edit"></i> Update Profile</h2>
        </div>
        <form id="updateProfileForm" class="glass-form">
            <div class="form-row">
                <div class="input-group">
                    <label for="updateName">Full Name</label>
                    <input type="text" id="updateName" value="${currentUser?.name || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="input-group">
                    <label for="updateEmail">Email</label>
                    <input type="email" id="updateEmail" value="${currentUser?.email || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="input-group">
                    <label for="updatePhone">Phone</label>
                    <input type="tel" id="updatePhone" value="${currentUser?.phone || ''}" required>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal('updateProfileModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Profile</button>
            </div>
        </form>
    `;
}

function createMessagesModal() {
    const messages = [
        {
            title: 'Appointment Reminder',
            message: 'You have an appointment with Dr. Smith tomorrow at 2:00 PM',
            time: '2 hours ago',
            type: 'reminder'
        },
        {
            title: 'Test Results Available',
            message: 'Your blood test results are now available in your profile',
            time: '1 day ago',
            type: 'info'
        },
        {
            title: 'Payment Confirmation',
            message: 'Your payment of ₹500 has been confirmed for appointment #12345',
            time: '2 days ago',
            type: 'success'
        }
    ];

    const messagesHTML = messages.map(msg => `
        <div class="message-item">
            <div class="message-icon ${msg.type}">
                <i class="fas ${getMessageIcon(msg.type)}"></i>
            </div>
            <div class="message-content">
                <h4>${msg.title}</h4>
                <p>${msg.message}</p>
                <small>${msg.time}</small>
            </div>
        </div>
    `).join('');

    return `
        <div class="modal-header">
            <h2><i class="fas fa-envelope"></i> Messages</h2>
        </div>
        <div class="messages-container">
            ${messagesHTML}
        </div>
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeModal('messagesModal')">Close</button>
        </div>
    `;
}

function createCalendarModal() {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    return `
        <div class="modal-header">
            <h2><i class="fas fa-calendar"></i> Schedule Calendar</h2>
        </div>
        <div class="calendar-container">
            <div class="calendar-header">
                <button class="nav-btn" onclick="changeMonth(-1)">&lt;</button>
                <h3>${currentMonth}</h3>
                <button class="nav-btn" onclick="changeMonth(1)">&gt;</button>
            </div>
            <div class="calendar-grid" id="modalCalendar">
                <!-- Calendar will be generated dynamically -->
            </div>
            <div class="calendar-legend">
                <div class="legend-item">
                    <div class="legend-color appointment"></div>
                    <span>Appointments</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color holiday"></div>
                    <span>Holidays (Mondays)</span>
                </div>
            </div>
        </div>
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeModal('calendarModal')">Close</button>
        </div>
    `;
}

function createHabitsModal() {
    const habits = [
        { name: 'Blood Sugar', value: 'Normal', status: 'good' },
        { name: 'Blood Pressure', value: '120/80', status: 'good' },
        { name: 'Cholesterol', value: 'High', status: 'warning' },
        { name: 'Weight', value: '75 kg', status: 'good' },
        { name: 'Exercise', value: '3x per week', status: 'good' }
    ];

    const habitsHTML = habits.map(habit => `
        <div class="habit-item">
            <div class="habit-info">
                <h4>${habit.name}</h4>
                <p class="habit-value ${habit.status}">${habit.value}</p>
            </div>
            <div class="habit-status ${habit.status}">
                <i class="fas ${getHabitIcon(habit.status)}"></i>
            </div>
        </div>
    `).join('');

    return `
        <div class="modal-header">
            <h2><i class="fas fa-heartbeat"></i> Health Habits</h2>
            <p>This information is only visible to authorized medical staff</p>
        </div>
        <div class="habits-container">
            ${habitsHTML}
        </div>
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeModal('habitsModal')">Close</button>
        </div>
    `;
}

function createFeedbackModal() {
    return `
        <div class="modal-header">
            <h2><i class="fas fa-comment"></i> Submit Feedback</h2>
        </div>
        <form id="feedbackForm" class="glass-form">
            <div class="form-row">
                <div class="input-group full-width">
                    <label for="feedbackType">Feedback Type</label>
                    <select id="feedbackType" required>
                        <option value="">Select Type</option>
                        <option value="general">General Feedback</option>
                        <option value="appointment">Appointment Experience</option>
                        <option value="doctor">Doctor Review</option>
                        <option value="technical">Technical Issue</option>
                        <option value="suggestion">Suggestion</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="input-group full-width">
                    <label>Rating</label>
                    <div class="rating-stars">
                        <span class="star" data-rating="1">★</span>
                        <span class="star" data-rating="2">★</span>
                        <span class="star" data-rating="3">★</span>
                        <span class="star" data-rating="4">★</span>
                        <span class="star" data-rating="5">★</span>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="input-group full-width">
                    <label for="feedbackMessage">Message</label>
                    <textarea id="feedbackMessage" rows="4" placeholder="Please share your feedback..." required></textarea>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal('feedbackModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit Feedback</button>
            </div>
        </form>
    `;
}

// Utility functions
function getMessageIcon(type) {
    const icons = {
        reminder: 'fa-clock',
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle'
    };
    return icons[type] || 'fa-envelope';
}

function getHabitIcon(status) {
    const icons = {
        good: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        danger: 'fa-times-circle'
    };
    return icons[status] || 'fa-question-circle';
}

// Modal management functions
function showModal(modalId, content) {
    // Remove existing modal
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content glass-card">
            <span class="close-modal" onclick="closeModal('${modalId}')">&times;</span>
            ${content}
        </div>
    `;

    document.body.appendChild(modal);

    // Setup modal event listeners
    setupModalEventListeners(modalId);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
}

function setupModalEventListeners(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modalId);
        }
    });

    // Handle form submissions
    const form = modal.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleModalFormSubmit(modalId, form);
        });
    }

    // Setup rating stars
    const stars = modal.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            setRating(stars, rating);
        });
    });
}

function handleModalFormSubmit(modalId, form) {
    switch(modalId) {
        case 'updateProfileModal':
            handleUpdateProfile(form);
            break;
        case 'feedbackModal':
            handleFeedbackSubmit(form);
            break;
    }
}

function handleUpdateProfile(form) {
    const formData = new FormData(form);
    const name = form.querySelector('#updateName').value;
    const email = form.querySelector('#updateEmail').value;
    const phone = form.querySelector('#updatePhone').value;

    // Update user data (in a real app, this would be an API call)
    const currentUser = window.authManager?.getCurrentUser();
    if (currentUser) {
        currentUser.name = name;
        currentUser.email = email;
        currentUser.phone = phone;
        
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        if (window.sidebar) {
            window.sidebar.updateProfileInfo();
        }
        
        showNotification('Profile updated successfully!', 'success');
        closeModal('updateProfileModal');
    }
}

function handleFeedbackSubmit(form) {
    const type = form.querySelector('#feedbackType').value;
    const message = form.querySelector('#feedbackMessage').value;
    const rating = form.querySelector('.star.active:last-child')?.dataset.rating || 0;

    // Submit feedback (in a real app, this would be an API call)
    console.log('Feedback submitted:', { type, message, rating });
    
    showNotification('Thank you for your feedback!', 'success');
    closeModal('feedbackModal');
}

function setRating(stars, rating) {
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

function showNotification(message, type = 'info') {
    // Reuse notification function from dashboard or create a generic one
    if (window.dashboard) {
        window.dashboard.showNotification(message, type);
    }
}

// Initialize sidebar
let sidebar;
document.addEventListener('DOMContentLoaded', () => {
    sidebar = new Sidebar();
    window.sidebar = sidebar;
});

// Add custom styles for modals and messages
const style = document.createElement('style');
style.textContent = `
    .message-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin-bottom: 12px;
        transition: all 0.3s ease;
    }
    
    .message-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(5px);
    }
    
    .message-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
    }
    
    .message-icon.reminder { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .message-icon.info { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .message-icon.success { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .message-icon.warning { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
    
    .message-content h4 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--text-light);
    }
    
    .message-content p {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 6px;
        line-height: 1.4;
    }
    
    .message-content small {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
    }
    
    .habit-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin-bottom: 12px;
    }
    
    .habit-info h4 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--text-light);
    }
    
    .habit-value {
        font-size: 13px;
        font-weight: 500;
    }
    
    .habit-value.good { color: #10b981; }
    .habit-value.warning { color: #fbbf24; }
    .habit-value.danger { color: #ef4444; }
    
    .habit-status {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    }
    
    .habit-status.good { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .habit-status.warning { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
    .habit-status.danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    
    .form-actions, .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
    }
    
    .modal-actions {
        justify-content: center;
    }
`;
document.head.appendChild(style);