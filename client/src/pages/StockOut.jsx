import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import ProductSelectionGrid from '../components/ProductSelectionGrid';
import { useToast } from '../context/ToastContext';
import { soundManager } from '../utils/soundManager';

const StockOut = () => {
    const { products, addStockOut } = useStock();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        platform: 'Tiktok',
        customerName: '',
        paymentStatus: 'Paid',
        receiverName: ''
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!formData.productId) {
            soundManager.playError();
            return showToast('Please select a product', 'error');
        }

        if (selectedProduct && parseInt(formData.quantity) > selectedProduct.currentStock) {
            soundManager.playError();
            return showToast('Error: Insufficient stock!', 'error');
        }

        try {
            setIsSubmitting(true);
            await addStockOut(formData);
            soundManager.playSuccess();
            showToast('Stock out recorded successfully!', 'success');
            setFormData({
                productId: '',
                quantity: '',
                date: new Date().toISOString().split('T')[0],
                platform: 'Tiktok',
                customerName: '',
                paymentStatus: 'Paid',
                receiverName: ''
            });
            setSelectedProduct(null);
        } catch (error) {
            soundManager.playError();
            showToast(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 'bold' }}>Stock Out</h2>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <ProductSelectionGrid
                        products={products}
                        onSelect={(p) => {
                            soundManager.playClick();
                            setFormData({ ...formData, productId: p.id });
                            setSelectedProduct(p);
                        }}
                        selectedProductId={formData.productId}
                    />

                    {selectedProduct && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            backgroundColor: selectedProduct.currentStock < 10 ? '#ffebee' : '#e8f5e9',
                            color: selectedProduct.currentStock < 10 ? '#c62828' : '#2e7d32',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{selectedProduct.name}</div>
                            Available Stock: {selectedProduct.currentStock}
                            {selectedProduct.currentStock < 10 && (
                                <div style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '1rem' }}>
                                    ⚠️ Low Stock Alert
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quantity</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Enter quantity"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Sales Platform</label>
                    <select
                        className="input-field"
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        required
                    >
                        <option value="Tiktok">Tiktok</option>
                        <option value="Whatsapp">Whatsapp</option>
                        <option value="Lazada">Lazada</option>
                        <option value="Shopee">Shopee</option>
                        <option value="NVS SAMA SAMA">NVS SAMA SAMA</option>
                    </select>

                    {formData.platform === 'Whatsapp' && (
                        <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Customer Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter customer name"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                required={formData.platform === 'Whatsapp'}
                            />

                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', marginTop: '1rem' }}>Payment Status</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="paymentStatus"
                                        value="Paid"
                                        checked={formData.paymentStatus === 'Paid'}
                                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                    />
                                    <span style={{ fontWeight: '500', color: '#15803d' }}>Paid</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="paymentStatus"
                                        value="COD"
                                        checked={formData.paymentStatus === 'COD'}
                                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                    />
                                    <span style={{ fontWeight: '500', color: '#b45309' }}>COD</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {formData.platform === 'NVS SAMA SAMA' && (
                        <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Receiver Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter receiver name"
                                value={formData.receiverName}
                                onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                                required={formData.platform === 'NVS SAMA SAMA'}
                            />
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Recording...' : 'Record Sale'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StockOut;
