import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Pages
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import AdminDashboard from './pages/AdminDashboard';
import AddStudent from './pages/AddStudent';
import StudentList from './pages/StudentList';
import Schools from './pages/Schools';
import CollectFee from './pages/CollectFee';
import YearlyReport from './pages/YearlyReport';
import StudentDashboard from './pages/StudentDashboard';
import StudentMonthlyHistory from './pages/StudentMonthlyHistory';
import StudentPayment from './pages/StudentPayment';
import AIAnalytics from './pages/AIAnalytics';
import EditProfile from './pages/EditProfile';
import ViewProfile from './pages/ViewProfile';
import AdminMonthlyCollection from './pages/AdminMonthlyCollection';
import PendingFees from './pages/PendingFees';

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated, redirectTo = "/" }) {
  return isAuthenticated ? children : <Navigate to={redirectTo} />;
}

function App() {
  const [adminAuth, setAdminAuth] = useState(() => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    return userInfo?.role === 'admin';
  });
  const [studentAuth, setStudentAuth] = useState(() => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    return userInfo?.role === 'student';
  });

  const [currentStudent, setCurrentStudent] = useState(() => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    return userInfo?.role === 'student' ? userInfo : null;
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    return userInfo?.role === 'admin' ? userInfo : null;
  });

  const handleAdminLogin = (adminData) => {
    setAdminAuth(true);
    setCurrentAdmin(adminData);
  };

  const handleAdminUpdate = (updatedData) => {
    const newData = { ...currentAdmin, ...updatedData };
    setCurrentAdmin(newData);
    sessionStorage.setItem('userInfo', JSON.stringify(newData));
  };

  const handleStudentLogin = (studentData) => {
    setStudentAuth(true);
    setCurrentStudent(studentData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userInfo');
    setAdminAuth(false);
    setStudentAuth(false);
    setCurrentStudent(null);
    setCurrentAdmin(null);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/admin/login"
          element={<AdminLogin onLogin={handleAdminLogin} />}
        />
        <Route
          path="/student/login"
          element={<StudentLogin onLogin={handleStudentLogin} />}
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/monthly-collection"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <AdminMonthlyCollection onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-student"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <AddStudent onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <StudentList onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schools"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <Schools onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/collect-fee"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <CollectFee onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/yearly-report"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <YearlyReport onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ai-analytics"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <AIAnalytics onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pending-fees"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <PendingFees onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        {/* Student Protected Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute isAuthenticated={studentAuth} redirectTo="/student/login">
              <StudentDashboard student={currentStudent} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/monthly-history"
          element={
            <ProtectedRoute isAuthenticated={studentAuth} redirectTo="/student/login">
              <StudentMonthlyHistory student={currentStudent} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/yearly-report"
          element={
            <ProtectedRoute isAuthenticated={studentAuth} redirectTo="/student/login">
              <YearlyReport student={currentStudent} onLogout={handleLogout} isStudent={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/payment"
          element={
            <ProtectedRoute isAuthenticated={studentAuth} redirectTo="/student/login">
              <StudentPayment student={currentStudent} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/view-profile"
          element={
            <ProtectedRoute isAuthenticated={studentAuth} redirectTo="/student/login">
              <ViewProfile user={currentStudent} onLogout={handleLogout} isStudent={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/view-profile"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <ViewProfile user={currentAdmin} onLogout={handleLogout} isStudent={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/edit-profile"
          element={
            <ProtectedRoute isAuthenticated={studentAuth} redirectTo="/student/login">
              <EditProfile user={currentStudent} onLogout={handleLogout} isStudent={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit-profile"
          element={
            <ProtectedRoute isAuthenticated={adminAuth} redirectTo="/admin/login">
              <EditProfile user={currentAdmin} onUpdate={handleAdminUpdate} onLogout={handleLogout} isStudent={false} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
