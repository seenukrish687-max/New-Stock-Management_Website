require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    console.log('Testing connection with URI:', process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('DB Connection Error:', error.message);
        process.exit(1);
    }
};

connectDB();
