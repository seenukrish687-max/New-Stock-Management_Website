import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import ProductSelectionGrid from '../components/ProductSelectionGrid';
import { useToast } from '../context/ToastContext';
import { RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

const ReturnProduct = () => {
    const { products, addReturn } = useStock();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        platform: 'Tiktok',
        returnReason: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!formData.productId) {
            soundManager.playError();
            return showToast('Please select a product', 'error');
        }

        setIsSubmitting(true);
        try {
            await addReturn(formData);
            soundManager.playSuccess();
            showToast('Product returned successfully!', 'success');
            setFormData({
                productId: '',
                quantity: '',
                date: new Date().toISOString().split('T')[0],
                platform: 'Tiktok',
                returnReason: '',
                notes: ''
            });
        } catch (error) {
            soundManager.playError();
            showToast('Failed to return product', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#ef4444' }}>
                    <RotateCcw size={24} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Return Product</h2>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <ProductSelectionGrid
                        products={products}
                        onSelect={(p) => {
                            soundManager.playClick();
                            setFormData({ ...formData, productId: p.id });
                        }}
                        selectedProductId={formData.productId}
                    />

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

                    <label style={{ display: 'block', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: '500' }}>Return Reason</label>
                    <select
                        className="input-field"
                        value={formData.returnReason}
                        onChange={(e) => setFormData({ ...formData, returnReason: e.target.value })}
                        required
                    >
                        <option value="">Select Reason</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Wrong Item">Wrong Item</option>
                        <option value="Customer Changed Mind">Customer Changed Mind</option>
                        <option value="Defective">Defective</option>
                        <option value="Other">Other</option>
                    </select>

                    <label style={{ display: 'block', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: '500' }}>Notes (Optional)</label>
                    <textarea
                        className="input-field"
                        placeholder="Additional notes (Optional)"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                        style={{ resize: 'vertical' }}
                    />

                    <button type="submit" className="btn-primary" style={{ width: '100%', backgroundColor: '#ef4444' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Processing Return...' : 'Confirm Return'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReturnProduct;
