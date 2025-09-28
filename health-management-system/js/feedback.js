// Feedback functionality for Health Management System

class FeedbackManager {
    constructor() {
        this.isVisible = false;
        this.currentRating = 0;
        this.feedbacks = this.loadFeedbacks();
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupFeedbackBox();
        this.showFeedbackBox();
    }

    setupEventListeners() {
        // Star rating
        const stars = document.querySelectorAll('.feedback-box .star');
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.setRating(index + 1);
            });
            
            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });
        });

        // Reset stars on mouse leave
        const ratingContainer = document.querySelector('.feedback-box .rating-stars');
        if (ratingContainer) {
            ratingContainer.addEventListener('mouseleave', () => {
                this.highlightStars(this.currentRating);
            });
        }

        // Submit feedback
        const submitBtn = document.querySelector('.feedback-box .btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitFeedback();
            });
        }

        // Close feedback box
        const closeBtn = document.querySelector('.close-feedback');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideFeedbackBox();
            });
        }

        // Auto-show feedback box after some time
        setTimeout(() => {
            if (!this.isVisible) {
                this.showFeedbackBox();
            }
        }, 30000); // Show after 30 seconds

        // Show feedback box when user is idle
        this.setupIdleDetection();
    }

    setupFeedbackBox() {
        const feedbackBox = document.getElementById('feedbackBox');
        if (!feedbackBox) return;

        // Add animation classes
        feedbackBox.style.transform = 'translateX(100%)';
        feedbackBox.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    setupIdleDetection() {
        let idleTime = 0;
        let idleInterval;

        const resetIdleTime = () => {
            idleTime = 0;
        };

        // Events that reset idle time
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetIdleTime, true);
        });

        // Check for idle time every minute
        idleInterval = setInterval(() => {
            idleTime++;
            // Show feedback box after 3 minutes of inactivity
            if (idleTime >= 3 && !this.isVisible) {
                this.showFeedbackBox();
            }
        }, 60000);
    }

    showFeedbackBox() {
        const feedbackBox = document.getElementById('feedbackBox');
        if (!feedbackBox || this.isVisible) return;

        feedbackBox.classList.add('active');
        this.isVisible = true;

        // Add entrance animation
        setTimeout(() => {
            feedbackBox.style.transform = 'translateX(0)';
        }, 100);

        // Auto-hide after 10 seconds if no interaction
        setTimeout(() => {
            if (this.isVisible && this.currentRating === 0) {
                this.hideFeedbackBox();
            }
        }, 10000);
    }

    hideFeedbackBox() {
        const feedbackBox = document.getElementById('feedbackBox');
        if (!feedbackBox || !this.isVisible) return;

        feedbackBox.style.transform = 'translateX(100%)';
        this.isVisible = false;

        setTimeout(() => {
            feedbackBox.classList.remove('active');
        }, 400);
    }

    toggleFeedbackBox() {
        if (this.isVisible) {
            this.hideFeedbackBox();
        } else {
            this.showFeedbackBox();
        }
    }

    setRating(rating) {
        this.currentRating = rating;
        this.highlightStars(rating);
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.feedback-box .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    async submitFeedback() {
        const textarea = document.querySelector('.feedback-box textarea');
        const message = textarea?.value.trim() || '';
        
        if (this.currentRating === 0) {
            this.showNotification('Please select a rating before submitting', 'warning');
            return;
        }

        if (!message) {
            this.showNotification('Please provide feedback before submitting', 'warning');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.feedback-box .btn');
        const originalText = submitBtn?.innerHTML;
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
        }

        try {
            // Simulate API call
            await this.delay(1500);

            // Create feedback object
            const feedback = {
                id: Date.now(),
                rating: this.currentRating,
                message: message,
                timestamp: new Date().toISOString(),
                userId: window.authManager?.getCurrentUser()?.id,
                userName: window.authManager?.getCurrentUser()?.name || 'Anonymous'
            };

            // Save feedback
            this.feedbacks.push(feedback);
            this.saveFeedbacks();

            // Show success message
            this.showNotification('Thank you for your feedback!', 'success');

            // Reset form
            this.resetFeedbackForm();

            // Hide feedback box after success
            setTimeout(() => {
                this.hideFeedbackBox();
            }, 2000);

        } catch (error) {
            this.showNotification('Failed to submit feedback. Please try again.', 'error');
        } finally {
            // Restore button state
            if (submitBtn && originalText) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    resetFeedbackForm() {
        // Reset rating
        this.currentRating = 0;
        this.highlightStars(0);

        // Clear textarea
        const textarea = document.querySelector('.feedback-box textarea');
        if (textarea) {
            textarea.value = '';
        }
    }

    loadFeedbacks() {
        const stored = localStorage.getItem('hms_feedbacks');
        return stored ? JSON.parse(stored) : [];
    }

    saveFeedbacks() {
        localStorage.setItem('hms_feedbacks', JSON.stringify(this.feedbacks));
    }

    getFeedbacks() {
        return this.feedbacks;
    }

    getAverageRating() {
        if (this.feedbacks.length === 0) return 0;
        const sum = this.feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
        return (sum / this.feedbacks.length).toFixed(1);
    }

    getFeedbackStats() {
        const total = this.feedbacks.length;
        const ratings = [1, 2, 3, 4, 5].map(rating => {
            const count = this.feedbacks.filter(f => f.rating === rating).length;
            return { rating, count, percentage: total > 0 ? (count / total * 100).toFixed(1) : 0 };
        });

        return {
            total,
            average: this.getAverageRating(),
            ratings
        };
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.feedback-notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'feedback-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Style notification
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 320px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 1001;
            font-size: 14px;
            max-width: 300px;
            animation: slideInLeft 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutLeft 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for onclick handlers
function toggleFeedbackBox() {
    if (window.feedbackManager) {
        window.feedbackManager.toggleFeedbackBox();
    }
}

function submitFeedback() {
    if (window.feedbackManager) {
        window.feedbackManager.submitFeedback();
    }
}

// Initialize feedback manager
let feedbackManager;
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if feedback box exists
    if (document.getElementById('feedbackBox')) {
        feedbackManager = new FeedbackManager();
        window.feedbackManager = feedbackManager;
    }
});

// Add custom CSS for feedback animations
const feedbackStyles = document.createElement('style');
feedbackStyles.textContent = `
    @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
    }
    
    .feedback-box {
        cursor: default;
    }
    
    .feedback-box .star {
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
    }
    
    .feedback-box .star:hover {
        transform: scale(1.2);
    }
    
    .feedback-box textarea {
        resize: vertical;
        min-height: 60px;
        max-height: 120px;
    }
    
    .feedback-box textarea:focus {
        outline: none;
        border-color: var(--accent-color);
    }
    
    .feedback-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .feedback-box .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
        .feedback-notification {
            right: 20px !important;
            bottom: 100px !important;
            max-width: calc(100vw - 40px) !important;
        }
    }
`;
document.head.appendChild(feedbackStyles);

// Feedback box visibility control
class FeedbackVisibilityController {
    constructor() {
        this.setupVisibilityRules();
    }

    setupVisibilityRules() {
        // Hide feedback box on mobile in landscape mode
        const checkOrientation = () => {
            const feedbackBox = document.getElementById('feedbackBox');
            if (!feedbackBox) return;

            if (window.innerWidth < 768 && window.innerHeight < 500) {
                feedbackBox.style.display = 'none';
            } else {
                feedbackBox.style.display = 'block';
            }
        };

        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', () => {
            setTimeout(checkOrientation, 100);
        });

        checkOrientation();
    }
}

// Initialize visibility controller
document.addEventListener('DOMContentLoaded', () => {
    new FeedbackVisibilityController();
});