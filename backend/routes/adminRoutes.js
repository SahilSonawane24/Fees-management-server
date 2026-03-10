const express = require('express');
const router = express.Router();
const {
    loginAdmin,
    getDashboardStats,
    addStudent,
    getAllStudents,
    deleteStudent,
    deleteSchool,
    getProfile,
    updateProfile,
    addSchool,
    getSchools,
    updateStudent
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/stats', protect, adminOnly, getDashboardStats);
router.post('/students', protect, adminOnly, addStudent);
router.get('/students', protect, adminOnly, getAllStudents);
router.put('/students/:id', protect, adminOnly, updateStudent);
router.delete('/students/:id', protect, adminOnly, deleteStudent);

// School Routes
router.post('/schools', protect, adminOnly, addSchool);
router.get('/schools', protect, adminOnly, getSchools);
router.delete('/schools/:schoolName', protect, adminOnly, deleteSchool);

router.get('/profile', protect, adminOnly, getProfile);
router.put('/profile', protect, adminOnly, updateProfile);

module.exports = router;
