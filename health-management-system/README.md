# Health Management System

A modern, responsive web-based Health Management System with a beautiful glassmorphic design theme. This application provides comprehensive healthcare management features including patient registration, appointment booking, hospital and doctor listings, and administrative tools.

## 🌟 Features

### 🔐 Authentication System
- User login and registration
- Role-based access control (Admin, Patient, Doctor)
- Secure local storage for user sessions
- Remember me functionality

### 🏥 Hospital Management
- Comprehensive hospital listings (12+ hospitals)
- Detailed hospital information with ratings and reviews
- Search and filter functionality
- Hospital type categorization (Government/Private/Specialty)

### 👨‍⚕️ Doctor Directory
- Extensive doctor database (30+ specialists)
- Multiple medical specialties covered
- Doctor profiles with experience, qualifications, and ratings
- Specialty-based filtering and search

### 📅 Appointment System
- Category-based appointment booking (30+ categories)
- 5-step booking process with payment integration
- Appointment management (view, reschedule, cancel)
- Calendar integration for scheduling

### 👤 User Profile Management
- Profile sidebar with user information
- Profile picture upload functionality
- Health habits tracking (visible to medical staff only)
- Message center for appointment notifications

### 📊 Admin Dashboard
- Comprehensive statistics and analytics
- User and appointment management
- Feedback monitoring system
- System settings and configuration
- Report generation capabilities

### 💬 Feedback System
- Floating feedback box for user reviews
- Star rating system
- Real-time feedback collection
- Admin feedback management

### 🎨 Design Features
- **Glassmorphic UI**: Modern glass-effect design with blur and transparency
- **Navy/Cobalt Theme**: Professional dark blue color scheme
- **Responsive Layout**: Works perfectly on all devices
- **Smooth Animations**: Enhanced user experience with CSS animations
- **Modern Icons**: Font Awesome icons throughout the interface

## 🚀 Tech Stack

### Frontend
- **HTML5**: Semantic markup for better accessibility
- **CSS3**: Advanced styling with glassmorphism effects
- **JavaScript (ES6+)**: Modern JavaScript for dynamic functionality
- **Font Awesome**: Icon library for consistent iconography

### Backend (Simulated)
- **Local Storage**: Client-side data persistence
- **JSON Data Files**: Structured data for hospitals, doctors, and categories
- **Mock Payment System**: Simulated payment processing

## 📁 Project Structure

```
health-management-system/
├── index.html                 # Login/Registration page
├── dashboard.html             # Main dashboard
├── hospitals.html             # Hospital listings
├── doctors.html              # Doctor directory
├── appointments.html          # Appointment management
├── patient-registration.html  # Appointment booking flow
├── admin.html                # Admin dashboard
├── README.md                 # Project documentation
│
├── css/
│   └── styles.css            # Main stylesheet with glassmorphic design
│
├── js/
│   ├── auth.js               # Authentication functionality
│   ├── dashboard.js          # Dashboard logic
│   ├── sidebar.js            # Profile sidebar management
│   └── feedback.js           # Feedback system
│
├── data/
│   ├── hospitals.json        # Hospital data (12 hospitals)
│   ├── doctors.json          # Doctor data (30+ specialists)
│   └── categories.json       # Appointment categories (30 types)
│
├── images/                   # Image assets
│   ├── hospitals/            # Hospital images
│   ├── doctors/             # Doctor profile pictures
│   └── default-avatar.png    # Default profile picture
│
└── assets/                   # Additional assets
```

## 🛠️ Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional but recommended)

### Installation

1. **Clone or Download the Repository**
   ```bash
   git clone <repository-url>
   cd health-management-system
   ```

2. **Set Up a Local Server** (Recommended)
   
   **Option 1: Using Python**
   ```bash
   # For Python 3
   python -m http.server 8000
   
   # For Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option 2: Using Node.js**
   ```bash
   npx serve .
   ```
   
   **Option 3: Using Live Server (VS Code Extension)**
   - Install the Live Server extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:8000`
   - Or open `index.html` directly in your browser (some features may be limited)

## 👥 Demo Accounts

The application comes with pre-configured demo accounts:

### Admin Account
- **Email**: admin@hms.com
- **Password**: admin123
- **Access**: Full admin dashboard with system management

### Patient Account
- **Email**: john@example.com
- **Password**: patient123
- **Access**: Patient dashboard with appointment booking

### Doctor Account
- **Email**: dr.smith@hms.com
- **Password**: doctor123
- **Access**: Doctor-specific features

## 🎯 Key Features Walkthrough

### 1. User Authentication
- Clean login/registration interface with glassmorphic design
- Form validation and user feedback
- Secure session management

### 2. Dashboard Navigation
- Four main options: Hospitals, Doctors, Appointments, Admin (role-based)
- Quick statistics and recent activity
- Responsive card-based layout

### 3. Hospital & Doctor Discovery
- Advanced search and filtering
- Detailed profiles with ratings and reviews
- Contact information and specialties

### 4. Appointment Booking
- 5-step process: Category → Details → Schedule → Payment → Confirmation
- 30+ appointment categories including specialized consultations
- Integrated calendar with available time slots
- Mock payment processing

### 5. Profile Management
- Sliding sidebar with profile options
- Health habits tracking
- Message center for notifications
- Profile picture upload

### 6. Admin Dashboard
- Comprehensive system overview
- User and appointment management
- Feedback monitoring
- Statistical reports and analytics

## 🎨 Design Philosophy

### Glassmorphism
- Semi-transparent elements with backdrop blur effects
- Subtle borders and shadows for depth
- Modern, minimalistic aesthetic

### Color Scheme
- **Primary**: Navy Blue (#1e40af)
- **Secondary**: Cobalt Blue (#1e3a8a)
- **Accent**: Sky Blue (#3b82f6)
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- Clean, modern font stack (Segoe UI, system fonts)
- Proper hierarchy with varied font sizes
- Excellent readability with high contrast

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- **Desktop**: Full feature set with optimal layout
- **Tablet**: Adapted grid layouts and touch-friendly interface
- **Mobile**: Optimized navigation and compact layouts

## 🔒 Security Features

- Input validation and sanitization
- XSS protection measures
- Secure session management
- Role-based access control
- Password strength requirements

## 🚀 Future Enhancements

### Planned Features
- Real backend integration with RESTful APIs
- Database integration (MySQL/PostgreSQL)
- Email notifications for appointments
- SMS integration for reminders
- Telemedicine video consultation
- Prescription management system
- Medical records storage
- Insurance claim processing

### Technical Improvements
- Progressive Web App (PWA) capabilities
- Real-time notifications
- Advanced search with AI recommendations
- Multi-language support
- Dark/Light theme toggle
- Advanced reporting and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Tharun Raj M**
- Project developed as part of academic coursework
- Focused on modern web development practices and user experience

## 🙏 Acknowledgments

- Font Awesome for the comprehensive icon library
- Modern CSS techniques for glassmorphism effects
- Healthcare industry standards for appointment management workflows
- UX/UI best practices for healthcare applications

---

**Note**: This is an academic project designed to demonstrate modern web development skills including responsive design, JavaScript functionality, and user experience design. The payment processing and medical data are simulated for educational purposes.