import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStock } from '../context/StockContext';
import { useToast } from '../context/ToastContext';
import { Plus, X, Upload, Trash2, Edit2 } from 'lucide-react';
import { API_URL } from '../config';
import { getCategoryColor } from '../utils/colors';

const Products = () => {
    const { products, addProduct, deleteProduct, updateProduct } = useStock();
    const { showToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        purchasePrice: '',
        sellingPrice: '',
        openingStock: '',
        image: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('action') === 'add') {
            setShowForm(true);
            setSearchParams({}, { replace: true }); // Replace history to prevent back-button loops
        }
    }, [searchParams, setSearchParams]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        try {
            await addProduct(data);
            showToast('Product added successfully!', 'success');
            setShowForm(false);
            setFormData({
                name: '',
                category: '',
                purchasePrice: '',
                sellingPrice: '',
                openingStock: '',
                image: null
            });
            setPreview(null);
        } catch (error) {
            showToast('Failed to add product', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name-asc');

    const filteredProducts = products
        .filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
            if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
            if (sortOption === 'price-desc') return b.sellingPrice - a.sellingPrice;
            if (sortOption === 'stock-asc') return a.currentStock - b.currentStock;
            if (sortOption === 'stock-desc') return b.currentStock - a.currentStock;
            return 0;
        });

    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const startEditing = (product) => {
        setEditingId(product.id);
        setEditValue(product.currentStock);
    };

    const saveStock = async (id) => {
        try {
            await updateProduct(id, { currentStock: parseInt(editValue) });
            setEditingId(null);
            showToast('Stock updated successfully!', 'success');
        } catch (error) {
            showToast('Failed to update stock', 'error');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>Products</h2>
                <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field"
                    style={{ marginBottom: 0, flex: 1 }}
                />
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="input-field"
                    style={{ marginBottom: 0, width: '200px' }}
                >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="stock-asc">Stock (Low to High)</option>
                    <option value="stock-desc">Stock (High to Low)</option>
                </select>
            </div>

            {
                showForm && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                        padding: '1rem'
                    }}>
                        <div className="card" style={{ width: '500px', maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto', margin: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Add New Product</h3>
                                <button onClick={() => setShowForm(false)} style={{ background: 'none', color: '#666' }}><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} action="javascript:void(0);">
                                <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        width: '100%', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
                                        overflow: 'hidden', position: 'relative', marginBottom: '0.5rem'
                                    }} onClick={() => document.getElementById('imageInput').click()}>
                                        {preview ? (
                                            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#999' }}>
                                                <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                                                <p>Click to upload image</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="imageInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                        required
                                    />
                                </div>

                                <input className="input-field" name="name" placeholder="Product Name" value={formData.name} onChange={handleInputChange} required />
                                <input className="input-field" name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} required />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input className="input-field" type="number" name="purchasePrice" placeholder="Purchase Price" value={formData.purchasePrice} onChange={handleInputChange} required />
                                    <input className="input-field" type="number" name="sellingPrice" placeholder="Selling Price" value={formData.sellingPrice} onChange={handleInputChange} required />
                                </div>
                                <input className="input-field" type="number" name="openingStock" placeholder="Opening Stock" value={formData.openingStock} onChange={handleInputChange} required />

                                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Product'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {filteredProducts.map(product => {
                    const categoryStyle = getCategoryColor(product.category);
                    return (
                        <div key={product.id} className="card hover-zoom" style={{ padding: '1rem' }}>
                            <div style={{ height: '150px', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                                {product.imageURL ? (
                                    <img
                                        src={product.imageURL.startsWith('http') ? product.imageURL : `${API_URL}${product.imageURL}`}
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                            e.target.style.objectFit = 'contain';
                                        }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No Image</div>
                                )}
                            </div>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{product.name}</h3>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '12px',
                                    backgroundColor: categoryStyle.bg,
                                    color: categoryStyle.text,
                                    fontWeight: '600'
                                }}>
                                    {product.category}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--color-primary-accent)' }}>RM {product.sellingPrice}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {editingId === product.id ? (
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => saveStock(product.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveStock(product.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ width: '80px', padding: '0.25rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                            />
                                        ) : (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(product);
                                                }}
                                                style={{
                                                    fontSize: '0.875rem',
                                                    padding: '0.25rem 0.5rem',
                                                    backgroundColor: product.currentStock < 10 ? '#ffebee' : '#e8f5e9',
                                                    color: product.currentStock < 10 ? '#c62828' : '#2e7d32',
                                                    borderRadius: '4px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                                title="Click to edit stock"
                                            >
                                                Stock: {product.currentStock}
                                                <Edit2 size={12} style={{ opacity: 0.5 }} />
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent event bubbling
                                                console.log("Delete button clicked for:", product.id);
                                                if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                                    console.log("Confirmed delete for:", product.id);
                                                    console.log("Confirmed delete for:", product.id);
                                                    deleteProduct(product.id);
                                                    showToast('Product deleted successfully!', 'success');
                                                }
                                            }}
                                            style={{ color: '#c62828', padding: '0.25rem', borderRadius: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer', zIndex: 20, position: 'relative' }}
                                            title="Delete Product"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div >
    );
};

export default Products;
