const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Unpaid'],
        default: 'Paid'
    },
    collector: {
        type: String,
        default: 'Admin'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
