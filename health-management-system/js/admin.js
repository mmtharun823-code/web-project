// Admin Dashboard functionality

class AdminManager {
    constructor() {
        this.currentView = 'overview';
        this.users = [];
        this.registrations = [];
        this.appointments = [];
        this.hospitals = [];
        this.doctors = [];
        this.initialize();
    }

    async initialize() {
        // Check admin authentication
        this.checkAdminAuth();
        
        // Load all data
        await this.loadAllData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize overview
        this.switchView('overview');
        
        // Hide loading spinner
        this.hideLoading();
    }

    checkAdminAuth() {
        const authManager = window.authManager;
        if (!authManager || !authManager.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        // Check if user has admin role
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'dashboard.html';
            return;
        }
    }

    async loadAllData() {
        try {
            // Load system data
            const [hospitalsResponse, doctorsResponse] = await Promise.all([
                fetch('data/hospitals.json'),
                fetch('data/doctors.json')
            ]);

            const hospitalsData = await hospitalsResponse.json();
            const doctorsData = await doctorsResponse.json();

            this.hospitals = hospitalsData.hospitals;
            this.doctors = doctorsData.doctors;

            // Load user data from localStorage
            this.loadUserData();
            this.loadRegistrations();
            this.loadAppointments();

        } catch (error) {
            console.error('Error loading admin data:', error);
            this.showError('Failed to load admin data');
        }
    }

    loadUserData() {
        // Get all users from localStorage
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        this.users = allUsers;
    }

    loadRegistrations() {
        // Get all registrations from all users
        this.registrations = [];
        this.users.forEach(user => {
            const userRegistrations = JSON.parse(localStorage.getItem(`registrations_${user.email}`) || '[]');
            this.registrations.push(...userRegistrations.map(reg => ({
                ...reg,
                userEmail: user.email,
                userName: user.name
            })));
        });
    }

    loadAppointments() {
        // Get all appointments from all users
        this.appointments = [];
        this.users.forEach(user => {
            const userAppointments = JSON.parse(localStorage.getItem(`appointments_${user.email}`) || '[]');
            this.appointments.push(...userAppointments.map(apt => ({
                ...apt,
                userEmail: user.email,
                userName: user.name
            })));
        });
    }

    setupEventListeners() {
        // View switchers
        const navItems = document.querySelectorAll('.admin-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.target.dataset.view || e.target.closest('.admin-nav-item').dataset.view;
                this.switchView(view);
            });
        });

        // Search functionality
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const tableId = e.target.dataset.table;
                this.filterTable(tableId, searchTerm);
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshAllData();
            });
        }
    }

    switchView(view) {
        this.currentView = view;

        // Update navigation
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-view="${view}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Hide all views
        document.querySelectorAll('.admin-view').forEach(viewEl => {
            viewEl.style.display = 'none';
        });

        // Show selected view
        const activeView = document.getElementById(`${view}View`);
        if (activeView) {
            activeView.style.display = 'block';
        }

        // Load view-specific content
        switch (view) {
            case 'overview':
                this.loadOverview();
                break;
            case 'users':
                this.loadUsersView();
                break;
            case 'registrations':
                this.loadRegistrationsView();
                break;
            case 'appointments':
                this.loadAppointmentsView();
                break;
            case 'hospitals':
                this.loadHospitalsView();
                break;
            case 'doctors':
                this.loadDoctorsView();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    loadOverview() {
        // Update stats cards
        this.updateStatsCards();
        
        // Load recent activities
        this.loadRecentActivities();
        
        // Load system status
        this.loadSystemStatus();
    }

    updateStatsCards() {
        // Total users
        const totalUsersEl = document.getElementById('totalUsers');
        if (totalUsersEl) {
            totalUsersEl.textContent = this.users.length;
        }

        // Total appointments
        const totalAppointmentsEl = document.getElementById('totalAppointments');
        if (totalAppointmentsEl) {
            totalAppointmentsEl.textContent = this.appointments.length;
        }

        // Total registrations
        const totalRegistrationsEl = document.getElementById('totalRegistrations');
        if (totalRegistrationsEl) {
            totalRegistrationsEl.textContent = this.registrations.length;
        }

        // Active hospitals
        const activeHospitalsEl = document.getElementById('activeHospitals');
        if (activeHospitalsEl) {
            activeHospitalsEl.textContent = this.hospitals.length;
        }

        // Today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.appointments.filter(apt => apt.date === today);
        const todayAppointmentsEl = document.getElementById('todayAppointments');
        if (todayAppointmentsEl) {
            todayAppointmentsEl.textContent = todayAppointments.length;
        }

        // Pending registrations
        const pendingRegs = this.registrations.filter(reg => reg.status === 'pending');
        const pendingRegistrationsEl = document.getElementById('pendingRegistrations');
        if (pendingRegistrationsEl) {
            pendingRegistrationsEl.textContent = pendingRegs.length;
        }
    }

    loadRecentActivities() {
        const activitiesContainer = document.getElementById('recentActivities');
        if (!activitiesContainer) return;

        // Combine recent activities from different sources
        const activities = [];

        // Recent registrations
        this.registrations
            .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
            .slice(0, 5)
            .forEach(reg => {
                activities.push({
                    type: 'registration',
                    message: `New patient registration: ${reg.patientName}`,
                    time: new Date(reg.registrationDate),
                    icon: 'fa-user-plus',
                    status: reg.status
                });
            });

        // Recent appointments
        this.appointments
            .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
            .slice(0, 5)
            .forEach(apt => {
                activities.push({
                    type: 'appointment',
                    message: `Appointment booked with Dr. ${apt.doctorName}`,
                    time: new Date(apt.bookedAt),
                    icon: 'fa-calendar-plus',
                    status: apt.status
                });
            });

        // Sort all activities by time
        activities.sort((a, b) => b.time - a.time);

        // Display top 10 activities
        const recentActivities = activities.slice(0, 10);

        activitiesContainer.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-message">${activity.message}</div>
                    <div class="activity-time">${this.formatRelativeTime(activity.time)}</div>
                </div>
                <div class="activity-status status-${activity.status}">
                    ${activity.status}
                </div>
            </div>
        `).join('');
    }

    loadSystemStatus() {
        const statusContainer = document.getElementById('systemStatus');
        if (!statusContainer) return;

        const status = {
            database: 'online',
            api: 'online',
            notifications: 'online',
            backups: 'warning'
        };

        statusContainer.innerHTML = `
            <div class="status-grid">
                <div class="status-item">
                    <div class="status-indicator ${status.database}"></div>
                    <span>Database</span>
                </div>
                <div class="status-item">
                    <div class="status-indicator ${status.api}"></div>
                    <span>API Services</span>
                </div>
                <div class="status-item">
                    <div class="status-indicator ${status.notifications}"></div>
                    <span>Notifications</span>
                </div>
                <div class="status-item">
                    <div class="status-indicator ${status.backups}"></div>
                    <span>Backups</span>
                </div>
            </div>
        `;
    }

    loadUsersView() {
        const usersTable = document.getElementById('usersTable');
        if (!usersTable) return;

        const tableHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${this.users.map(user => `
                    <tr>
                        <td>
                            <div class="user-info">
                                <div class="user-avatar">
                                    ${user.name.charAt(0).toUpperCase()}
                                </div>
                                <span>${user.name}</span>
                            </div>
                        </td>
                        <td>${user.email}</td>
                        <td>
                            <span class="role-badge ${user.role || 'user'}">
                                ${(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge active">Active</span>
                        </td>
                        <td>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action edit" onclick="adminManager.editUser('${user.email}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-action delete" onclick="adminManager.deleteUser('${user.email}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        usersTable.innerHTML = tableHTML;
    }

    loadRegistrationsView() {
        const registrationsTable = document.getElementById('registrationsTable');
        if (!registrationsTable) return;

        const tableHTML = `
            <thead>
                <tr>
                    <th>Registration ID</th>
                    <th>Patient Name</th>
                    <th>Hospital</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${this.registrations.map(reg => `
                    <tr>
                        <td><span class="reg-id">${reg.registrationId}</span></td>
                        <td>${reg.patientName}</td>
                        <td>${reg.hospitalName}</td>
                        <td>Dr. ${reg.doctorName}</td>
                        <td>${new Date(reg.registrationDate).toLocaleDateString()}</td>
                        <td>
                            <span class="status-badge ${reg.status}">
                                ${reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action view" onclick="adminManager.viewRegistration('${reg.registrationId}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                ${reg.status === 'pending' ? `
                                    <button class="btn-action approve" onclick="adminManager.approveRegistration('${reg.registrationId}')">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button class="btn-action reject" onclick="adminManager.rejectRegistration('${reg.registrationId}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        registrationsTable.innerHTML = tableHTML;
    }

    loadAppointmentsView() {
        const appointmentsTable = document.getElementById('appointmentsTable');
        if (!appointmentsTable) return;

        const tableHTML = `
            <thead>
                <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Fee</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${this.appointments.map(apt => `
                    <tr>
                        <td>${apt.patientName}</td>
                        <td>Dr. ${apt.doctorName}</td>
                        <td>${new Date(apt.date).toLocaleDateString()}</td>
                        <td>${apt.time}</td>
                        <td>
                            <span class="status-badge ${apt.status}">
                                ${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                        </td>
                        <td>₹${apt.consultationFee}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action view" onclick="adminManager.viewAppointment(${apt.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-action edit" onclick="adminManager.editAppointment(${apt.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        appointmentsTable.innerHTML = tableHTML;
    }

    loadHospitalsView() {
        const hospitalsGrid = document.getElementById('hospitalsGrid');
        if (!hospitalsGrid) return;

        hospitalsGrid.innerHTML = this.hospitals.map(hospital => `
            <div class="hospital-admin-card">
                <div class="hospital-header">
                    <h4>${hospital.name}</h4>
                    <span class="hospital-type ${hospital.type}">${hospital.type}</span>
                </div>
                <div class="hospital-details">
                    <p><i class="fas fa-map-marker-alt"></i> ${hospital.location}</p>
                    <p><i class="fas fa-phone"></i> ${hospital.phone}</p>
                    <p><i class="fas fa-bed"></i> ${hospital.beds} beds</p>
                    <p><i class="fas fa-star"></i> ${hospital.rating} (${hospital.reviews} reviews)</p>
                </div>
                <div class="hospital-actions">
                    <button class="btn btn-secondary" onclick="adminManager.editHospital(${hospital.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="adminManager.deleteHospital(${hospital.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadDoctorsView() {
        const doctorsGrid = document.getElementById('doctorsGrid');
        if (!doctorsGrid) return;

        doctorsGrid.innerHTML = this.doctors.map(doctor => `
            <div class="doctor-admin-card">
                <div class="doctor-header">
                    <img src="${doctor.image}" alt="${doctor.name}" onerror="this.src='assets/images/default-doctor.jpg'">
                    <div class="doctor-info">
                        <h4>Dr. ${doctor.name}</h4>
                        <p>${doctor.specialty}</p>
                        <p class="hospital-name">${doctor.hospital}</p>
                    </div>
                </div>
                <div class="doctor-stats">
                    <div class="stat">
                        <span class="stat-value">${doctor.experience}</span>
                        <span class="stat-label">Years</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${doctor.rating}</span>
                        <span class="stat-label">Rating</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">₹${doctor.consultationFee}</span>
                        <span class="stat-label">Fee</span>
                    </div>
                </div>
                <div class="doctor-actions">
                    <button class="btn btn-secondary" onclick="adminManager.editDoctor(${doctor.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="adminManager.deleteDoctor(${doctor.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadAnalytics() {
        // This would typically load charts and analytics data
        // For now, we'll just show placeholder content
        const analyticsContainer = document.getElementById('analyticsContainer');
        if (!analyticsContainer) return;

        analyticsContainer.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h4>User Growth</h4>
                    <div class="chart-placeholder">
                        <p>Chart showing user registration trends over time</p>
                    </div>
                </div>
                <div class="analytics-card">
                    <h4>Appointment Statistics</h4>
                    <div class="chart-placeholder">
                        <p>Chart showing appointment booking patterns</p>
                    </div>
                </div>
                <div class="analytics-card">
                    <h4>Revenue Trends</h4>
                    <div class="chart-placeholder">
                        <p>Chart showing revenue from consultations</p>
                    </div>
                </div>
                <div class="analytics-card">
                    <h4>Hospital Performance</h4>
                    <div class="chart-placeholder">
                        <p>Chart showing hospital utilization rates</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Action methods
    editUser(email) {
        const user = this.users.find(u => u.email === email);
        if (!user) return;

        // Implementation for editing user would go here
        this.showInfo(`Edit user functionality for ${user.name} would be implemented here`);
    }

    deleteUser(email) {
        if (confirm('Are you sure you want to delete this user?')) {
            // Implementation for deleting user would go here
            this.showInfo(`Delete user functionality would be implemented here`);
        }
    }

    approveRegistration(registrationId) {
        const registration = this.registrations.find(r => r.registrationId === registrationId);
        if (!registration) return;

        registration.status = 'approved';
        registration.approvedAt = new Date().toISOString();

        // Save back to localStorage
        this.saveRegistration(registration);
        
        this.showSuccess('Registration approved successfully');
        this.loadRegistrationsView();
    }

    rejectRegistration(registrationId) {
        if (confirm('Are you sure you want to reject this registration?')) {
            const registration = this.registrations.find(r => r.registrationId === registrationId);
            if (!registration) return;

            registration.status = 'rejected';
            registration.rejectedAt = new Date().toISOString();

            // Save back to localStorage
            this.saveRegistration(registration);
            
            this.showSuccess('Registration rejected');
            this.loadRegistrationsView();
        }
    }

    saveRegistration(registration) {
        // Find and update the registration in the user's data
        const userRegistrations = JSON.parse(localStorage.getItem(`registrations_${registration.userEmail}`) || '[]');
        const index = userRegistrations.findIndex(r => r.registrationId === registration.registrationId);
        
        if (index !== -1) {
            userRegistrations[index] = registration;
            localStorage.setItem(`registrations_${registration.userEmail}`, JSON.stringify(userRegistrations));
        }

        // Update local copy
        const localIndex = this.registrations.findIndex(r => r.registrationId === registration.registrationId);
        if (localIndex !== -1) {
            this.registrations[localIndex] = registration;
        }
    }

    viewRegistration(registrationId) {
        const registration = this.registrations.find(r => r.registrationId === registrationId);
        if (!registration) return;

        // Implementation for viewing registration details would go here
        this.showInfo(`View registration details for ${registration.registrationId}`);
    }

    viewAppointment(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (!appointment) return;

        // Implementation for viewing appointment details would go here
        this.showInfo(`View appointment details for ${appointment.patientName}`);
    }

    editAppointment(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (!appointment) return;

        // Implementation for editing appointment would go here
        this.showInfo(`Edit appointment functionality for ${appointment.patientName}`);
    }

    editHospital(hospitalId) {
        const hospital = this.hospitals.find(h => h.id === hospitalId);
        if (!hospital) return;

        this.showInfo(`Edit hospital functionality for ${hospital.name}`);
    }

    deleteHospital(hospitalId) {
        if (confirm('Are you sure you want to delete this hospital?')) {
            this.showInfo(`Delete hospital functionality would be implemented here`);
        }
    }

    editDoctor(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;

        this.showInfo(`Edit doctor functionality for Dr. ${doctor.name}`);
    }

    deleteDoctor(doctorId) {
        if (confirm('Are you sure you want to delete this doctor?')) {
            this.showInfo(`Delete doctor functionality would be implemented here`);
        }
    }

    filterTable(tableId, searchTerm) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(searchTerm);
            row.style.display = isVisible ? '' : 'none';
        });
    }

    refreshAllData() {
        this.loadUserData();
        this.loadRegistrations();
        this.loadAppointments();
        this.loadOverview();
        this.showSuccess('Data refreshed successfully');
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
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

// Initialize on page load
let adminManager;
document.addEventListener('DOMContentLoaded', () => {
    adminManager = new AdminManager();
    window.adminManager = adminManager;
});

// Add custom styles
const style = document.createElement('style');
style.textContent = `
    .admin-nav {
        display: flex;
        gap: 12px;
        margin-bottom: 30px;
        background: rgba(255, 255, 255, 0.05);
        padding: 8px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        flex-wrap: wrap;
    }
    
    .admin-nav-item {
        padding: 12px 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .admin-nav-item.active, .admin-nav-item:hover {
        background: var(--accent-color);
        color: white;
        transform: translateY(-1px);
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .stat-card {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        transition: all 0.3s ease;
    }
    
    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px var(--shadow);
    }
    
    .stat-icon {
        width: 60px;
        height: 60px;
        background: var(--accent-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        font-size: 24px;
        color: white;
    }
    
    .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-light);
        margin-bottom: 8px;
    }
    
    .stat-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .data-table {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        overflow: hidden;
    }
    
    .data-table table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .data-table th {
        background: rgba(255, 255, 255, 0.05);
        padding: 16px;
        text-align: left;
        color: var(--text-light);
        font-weight: 600;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .data-table td {
        padding: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.9);
    }
    
    .data-table tr:hover {
        background: rgba(255, 255, 255, 0.02);
    }
    
    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .user-avatar {
        width: 40px;
        height: 40px;
        background: var(--accent-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
    }
    
    .role-badge, .status-badge {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .role-badge.admin {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }
    
    .role-badge.user {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
    }
    
    .status-badge.active {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }
    
    .status-badge.pending {
        background: rgba(251, 191, 36, 0.2);
        color: #fbbf24;
    }
    
    .status-badge.approved {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }
    
    .status-badge.rejected {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }
    
    .status-badge.confirmed {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }
    
    .status-badge.cancelled {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }
    
    .action-buttons {
        display: flex;
        gap: 8px;
    }
    
    .btn-action {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        font-size: 12px;
    }
    
    .btn-action.edit {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
    }
    
    .btn-action.delete {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }
    
    .btn-action.view {
        background: rgba(107, 114, 128, 0.2);
        color: #9ca3af;
    }
    
    .btn-action.approve {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }
    
    .btn-action.reject {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }
    
    .btn-action:hover {
        transform: scale(1.1);
    }
    
    .reg-id {
        font-family: 'Courier New', monospace;
        background: rgba(255, 255, 255, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
    }
    
    .activity-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    
    .activity-icon.registration {
        background: var(--accent-color);
    }
    
    .activity-icon.appointment {
        background: var(--success-color);
    }
    
    .activity-content {
        flex: 1;
    }
    
    .activity-message {
        color: var(--text-light);
        margin-bottom: 4px;
    }
    
    .activity-time {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
    }
    
    .status-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }
    
    .status-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.8);
    }
    
    .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }
    
    .status-indicator.online {
        background: var(--success-color);
    }
    
    .status-indicator.warning {
        background: var(--warning-color);
    }
    
    .status-indicator.offline {
        background: var(--error-color);
    }
    
    .hospital-admin-card, .doctor-admin-card {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 20px;
        transition: all 0.3s ease;
    }
    
    .hospital-admin-card:hover, .doctor-admin-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px var(--shadow);
    }
    
    .hospital-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }
    
    .hospital-header h4 {
        color: var(--text-light);
        margin: 0;
    }
    
    .hospital-type {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .hospital-type.government {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }
    
    .hospital-type.private {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
    }
    
    .hospital-details p {
        color: rgba(255, 255, 255, 0.8);
        margin: 8px 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .doctor-header {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
    }
    
    .doctor-header img {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        object-fit: cover;
    }
    
    .doctor-info h4 {
        color: var(--text-light);
        margin: 0 0 4px 0;
    }
    
    .doctor-info p {
        color: rgba(255, 255, 255, 0.8);
        margin: 2px 0;
    }
    
    .hospital-name {
        color: var(--accent-color) !important;
    }
    
    .doctor-stats {
        display: flex;
        justify-content: space-around;
        margin: 16px 0;
    }
    
    .stat {
        text-align: center;
    }
    
    .stat-value {
        display: block;
        color: var(--text-light);
        font-weight: 600;
        font-size: 16px;
    }
    
    .stat-label {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
    }
    
    .hospital-actions, .doctor-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
    }
    
    .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }
    
    .analytics-card {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 24px;
    }
    
    .analytics-card h4 {
        color: var(--text-light);
        margin: 0 0 20px 0;
    }
    
    .chart-placeholder {
        height: 200px;
        background: rgba(255, 255, 255, 0.02);
        border: 2px dashed rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.5);
        text-align: center;
    }
`;
document.head.appendChild(style);