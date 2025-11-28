import React from 'react';
import { API_URL } from '../config';

const ReportTable = ({ transactions, title, showType = true, showDate = false, showTotal = false, products = [] }) => {
    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#333' }}>{title}</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#666', fontSize: '0.875rem' }}>
                            {showDate && <th style={{ padding: '0.75rem' }}>Date</th>}
                            {showType && <th style={{ padding: '0.75rem' }}>Type</th>}
                            <th style={{ padding: '0.75rem' }}>Platform</th>
                            <th style={{ padding: '0.75rem' }}>Product</th>
                            <th style={{ padding: '0.75rem' }}>Qty</th>
                            {showTotal ? <th style={{ padding: '0.75rem' }}>Total</th> : <th style={{ padding: '0.75rem' }}>Notes</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f9f9f9', fontSize: '0.9rem' }}>
                                {showDate && <td style={{ padding: '0.75rem', color: '#666', whiteSpace: 'nowrap' }}>{t.date}</td>}
                                {showType && (
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            backgroundColor: t.type === 'IN' ? '#e8f5e9' : t.type === 'RETURN' ? '#fef3c7' : '#ffebee',
                                            color: t.type === 'IN' ? '#2e7d32' : t.type === 'RETURN' ? '#d97706' : '#c62828',
                                            fontSize: '0.75rem', fontWeight: 'bold'
                                        }}>
                                            {t.type === 'IN' ? 'STOCK IN' : t.type === 'RETURN' ? 'RETURN' : 'STOCK OUT'}
                                        </span>
                                    </td>
                                )}
                                <td style={{ padding: '0.75rem', color: '#666' }}>{t.platform || '-'}</td>
                                <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {t.productImage && (
                                        <img
                                            src={t.productImage}
                                            alt=""
                                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/32?text=Img'; }}
                                        />
                                    )}
                                    <span style={{ fontWeight: '500', color: '#333' }}>{t.productName}</span>
                                </td>
                                <td style={{ padding: '0.75rem', fontWeight: '500' }}>{t.quantity}</td>
                                {showTotal ? (
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#333' }}>
                                        {(() => {
                                            let price = 0;
                                            if (t.type === 'OUT') {
                                                price = t.sellingPriceAtTime;
                                            } else {
                                                price = t.purchasePriceAtTime;
                                                // Fallback to current product price if historical price is missing
                                                if ((price === undefined || price === null || isNaN(price)) && products) {
                                                    const product = products.find(p => p.id === t.productId);
                                                    if (product) {
                                                        price = product.purchasePrice;
                                                    }
                                                }
                                            }

                                            if (price === undefined || price === null || isNaN(price)) {
                                                return '-';
                                            }
                                            return `RM ${(t.quantity * price).toFixed(2)}`;
                                        })()}
                                    </td>
                                ) : (
                                    <td style={{ padding: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                                        {t.notes || '-'}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                                    <div style={{ marginBottom: '0.5rem' }}>No transactions found</div>
                                    <div style={{ fontSize: '0.8rem' }}>Try adjusting filters or add new stock</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportTable;
