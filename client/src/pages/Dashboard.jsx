import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '../context/StockContext';
import { Package, TrendingUp, TrendingDown, DollarSign, Plus, FileText, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';
import { getCategoryColor } from '../utils/colors';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

const Dashboard = () => {
    const { products, transactions } = useStock();
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const navigate = useNavigate();

    const totalProducts = products.length;
    const lowStock = products.filter(p => p.currentStock < 10).length;
    const totalStockIn = transactions.stockIn.length;
    const totalStockOut = transactions.stockOut.length;

    // --- Data Processing for Charts ---

    // 1. Today's Sales (Hourly Line Chart)
    const getTodaySalesData = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayTransactions = transactions.stockOut.filter(t => t.date === today);

        // Initialize hours 0-23
        const hourlyData = Array(24).fill(0).map((_, i) => ({
            hour: `${i}:00`,
            sales: 0,
            hourIndex: i
        }));

        todayTransactions.forEach(t => {
            // Extract hour from timestamp ID
            const date = new Date(parseInt(t.id));
            const hour = date.getHours();
            hourlyData[hour].sales += (t.quantity * t.sellingPriceAtTime);
        });

        // Filter to show only up to current hour or a reasonable range if empty
        const currentHour = new Date().getHours();
        return hourlyData.filter(d => d.hourIndex <= currentHour + 1);
    };

    const todaySalesData = getTodaySalesData();

    // 2. Product Sales (Last 7 Days & 30 Days)
    const getProductSalesData = (days) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

        const filteredTransactions = transactions.stockOut.filter(t => t.date >= cutoffDateStr);

        const productSales = {};
        filteredTransactions.forEach(t => {
            if (!productSales[t.productName]) {
                productSales[t.productName] = 0;
            }
            productSales[t.productName] += t.quantity;
        });

        return Object.entries(productSales)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5); // Top 5 products
    };

    const last7DaysData = getProductSalesData(7);
    const last30DaysData = getProductSalesData(30);

    const StatCard = ({ title, value, icon, color, onClick, isActive }) => (
        <div
            className="card"
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: onClick ? 'pointer' : 'default',
                border: isActive ? `2px solid ${color}` : '1px solid transparent',
                transition: 'all 0.2s ease'
            }}
        >
            <div style={{
                padding: '1rem',
                borderRadius: '50%',
                backgroundColor: color + '20',
                color: color
            }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: '0.875rem', color: '#666' }}>{title}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>Dashboard</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    title="Total Products"
                    value={totalProducts}
                    icon={<Package size={24} />}
                    color="var(--color-primary-accent)"
                    onClick={() => navigate('/products')}
                />
                <StatCard
                    title="Low Stock Items"
                    value={lowStock}
                    icon={<TrendingDown size={24} />}
                    color="#e74c3c"
                    onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                    isActive={showLowStockOnly}
                />
                <StatCard
                    title="Stock In Transactions"
                    value={totalStockIn}
                    icon={<TrendingUp size={24} />}
                    color="var(--color-secondary-accent)"
                    onClick={() => navigate('/reports')}
                />
                <StatCard
                    title="Stock Out Transactions"
                    value={totalStockOut}
                    icon={<DollarSign size={24} />}
                    color="var(--color-dark-accent)"
                    onClick={() => navigate('/reports')}
                />
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/products?action=add')}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                    <button
                        onClick={() => navigate('/stock-in')}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}
                    >
                        <TrendingUp size={20} />
                        Stock In
                    </button>
                    <button
                        onClick={() => navigate('/stock-out')}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: 'var(--color-dark-accent)' }}
                    >
                        <TrendingDown size={20} />
                        Stock Out
                    </button>
                    <button
                        onClick={() => navigate('/reports')}
                        className="card"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', cursor: 'pointer', border: '1px solid #ddd' }}
                    >
                        <FileText size={20} color="var(--color-primary-accent)" />
                        View Reports
                    </button>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                {/* Today's Sales Line Chart */}
                <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Today's Sales Trend</h3>
                    <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={todaySalesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `RM${val}`} />
                                <Tooltip
                                    formatter={(value) => [`RM ${value}`, 'Sales']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="sales" stroke="var(--color-primary-accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Last 7 Days Product Sales */}
                <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Top Products (Last 7 Days)</h3>
                    <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last7DaysData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                <XAxis type="number" axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} name="Units Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Last 30 Days Product Sales */}
                <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Top Products (Last 30 Days)</h3>
                    <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last30DaysData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                <XAxis type="number" axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="quantity" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} name="Units Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                    {showLowStockOnly ? 'Low Stock Products' : 'Recent Products'}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Image</th>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Category</th>
                                <th style={{ padding: '1rem' }}>Stock</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(showLowStockOnly
                                ? products.filter(p => p.currentStock < 10)
                                : products.slice(-5).reverse()
                            ).map(product => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>
                                        {product.imageURL && (
                                            <img
                                                src={product.imageURL.startsWith('http') ? product.imageURL : `${API_URL}${product.imageURL}`}
                                                alt={product.name}
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/40?text=No+Img';
                                                }}
                                            />
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{product.name}</td>
                                    <td style={{ padding: '1rem' }}>{product.category}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            backgroundColor: product.currentStock < 10 ? '#ffebee' : '#e8f5e9',
                                            color: product.currentStock < 10 ? '#c62828' : '#2e7d32',
                                            fontSize: '0.875rem'
                                        }}>
                                            {product.currentStock}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>RM {product.sellingPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
