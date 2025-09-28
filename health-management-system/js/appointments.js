// Appointments page functionality

class AppointmentsManager {
    constructor() {
        this.doctors = [];
        this.appointments = [];
        this.selectedDate = new Date().toISOString().split('T')[0];
        this.selectedTime = '';
        this.selectedDoctor = null;
        this.currentView = 'booking';
        this.initialize();
    }

    async initialize() {
        // Check authentication
        this.checkAuth();
        
        // Load data
        await this.loadDoctors();
        await this.loadAppointments();
        
        // Check if doctor was preselected
        this.checkPreselectedDoctor();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup calendar
        this.setupCalendar();
        
        // Initialize view
        this.switchView(this.currentView);
        
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
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.showError('Failed to load doctors data');
        }
    }

    async loadAppointments() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userAppointments = JSON.parse(localStorage.getItem(`appointments_${currentUser.email}`) || '[]');
            this.appointments = userAppointments;
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.appointments = [];
        }
    }

    checkPreselectedDoctor() {
        const preselectedDoctorId = localStorage.getItem('selectedDoctor');
        if (preselectedDoctorId) {
            this.selectedDoctor = this.doctors.find(d => d.id === parseInt(preselectedDoctorId));
            localStorage.removeItem('selectedDoctor');
            
            if (this.selectedDoctor) {
                this.populateDoctorInfo();
            }
        }
    }

    setupEventListeners() {
        // View switchers
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Doctor selection
        const doctorSelect = document.getElementById('doctorSelect');
        if (doctorSelect) {
            doctorSelect.addEventListener('change', (e) => {
                const doctorId = parseInt(e.target.value);
                this.selectedDoctor = this.doctors.find(d => d.id === doctorId);
                this.populateDoctorInfo();
                this.updateAvailableSlots();
            });
        }

        // Date selection
        const dateInput = document.getElementById('appointmentDate');
        if (dateInput) {
            dateInput.addEventListener('change', (e) => {
                this.selectedDate = e.target.value;
                this.updateAvailableSlots();
            });
        }

        // Time slot selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-slot')) {
                // Remove active class from all slots
                document.querySelectorAll('.time-slot').forEach(slot => {
                    slot.classList.remove('active');
                });
                
                // Add active class to selected slot
                e.target.classList.add('active');
                this.selectedTime = e.target.dataset.time;
                
                // Enable booking button
                const bookBtn = document.getElementById('bookAppointmentBtn');
                if (bookBtn) {
                    bookBtn.disabled = false;
                }
            }
        });

        // Booking form submission
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.bookAppointment();
            });
        }

        // Search appointments
        const searchInput = document.getElementById('appointmentSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterAppointments(e.target.value);
            });
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            }
        });

        // Show/hide content sections
        document.querySelectorAll('.view-content').forEach(content => {
            content.style.display = 'none';
        });

        const activeContent = document.getElementById(`${view}View`);
        if (activeContent) {
            activeContent.style.display = 'block';
        }

        // Load view-specific content
        if (view === 'booking') {
            this.populateDoctorSelect();
        } else if (view === 'manage') {
            this.displayAppointments();
        } else if (view === 'history') {
            this.displayAppointmentHistory();
        }
    }

    populateDoctorSelect() {
        const doctorSelect = document.getElementById('doctorSelect');
        if (!doctorSelect) return;

        const options = this.doctors.map(doctor => 
            `<option value="${doctor.id}">${doctor.name} - ${doctor.specialty}</option>`
        ).join('');

        doctorSelect.innerHTML = `
            <option value="">Select a doctor</option>
            ${options}
        `;

        // If doctor was preselected, set it
        if (this.selectedDoctor) {
            doctorSelect.value = this.selectedDoctor.id;
        }
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
                        <h4>${this.selectedDoctor.name}</h4>
                        <p>${this.selectedDoctor.specialty}</p>
                        <div class="rating-info">
                            <div class="rating-stars">${stars}</div>
                            <span>${this.selectedDoctor.rating} (${this.selectedDoctor.reviewCount} reviews)</span>
                        </div>
                        <div class="consultation-fee-info">
                            <strong>Consultation Fee: ₹${this.selectedDoctor.consultationFee}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;

        doctorInfoDiv.style.display = 'block';
    }

    setupCalendar() {
        const dateInput = document.getElementById('appointmentDate');
        if (dateInput) {
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = this.selectedDate;
            
            // Set maximum date to 3 months from now
            const maxDate = new Date();
            maxDate.setMonth(maxDate.getMonth() + 3);
            dateInput.max = maxDate.toISOString().split('T')[0];
        }
    }

    updateAvailableSlots() {
        if (!this.selectedDoctor || !this.selectedDate) return;

        const slotsContainer = document.getElementById('timeSlots');
        if (!slotsContainer) return;

        // Generate time slots (9 AM to 6 PM)
        const slots = this.generateTimeSlots();
        const bookedSlots = this.getBookedSlots(this.selectedDoctor.id, this.selectedDate);
        
        const slotElements = slots.map(slot => {
            const isBooked = bookedSlots.includes(slot);
            const isPast = this.isSlotInPast(this.selectedDate, slot);
            const isDisabled = isBooked || isPast;
            
            return `
                <button class="time-slot ${isDisabled ? 'disabled' : ''}" 
                        data-time="${slot}" 
                        ${isDisabled ? 'disabled' : ''}>
                    ${slot}
                    ${isBooked ? '<span class="booked-indicator">Booked</span>' : ''}
                </button>
            `;
        }).join('');

        slotsContainer.innerHTML = slotElements;
    }

    generateTimeSlots() {
        const slots = [];
        const startHour = 9; // 9 AM
        const endHour = 18; // 6 PM
        const slotDuration = 30; // 30 minutes

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += slotDuration) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }

        return slots;
    }

    getBookedSlots(doctorId, date) {
        return this.appointments
            .filter(apt => apt.doctorId === doctorId && apt.date === date)
            .map(apt => apt.time);
    }

    isSlotInPast(date, time) {
        const now = new Date();
        const slotDateTime = new Date(`${date}T${time}`);
        return slotDateTime < now;
    }

    bookAppointment() {
        if (!this.selectedDoctor || !this.selectedDate || !this.selectedTime) {
            this.showError('Please select doctor, date, and time');
            return;
        }

        const formData = new FormData(document.getElementById('bookingForm'));
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

        const appointment = {
            id: Date.now(),
            patientId: currentUser.email,
            patientName: formData.get('patientName'),
            patientPhone: formData.get('patientPhone'),
            patientEmail: formData.get('patientEmail'),
            doctorId: this.selectedDoctor.id,
            doctorName: this.selectedDoctor.name,
            specialty: this.selectedDoctor.specialty,
            date: this.selectedDate,
            time: this.selectedTime,
            reason: formData.get('reason'),
            notes: formData.get('notes'),
            status: 'confirmed',
            consultationFee: this.selectedDoctor.consultationFee,
            bookedAt: new Date().toISOString()
        };

        // Save appointment
        this.appointments.push(appointment);
        this.saveAppointments();

        // Show success message
        this.showSuccess('Appointment booked successfully!');

        // Reset form and update UI
        this.resetBookingForm();
        this.updateAvailableSlots();
        
        // Switch to manage view
        setTimeout(() => {
            this.switchView('manage');
        }, 2000);
    }

    saveAppointments() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        localStorage.setItem(`appointments_${currentUser.email}`, JSON.stringify(this.appointments));
    }

    resetBookingForm() {
        const form = document.getElementById('bookingForm');
        if (form) {
            form.reset();
        }
        
        this.selectedTime = '';
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('active');
        });
        
        const bookBtn = document.getElementById('bookAppointmentBtn');
        if (bookBtn) {
            bookBtn.disabled = true;
        }
    }

    displayAppointments() {
        const container = document.getElementById('appointmentsList');
        if (!container) return;

        const upcomingAppointments = this.appointments
            .filter(apt => apt.status !== 'cancelled' && new Date(`${apt.date}T${apt.time}`) > new Date())
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        if (upcomingAppointments.length === 0) {
            container.innerHTML = `
                <div class="no-appointments">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Upcoming Appointments</h3>
                    <p>You don't have any upcoming appointments. Book one now!</p>
                    <button class="btn btn-primary" onclick="appointmentsManager.switchView('booking')">
                        Book Appointment
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = upcomingAppointments.map(apt => this.createAppointmentCard(apt)).join('');
    }

    displayAppointmentHistory() {
        const container = document.getElementById('appointmentsHistory');
        if (!container) return;

        const pastAppointments = this.appointments
            .filter(apt => new Date(`${apt.date}T${apt.time}`) <= new Date())
            .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

        if (pastAppointments.length === 0) {
            container.innerHTML = `
                <div class="no-appointments">
                    <i class="fas fa-history"></i>
                    <h3>No Appointment History</h3>
                    <p>You haven't had any appointments yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pastAppointments.map(apt => this.createAppointmentCard(apt, true)).join('');
    }

    createAppointmentCard(appointment, isPast = false) {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const formattedDate = appointmentDate.toLocaleDateString('en-IN');
        const formattedTime = appointmentDate.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const statusClass = appointment.status === 'cancelled' ? 'cancelled' : 
                           appointment.status === 'completed' ? 'completed' : 'confirmed';

        return `
            <div class="appointment-card ${statusClass}">
                <div class="appointment-header">
                    <div class="appointment-info">
                        <h4>Dr. ${appointment.doctorName}</h4>
                        <p class="specialty">${appointment.specialty}</p>
                        <div class="appointment-status status-${statusClass}">
                            <i class="fas ${this.getStatusIcon(appointment.status)}"></i>
                            ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </div>
                    </div>
                    <div class="appointment-datetime">
                        <div class="date">
                            <i class="fas fa-calendar-alt"></i>
                            ${formattedDate}
                        </div>
                        <div class="time">
                            <i class="fas fa-clock"></i>
                            ${formattedTime}
                        </div>
                    </div>
                </div>
                
                <div class="appointment-details">
                    <div class="detail-row">
                        <span class="label">Patient:</span>
                        <span class="value">${appointment.patientName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Reason:</span>
                        <span class="value">${appointment.reason}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Fee:</span>
                        <span class="value">₹${appointment.consultationFee}</span>
                    </div>
                    ${appointment.notes ? `
                    <div class="detail-row">
                        <span class="label">Notes:</span>
                        <span class="value">${appointment.notes}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="appointment-actions">
                    ${!isPast && appointment.status !== 'cancelled' ? `
                        <button class="btn btn-danger" onclick="appointmentsManager.cancelAppointment(${appointment.id})">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-secondary" onclick="appointmentsManager.rescheduleAppointment(${appointment.id})">
                            <i class="fas fa-edit"></i> Reschedule
                        </button>
                    ` : ''}
                    <button class="btn btn-primary" onclick="appointmentsManager.viewAppointmentDetails(${appointment.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `;
    }

    getStatusIcon(status) {
        const icons = {
            confirmed: 'fa-check-circle',
            cancelled: 'fa-times-circle',
            completed: 'fa-flag-checkered'
        };
        return icons[status] || 'fa-clock';
    }

    cancelAppointment(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) return;

        if (confirm('Are you sure you want to cancel this appointment?')) {
            appointment.status = 'cancelled';
            appointment.cancelledAt = new Date().toISOString();
            
            this.saveAppointments();
            this.displayAppointments();
            this.showSuccess('Appointment cancelled successfully');
        }
    }

    rescheduleAppointment(appointmentId) {
        // Store the appointment ID for rescheduling
        localStorage.setItem('rescheduleAppointmentId', appointmentId);
        
        // Switch to booking view for rescheduling
        this.switchView('booking');
        
        // Pre-fill the doctor
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            this.selectedDoctor = this.doctors.find(d => d.id === appointment.doctorId);
            this.populateDoctorInfo();
            
            const doctorSelect = document.getElementById('doctorSelect');
            if (doctorSelect) {
                doctorSelect.value = appointment.doctorId;
            }
        }
        
        this.showInfo('Please select a new date and time for your appointment');
    }

    viewAppointmentDetails(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) return;

        const modalContent = this.createAppointmentDetailsModal(appointment);
        this.showModal('appointmentDetailsModal', modalContent);
    }

    createAppointmentDetailsModal(appointment) {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const formattedDate = appointmentDate.toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedTime = appointmentDate.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return `
            <div class="appointment-details-modal">
                <div class="modal-header">
                    <h3>Appointment Details</h3>
                    <div class="appointment-status status-${appointment.status}">
                        <i class="fas ${this.getStatusIcon(appointment.status)}"></i>
                        ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </div>
                </div>
                
                <div class="modal-body">
                    <div class="details-grid">
                        <div class="detail-section">
                            <h4><i class="fas fa-user-md"></i> Doctor Information</h4>
                            <div class="detail-item">
                                <span class="label">Doctor:</span>
                                <span class="value">Dr. ${appointment.doctorName}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Specialty:</span>
                                <span class="value">${appointment.specialty}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4><i class="fas fa-user"></i> Patient Information</h4>
                            <div class="detail-item">
                                <span class="label">Name:</span>
                                <span class="value">${appointment.patientName}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Phone:</span>
                                <span class="value">${appointment.patientPhone}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Email:</span>
                                <span class="value">${appointment.patientEmail}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4><i class="fas fa-calendar-alt"></i> Appointment Information</h4>
                            <div class="detail-item">
                                <span class="label">Date:</span>
                                <span class="value">${formattedDate}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Time:</span>
                                <span class="value">${formattedTime}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Reason:</span>
                                <span class="value">${appointment.reason}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Consultation Fee:</span>
                                <span class="value">₹${appointment.consultationFee}</span>
                            </div>
                        </div>
                        
                        ${appointment.notes ? `
                        <div class="detail-section">
                            <h4><i class="fas fa-sticky-note"></i> Additional Notes</h4>
                            <p class="notes-text">${appointment.notes}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeAppointmentDetailsModal()">Close</button>
                </div>
            </div>
        `;
    }

    filterAppointments(searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const appointmentCards = document.querySelectorAll('.appointment-card');
        
        appointmentCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const isVisible = text.includes(searchLower);
            card.style.display = isVisible ? 'block' : 'none';
        });
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
                <span class="close-modal" onclick="closeAppointmentDetailsModal()">&times;</span>
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

    showInfo(message) {
        this.showNotification(message, 'info');
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
function closeAppointmentDetailsModal() {
    const modal = document.getElementById('appointmentDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Initialize on page load
let appointmentsManager;
document.addEventListener('DOMContentLoaded', () => {
    appointmentsManager = new AppointmentsManager();
    window.appointmentsManager = appointmentsManager;
});

// Add custom styles
const style = document.createElement('style');
style.textContent = `
    .view-switcher {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
        padding: 4px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .view-btn {
        flex: 1;
        padding: 12px 20px;
        border: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
    }
    
    .view-btn.active, .view-btn:hover {
        background: var(--accent-color);
        color: white;
        transform: translateY(-1px);
    }
    
    .doctor-info-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
    }
    
    .doctor-info-header {
        display: flex;
        gap: 16px;
        align-items: center;
    }
    
    .doctor-info-header img {
        width: 80px;
        height: 80px;
        border-radius: 12px;
        object-fit: cover;
    }
    
    .doctor-details h4 {
        color: var(--text-light);
        margin: 0 0 8px 0;
    }
    
    .doctor-details p {
        color: var(--accent-color);
        margin: 0 0 12px 0;
    }
    
    .rating-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
    }
    
    .consultation-fee-info {
        color: var(--warning-color);
        font-size: 14px;
    }
    
    .time-slots {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 12px;
        margin: 20px 0;
    }
    
    .time-slot {
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-light);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        position: relative;
    }
    
    .time-slot:hover:not(.disabled) {
        background: var(--accent-color);
        color: white;
        transform: translateY(-2px);
    }
    
    .time-slot.active {
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-color);
    }
    
    .time-slot.disabled {
        background: rgba(255, 255, 255, 0.02);
        color: rgba(255, 255, 255, 0.3);
        cursor: not-allowed;
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .booked-indicator {
        position: absolute;
        top: -8px;
        right: -8px;
        background: var(--error-color);
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 12px;
    }
    
    .appointment-card {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        transition: all 0.3s ease;
    }
    
    .appointment-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px var(--shadow);
    }
    
    .appointment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
    }
    
    .appointment-info h4 {
        color: var(--text-light);
        margin: 0 0 4px 0;
    }
    
    .specialty {
        color: var(--accent-color);
        margin: 0 0 8px 0;
        font-size: 14px;
    }
    
    .appointment-status {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .status-confirmed {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }
    
    .status-cancelled {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }
    
    .status-completed {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
    }
    
    .appointment-datetime {
        text-align: right;
    }
    
    .appointment-datetime .date,
    .appointment-datetime .time {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        margin-bottom: 4px;
    }
    
    .appointment-details {
        background: rgba(255, 255, 255, 0.02);
        border-radius: 8px;
        padding: 16px;
        margin: 16px 0;
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .detail-row:last-child {
        border-bottom: none;
    }
    
    .detail-row .label {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
    }
    
    .detail-row .value {
        color: var(--text-light);
        font-weight: 500;
    }
    
    .appointment-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .appointment-actions .btn {
        padding: 8px 16px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .no-appointments {
        text-align: center;
        padding: 60px 20px;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .no-appointments i {
        font-size: 4rem;
        color: var(--accent-color);
        margin-bottom: 20px;
    }
    
    .no-appointments h3 {
        color: var(--text-light);
        margin-bottom: 12px;
    }
    
    .detail-section {
        margin-bottom: 24px;
    }
    
    .detail-section h4 {
        color: var(--accent-color);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .notes-text {
        color: rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.02);
        padding: 12px;
        border-radius: 8px;
        margin: 0;
        line-height: 1.5;
    }
`;
document.head.appendChild(style);