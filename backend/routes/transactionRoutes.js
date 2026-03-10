const express = require('express');
const router = express.Router();
const { addTransaction, getTransactions, getMyTransactions, getMonthlyTransactions, studentSelfPayment, deleteTransaction, updateTransaction } = require('../controllers/transactionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, adminOnly, addTransaction)
    .get(protect, adminOnly, getTransactions);

router.route('/:id')
    .delete(protect, adminOnly, deleteTransaction)
    .put(protect, adminOnly, updateTransaction);

router.get('/my', protect, getMyTransactions);
router.get('/monthly', protect, adminOnly, getMonthlyTransactions);
router.post('/pay', protect, studentSelfPayment);

module.exports = router;
