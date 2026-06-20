# 🎓 Fees Management System (v2.1.0)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB.svg)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933.svg)](https://nodejs.org)

A high-performance, professional-grade Fees Management Solution designed for modern educational institutions. This comprehensive MERN stack application provides seamless management of students, school-wise data isolation, automated fee tracking, and AI-powered financial insights.

---

## 📸 Dashboard Preview
*(Insert your application screenshots here to showcase the premium UI)*

---

## 🔥 Key Features

### 🏢 Institutional Management
*   **Multi-School Architecture**: Centralized management with robust data isolation. Admins manage their specific school data without cross-exposure.
*   **Intelligent Filtering**: Real-time filtering by school, class (1st to 10th Std), and student status.
*   **Standardized Standards**: Pre-configured for primary and secondary education systems.

### 💳 Financial Operations
*   **Advanced Fee Ledger**: Record, track, and manage monthly fee collections with ease.
*   **Total Amount Visibility**: Newly implemented "Total Amount" columns in reports offer a 360-degree view of student financial status.
*   **Hybrid Payment Entry**: Supports both Admin-recorded payments and Student self-payment portals.
*   **Pending Fee Tracking**: Dedicated module to track outstanding balances and aging receivables.

### 📊 Professional Reporting
*   **Yearly Collection Grid**: A matrix-style report showing monthly payment statuses for all students across the academic year.
*   **High-Fidelity PDF Export**: Professional, school-branded PDF reports for monthly and yearly collections, ready for printing or storage.
*   **AI-Powered Analytics**: Predictive trends and financial health visualizations powered by Recharts.

### 📱 Communication & Security
*   **SMS Reminders**: One-click SMS alerts for students with outstanding balances.
*   **Digital Identity**: QR code generation for every student profile for quick identification.
*   **Enterprise Security**: JWT-based authentication, role-based access control (RBAC), and Bcrypt password encryption.
*   **Multilingual Interface**: Full support for **English, Hindi, and Marathi** to serve diverse regional requirements.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, React Router 6, Axios, Vite, Lucide Icons |
| **Financial Viz** | Recharts (Financial trends & analytics) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Security** | JWT, Bcrypt.js, CORS |
| **Reporting** | jsPDF, jspdf-autotable (PDF generation) |
| **Misc** | Multer (File uploads), QRCode.react |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.0+)
- MongoDB (Local instance or Atlas Cluster)
- NPM or Yarn

### 1. Repository Setup
```bash
git clone https://github.com/SahilSonawane24/fees-Management-system.git
cd fees-Management-system
```

### 2. Backend Configuration
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://your_connection_string
JWT_SECRET=your_robust_jwt_secret_key
NODE_ENV=development
```
**Seed the database (Optional):**
```bash
npm run data:import
```
**Launch Development Server:**
```bash
npm run dev
```

### 3. Frontend Configuration
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
**Launch Development Server:**
```bash
npm run dev
```

---

## 📂 Architecture Overview

```text
├── backend/
│   ├── config/          # DB & Server configurations
│   ├── controllers/     # Business logic (Admin, Student, Transaction)
│   ├── middleware/      # Auth & Error handling
│   ├── models/          # Mongoose Schema definitions
│   └── routes/          # RESTful API endpoints
└── frontend/
    ├── src/
    │   ├── context/     # Language & Auth Providers
    │   ├── pages/       # View components (Admin/Student Dashboards)
    │   ├── components/  # Atomic UI elements
    │   └── utils/       # API wrapper & Helper functions
```

---

## 📊 Default Access (Dev Environment)

| Role | Identifier | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin` | `admin123` |
| **Demo Student** | `9876543210` | `password123` |

---

## ✅ Deployment Checklist
For production deployment, ensure the following are configured:
- [ ] Connect to **MongoDB Atlas** for persistent storage.
- [ ] Set `NODE_ENV` to `production`.
- [ ] Implement **Rate Limiting** for API endpoints.
- [ ] Use **HTTPS/SSL** for all traffic.
- [ ] Configure **CORS** to allow only your production domain.

---

## 📈 Roadmap & Future Enhancements
- [x] Multilingual Support (English, Hindi, Marathi)
- [x] Professional PDF Report Generation
- [x] Total Amount Calculation System
- [ ] WhatsApp Integration for automated fee alerts.
- [ ] Bulk Student Import via Excel/CSV.
- [ ] Integrated Payment Gateway (Razorpay/Stripe).
- [ ] Parent Communication Portal.

---

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the **ISC License**. See `LICENSE` for more information.

## 👨‍💻 Author
**Er. Sahil Sonawane**
*Software Developer & System Architect*
- LinkedIn: [Your Profile](www.linkedin.com/in/sahil-sonawane-827359315)
- Portfolio: [Your Website](https://yourportfolio.com)

---
Developed with ❤️ by Er. Sahil Sonawane
