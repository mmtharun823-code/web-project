// Hospitals page functionality

class HospitalsManager {
    constructor() {
        this.hospitals = [];
        this.filteredHospitals = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.initialize();
    }

    async initialize() {
        // Check authentication
        this.checkAuth();
        
        // Load hospitals data
        await this.loadHospitals();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial display
        this.displayHospitals();
        
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

    async loadHospitals() {
        try {
            const response = await fetch('data/hospitals.json');
            const data = await response.json();
            this.hospitals = data.hospitals;
            this.filteredHospitals = [...this.hospitals];
        } catch (error) {
            console.error('Error loading hospitals:', error);
            this.showError('Failed to load hospitals data');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('hospitalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.filterAndDisplay();
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Set current filter
                this.currentFilter = e.target.dataset.filter;
                
                // Filter and display
                this.filterAndDisplay();
            });
        });
    }

    filterAndDisplay() {
        // Apply filters
        this.filteredHospitals = this.hospitals.filter(hospital => {
            // Type filter
            const matchesType = this.currentFilter === 'all' || hospital.type === this.currentFilter;
            
            // Search filter
            const matchesSearch = this.currentSearch === '' ||
                hospital.name.toLowerCase().includes(this.currentSearch) ||
                hospital.location.toLowerCase().includes(this.currentSearch) ||
                hospital.specialties.some(specialty => 
                    specialty.toLowerCase().includes(this.currentSearch));
            
            return matchesType && matchesSearch;
        });

        this.displayHospitals();
    }

    displayHospitals() {
        const container = document.getElementById('hospitalsGrid');
        if (!container) return;

        if (this.filteredHospitals.length === 0) {
            this.showNoResults();
            return;
        }

        // Hide no results message
        const noResults = document.getElementById('noResults');
        if (noResults) noResults.style.display = 'none';

        // Generate hospital cards
        container.innerHTML = this.filteredHospitals.map(hospital => this.createHospitalCard(hospital)).join('');

        // Add click listeners to cards
        this.addCardListeners();
    }

    createHospitalCard(hospital) {
        const stars = this.generateStars(hospital.rating);
        const specialtyBadges = hospital.specialties.slice(0, 3).map(specialty => 
            `<span class="specialty-badge">${specialty}</span>`
        ).join('');

        return `
            <div class="hospital-card" data-hospital-id="${hospital.id}">
                <div class="card-header">
                    <div class="hospital-info">
                        <h3 class="card-title">${hospital.name}</h3>
                        <p class="card-subtitle">${hospital.location}</p>
                        <div class="card-badge ${hospital.type}">${hospital.type.charAt(0).toUpperCase() + hospital.type.slice(1)}</div>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="card-info">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${hospital.address}</span>
                    </div>
                    <div class="card-info">
                        <i class="fas fa-phone"></i>
                        <span>${hospital.phone}</span>
                    </div>
                    <div class="card-info">
                        <i class="fas fa-bed"></i>
                        <span>${hospital.beds} beds</span>
                    </div>
                    <div class="card-info">
                        <i class="fas fa-calendar"></i>
                        <span>Est. ${hospital.established}</span>
                    </div>
                    
                    <div class="specialties-container">
                        ${specialtyBadges}
                        ${hospital.specialties.length > 3 ? `<span class="specialty-badge more">+${hospital.specialties.length - 3} more</span>` : ''}
                    </div>
                </div>
                
                <div class="card-footer">
                    <div class="rating">
                        <div class="rating-stars">${stars}</div>
                        <span class="rating-value">${hospital.rating}</span>
                        <span class="rating-count">(${hospital.reviews} reviews)</span>
                    </div>
                    ${hospital.emergency ? '<div class="emergency-badge"><i class="fas fa-ambulance"></i> 24/7 Emergency</div>' : ''}
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

    addCardListeners() {
        const cards = document.querySelectorAll('.hospital-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const hospitalId = parseInt(card.dataset.hospitalId);
                this.showHospitalDetails(hospitalId);
            });
        });
    }

    showHospitalDetails(hospitalId) {
        const hospital = this.hospitals.find(h => h.id === hospitalId);
        if (!hospital) return;

        const modalContent = this.createHospitalModal(hospital);
        this.showModal('hospitalModal', modalContent);
    }

    createHospitalModal(hospital) {
        const stars = this.generateStars(hospital.rating);
        const specialties = hospital.specialties.map(specialty => 
            `<span class="specialty-tag">${specialty}</span>`
        ).join('');
        const facilities = hospital.facilities.map(facility => 
            `<li><i class="fas fa-check-circle"></i> ${facility}</li>`
        ).join('');
        const accreditations = hospital.accreditation.map(acc => 
            `<span class="accreditation-badge">${acc}</span>`
        ).join('');
        const insurances = hospital.insuranceAccepted.map(insurance => 
            `<span class="insurance-badge">${insurance}</span>`
        ).join('');

        return `
            <div class="hospital-modal-content">
                <div class="modal-header">
                    <h2>${hospital.name}</h2>
                    <div class="hospital-type-badge ${hospital.type}">${hospital.type.charAt(0).toUpperCase() + hospital.type.slice(1)}</div>
                </div>
                
                <div class="hospital-details">
                    <div class="detail-section">
                        <h4><i class="fas fa-info-circle"></i> Basic Information</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="label">Location:</span>
                                <span class="value">${hospital.location}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Address:</span>
                                <span class="value">${hospital.address}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Phone:</span>
                                <span class="value">${hospital.phone}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Email:</span>
                                <span class="value">${hospital.email}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Website:</span>
                                <span class="value">${hospital.website}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Established:</span>
                                <span class="value">${hospital.established}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Beds:</span>
                                <span class="value">${hospital.beds}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Timings:</span>
                                <span class="value">${hospital.timings}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4><i class="fas fa-star"></i> Rating & Reviews</h4>
                        <div class="rating-section">
                            <div class="rating-display">
                                <div class="rating-stars">${stars}</div>
                                <span class="rating-value">${hospital.rating}</span>
                                <span class="rating-count">(${hospital.reviews} reviews)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4><i class="fas fa-stethoscope"></i> Specialties</h4>
                        <div class="specialties-list">
                            ${specialties}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4><i class="fas fa-building"></i> Facilities</h4>
                        <ul class="facilities-list">
                            ${facilities}
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h4><i class="fas fa-certificate"></i> Accreditations</h4>
                        <div class="accreditations-list">
                            ${accreditations}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4><i class="fas fa-shield-alt"></i> Insurance Accepted</h4>
                        <div class="insurance-list">
                            ${insurances}
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeHospitalModal()">Close</button>
                    <button class="btn btn-primary" onclick="bookAppointment(${hospital.id})">Book Appointment</button>
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
                <span class="close-modal" onclick="closeHospitalModal()">&times;</span>
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

    showNoResults() {
        const container = document.getElementById('hospitalsGrid');
        const noResults = document.getElementById('noResults');
        
        if (container) container.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
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
function closeHospitalModal() {
    const modal = document.getElementById('hospitalModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function bookAppointment(hospitalId) {
    localStorage.setItem('selectedHospital', hospitalId);
    window.location.href = 'patient-registration.html';
}

// Initialize on page load
let hospitalsManager;
document.addEventListener('DOMContentLoaded', () => {
    hospitalsManager = new HospitalsManager();
});

// Add custom styles
const style = document.createElement('style');
style.textContent = `
    .specialty-badge, .specialty-tag {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin: 2px;
        display: inline-block;
    }
    
    .specialty-badge.more {
        background: rgba(107, 114, 128, 0.2);
        color: #6b7280;
    }
    
    .emergency-badge {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .hospital-type-badge {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .hospital-type-badge.government {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }
    
    .hospital-type-badge.private {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
    }
    
    .hospital-type-badge.specialty {
        background: rgba(139, 92, 246, 0.2);
        color: #8b5cf6;
    }
    
    .specialties-container {
        margin: 12px 0;
    }
    
    .detail-section {
        margin-bottom: 24px;
    }
    
    .detail-section h4 {
        color: var(--accent-color);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 12px;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .detail-item .label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
    }
    
    .detail-item .value {
        color: var(--text-light);
        font-weight: 500;
        font-size: 14px;
    }
    
    .rating-display {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .specialties-list, .accreditations-list, .insurance-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .facilities-list {
        list-style: none;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 8px;
    }
    
    .facilities-list li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        font-size: 14px;
    }
    
    .facilities-list i {
        color: var(--success-color);
    }
    
    .accreditation-badge, .insurance-badge {
        background: rgba(251, 191, 36, 0.2);
        color: #fbbf24;
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .insurance-badge {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }
`;
document.head.appendChild(style);