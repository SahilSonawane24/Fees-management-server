const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Auth student & get token
// @route   POST /api/students/login
// @access  Public
const loginStudent = async (req, res) => {
    const { userId, password } = req.body; // userId can be rollNo or mobile

    const student = await Student.findOne({
        $or: [{ rollNo: userId }, { mobile: userId }]
    });

    if (student && (await student.matchPassword(password))) {
        res.json({
            _id: student._id,
            name: student.name,
            rollNo: student.rollNo,
            mobile: student.mobile,
            class: student.class,
            schoolName: student.schoolName,
            pendingFee: student.pendingFee,
            totalPaid: student.totalPaid,
            token: generateToken(student._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private
const getStudentProfile = async (req, res) => {
    const student = await Student.findById(req.user._id);

    if (student) {
        res.json({
            _id: student._id,
            name: student.name,
            rollNo: student.rollNo,
            class: student.class,
            schoolName: student.schoolName,
            mobile: student.mobile,
            pendingFee: student.pendingFee,
            totalPaid: student.totalPaid,
            qrImage: student.qrImage,
            profileImage: student.profileImage
        });
    } else {
        res.status(404).json({ message: 'Student not found' });
    }
};

module.exports = {
    loginStudent,
    getStudentProfile
};
