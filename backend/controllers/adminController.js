const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Transaction = require('../models/Transaction');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            _id: admin._id,
            name: admin.name,
            username: admin.username,
            token: generateToken(admin._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        console.log('📊 Calculating admin dashboard stats for admin:', req.user._id);

        // Only count THIS admin's students
        const totalStudents = await Student.countDocuments({ admin: req.user._id });
        console.log('👥 Total students for this admin:', totalStudents);

        // Only get transactions for THIS admin's students
        const myStudents = await Student.find({ admin: req.user._id }).select('_id');
        const studentIds = myStudents.map(s => s._id);

        const transactions = await Transaction.find({
            student: { $in: studentIds },
            status: 'Paid'
        });
        const totalCollected = transactions.reduce((sum, t) => sum + t.amount, 0);
        console.log('💰 Total collected for this admin:', totalCollected);

        const students = await Student.find({ admin: req.user._id });
        const pendingFees = students.reduce((sum, s) => sum + s.pendingFee, 0);
        console.log('⚠️ Pending fees for this admin:', pendingFees);

        // This month's collection for THIS admin only
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthTransactions = await Transaction.find({
            student: { $in: studentIds },
            status: 'Paid',
            paymentDate: { $gte: startOfMonth }
        });
        const thisMonth = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
        console.log('📅 This month collection for this admin:', thisMonth);

        const stats = {
            totalStudents,
            totalCollected,
            pendingFees,
            thisMonth
        };

        console.log('✅ Stats calculated successfully for admin:', req.user.username);
        res.json(stats);
    } catch (error) {
        console.error('❌ Error calculating stats:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new student
// @route   POST /api/admin/students
// @access  Private/Admin
const addStudent = async (req, res) => {
    const { name, rollNo, class: studentClass, mobile, password, pendingFee, schoolName: requestSchoolName } = req.body;

    // Check if rollNo or mobile already exists
    const studentExists = await Student.findOne({
        $or: [{ rollNo }, { mobile }]
    });

    if (studentExists) {
        if (studentExists.rollNo === rollNo) {
            return res.status(400).json({ message: 'Student with this roll number already exists' });
        }
        if (studentExists.mobile === mobile) {
            return res.status(400).json({ message: 'Student with this mobile number already exists' });
        }
    }

    // Use provided schoolName or fall back to admin's schoolName
    let schoolName = requestSchoolName;
    if (!schoolName) {
        const admin = await Admin.findById(req.user._id);
        schoolName = admin.schoolName || 'Default School';
    }

    const student = await Student.create({
        admin: req.user._id,
        name,
        rollNo,
        class: studentClass,
        schoolName,
        mobile,
        password: password || mobile, // Default password to mobile number
        pendingFee: pendingFee || 0
    });

    if (student) {
        res.status(201).json({
            _id: student._id,
            name: student.name,
            rollNo: student.rollNo,
            class: student.class,
            schoolName: student.schoolName
        });
    } else {
        res.status(400).json({ message: 'Invalid student data' });
    }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getAllStudents = async (req, res) => {
    try {
        console.log('🔍 Fetching all students for admin:', req.user._id);
        const students = await Student.find({ admin: req.user._id }).sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.admin && student.admin.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this student' });
        }

        const { name, rollNo, class: studentClass, mobile, schoolName, pendingFee, password } = req.body;

        // Check for duplicate rollNo (exclude current student)
        if (rollNo && rollNo !== student.rollNo) {
            const rollExists = await Student.findOne({ rollNo, _id: { $ne: student._id } });
            if (rollExists) return res.status(400).json({ message: 'Roll number already taken' });
        }
        // Check for duplicate mobile (exclude current student)
        if (mobile && mobile !== student.mobile) {
            const mobileExists = await Student.findOne({ mobile, _id: { $ne: student._id } });
            if (mobileExists) return res.status(400).json({ message: 'Mobile number already taken' });
        }

        if (password && password.trim() !== '') {
            // Password is changing — use save() so the pre-save hook hashes it
            student.name = name || student.name;
            student.rollNo = rollNo || student.rollNo;
            student.class = studentClass || student.class;
            student.mobile = mobile || student.mobile;
            student.schoolName = schoolName || student.schoolName;
            student.pendingFee = pendingFee !== undefined ? pendingFee : student.pendingFee;
            student.password = password;
            const updatedStudent = await student.save();
            return res.json(updatedStudent);
        }

        // No password change — use findByIdAndUpdate to skip pre-save hook entirely
        const updateFields = {};
        if (name) updateFields.name = name;
        if (rollNo) updateFields.rollNo = rollNo;
        if (studentClass) updateFields.class = studentClass;
        if (mobile) updateFields.mobile = mobile;
        if (schoolName) updateFields.schoolName = schoolName;
        if (pendingFee !== undefined) updateFields.pendingFee = pendingFee;

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: false }
        );

        res.json(updatedStudent);
    } catch (error) {
        console.error('\u274c Error updating student:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student belongs to admin
        if (student.admin && student.admin.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this student' });
        }

        // Delete associated transactions
        await Transaction.deleteMany({ student: student._id });

        // Delete the student
        await student.deleteOne();

        res.json({ message: 'Student and associated transactions removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getProfile = async (req, res) => {
    const admin = await Admin.findById(req.user._id);
    if (admin) {
        res.json({
            _id: admin._id,
            name: admin.name,
            username: admin.username
        });
    } else {
        res.status(404).json({ message: 'Admin not found' });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
const updateProfile = async (req, res) => {
    const admin = await Admin.findById(req.user._id);

    if (admin) {
        admin.name = req.body.name || admin.name;
        admin.username = req.body.username || admin.username;

        if (req.body.password) {
            admin.password = req.body.password;
        }

        const updatedAdmin = await admin.save();

        res.json({
            _id: updatedAdmin._id,
            name: updatedAdmin.name,
            username: updatedAdmin.username,
            token: generateToken(updatedAdmin._id)
        });
    } else {
        res.status(404).json({ message: 'Admin not found' });
    }
};

const School = require('../models/School');



// @desc    Add new school
// @route   POST /api/admin/schools
// @access  Private/Admin
const addSchool = async (req, res) => {
    const { name, address, contact } = req.body;

    try {
        const schoolExists = await School.findOne({
            admin: req.user._id,
            name: { $regex: new RegExp(`^${name}$`, 'i') } // Case insensitive check
        });

        if (schoolExists) {
            return res.status(400).json({ message: 'School with this name already exists' });
        }

        const school = await School.create({
            admin: req.user._id,
            name,
            address,
            contact
        });

        res.status(201).json(school);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all schools with stats
// @route   GET /api/admin/schools
// @access  Private/Admin
const getSchools = async (req, res) => {
    try {
        // 1. Get explicitly created schools
        const createdSchools = await School.find({ admin: req.user._id }).lean();

        // 2. Get all students to calculate stats and find implicit schools
        const students = await Student.find({ admin: req.user._id }).lean();

        // 3. Create a map of schools
        const schoolMap = {};

        // Initialize from created schools
        createdSchools.forEach(school => {
            schoolMap[school.name] = {
                _id: school._id,
                name: school.name,
                address: school.address,
                contact: school.contact,
                studentCount: 0,
                pendingFees: 0,
                totalCollected: 0,
                isExplicit: true
            };
        });

        // Add stats from students (and add implicit schools if missing)
        students.forEach(student => {
            const schoolName = student.schoolName || 'Unknown School';

            if (!schoolMap[schoolName]) {
                schoolMap[schoolName] = {
                    name: schoolName,
                    address: '',
                    contact: '',
                    studentCount: 0,
                    pendingFees: 0,
                    totalCollected: 0,
                    isExplicit: false
                };
            }

            schoolMap[schoolName].studentCount++;
            schoolMap[schoolName].pendingFees += student.pendingFee || 0;
            schoolMap[schoolName].totalCollected += student.totalPaid || 0;
        });

        const schoolsArray = Object.values(schoolMap);
        res.json(schoolsArray);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete all students of a school
// @route   DELETE /api/admin/schools/:schoolName
// @access  Private/Admin
const deleteSchool = async (req, res) => {
    try {
        const schoolName = req.params.schoolName;

        const adminId = req.user._id;

        // Find all students of this school belonging to this admin
        const students = await Student.find({
            admin: adminId,
            schoolName: schoolName
        });

        // Get student IDs
        const studentIds = students.map(s => s._id);

        // Delete all transactions for these students
        if (studentIds.length > 0) {
            await Transaction.deleteMany({ student: { $in: studentIds } });
        }

        // Delete all students
        if (studentIds.length > 0) {
            await Student.deleteMany({
                admin: adminId,
                schoolName: schoolName
            });
        }

        // Also delete the School document if it exists
        await School.deleteOne({
            admin: adminId,
            name: { $regex: new RegExp(`^${schoolName}$`, 'i') }
        });

        res.json({ message: `School '${schoolName}' deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    loginAdmin,
    getDashboardStats,
    addStudent,
    getAllStudents,
    deleteStudent,
    updateStudent,
    addSchool,
    getSchools,
    deleteSchool,
    getProfile,
    updateProfile
};
