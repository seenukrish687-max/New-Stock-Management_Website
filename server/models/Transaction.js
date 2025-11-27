const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    quantity: { type: Number, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    notes: { type: String },
    sellingPriceAtTime: { type: Number }, // For Stock Out
    purchasePriceAtTime: { type: Number }, // For Stock In (optional)
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
