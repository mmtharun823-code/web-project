// Patient Registration page functionality

class PatientRegistrationManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.selectedHospital = null;
        this.selectedDoctor = null;
        this.initialize();
    }

    async initialize() {
        // Check authentication
        this.checkAuth();
        
        // Load data
        await this.loadHospitals();
        await this.loadDoctors();
        
        // Check for preselected hospital
        this.checkPreselectedHospital();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize first step
        this.showStep(1);
        
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
        } catch (error) {
            console.error('Error loading hospitals:', error);
            this.showError('Failed to load hospitals data');
        }
    }

    async loadDoctors() {
        try {
            const response = await fetch('data/doctors.json');
            const data = await response.json();
            this.doctors = data.doctors;
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.showError('Failed to load doctors data');
        }
    }

    checkPreselectedHospital() {
        const preselectedHospitalId = localStorage.getItem('selectedHospital');
        if (preselectedHospitalId) {
            this.selectedHospital = this.hospitals.find(h => h.id === parseInt(preselectedHospitalId));
            localStorage.removeItem('selectedHospital');
            
            if (this.selectedHospital) {
                this.populateHospitalInfo();
            }
        }
    }

    setupEventListeners() {
        // Step navigation
        const nextBtns = document.querySelectorAll('.next-step');
        const prevBtns = document.querySelectorAll('.prev-step');
        
        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });
        
        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        // Hospital selection
        const hospitalSelect = document.getElementById('hospitalSelect');
        if (hospitalSelect) {
            hospitalSelect.addEventListener('change', (e) => {
                const hospitalId = parseInt(e.target.value);
                this.selectedHospital = this.hospitals.find(h => h.id === hospitalId);
                this.populateHospitalInfo();
                this.populateDoctorsByHospital();
            });
        }

        // Doctor selection
        const doctorSelect = document.getElementById('doctorSelect');
        if (doctorSelect) {
            doctorSelect.addEventListener('change', (e) => {
                const doctorId = parseInt(e.target.value);
                this.selectedDoctor = this.doctors.find(d => d.id === doctorId);
                this.populateDoctorInfo();
            });
        }

        // Final form submission
        const registrationForm = document.getElementById('registrationForm');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitRegistration();
            });
        }

        // Auto-fill current user data
        this.autoFillUserData();

        // Input validation
        this.setupValidation();
    }

    autoFillUserData() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Fill basic info if available
        const nameInput = document.getElementById('patientName');
        const emailInput = document.getElementById('patientEmail');
        
        if (nameInput && currentUser.name) {
            nameInput.value = currentUser.name;
        }
        
        if (emailInput && currentUser.email) {
            emailInput.value = currentUser.email;
        }
    }

    setupValidation() {
        // Real-time validation for phone numbers
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                    e.target.value = value;
                }
            });
        });

        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                this.validateEmail(e.target);
            });
        });

        // Required field validation
        const requiredInputs = document.querySelectorAll('input[required], select[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                this.validateRequired(e.target);
            });
        });
    }

    validateEmail(input) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailPattern.test(input.value);
        
        this.showFieldValidation(input, isValid, isValid ? '' : 'Please enter a valid email address');
        return isValid;
    }

    validateRequired(input) {
        const isValid = input.value.trim() !== '';
        this.showFieldValidation(input, isValid, isValid ? '' : 'This field is required');
        return isValid;
    }

    showFieldValidation(input, isValid, message) {
        const parent = input.parentElement;
        const existingError = parent.querySelector('.field-error');
        
        if (existingError) {
            existingError.remove();
        }
        
        input.classList.remove('error', 'success');
        
        if (input.value.trim() !== '') {
            if (isValid) {
                input.classList.add('success');
            } else {
                input.classList.add('error');
                const errorSpan = document.createElement('span');
                errorSpan.className = 'field-error';
                errorSpan.textContent = message;
                parent.appendChild(errorSpan);
            }
        }
    }

    showStep(step) {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            const stepElement = document.getElementById(`step${i}`);
            if (stepElement) {
                stepElement.style.display = 'none';
            }
        }

        // Show current step
        const currentStepElement = document.getElementById(`step${step}`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
        }

        // Update progress bar
        this.updateProgressBar(step);

        // Update navigation buttons
        this.updateNavigationButtons(step);

        // Load step-specific content
        if (step === 1) {
            this.populateHospitalSelect();
        }
    }

    updateProgressBar(step) {
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            const percentage = (step / this.totalSteps) * 100;
            progressBar.style.width = `${percentage}%`;
        }

        // Update step indicators
        for (let i = 1; i <= this.totalSteps; i++) {
            const indicator = document.querySelector(`.step-indicator[data-step="${i}"]`);
            if (indicator) {
                indicator.classList.remove('active', 'completed');
                if (i < step) {
                    indicator.classList.add('completed');
                } else if (i === step) {
                    indicator.classList.add('active');
                }
            }
        }
    }

    updateNavigationButtons(step) {
        const prevBtns = document.querySelectorAll('.prev-step');
        const nextBtns = document.querySelectorAll('.next-step');
        const submitBtn = document.getElementById('submitRegistration');

        prevBtns.forEach(btn => {
            btn.style.display = step === 1 ? 'none' : 'inline-block';
        });

        nextBtns.forEach(btn => {
            btn.style.display = step === this.totalSteps ? 'none' : 'inline-block';
        });

        if (submitBtn) {
            submitBtn.style.display = step === this.totalSteps ? 'inline-block' : 'none';
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveStepData();
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.showStep(this.currentStep);
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (!currentStepElement) return true;

        const requiredFields = currentStepElement.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateRequired(field)) {
                isValid = false;
            }
            
            if (field.type === 'email' && !this.validateEmail(field)) {
                isValid = false;
            }
        });

        // Step-specific validation
        if (this.currentStep === 1) {
            if (!this.selectedHospital) {
                this.showError('Please select a hospital');
                isValid = false;
            }
        } else if (this.currentStep === 2) {
            if (!this.selectedDoctor) {
                this.showError('Please select a doctor');
                isValid = false;
            }
        }

        return isValid;
    }

    saveStepData() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (!currentStepElement) return;

        const formData = new FormData();
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name && input.value) {
                formData.append(input.name, input.value);
            }
        });

        // Convert FormData to object and merge with existing data
        const stepData = Object.fromEntries(formData.entries());
        this.formData = { ...this.formData, ...stepData };
    }

    populateHospitalSelect() {
        const hospitalSelect = document.getElementById('hospitalSelect');
        if (!hospitalSelect || !this.hospitals) return;

        const options = this.hospitals.map(hospital => 
            `<option value="${hospital.id}">${hospital.name} - ${hospital.location}</option>`
        ).join('');

        hospitalSelect.innerHTML = `
            <option value="">Select a hospital</option>
            ${options}
        `;

        // If hospital was preselected, set it
        if (this.selectedHospital) {
            hospitalSelect.value = this.selectedHospital.id;
        }
    }

    populateHospitalInfo() {
        if (!this.selectedHospital) return;

        const hospitalInfoDiv = document.getElementById('selectedHospitalInfo');
        if (!hospitalInfoDiv) return;

        hospitalInfoDiv.innerHTML = `
            <div class="hospital-info-card">
                <h4>${this.selectedHospital.name}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${this.selectedHospital.location}</p>
                <p><i class="fas fa-phone"></i> ${this.selectedHospital.phone}</p>
                <div class="hospital-specialties">
                    <strong>Specialties:</strong>
                    ${this.selectedHospital.specialties.slice(0, 3).map(s => `<span class="specialty-tag">${s}</span>`).join('')}
                </div>
            </div>
        `;

        hospitalInfoDiv.style.display = 'block';
    }

    populateDoctorsByHospital() {
        if (!this.selectedHospital) return;

        const doctorSelect = document.getElementById('doctorSelect');
        if (!doctorSelect) return;

        // Filter doctors by hospital (simplified - in real app, you'd have hospital-doctor relationships)
        const hospitalDoctors = this.doctors.filter(doctor => 
            doctor.hospital === this.selectedHospital.name
        );

        if (hospitalDoctors.length === 0) {
            doctorSelect.innerHTML = '<option value="">No doctors available at this hospital</option>';
            return;
        }

        const options = hospitalDoctors.map(doctor => 
            `<option value="${doctor.id}">${doctor.name} - ${doctor.specialty}</option>`
        ).join('');

        doctorSelect.innerHTML = `
            <option value="">Select a doctor</option>
            ${options}
        `;
    }

    populateDoctorInfo() {
        if (!this.selectedDoctor) return;

        const doctorInfoDiv = document.getElementById('selectedDoctorInfo');
        if (!doctorInfoDiv) return;

        const stars = this.generateStars(this.selectedDoctor.rating);

        doctorInfoDiv.innerHTML = `
            <div class="doctor-info-card">
                <div class="doctor-info-header">
                    <img src="${this.selectedDoctor.image}" alt="${this.selectedDoctor.name}" 
                         onerror="this.src='assets/images/default-doctor.jpg'">
                    <div class="doctor-details">
                        <h4>Dr. ${this.selectedDoctor.name}</h4>
                        <p>${this.selectedDoctor.specialty}</p>
                        <div class="rating-info">
                            <div class="rating-stars">${stars}</div>
                            <span>${this.selectedDoctor.rating} (${this.selectedDoctor.reviewCount} reviews)</span>
                        </div>
                        <div class="consultation-fee">
                            <strong>Consultation Fee: ₹${this.selectedDoctor.consultationFee}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;

        doctorInfoDiv.style.display = 'block';
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

    submitRegistration() {
        if (!this.validateCurrentStep()) return;

        this.saveStepData();

        // Add selected hospital and doctor info
        this.formData.hospitalId = this.selectedHospital?.id;
        this.formData.hospitalName = this.selectedHospital?.name;
        this.formData.doctorId = this.selectedDoctor?.id;
        this.formData.doctorName = this.selectedDoctor?.name;
        this.formData.specialty = this.selectedDoctor?.specialty;
        this.formData.consultationFee = this.selectedDoctor?.consultationFee;

        // Generate registration ID
        const registrationId = 'REG' + Date.now().toString().slice(-8);
        this.formData.registrationId = registrationId;
        this.formData.registrationDate = new Date().toISOString();
        this.formData.status = 'pending';

        // Save to localStorage
        this.saveRegistration();

        // Show success message
        this.showSuccessModal(registrationId);
    }

    saveRegistration() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userRegistrations = JSON.parse(localStorage.getItem(`registrations_${currentUser.email}`) || '[]');
        
        userRegistrations.push(this.formData);
        localStorage.setItem(`registrations_${currentUser.email}`, JSON.stringify(userRegistrations));
    }

    showSuccessModal(registrationId) {
        const modalContent = `
            <div class="success-modal">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Registration Successful!</h3>
                <p>Your patient registration has been submitted successfully.</p>
                <div class="registration-details">
                    <div class="detail-item">
                        <strong>Registration ID:</strong> ${registrationId}
                    </div>
                    <div class="detail-item">
                        <strong>Hospital:</strong> ${this.selectedHospital.name}
                    </div>
                    <div class="detail-item">
                        <strong>Doctor:</strong> Dr. ${this.selectedDoctor.name}
                    </div>
                    <div class="detail-item">
                        <strong>Status:</strong> Pending Approval
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="redirectToDashboard()">Go to Dashboard</button>
                    <button class="btn btn-secondary" onclick="redirectToAppointments()">Book Appointment</button>
                </div>
            </div>
        `;

        this.showModal('successModal', modalContent);
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
                ${content}
            </div>
        `;

        document.body.appendChild(modal);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    hideLoading() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const colors = {
            success: 'rgba(16, 185, 129, 0.9)',
            error: 'rgba(239, 68, 68, 0.9)',
            info: 'rgba(59, 130, 246, 0.9)'
        };

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icons[type]}"></i>
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
            background: ${colors[type]};
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
function redirectToDashboard() {
    window.location.href = 'dashboard.html';
}

function redirectToAppointments() {
    window.location.href = 'appointments.html';
}

// Initialize on page load
let patientRegistrationManager;
document.addEventListener('DOMContentLoaded', () => {
    patientRegistrationManager = new PatientRegistrationManager();
    window.patientRegistrationManager = patientRegistrationManager;
});

// Add custom styles
const style = document.createElement('style');
style.textContent = `
    .progress-container {
        margin-bottom: 30px;
    }
    
    .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 20px;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-color), var(--accent-hover));
        border-radius: 4px;
        transition: width 0.3s ease;
        width: 33%;
    }
    
    .step-indicators {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .step-indicator {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.5);
        font-weight: 600;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .step-indicator.active {
        background: var(--accent-color);
        border-color: var(--accent-color);
        color: white;
    }
    
    .step-indicator.completed {
        background: var(--success-color);
        border-color: var(--success-color);
        color: white;
    }
    
    .step-indicator.completed::after {
        content: '✓';
        position: absolute;
    }
    
    .form-step {
        display: none;
    }
    
    .form-step.active {
        display: block;
    }
    
    .hospital-info-card, .doctor-info-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
    }
    
    .hospital-info-card h4, .doctor-info-card h4 {
        color: var(--text-light);
        margin: 0 0 12px 0;
    }
    
    .hospital-info-card p, .doctor-info-card p {
        color: rgba(255, 255, 255, 0.8);
        margin: 8px 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .hospital-specialties {
        margin-top: 16px;
    }
    
    .specialty-tag {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin: 4px 4px 4px 0;
        display: inline-block;
    }
    
    .doctor-info-header {
        display: flex;
        gap: 16px;
        align-items: flex-start;
    }
    
    .doctor-info-header img {
        width: 80px;
        height: 80px;
        border-radius: 12px;
        object-fit: cover;
    }
    
    .doctor-details {
        flex: 1;
    }
    
    .rating-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
    }
    
    .consultation-fee {
        color: var(--warning-color);
        margin-top: 8px;
    }
    
    .form-group {
        margin-bottom: 20px;
        position: relative;
    }
    
    .form-group input, .form-group select, .form-group textarea {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-light);
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.3s ease;
    }
    
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
        outline: none;
        border-color: var(--accent-color);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .form-group input.success {
        border-color: var(--success-color);
        background: rgba(16, 185, 129, 0.05);
    }
    
    .form-group input.error {
        border-color: var(--error-color);
        background: rgba(239, 68, 68, 0.05);
    }
    
    .form-group label {
        display: block;
        color: var(--text-light);
        margin-bottom: 8px;
        font-weight: 500;
    }
    
    .field-error {
        color: var(--error-color);
        font-size: 14px;
        margin-top: 4px;
        display: block;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
    }
    
    .step-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .step-navigation .btn {
        min-width: 120px;
    }
    
    .success-modal {
        text-align: center;
        padding: 40px 20px;
    }
    
    .success-icon {
        font-size: 4rem;
        color: var(--success-color);
        margin-bottom: 20px;
    }
    
    .success-modal h3 {
        color: var(--text-light);
        margin-bottom: 16px;
    }
    
    .success-modal p {
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 30px;
    }
    
    .registration-details {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
        text-align: left;
    }
    
    .registration-details .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.9);
    }
    
    .registration-details .detail-item:last-child {
        border-bottom: none;
    }
    
    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 30px;
    }
    
    .modal-actions .btn {
        min-width: 150px;
    }
`;
document.head.appendChild(style);