const mongoose = require('mongoose');

const schoolSchema = mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin'
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ''
    },
    contact: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Helper to ensure school names are unique per admin
schoolSchema.index({ admin: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('School', schoolSchema);
