const Transaction = require('../models/Transaction');
const Student = require('../models/Student');

// @desc    Record a fee payment
// @route   POST /api/transactions
// @access  Private/Admin
const addTransaction = async (req, res) => {
    const { studentId, amount, month, year, transactionId, status, paymentDate } = req.body;

    // Basic validation
    if (!studentId || !amount || !month || !year) {
        return res.status(400).json({ message: 'Please provide all required fields (studentId, amount, month, year)' });
    }

    try {
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student belongs to this admin
        if (student.admin && student.admin.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to add transaction for this student' });
        }

        const transaction = await Transaction.create({
            student: studentId,
            amount: Number(amount),
            month,
            year,
            transactionId: transactionId || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            status: status || 'Paid',
            paymentDate: paymentDate || Date.now()
        });

        // Update student fee status only if Paid
        if ((status || 'Paid') === 'Paid') {
            student.totalPaid += Number(amount);
            student.pendingFee = Math.max(0, student.pendingFee - Number(amount));
            await student.save();
        }

        res.status(201).json(transaction);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Student ID format' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
    const { studentId } = req.query;
    try {
        console.log('🔍 Fetching transactions for admin:', req.user._id);
        let filter = {};

        // Find all students belonging to this admin
        const myStudents = await Student.find({ admin: req.user._id }).select('_id');
        const myStudentIds = myStudents.map(s => s._id);

        if (studentId) {
            // If checking specific student, ensure they belong to this admin
            if (!myStudentIds.some(id => id.toString() === studentId)) {
                return res.status(401).json({ message: 'Not authorized for this student' });
            }
            filter = { student: studentId };
        } else {
            // Show all transactions for my students
            filter = { student: { $in: myStudentIds } };
        }

        const transactions = await Transaction.find(filter).populate('student', 'name rollNo class mobile');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's own transactions
// @route   GET /api/transactions/my
// @access  Private
const getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ student: req.user._id });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get transactions by month and year
// @route   GET /api/transactions/monthly
// @access  Private/Admin
const getMonthlyTransactions = async (req, res) => {
    const { month, year } = req.query;
    try {
        // Find all students belonging to this admin
        const myStudents = await Student.find({ admin: req.user._id }).select('_id');
        const myStudentIds = myStudents.map(s => s._id);

        const transactions = await Transaction.find({
            month,
            year,
            student: { $in: myStudentIds } // Filter by my students
        })
            .populate('student', 'name rollNo class mobile');

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record a fee payment (Student Self)
// @route   POST /api/transactions/pay
// @access  Private
const studentSelfPayment = async (req, res) => {
    const { amount, month, year, transactionId } = req.body;
    const studentId = req.user._id;

    if (!amount || !month || !year) {
        return res.status(400).json({ message: 'Please provide amount, month, and year' });
    }

    try {
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const transaction = await Transaction.create({
            student: studentId,
            amount: Number(amount),
            month,
            year,
            transactionId: transactionId || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            status: 'Paid'
        });

        // Update student fee status
        student.totalPaid += Number(amount);
        student.pendingFee = Math.max(0, student.pendingFee - Number(amount));
        await student.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private/Admin
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Reverse student fee status only if it was 'Paid'
        if (transaction.status === 'Paid') {
            const student = await Student.findById(transaction.student);

            // Check authorization
            if (student) {
                if (student.admin && student.admin.toString() !== req.user._id.toString()) {
                    return res.status(401).json({ message: 'Not authorized to delete this transaction' });
                }

                student.totalPaid -= transaction.amount;
                student.pendingFee += transaction.amount;
                await student.save();
            }
        }

        await transaction.deleteOne();

        res.json({ message: 'Transaction removed and student records updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private/Admin
const updateTransaction = async (req, res) => {
    try {
        const { amount, status, month, year, paymentDate, transactionId } = req.body;
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const student = await Student.findById(transaction.student);
        if (!student) {
            return res.status(404).json({ message: 'Associated student not found' });
        }

        // Check authorization
        if (student.admin && student.admin.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to edit this transaction' });
        }

        // Calculate differences to update student stats
        let amountDiff = 0;
        let wasPaid = transaction.status === 'Paid';
        let isPaid = (status || transaction.status) === 'Paid';

        let oldAmount = transaction.amount;
        let newAmount = amount ? Number(amount) : oldAmount;

        // Logic for updating student totals
        // Case 1: Paid -> Paid (Amount changed)
        if (wasPaid && isPaid) {
            amountDiff = newAmount - oldAmount;
        }
        // Case 2: Paid -> Not Paid
        else if (wasPaid && !isPaid) {
            amountDiff = -oldAmount;
        }
        // Case 3: Not Paid -> Paid
        else if (!wasPaid && isPaid) {
            amountDiff = newAmount;
        }

        // Update transaction
        if (amount !== undefined) transaction.amount = newAmount;
        if (status !== undefined) transaction.status = status;
        if (month !== undefined) transaction.month = month;
        if (year !== undefined) transaction.year = year;
        if (paymentDate !== undefined) transaction.paymentDate = paymentDate;
        if (transactionId !== undefined) transaction.transactionId = transactionId;

        await transaction.save();

        // Update student record if amount changed
        if (amountDiff !== 0) {
            student.totalPaid += amountDiff;
            student.pendingFee -= amountDiff;
            await student.save();
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addTransaction,
    getTransactions,
    getMyTransactions,
    getMonthlyTransactions,
    studentSelfPayment,
    deleteTransaction,
    updateTransaction
};
