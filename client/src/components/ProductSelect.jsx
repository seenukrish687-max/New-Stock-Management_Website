import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { API_URL } from '../config';

const ProductSelect = ({ products, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (product) => {
        setSelectedProduct(product);
        onSelect(product);
        setIsOpen(false);
    };

    return (
        <div style={{ marginBottom: '1rem', position: 'relative' }} ref={dropdownRef}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#fff'
                }}
            >
                {selectedProduct ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {selectedProduct.imageURL && (
                            <img
                                src={`${API_URL}${selectedProduct.imageURL}`}
                                alt={selectedProduct.name}
                                style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/32?text=No+Img';
                                }}
                            />
                        )}
                        <div>
                            <div style={{ fontWeight: '600' }}>{selectedProduct.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>RM {selectedProduct.sellingPrice}</div>
                        </div>
                    </div>
                ) : (
                    <span style={{ color: '#999' }}>Select a product...</span>
                )}
                <ChevronDown size={20} color="#666" />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginTop: '0.25rem',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 10,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {products.map(product => (
                        <div
                            key={product.id}
                            onClick={() => handleSelect(product)}
                            style={{
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                            {product.imageURL ? (
                                <img
                                    src={`${API_URL}${product.imageURL}`}
                                    alt={product.name}
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/40?text=No+Img';
                                    }}
                                />
                            ) : (
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#eee', borderRadius: '4px' }}></div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600' }}>{product.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Stock: {product.currentStock}</div>
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-primary-accent)' }}>
                                RM {product.sellingPrice}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductSelect;
