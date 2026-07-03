const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

    if (!mongoUri || typeof mongoUri !== 'string' || !mongoUri.trim()) {
        console.error('Fatal: No MongoDB connection string found. Set MONGODB_URI, MONGO_URI, or DATABASE_URL in your environment.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxIdleTimeMS: 60000,
            retryWrites: true,
            w: 'majority'
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
