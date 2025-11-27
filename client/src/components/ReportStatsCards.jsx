import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subValue, subLabel }) => (
    <div className="card hover-zoom" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        borderLeft: `4px solid ${color}`
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
                <p style={{ color: '#666', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#333' }}>{value}</h3>
            </div>
            <div style={{
                backgroundColor: `${color}15`,
                padding: '0.75rem',
                borderRadius: '12px',
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={24} />
            </div>
        </div>
        {subValue && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginTop: 'auto' }}>
                <span style={{ fontWeight: '600', color: '#333' }}>{subValue}</span>
                <span style={{ color: '#888' }}>{subLabel}</span>
            </div>
        )}
    </div>
);

const ReportStatsCards = ({ data, type }) => {
    const formatCurrency = (amount) => `RM ${amount ? amount.toFixed(2) : '0.00'}`;

    // Normalize data based on report type
    const isMonthly = type === 'monthly';
    const revenue = isMonthly ? data.totalRevenue : data.totalSales;
    const stockInCount = isMonthly ? data.stockIn?.length : data.stockIn?.length;
    const stockOutCount = isMonthly ? data.stockOut?.length : data.stockOut?.length;
    const profit = isMonthly ? data.profit : null;
    const unitsSold = isMonthly ? data.totalUnitsSold : null;

    const showRevenue = revenue !== undefined && revenue !== null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {showRevenue && (
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(revenue)}
                    icon={DollarSign}
                    color="#2563eb" // Blue
                    subValue={unitsSold ? `${unitsSold} Units` : null}
                    subLabel={unitsSold ? "Sold" : null}
                />
            )}

            {isMonthly && (
                <StatCard
                    title="Est. Profit"
                    value={formatCurrency(profit)}
                    icon={TrendingUp}
                    color="#10b981" // Green
                    subValue={profit > 0 ? "Profitable" : "Loss"}
                    subLabel="Period"
                />
            )}

            <StatCard
                title="Stock In"
                value={stockInCount || 0}
                icon={Package}
                color="#8b5cf6" // Purple
                subValue="Transactions"
                subLabel="Recorded"
            />

            <StatCard
                title="Stock Out"
                value={stockOutCount || 0}
                icon={ShoppingCart}
                color="#f59e0b" // Orange
                subValue="Transactions"
                subLabel="Recorded"
            />
        </div>
    );
};

export default ReportStatsCards;
