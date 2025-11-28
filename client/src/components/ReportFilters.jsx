import React from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';

const ReportFilters = ({
    activeTab,
    selectedDate, setSelectedDate,
    selectedMonth, setSelectedMonth,
    filterType, setFilterType,
    products, selectedProductId, setSelectedProductId,
    onRefresh
}) => {
    return (
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '1rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="#666" />
                {activeTab === 'daily' ? (
                    <input
                        type="date"
                        className="input-field"
                        style={{ width: 'auto', marginBottom: 0, padding: '0.5rem' }}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                ) : activeTab === 'monthly' ? (
                    <input
                        type="month"
                        className="input-field"
                        style={{ width: 'auto', marginBottom: 0, padding: '0.5rem' }}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                ) : null}
            </div>

            {/* Product Selector */}
            {(activeTab === 'daily' || activeTab === 'monthly') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                        className="input-field"
                        style={{ width: 'auto', marginBottom: 0, padding: '0.5rem', maxWidth: '200px' }}
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                        <option value="">All Products</option>
                        {products && products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Type Filter */}
            {(activeTab === 'daily' || activeTab === 'monthly') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={18} color="#666" />
                    <select
                        className="input-field"
                        style={{ width: 'auto', marginBottom: 0, padding: '0.5rem' }}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="ALL">All Transactions</option>
                        <option value="IN">Stock In Only</option>
                        <option value="OUT">Stock Out Only</option>
                        <option value="RETURN">Returned Products</option>
                    </select>
                </div>
            )}

            {/* Refresh Button */}
            <button
                onClick={onRefresh}
                className="btn-secondary"
                style={{ marginLeft: 'auto', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                title="Refresh Data"
            >
                <RefreshCw size={18} />
            </button>
        </div>
    );
};

export default ReportFilters;
