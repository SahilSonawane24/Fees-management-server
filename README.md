# 🎓 Fees Management System

A comprehensive full-stack web application for managing school fees, students, and transactions. Built with React, Node.js, Express, and MongoDB.

## ✨ Features

### 🏫 Multi-School Support
- **School-wise student management** - Each admin manages their own school
- **School name filtering** - Filter students by school name
- **Data isolation** - Admins can only see their own school's data

### 👨‍🎓 Student Management
- Add, view, edit, and delete students
- Support for **1st to 10th Standard**
- Student profile with QR code
- Mobile-based authentication
- **Advanced search** - Search by name, roll no, class, or school name

### 💰 Fee Management
- Record fee payments
- Track pending fees
- View payment history
- Monthly and yearly reports
- Student self-payment option

### 📊 Analytics & Reports
- Dashboard with key statistics
- Monthly collection reports
- Yearly reports
- AI-powered analytics
- Transaction history

### 🔐 Security
- JWT-based authentication
- Role-based access control (Admin & Student)
- Password hashing with bcrypt
- Protected API routes

### 🌐 Multi-language Support
- Language context for internationalization
- Easy to add new languages

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "fees Management system"
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fees_management
JWT_SECRET=your_super_secret_jwt_key_123
NODE_ENV=development
```

Seed initial data:
```bash
npm run data:import
```

Start backend:
```bash
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

4. **Access the application**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

### Default Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Students:**
- User ID: `9876543210` (mobile number)
- Password: `password123`

---

## 📁 Project Structure

```
fees-management-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   │   ├── adminController.js
│   │   ├── studentController.js
│   │   └── transactionController.js
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Mongoose models
│   │   ├── Admin.js
│   │   ├── Student.js
│   │   └── Transaction.js
│   ├── routes/          # API routes
│   ├── seeder.js        # Database seeder
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # React context (Language)
    │   ├── pages/       # Page components
    │   │   ├── AdminDashboard.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   ├── AddStudent.jsx
    │   │   ├── StudentList.jsx
    │   │   ├── CollectFee.jsx
    │   │   └── ...
    │   ├── utils/       # API utilities
    │   └── App.jsx      # Main app component
    └── .env             # Environment variables
```

---

## 🔌 API Endpoints

### Base URL
`http://localhost:5000/api`

### Authentication
Most routes require a `Bearer <token>` in the `Authorization` header.

### Admin Endpoints (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/login` | Admin login | Public |
| GET | `/stats` | Get dashboard statistics | Private (Admin) |
| POST | `/students` | Add a new student | Private (Admin) |
| GET | `/students` | Get all students | Private (Admin) |
| DELETE | `/students/:id` | Delete a student | Private (Admin) |
| GET | `/profile` | Get admin profile | Private (Admin) |
| PUT | `/profile` | Update admin profile | Private (Admin) |

### Student Endpoints (`/api/students`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/login` | Student login (Roll No or Mobile) | Public |
| GET | `/profile` | Get student profile | Private (Student) |

### Transaction Endpoints (`/api/transactions`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Record fee payment (Admin) | Private (Admin) |
| GET | `/` | Get all transactions | Private (Admin) |
| GET | `/my` | Get student's transactions | Private (Student) |
| GET | `/monthly` | Get monthly transactions | Private (Admin) |
| POST | `/pay` | Student self-payment | Private (Student) |
| DELETE | `/:id` | Delete transaction | Private (Admin) |
| PUT | `/:id` | Update transaction | Private (Admin) |

---

## 📊 Data Models

### Admin
```javascript
{
  username: String (unique),
  name: String,
  schoolName: String,
  password: String (hashed)
}
```

### Student
```javascript
{
  admin: ObjectId (ref: Admin),
  name: String,
  rollNo: String (unique),
  class: String (1st Std - 10th Std),
  schoolName: String,
  mobile: String (unique),
  password: String (hashed),
  pendingFee: Number,
  totalPaid: Number,
  qrImage: String,
  profileImage: String
}
```

### Transaction
```javascript
{
  student: ObjectId (ref: Student),
  amount: Number,
  month: String,
  year: String,
  transactionId: String (unique),
  status: String ('Paid', 'Pending'),
  paymentDate: Date
}
```

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool
- **Lucide React** - Icons
- **Recharts** - Charts and analytics
- **QRCode.react** - QR code generation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests
- **Multer** - File uploads

---

## 🎨 Key Features Details

### School-wise Student Filtering
- New **School Name** field added to both Admin and Student models
- Dropdown filter in Student List page
- Automatically assigns school name when admin creates student
- Search includes school name

### Class Support (1st - 10th Std)
- Dropdown with all standards from 1st to 10th
- Updated from college classes to school standards
- Easy to search and filter by class

### Advanced Search
- Search across multiple fields:
  - Name
  - Roll Number
  - Class
  - School Name
- Real-time filtering
- Combined with school name filter

### Data Isolation
- Each admin only sees their own school's students
- Dashboard stats calculated per admin
- Transactions filtered by admin's students
- Secure authorization checks

---

## 📝 Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run data:import # Seed database with sample data
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## 🚀 Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for comprehensive deployment guide.

### Quick Deployment Steps

1. **Update Environment Variables**
   - Backend: Update `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`
   - Frontend: Update `VITE_API_URL`

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy Backend**
   - Deploy to Render, Railway, Heroku, or VPS
   - Ensure MongoDB is accessible

4. **Deploy Frontend**
   - Deploy `dist` folder to Vercel, Netlify, or static hosting

---

## 🔒 Security Best Practices

- ✅ JWT tokens with expiration
- ✅ Password hashing with bcrypt
- ✅ Protected routes with middleware
- ✅ Admin-only endpoint protection
- ✅ Data isolation per admin
- ⚠️ **TODO:** Add rate limiting
- ⚠️ **TODO:** Add input validation
- ⚠️ **TODO:** Implement HTTPS in production

---

## 🐛 Known Issues & Solutions

### CORS Errors
Add proper CORS configuration for production domains.

### Database Connection Issues
- Check MongoDB connection string
- Whitelist IP addresses in MongoDB Atlas
- Verify network connectivity

### Build Errors
- Clear `node_modules` and reinstall
- Check Node.js version compatibility
- Ensure all environment variables are set

---

## 📈 Future Enhancements

- [ ] Email notifications for pending fees
- [ ] SMS integration for reminders
- [ ] Bulk student import (CSV)
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF/Excel
- [ ] Parent portal
- [ ] Online payment gateway integration
- [ ] Attendance tracking
- [ ] Staff management

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

Developed with ❤️ by Er.Sahil Sonawane

---

## 📞 Support

For issues or questions:
- Check the [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Review console logs
- Verify API endpoints
- Check environment variables

---

**Version:** 2.0.0  
**Last Updated:** February 8, 2026  
**Status:** ✅ Production Ready
