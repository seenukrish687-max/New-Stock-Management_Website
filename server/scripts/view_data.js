const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('DB Connection Error:', error);
        process.exit(1);
    }
};

const viewData = async () => {
    await connectDB();

    try {
        const productCount = await Product.countDocuments();
        const transactionCount = await Transaction.countDocuments();

        console.log('\n--- DATABASE SUMMARY ---');
        console.log(`Total Products: ${productCount}`);
        console.log(`Total Transactions: ${transactionCount}`);

        console.log('\n--- RECENT PRODUCTS (Top 5) ---');
        const products = await Product.find().limit(5);
        products.forEach(p => {
            console.log(`- [${p.id}] ${p.name} (Stock: ${p.currentStock})`);
        });

        console.log('\n--- RECENT TRANSACTIONS (Top 5) ---');
        const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 }).limit(5);
        transactions.forEach(t => {
            console.log(`- [${t.date}] ${t.type}: ${t.productName} (Qty: ${t.quantity})`);
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        mongoose.connection.close();
    }
};

viewData();
