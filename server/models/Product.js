const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping string ID for compatibility
    name: { type: String, required: true },
    category: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    openingStock: { type: Number, required: true },
    currentStock: { type: Number, required: true },
    imageURL: { type: String }, // Will store Cloudinary URL
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
