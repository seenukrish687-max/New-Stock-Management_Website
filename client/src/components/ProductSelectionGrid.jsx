import React, { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { API_URL } from '../config';

const ProductSelectionGrid = ({ products, onSelect, selectedProductId }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = (products || []).filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Product</label>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
                    />
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem',
                maxHeight: '60vh',
                overflowY: 'auto',
                padding: '0.5rem',
                border: '1px solid #eee',
                borderRadius: '8px'
            }}>
                {filteredProducts.map(product => {
                    const isSelected = selectedProductId === product.id;
                    const isLowStock = product.currentStock < 10;

                    return (
                        <div
                            key={product.id}
                            onClick={() => onSelect(product)}
                            className="card"
                            style={{
                                padding: '0.75rem',
                                cursor: 'pointer',
                                border: isSelected
                                    ? '2px solid var(--color-primary-accent)'
                                    : isLowStock
                                        ? '2px solid #ef5350' // Red border for low stock
                                        : '1px solid transparent',
                                backgroundColor: isSelected
                                    ? '#f0f9ff'
                                    : isLowStock
                                        ? '#ffebee' // Light red background for low stock
                                        : '#fff',
                                transition: 'all 0.2s ease',
                                position: 'relative'
                            }}
                        >
                            {isSelected && (
                                <div style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    backgroundColor: 'var(--color-primary-accent)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10
                                }}>
                                    <Check size={12} />
                                </div>
                            )}

                            <div style={{
                                height: '100px',
                                marginBottom: '0.5rem',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                backgroundColor: '#f5f5f5'
                            }}>
                                {product.imageURL ? (
                                    <img
                                        src={product.imageURL.startsWith('http') ? product.imageURL : `${API_URL}${product.imageURL}`}
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/150?text=No+Img';
                                        }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.8rem' }}>No Image</div>
                                )}
                            </div>

                            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={product.name}>
                                {product.name}
                            </h4>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--color-primary-accent)' }}>
                                    RM {product.sellingPrice}
                                </span>
                                <span style={{
                                    color: isLowStock ? '#c62828' : '#2e7d32',
                                    fontWeight: isLowStock ? 'bold' : 'normal',
                                    backgroundColor: isLowStock ? '#ffcdd2' : '#e8f5e9',
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem'
                                }}>
                                    Qty: {product.currentStock}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductSelectionGrid;
