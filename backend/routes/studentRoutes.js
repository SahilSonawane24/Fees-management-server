const express = require('express');
const router = express.Router();
const { loginStudent, getStudentProfile } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginStudent);
router.get('/profile', protect, getStudentProfile);

module.exports = router;
