const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Transaction = require('./models/Transaction');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedMultiUser = async () => {
    try {
        // Clear everything
        await Admin.deleteMany();
        await Student.deleteMany();
        await Transaction.deleteMany();
        console.log('🧹 Database cleared.');

        // Create Admin 1
        const admin1 = await Admin.create({
            username: 'admin1',
            name: 'Admin One',
            schoolName: 'Sunrise Public School',
            password: 'password123'
        });
        console.log('✅ Created Admin 1: admin1 / password123 (Sunrise Public School)');

        // Create Admin 2
        const admin2 = await Admin.create({
            username: 'admin2',
            name: 'Admin Two',
            schoolName: 'Rainbow International School',
            password: 'password123'
        });
        console.log('✅ Created Admin 2: admin2 / password123 (Rainbow International School)');

        // Add students for Admin 1
        const student1 = await Student.create({
            admin: admin1._id,
            name: 'Rahul Sharma',
            rollNo: 'A1-001',
            class: '10th Std',
            schoolName: admin1.schoolName,
            mobile: '9999911111',
            password: 'password123',
            pendingFee: 5000,
            totalPaid: 15000
        });
        console.log('   👤 Added student for Admin 1: Rahul');

        // Add students for Admin 2
        const student2 = await Student.create({
            admin: admin2._id,
            name: 'Priya Patel',
            rollNo: 'A2-001',
            class: '9th Std',
            schoolName: admin2.schoolName,
            mobile: '9999922222',
            password: 'password123',
            pendingFee: 2000,
            totalPaid: 20000
        });
        const student3 = await Student.create({
            admin: admin2._id,
            name: 'Amit Kumar',
            rollNo: 'A2-002',
            class: '8th Std',
            schoolName: admin2.schoolName,
            mobile: '9999933333',
            password: 'password123',
            pendingFee: 0,
            totalPaid: 25000
        });
        console.log('   👤 Added students for Admin 2: Priya, Amit');

        console.log('\n🎉 Setup Complete! You can now login with different admins and see different data.');
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedMultiUser();
