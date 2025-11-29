require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const connectDB = require('./config/db');
const { storage } = require('./config/cloudinary');
const Product = require('./models/Product');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.use(cors());
app.use(bodyParser.json());

// Multer setup for Cloudinary
const upload = multer({ storage: storage });

// --- ROUTES ---

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Add Product
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, category, purchasePrice, sellingPrice, openingStock } = req.body;

        const newProduct = new Product({
            id: Date.now().toString(),
            name,
            category,
            purchasePrice: parseFloat(purchasePrice),
            sellingPrice: parseFloat(sellingPrice),
            openingStock: parseInt(openingStock),
            currentStock: parseInt(openingStock),
            imageURL: req.file ? req.file.path : null // Cloudinary URL
        });

        await newProduct.save();
        res.json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// Update Product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const product = await Product.findOne({ id });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update fields
        Object.keys(updates).forEach(key => {
            if (key !== 'id' && key !== '_id' && key !== 'image') { // Prevent updating immutable IDs and handle image separately
                if (['purchasePrice', 'sellingPrice'].includes(key)) {
                    product[key] = parseFloat(updates[key]);
                } else if (['openingStock', 'currentStock'].includes(key)) {
                    product[key] = parseInt(updates[key]);
                } else {
                    product[key] = updates[key];
                }
            }
        });

        // Handle Image Update
        if (req.file) {
            product.imageURL = req.file.path;
        }

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({ id });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Note: Deleting image from Cloudinary is not implemented here to keep it simple,
        // but can be added using cloudinary.uploader.destroy(public_id)

        await Product.deleteOne({ id });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Stock In
app.post('/api/stock-in', async (req, res) => {
    try {
        const { productId, quantity, date, notes } = req.body;
        const product = await Product.findOne({ id: productId });

        if (!product) return res.status(404).json({ error: 'Product not found' });

        const qty = parseInt(quantity);
        product.currentStock += qty;
        await product.save();

        const transaction = new Transaction({
            id: Date.now().toString(),
            type: 'IN',
            date,
            productId,
            productName: product.name,
            productImage: product.imageURL,
            quantity: qty,
            purchasePriceAtTime: product.purchasePrice,
            notes
        });

        await transaction.save();
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process stock in' });
    }
});

// Stock Out
app.post('/api/stock-out', async (req, res) => {
    try {
        const { productId, quantity, date, notes, platform, customerName, paymentStatus } = req.body;
        const product = await Product.findOne({ id: productId });

        if (!product) return res.status(404).json({ error: 'Product not found' });

        const qty = parseInt(quantity);
        if (product.currentStock < qty) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        product.currentStock -= qty;
        await product.save();

        const transaction = new Transaction({
            id: Date.now().toString(),
            type: 'OUT',
            date,
            productId,
            productName: product.name,
            productImage: product.imageURL,
            quantity: qty,
            sellingPriceAtTime: product.sellingPrice,
            notes,
            platform,
            customerName,
            paymentStatus
        });

        await transaction.save();
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process stock out' });
    }
});

// Return Product
app.post('/api/return', async (req, res) => {
    try {
        const { productId, quantity, date, notes, platform } = req.body;
        const product = await Product.findOne({ id: productId });

        if (!product) return res.status(404).json({ error: 'Product not found' });

        const qty = parseInt(quantity);
        product.currentStock += qty;
        await product.save();

        const transaction = new Transaction({
            id: Date.now().toString(),
            type: 'RETURN',
            date,
            productId,
            productName: product.name,
            productImage: product.imageURL,
            quantity: qty,
            notes,
            platform
        });

        await transaction.save();
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process return' });
    }
});

// Get Reports
app.get('/api/transactions', async (req, res) => {
    try {
        const stockIn = await Transaction.find({ type: { $in: ['IN', 'RETURN'] } });
        const stockOut = await Transaction.find({ type: 'OUT' });
        res.json({ stockIn, stockOut });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Reset Data
app.delete('/api/reset', async (req, res) => {
    try {
        // Reset all products: set currentStock and openingStock to 0
        await Product.updateMany({}, { $set: { currentStock: 0, openingStock: 0 } });

        // Delete all transactions
        await Transaction.deleteMany({});

        console.log('Database reset: Stocks cleared, Transactions deleted');
        res.json({ message: 'Data reset successfully' });
    } catch (error) {
        console.error('Error resetting data:', error);
        res.status(500).json({ error: 'Failed to reset data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
