import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useStock } from '../context/StockContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ProductSelectionGrid from '../components/ProductSelectionGrid';
import ReportStatsCards from '../components/ReportStatsCards';
import ReportCharts from '../components/ReportCharts';
import ReportTable from '../components/ReportTable';
import ReportFilters from '../components/ReportFilters';
import { generateDailyReportPDF, generateMonthlyReportPDF, generateProductReportPDF } from '../utils/pdfGenerator';
import { FileText } from 'lucide-react';

const Reports = () => {
    const { transactions, products } = useStock();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [filterType, setFilterType] = useState('ALL');
    const [selectedProductId, setSelectedProductId] = useState('');

    // --- Daily Report Logic ---
    const dailyData = useMemo(() => {
        let stockIn = transactions.stockIn.filter(t => t.date === selectedDate);
        let stockOut = transactions.stockOut.filter(t => t.date === selectedDate);

        if (filterType === 'IN') stockOut = [];
        if (filterType === 'OUT') stockIn = [];
        if (filterType === 'RETURN') {
            stockIn = stockIn.filter(t => t.type === 'RETURN');
            stockOut = stockOut.filter(t => t.type === 'RETURN');
        }

        const totalSales = stockOut.reduce((sum, t) => sum + (t.quantity * t.sellingPriceAtTime), 0);
        return { stockIn, stockOut, totalSales };
    }, [transactions, selectedDate, filterType]);

    // --- Monthly Report Logic ---
    const monthlyData = useMemo(() => {
        let stockOut = transactions.stockOut.filter(t => t.date.startsWith(selectedMonth));
        let stockIn = transactions.stockIn.filter(t => t.date.startsWith(selectedMonth));

        if (filterType === 'IN') stockOut = [];
        if (filterType === 'OUT') stockIn = [];
        if (filterType === 'RETURN') {
            stockIn = stockIn.filter(t => t.type === 'RETURN');
            stockOut = stockOut.filter(t => t.type === 'RETURN');
        }

        const totalRevenue = stockOut.reduce((sum, t) => sum + (t.quantity * t.sellingPriceAtTime), 0);
        const totalUnitsSold = stockOut.reduce((sum, t) => sum + t.quantity, 0);

        let totalCost = 0;
        const productSales = {};

        stockOut.forEach(t => {
            const product = products.find(p => p.id === t.productId);
            const cost = product ? product.purchasePrice : 0;
            totalCost += t.quantity * cost;
            if (!productSales[t.productName]) productSales[t.productName] = 0;
            productSales[t.productName] += t.quantity;
        });

        const profit = totalRevenue - totalCost;
        const topProducts = Object.entries(productSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));

        return { totalRevenue, totalUnitsSold, profit, topProducts, stockOut, stockIn };
    }, [transactions, products, selectedMonth, filterType]);

    // --- Product Report Logic ---
    const productData = useMemo(() => {
        if (!selectedProductId) return { transactions: [], totalIn: 0, totalOut: 0 };
        const pStockIn = transactions.stockIn.filter(t => t.productId === selectedProductId);
        const pStockOut = transactions.stockOut.filter(t => t.productId === selectedProductId);
        const allTrans = [...pStockIn, ...pStockOut].sort((a, b) => new Date(b.date) - new Date(a.date));
        const totalIn = pStockIn.reduce((sum, t) => sum + t.quantity, 0);
        const totalOut = pStockOut.reduce((sum, t) => sum + t.quantity, 0);
        return { transactions: allTrans, totalIn, totalOut };
    }, [transactions, selectedProductId]);

    // --- PDF Export Logic ---
    const handleExportDaily = () => {
        try {
            generateDailyReportPDF(dailyData, selectedDate, filterType);
        } catch (error) {
            console.error("PDF Export Failed:", error);
            showToast("Failed to export PDF: " + error.message, 'error');
        }
    };

    const handleExportMonthly = () => {
        try {
            generateMonthlyReportPDF(monthlyData, selectedMonth);
        } catch (error) {
            console.error("PDF Export Failed:", error);
            showToast("Failed to export PDF: " + error.message, 'error');
        }
    };

    const handleExportProduct = () => {
        if (!selectedProductId) return;
        const product = products.find(p => p.id === selectedProductId);
        if (product) {
            try {
                generateProductReportPDF(productData, product);
            } catch (error) {
                console.error("PDF Export Failed:", error);
                showToast("Failed to export PDF: " + error.message, 'error');
            }
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem' }}>Reports Dashboard</h2>
                    <p style={{ color: '#666' }}>Overview of your inventory performance</p>
                </div>
                {(activeTab === 'daily' || activeTab === 'monthly') && (
                    <button
                        className="btn-primary"
                        onClick={activeTab === 'daily' ? handleExportDaily : handleExportMonthly}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px rgba(217, 104, 70, 0.25)' }}
                    >
                        <FileText size={18} />
                        <span>Export PDF</span>
                    </button>
                )}
                {activeTab === 'product' && (
                    <button
                        className="btn-primary"
                        onClick={handleExportProduct}
                        disabled={!selectedProductId}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 6px rgba(217, 104, 70, 0.25)',
                            opacity: !selectedProductId ? 0.5 : 1,
                            cursor: !selectedProductId ? 'not-allowed' : 'pointer'
                        }}
                        title={!selectedProductId ? "Select a product to export report" : "Export Product Report"}
                    >
                        <FileText size={18} />
                        <span>Export PDF</span>
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1px' }}>
                {['daily', 'monthly', 'product'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontWeight: '600',
                            color: activeTab === tab ? 'var(--color-primary-accent)' : '#666',
                            borderBottom: activeTab === tab ? '3px solid var(--color-primary-accent)' : '3px solid transparent',
                            backgroundColor: 'transparent',
                            textTransform: 'capitalize',
                            fontSize: '1rem'
                        }}
                    >
                        {tab} Report
                    </button>
                ))}
            </div>

            {/* Filters */}
            <ReportFilters
                activeTab={activeTab}
                selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
                filterType={filterType} setFilterType={setFilterType}
                onRefresh={() => { }}
            />

            {/* Content */}
            {activeTab === 'daily' && (
                <div className="animate-fade-in">
                    <ReportStatsCards data={dailyData} type="daily" />
                    <ReportCharts data={dailyData} type="daily" products={products} />
                    <ReportTable
                        title="Daily Transactions"
                        transactions={[...dailyData.stockIn, ...dailyData.stockOut]}
                        showTotal={true}
                    />
                </div>
            )}

            {activeTab === 'monthly' && (
                <div className="animate-fade-in">
                    <ReportStatsCards data={monthlyData} type="monthly" />
                    <ReportCharts data={monthlyData} type="monthly" products={products} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
                        <ReportTable
                            title="Sales List"
                            transactions={monthlyData.stockOut}
                            showTotal={true}
                            showDate={true}
                        />
                        <ReportTable
                            title="Stock In History"
                            transactions={monthlyData.stockIn}
                            showDate={true}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'product' && (
                <div className="animate-fade-in">
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <ProductSelectionGrid
                            products={products}
                            onSelect={(p) => setSelectedProductId(p.id)}
                            selectedProductId={selectedProductId}
                        />
                    </div>

                    {selectedProductId && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                                    <p style={{ color: '#666', fontWeight: '600', marginBottom: '0.5rem' }}>TOTAL STOCK IN</p>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{productData.totalIn}</h3>
                                </div>
                                <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                                    <p style={{ color: '#666', fontWeight: '600', marginBottom: '0.5rem' }}>TOTAL STOCK OUT</p>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{productData.totalOut}</h3>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                <button
                                    className="btn-primary"
                                    onClick={handleExportProduct}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <FileText size={18} />
                                    <span>Export PDF</span>
                                </button>
                            </div>

                            <ReportTable
                                title="Transaction History"
                                transactions={productData.transactions}
                                showDate={true}
                                showType={true}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
