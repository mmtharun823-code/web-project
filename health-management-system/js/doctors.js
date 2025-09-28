// Doctors page functionality

class DoctorsManager {
    constructor() {
        this.doctors = [];
        this.filteredDoctors = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentExperience = 0;
        this.currentSort = 'rating';
        this.initialize();
    }

    async initialize() {
        // Check authentication
        this.checkAuth();
        
        // Load doctors data
        await this.loadDoctors();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial display
        this.sortAndDisplay();
        
        // Hide loading spinner
        this.hideLoading();
    }

    checkAuth() {
        const authManager = window.authManager;
        if (!authManager || !authManager.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }
    }

    async loadDoctors() {
        try {
            const response = await fetch('data/doctors.json');
            const data = await response.json();
            this.doctors = data.doctors;
            this.filteredDoctors = [...this.doctors];
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.showError('Failed to load doctors data');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('doctorSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.filterAndDisplay();
            });
        }

        // Specialty filter
        const specialtySelect = document.getElementById('specialtyFilter');
        if (specialtySelect) {
            specialtySelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.filterAndDisplay();
            });
        }

        // Experience filter
        const experienceSlider = document.getElementById('experienceFilter');
        if (experienceSlider) {
            experienceSlider.addEventListener('input', (e) => {
                this.currentExperience = parseInt(e.target.value);
                const experienceLabel = document.getElementById('experienceValue');
                if (experienceLabel) {
                    experienceLabel.textContent = this.currentExperience;
                }
                this.filterAndDisplay();
            });
        }

        // Sort options
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.sortAndDisplay();
            });
        }

        // Clear filters button
        const clearBtn = document.getElementById('clearFilters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    clearAllFilters() {
        // Reset filter values
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentExperience = 0;
        
        // Reset UI controls
        const searchInput = document.getElementById('doctorSearch');
        const specialtySelect = document.getElementById('specialtyFilter');
        const experienceSlider = document.getElementById('experienceFilter');
        const experienceValue = document.getElementById('experienceValue');
        
        if (searchInput) searchInput.value = '';
        if (specialtySelect) specialtySelect.value = 'all';
        if (experienceSlider) experienceSlider.value = '0';
        if (experienceValue) experienceValue.textContent = '0';
        
        this.filterAndDisplay();
    }

    filterAndDisplay() {
        // Apply filters
        this.filteredDoctors = this.doctors.filter(doctor => {
            // Specialty filter
            const matchesSpecialty = this.currentFilter === 'all' || 
                doctor.specialty.toLowerCase().includes(this.currentFilter.toLowerCase()) ||
                doctor.subspecialty.some(sub => sub.toLowerCase().includes(this.currentFilter.toLowerCase()));
            
            // Search filter
            const matchesSearch = this.currentSearch === '' ||
                doctor.name.toLowerCase().includes(this.currentSearch) ||
                doctor.specialty.toLowerCase().includes(this.currentSearch) ||
                doctor.hospital.toLowerCase().includes(this.currentSearch) ||
                doctor.education.some(edu => edu.toLowerCase().includes(this.currentSearch));
            
            // Experience filter
            const matchesExperience = doctor.experience >= this.currentExperience;
            
            return matchesSpecialty && matchesSearch && matchesExperience;
        });

        this.sortAndDisplay();
    }

    sortAndDisplay() {
        // Sort doctors
        this.filteredDoctors.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'experience':
                    return b.experience - a.experience;
                case 'rating':
                    return b.rating - a.rating;
                case 'price':
                    return a.consultationFee - b.consultationFee;
                default:
                    return b.rating - a.rating;
            }
        });

        this.displayDoctors();
        this.updateResultsCount();
    }

    displayDoctors() {
        const container = document.getElementById('doctorsGrid');
        if (!container) return;

        if (this.filteredDoctors.length === 0) {
            this.showNoResults();
            return;
        }

        // Hide no results message
        const noResults = document.getElementById('noResults');
        if (noResults) noResults.style.display = 'none';

        // Generate doctor cards
        container.innerHTML = this.filteredDoctors.map(doctor => this.createDoctorCard(doctor)).join('');

        // Add click listeners to cards
        this.addCardListeners();
    }

    createDoctorCard(doctor) {
        const stars = this.generateStars(doctor.rating);
        const availabilityBadge = this.getAvailabilityBadge(doctor.availability);
        const subspecialtyTags = doctor.subspecialty.slice(0, 2).map(sub => 
            `<span class="subspecialty-tag">${sub}</span>`
        ).join('');

        return `
            <div class="doctor-card" data-doctor-id="${doctor.id}">
                <div class="doctor-card-header">
                    <div class="doctor-image">
                        <img src="${doctor.image}" alt="${doctor.name}" onerror="this.src='assets/images/default-doctor.jpg'">
                        ${availabilityBadge}
                    </div>
                    <div class="doctor-info">
                        <h3 class="doctor-name">${doctor.name}</h3>
                        <p class="doctor-specialty">${doctor.specialty}</p>
                        <p class="doctor-hospital">
                            <i class="fas fa-hospital"></i>
                            ${doctor.hospital}
                        </p>
                    </div>
                </div>
                
                <div class="doctor-card-body">
                    <div class="doctor-stats">
                        <div class="stat-item">
                            <i class="fas fa-graduation-cap"></i>
                            <span>${doctor.experience}+ years</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span>${doctor.patientsServed}+ patients</span>
                        </div>
                    </div>
                    
                    <div class="subspecialties">
                        ${subspecialtyTags}
                        ${doctor.subspecialty.length > 2 ? `<span class="subspecialty-tag more">+${doctor.subspecialty.length - 2}</span>` : ''}
                    </div>
                    
                    <div class="doctor-rating">
                        <div class="rating-stars">${stars}</div>
                        <span class="rating-value">${doctor.rating}</span>
                        <span class="rating-count">(${doctor.reviewCount} reviews)</span>
                    </div>
                </div>
                
                <div class="doctor-card-footer">
                    <div class="consultation-fee">
                        <span class="fee-label">Consultation</span>
                        <span class="fee-amount">₹${doctor.consultationFee}</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn-view-profile" onclick="viewDoctorProfile(${doctor.id})">
                            <i class="fas fa-eye"></i> View Profile
                        </button>
                        <button class="btn-book-appointment" onclick="bookAppointmentWithDoctor(${doctor.id})">
                            <i class="fas fa-calendar-plus"></i> Book
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remainingStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    getAvailabilityBadge(availability) {
        const isAvailable = availability.status === 'available';
        return `
            <div class="availability-badge ${availability.status}">
                <i class="fas fa-circle"></i>
                ${isAvailable ? 'Available' : 'Busy'}
            </div>
        `;
    }

    addCardListeners() {
        const cards = document.querySelectorAll('.doctor-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger card click if clicking on buttons
                if (e.target.closest('.card-actions')) return;
                
                const doctorId = parseInt(card.dataset.doctorId);
                this.showDoctorProfile(doctorId);
            });
        });
    }

    showDoctorProfile(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;

        const modalContent = this.createDoctorProfileModal(doctor);
        this.showModal('doctorProfileModal', modalContent);
    }

    createDoctorProfileModal(doctor) {
        const stars = this.generateStars(doctor.rating);
        const educationList = doctor.education.map(edu => `<li>${edu}</li>`).join('');
        const subspecialtyTags = doctor.subspecialty.map(sub => 
            `<span class="subspecialty-tag">${sub}</span>`
        ).join('');
        const languageList = doctor.languages.map(lang => 
            `<span class="language-tag">${lang}</span>`
        ).join('');
        const awardsList = doctor.awards.map(award => `<li><i class="fas fa-trophy"></i> ${award}</li>`).join('');

        return `
            <div class="doctor-profile-modal">
                <div class="modal-header">
                    <div class="doctor-profile-header">
                        <div class="profile-image">
                            <img src="${doctor.image}" alt="${doctor.name}" onerror="this.src='assets/images/default-doctor.jpg'">
                        </div>
                        <div class="profile-info">
                            <h2>${doctor.name}</h2>
                            <p class="profile-specialty">${doctor.specialty}</p>
                            <p class="profile-hospital">
                                <i class="fas fa-hospital"></i>
                                ${doctor.hospital}
                            </p>
                            <div class="profile-rating">
                                <div class="rating-stars">${stars}</div>
                                <span class="rating-value">${doctor.rating}</span>
                                <span class="rating-count">(${doctor.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-body">
                    <div class="profile-sections">
                        <div class="profile-section">
                            <h4><i class="fas fa-user"></i> About</h4>
                            <p>${doctor.about}</p>
                        </div>
                        
                        <div class="profile-section">
                            <h4><i class="fas fa-graduation-cap"></i> Education & Experience</h4>
                            <div class="experience-info">
                                <div class="exp-item">
                                    <span class="exp-label">Experience:</span>
                                    <span class="exp-value">${doctor.experience}+ years</span>
                                </div>
                                <div class="exp-item">
                                    <span class="exp-label">Patients Served:</span>
                                    <span class="exp-value">${doctor.patientsServed}+</span>
                                </div>
                            </div>
                            <ul class="education-list">
                                ${educationList}
                            </ul>
                        </div>
                        
                        <div class="profile-section">
                            <h4><i class="fas fa-stethoscope"></i> Specializations</h4>
                            <div class="subspecialties-list">
                                ${subspecialtyTags}
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4><i class="fas fa-language"></i> Languages</h4>
                            <div class="languages-list">
                                ${languageList}
                            </div>
                        </div>
                        
                        ${doctor.awards.length > 0 ? `
                        <div class="profile-section">
                            <h4><i class="fas fa-trophy"></i> Awards & Recognition</h4>
                            <ul class="awards-list">
                                ${awardsList}
                            </ul>
                        </div>
                        ` : ''}
                        
                        <div class="profile-section">
                            <h4><i class="fas fa-clock"></i> Availability</h4>
                            <div class="availability-info">
                                <div class="availability-status ${doctor.availability.status}">
                                    <i class="fas fa-circle"></i>
                                    ${doctor.availability.status === 'available' ? 'Available Now' : 'Currently Busy'}
                                </div>
                                <p class="next-available">Next available: ${doctor.availability.nextAvailable}</p>
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4><i class="fas fa-rupee-sign"></i> Consultation Fee</h4>
                            <div class="fee-info">
                                <span class="fee-amount">₹${doctor.consultationFee}</span>
                                <span class="fee-note">(including taxes)</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeDoctorProfileModal()">Close</button>
                    <button class="btn btn-primary" onclick="bookAppointmentWithDoctor(${doctor.id})">
                        <i class="fas fa-calendar-plus"></i> Book Appointment
                    </button>
                </div>
            </div>
        `;
    }

    showModal(modalId, content) {
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
                <span class="close-modal" onclick="closeDoctorProfileModal()">&times;</span>
                ${content}
            </div>
        `;

        document.body.appendChild(modal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modalId);
            }
        });
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${this.filteredDoctors.length} doctors found`;
        }
    }

    showNoResults() {
        const container = document.getElementById('doctorsGrid');
        const noResults = document.getElementById('noResults');
        
        if (container) container.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        
        this.updateResultsCount();
    }

    hideLoading() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global functions
function closeDoctorProfileModal() {
    const modal = document.getElementById('doctorProfileModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function viewDoctorProfile(doctorId) {
    if (window.doctorsManager) {
        window.doctorsManager.showDoctorProfile(doctorId);
    }
}

function bookAppointmentWithDoctor(doctorId) {
    localStorage.setItem('selectedDoctor', doctorId);
    window.location.href = 'appointments.html';
}

// Initialize on page load
let doctorsManager;
document.addEventListener('DOMContentLoaded', () => {
    doctorsManager = new DoctorsManager();
    window.doctorsManager = doctorsManager;
});

// Add custom styles
const style = document.createElement('style');
style.textContent = `
    .doctor-card {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 20px;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .doctor-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px var(--shadow);
    }
    
    .doctor-card-header {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
    }
    
    .doctor-image {
        position: relative;
        width: 80px;
        height: 80px;
        flex-shrink: 0;
    }
    
    .doctor-image img {
        width: 100%;
        height: 100%;
        border-radius: 12px;
        object-fit: cover;
        border: 2px solid var(--glass-border);
    }
    
    .availability-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        padding: 2px 6px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 3px;
    }
    
    .availability-badge.available {
        background: rgba(16, 185, 129, 0.9);
        color: white;
    }
    
    .availability-badge.busy {
        background: rgba(239, 68, 68, 0.9);
        color: white;
    }
    
    .doctor-info {
        flex: 1;
    }
    
    .doctor-name {
        color: var(--text-light);
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
    }
    
    .doctor-specialty {
        color: var(--accent-color);
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 500;
    }
    
    .doctor-hospital {
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .doctor-stats {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
    }
    
    .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
    }
    
    .stat-item i {
        color: var(--accent-color);
    }
    
    .subspecialties {
        margin-bottom: 12px;
    }
    
    .subspecialty-tag {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 11px;
        margin: 2px 4px 2px 0;
        display: inline-block;
    }
    
    .subspecialty-tag.more {
        background: rgba(107, 114, 128, 0.2);
        color: #6b7280;
    }
    
    .doctor-rating {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
    }
    
    .doctor-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 16px;
    }
    
    .consultation-fee {
        display: flex;
        flex-direction: column;
    }
    
    .fee-label {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
    }
    
    .fee-amount {
        color: var(--accent-color);
        font-size: 18px;
        font-weight: 600;
    }
    
    .card-actions {
        display: flex;
        gap: 8px;
    }
    
    .btn-view-profile, .btn-book-appointment {
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .btn-view-profile {
        background: rgba(107, 114, 128, 0.2);
        color: #9ca3af;
    }
    
    .btn-view-profile:hover {
        background: rgba(107, 114, 128, 0.3);
        color: #d1d5db;
    }
    
    .btn-book-appointment {
        background: var(--accent-color);
        color: white;
    }
    
    .btn-book-appointment:hover {
        background: var(--accent-hover);
        transform: translateY(-1px);
    }
    
    .profile-image img {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 3px solid var(--accent-color);
    }
    
    .doctor-profile-header {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 24px;
    }
    
    .profile-info h2 {
        color: var(--text-light);
        margin: 0 0 8px 0;
        font-size: 28px;
    }
    
    .profile-specialty {
        color: var(--accent-color);
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px 0;
    }
    
    .profile-hospital {
        color: rgba(255, 255, 255, 0.8);
        margin: 0 0 12px 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .profile-section {
        margin-bottom: 24px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .profile-section h4 {
        color: var(--accent-color);
        margin: 0 0 16px 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
    }
    
    .experience-info {
        display: flex;
        gap: 24px;
        margin-bottom: 16px;
    }
    
    .exp-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .exp-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
    }
    
    .exp-value {
        color: var(--text-light);
        font-size: 16px;
        font-weight: 600;
    }
    
    .education-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .education-list li {
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
    }
    
    .subspecialties-list, .languages-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .language-tag {
        background: rgba(139, 92, 246, 0.2);
        color: #a78bfa;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .awards-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .awards-list li {
        padding: 8px 0;
        color: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .awards-list i {
        color: var(--warning-color);
    }
    
    .availability-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .availability-status {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
    }
    
    .next-available {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        margin: 0;
    }
    
    .fee-info {
        display: flex;
        align-items: baseline;
        gap: 8px;
    }
    
    .fee-info .fee-amount {
        font-size: 24px;
        font-weight: 600;
        color: var(--accent-color);
    }
    
    .fee-note {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
    }
`;
document.head.appendChild(style);