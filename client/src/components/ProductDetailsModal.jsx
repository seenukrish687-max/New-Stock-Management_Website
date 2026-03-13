import React from 'react';
import { X, TrendingUp, Package, DollarSign, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { API_URL } from '../config';

const ProductDetailsModal = ({ product, onClose, transactions }) => {
    if (!product) return null;

    // --- Prepare Data for Chart & Stats ---
    const productStockOut = transactions.stockOut.filter(t => t.productId === product.id);
    const productStockIn = transactions.stockIn.filter(t => t.productId === product.id);

    // 1. Total Stats
    const totalSold = productStockOut.reduce((sum, t) => sum + t.quantity, 0);
    const totalRevenue = totalSold * product.sellingPrice;
    const currentStock = product.currentStock;

    // 2. Chart Data (Last 7 Days or All Time)
    // Group stock out by date
    const salesByDate = productStockOut.reduce((acc, t) => {
        const date = new Date(t.date).toLocaleDateString('en-GB'); // DD/MM/YYYY
        acc[date] = (acc[date] || 0) + t.quantity;
        return acc;
    }, {});

    // Create array for chart
    const chartData = Object.keys(salesByDate).map(date => ({
        date: date,
        sales: salesByDate[date]
    })).slice(-7); // Last 7 active days for cleaner view

    // 3. Recent Activity (Mix of In and Out)
    const allActivity = [
        ...productStockOut.map(t => ({ ...t, type: 'out', dateObj: new Date(t.date) })),
        ...productStockIn.map(t => ({ ...t, type: 'in', dateObj: new Date(t.date) }))
    ].sort((a, b) => b.dateObj - a.dateObj).slice(0, 5); // Last 5

    return (
        <div className="passport-backdrop" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '1rem'
        }}>
            <div className="passport-card" onClick={e => e.stopPropagation()} style={{
                backgroundColor: 'var(--color-card-bg)', width: '900px', maxWidth: '100%',
                maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', position: 'relative'
            }}>
                {/* Close Button */}
                <button onClick={onClose} style={{
                    position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10,
                    background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--color-text-main)'
                }}>
                    <X size={20} />
                </button>

                {/* --- Header Section (Hero) --- */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-input-border)' }}>
                    {/* Left: Image */}
                    <div style={{ width: '40%', minHeight: '300px', position: 'relative', backgroundColor: '#f0f0f0' }}>
                        {product.imageURL ? (
                            <img
                                src={product.imageURL.startsWith('http') ? product.imageURL : `${API_URL}${product.imageURL}`}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/350?text=No+Image'; }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No Image</div>
                        )}
                        <div style={{
                            position: 'absolute', bottom: '1rem', left: '1rem',
                            backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', borderRadius: '12px',
                            fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            {product.category}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div style={{ width: '60%', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '0.5rem' }}>{product.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary-accent)' }}>RM {product.sellingPrice}</span>
                            <span style={{ fontSize: '1rem', color: '#666' }}>Profit/Unit: RM {(product.sellingPrice - product.purchasePrice).toFixed(2)}</span>
                        </div>

                        {/* Quick Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--color-input-bg)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', marginBottom: '0.5rem' }}>
                                    <Package size={16} /> Total Sold
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalSold}</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--color-input-bg)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', marginBottom: '0.5rem' }}>
                                    <DollarSign size={16} /> Revenue
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>RM {totalRevenue.toFixed(0)}</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--color-input-bg)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', marginBottom: '0.5rem' }}>
                                    <TrendingUp size={16} /> Stock
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentStock < 10 ? '#ef4444' : 'inherit' }}>{currentStock}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Content Section --- */}
                <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Left: Chart */}
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} /> Sales Trend (Last 7 Active Days)
                        </h3>
                        <div style={{ height: '250px', width: '100%' }}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-primary-accent)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--color-primary-accent)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            cursor={{ stroke: 'var(--color-primary-accent)', strokeWidth: 2 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="var(--color-primary-accent)"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSales)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', backgroundColor: 'var(--color-input-bg)', borderRadius: '12px' }}>
                                    No sales data yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Activity Feed */}
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} /> Recent Activity
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {allActivity.length > 0 ? (
                                allActivity.map((t, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '0.75rem', borderRadius: '12px',
                                        backgroundColor: 'var(--color-input-bg)'
                                    }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            backgroundColor: t.type === 'in' ? '#dcfce7' : '#fee2e2',
                                            color: t.type === 'in' ? '#166534' : '#991b1b',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {t.type === 'in' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                                {t.type === 'in' ? 'Stock Added' : 'Stock Sold'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                                {new Date(t.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                                            {t.type === 'in' ? '+' : '-'}{t.quantity}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: '#999', textAlign: 'center', padding: '1rem' }}>No recent activity</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;
