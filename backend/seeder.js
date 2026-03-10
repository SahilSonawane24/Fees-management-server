const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Transaction = require('./models/Transaction');
const School = require('./models/School');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const seedData = async () => {
    try {
        // Clear existing data
        await Admin.deleteMany();
        await Student.deleteMany();
        await Transaction.deleteMany();
        await School.deleteMany(); // Added School deleteMany

        // Create Admin
        const admin = await Admin.create({
            username: 'Sahil',
            name: 'Admin User',
            schoolName: 'My School',
            password: '2005'
        });

        // Create Schools
        const school1 = await School.create({
            admin: admin._id,
            name: 'Green Valley High',
            address: '123 Education Lane',
            contact: '1234567890'
        });

        const school2 = await School.create({
            admin: admin._id,
            name: 'Blue Ridge Academy',
            address: '456 Wisdom Way',
            contact: '0987654321'
        });

        const nvpSchool = await School.create({
            admin: admin._id,
            name: 'NVP School',
            address: 'Main Road, City',
            contact: '9998887776'
        });

        const mahavirSchool = await School.create({
            admin: admin._id,
            name: 'Mahavir School',
            address: 'Mahavir Nagar',
            contact: '8888877777'
        });

        const ldpSchool = await School.create({
            admin: admin._id,
            name: 'Ldp school',
            address: 'Ldp Campus',
            contact: '7777766666'
        });

        const saraswatiSchool = await School.create({
            admin: admin._id,
            name: 'Saraswati School',
            address: 'Saraswati Nagar',
            contact: '6666655555'
        });

        // Create Students
        const nvpStudents = [
            "Patange", "Nandini Wagh", "Aradhya Thore", "Akshara Matha", "Aadhi Krishnai",
"Madhura Soni", "Samruddhi Kale", "Ayush Gadekar", "Swasti Gawali", "Verma",
"Kartiki Kasar", "Guddu Holkar", "Jay Bakre", "Ishwari Khaire", "Garima Jain",
"Hiya Chordiya", "Viyan Kasar", "Vihaan Kale", "Shivansh Pawar", "Ayush Bhalerao",
"Uttam Gaikwad", "Arya Raut", "Gargi Devkate", "Neeraj Aher", "Anuj Sharma",
"Unnati Shinde", "Sanvi Jadhav", "Aarohi Suryavanshi", "Sarthak Holkar", "Devkar",
"Holkar Gokuldham"
        ];

        const mahavirStudents = [
           "Mahesh More", "Bhagwat", "Atharva Jadhav", "Mahi Nimbalkar", "Kimaya Vyavahare",
"Bablu Sheikh", "Pari Bhoite", "Shinde", "Ravina", "Wagh", "Kushare",
"Durga Narkhede", "Pawan"
        ];

        const ldpStudents = [
           "Ganesh Khairnar", "Sonali Bhalerao", "Aksa Sheikh", "Nana Arote", "Sonu Nishad", "Durga Shinde"
        ];

        const saraswatiStudents = [
          "A G Rasal", "Ashwini Aher", "Ganesh Kokale", "Karpe", "Nilesh Holkar",
"Rajshri Holkar", "Santosh Holkar", "Gokul Holkar", "Krishna Holkar",
"Sanjay Aher", "Radha Aher", "Sarika Salunkhe", "Yuva Bharat Ingale",
"Vedika Pawar", "Pari Pawar", "Pari Wagh", "Avneesh", "Purva Gondhale",
"Jadhav", "Pingale", "Sanap", "Dhumal", "Aher", "Kasar", "Aradhya Kedare"
        ];

        const studentData = [];

        // Add NVP Students
        nvpStudents.forEach((name, index) => {
            studentData.push({
                admin: admin._id,
                name: name,
                rollNo: `NVP${(index + 1).toString().padStart(3, '0')}`,
                class: '1st', // Default class
                schoolName: 'NVP School',
                mobile: `9000000${(index + 1).toString().padStart(3, '0')}`,
                password: 'password123',
                pendingFee: 700,
                totalPaid: 0
            });
        });

        // Add Mahavir Students
        mahavirStudents.forEach((name, index) => {
            studentData.push({
                admin: admin._id,
                name: name,
                rollNo: `MAH${(index + 1).toString().padStart(3, '0')}`,
                class: '1st',
                schoolName: 'Mahavir School',
                mobile: `9100000${(index + 1).toString().padStart(3, '0')}`,
                password: 'password123',
                pendingFee: 700,
                totalPaid: 0
            });
        });

        // Add LDP Students
        ldpStudents.forEach((name, index) => {
            studentData.push({
                admin: admin._id,
                name: name,
                rollNo: `LDP${(index + 1).toString().padStart(3, '0')}`,
                class: '1st',
                schoolName: 'Ldp school',
                mobile: `9200000${(index + 1).toString().padStart(3, '0')}`,
                password: 'password123',
                pendingFee: 700,
                totalPaid: 0
            });
        });

        // Add Saraswati Students
        saraswatiStudents.forEach((name, index) => {
            studentData.push({
                admin: admin._id,
                name: name,
                rollNo: `SAR${(index + 1).toString().padStart(3, '0')}`,
                class: '1st',
                schoolName: 'Saraswati School',
                mobile: `9300000${(index + 1).toString().padStart(3, '0')}`,
                password: 'password123',
                pendingFee: 700,
                totalPaid: 0
            });
        });

        await Student.insertMany(studentData);

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
