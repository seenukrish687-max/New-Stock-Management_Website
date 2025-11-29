import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import ProductSelectionGrid from '../components/ProductSelectionGrid';
import { useToast } from '../context/ToastContext';

const StockIn = () => {
    const { products, addStockIn } = useStock();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!formData.productId) return showToast('Please select a product', 'error');

        setIsSubmitting(true);
        await addStockIn(formData);
        setIsSubmitting(false);
        showToast('Stock added successfully!', 'success');
        setFormData({
            productId: '',
            quantity: '',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        });
        setSelectedProduct(null);
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 'bold' }}>Stock In</h2>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <ProductSelectionGrid
                        products={products}
                        onSelect={(p) => {
                            setFormData({ ...formData, productId: p.id });
                            setSelectedProduct(p);
                        }}
                        selectedProductId={formData.productId}
                    />

                    {selectedProduct && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{selectedProduct.name}</div>
                            Available Stock: {selectedProduct.currentStock}
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

                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Notes</label>
                    <textarea
                        className="input-field"
                        placeholder="Optional notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                    />

                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Adding Stock...' : 'Add Stock'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StockIn;
