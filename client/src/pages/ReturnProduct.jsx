import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import ProductSelectionGrid from '../components/ProductSelectionGrid';
import { useToast } from '../context/ToastContext';
import { RotateCcw } from 'lucide-react';

const ReturnProduct = () => {
    const { products, addStockIn } = useStock();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!formData.productId) return showToast('Please select a product', 'error');

        setIsSubmitting(true);
        // Prepend "RETURN: " to notes to distinguish from normal stock in
        const returnData = {
            ...formData,
            notes: `RETURN: ${formData.notes}`
        };

        try {
            await addStockIn(returnData);
            showToast('Product returned successfully!', 'success');
            setFormData({
                productId: '',
                quantity: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
        } catch (error) {
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
                        onSelect={(p) => setFormData({ ...formData, productId: p.id })}
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

                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Notes</label>
                    <textarea
                        className="input-field"
                        placeholder="Reason for return..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
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
