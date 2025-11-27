require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('DB Connection Error:', error);
        process.exit(1);
    }
};

const uploadImage = async (localPath) => {
    if (!localPath) return null;

    // Remove leading slash if present (e.g., /uploads/image.png -> uploads/image.png)
    const relativePath = localPath.startsWith('/') ? localPath.slice(1) : localPath;
    const absolutePath = path.join(__dirname, '..', relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`File not found: ${absolutePath}`);
        return null;
    }

    try {
        const result = await cloudinary.uploader.upload(absolutePath, {
            folder: 'stock-management/migration',
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Upload failed for ${localPath}:`, error.message);
        return null;
    }
};

const migrate = async () => {
    await connectDB();

    const dbPath = path.join(__dirname, '../data/db.json');
    const rawData = fs.readFileSync(dbPath);
    const data = JSON.parse(rawData);

    console.log('Starting Migration...');

    // Migrate Products
    console.log(`Migrating ${data.products.length} products...`);
    for (const p of data.products) {
        let cloudImage = null;
        if (p.imageURL && p.imageURL.includes('/uploads/')) {
            cloudImage = await uploadImage(p.imageURL);
        }

        await Product.create({
            ...p,
            imageURL: cloudImage || p.imageURL // Use cloud URL if upload success, else keep original (or null)
        });
        console.log(`Migrated Product: ${p.name}`);
    }

    // Migrate Transactions (Stock In)
    console.log(`Migrating ${data.stockIn.length} stock-in transactions...`);
    for (const t of data.stockIn) {
        await Transaction.create({
            ...t,
            type: 'IN',
            productId: t.productId || 'UNKNOWN', // Handle missing fields if any
            productName: t.productName || 'Unknown Product',
            quantity: t.quantity || 0,
            date: t.date
        });
    }

    // Migrate Transactions (Stock Out)
    console.log(`Migrating ${data.stockOut.length} stock-out transactions...`);
    for (const t of data.stockOut) {
        let cloudImage = null;
        if (t.productImage && t.productImage.includes('/uploads/')) {
            cloudImage = await uploadImage(t.productImage);
        }

        await Transaction.create({
            ...t,
            type: 'OUT',
            productImage: cloudImage || t.productImage
        });
    }

    console.log('Migration Complete!');
    process.exit(0);
};

migrate();
