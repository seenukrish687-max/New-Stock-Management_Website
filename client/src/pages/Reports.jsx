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
    const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');

    // --- Daily Report Logic ---
    const dailyData = useMemo(() => {
        let stockIn = transactions.stockIn.filter(t => t.date === selectedDate);
        let stockOut = transactions.stockOut.filter(t => t.date === selectedDate);

        if (filterType === 'IN') {
            stockOut = [];
            stockIn = stockIn.filter(t => t.type === 'IN');
        }
        if (filterType === 'OUT') stockIn = [];
        if (filterType === 'RETURN') {
            stockIn = stockIn.filter(t => t.type === 'RETURN');
            stockOut = [];
        }

        if (selectedProductId) {
            stockIn = stockIn.filter(t => t.productId === selectedProductId);
            stockOut = stockOut.filter(t => t.productId === selectedProductId);
        }

        if (selectedPlatform !== 'All Platforms') {
            stockOut = stockOut.filter(t => t.platform === selectedPlatform);
            // Stock In doesn't usually have a platform, but Returns might. 
            // Assuming Returns have platform, filter them. Normal Stock In (type 'IN') usually doesn't have platform.
            // If we want to filter Returns by platform:
            stockIn = stockIn.filter(t => t.type === 'IN' || t.platform === selectedPlatform);
        }

        const totalSales = stockOut.reduce((sum, t) => sum + (t.quantity * t.sellingPriceAtTime), 0);
        const totalStockOut = stockOut.reduce((sum, t) => sum + t.quantity, 0);
        const totalReturns = stockIn.filter(t => t.type === 'RETURN').reduce((sum, t) => sum + t.quantity, 0);
        const totalStockIn = stockIn.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0);

        return { stockIn, stockOut, totalSales, totalStockOut, totalReturns, totalStockIn };
    }, [transactions, selectedDate, filterType, selectedProductId, selectedPlatform]);

    // --- Monthly Report Logic ---
    const monthlyData = useMemo(() => {
        let stockOut = transactions.stockOut.filter(t => t.date.startsWith(selectedMonth));
        let stockIn = transactions.stockIn.filter(t => t.date.startsWith(selectedMonth));

        if (filterType === 'IN') {
            stockOut = [];
            stockIn = stockIn.filter(t => t.type === 'IN');
        }
        if (filterType === 'OUT') stockIn = [];
        if (filterType === 'RETURN') {
            stockIn = stockIn.filter(t => t.type === 'RETURN');
            stockOut = [];
        }

        if (selectedProductId) {
            stockIn = stockIn.filter(t => t.productId === selectedProductId);
            stockOut = stockOut.filter(t => t.productId === selectedProductId);
        }

        if (selectedPlatform !== 'All Platforms') {
            stockOut = stockOut.filter(t => t.platform === selectedPlatform);
            stockIn = stockIn.filter(t => t.type === 'IN' || t.platform === selectedPlatform);
        }

        const totalRevenue = stockOut.reduce((sum, t) => sum + (t.quantity * t.sellingPriceAtTime), 0);
        const totalUnitsSold = stockOut.reduce((sum, t) => sum + t.quantity, 0);
        const totalReturns = stockIn.filter(t => t.type === 'RETURN').reduce((sum, t) => sum + t.quantity, 0);
        const totalStockIn = stockIn.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0);

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

        return { totalRevenue, totalUnitsSold, profit, topProducts, stockOut, stockIn, totalReturns, totalStockIn };
    }, [transactions, products, selectedMonth, filterType, selectedProductId, selectedPlatform]);

    // --- Product Report Logic ---
    const productData = useMemo(() => {
        if (!selectedProductId) return { transactions: [], totalIn: 0, totalOut: 0 };
        const pStockIn = transactions.stockIn.filter(t => t.productId === selectedProductId);
        const pStockOut = transactions.stockOut.filter(t => t.productId === selectedProductId);

        let allTrans = [...pStockIn, ...pStockOut].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (selectedPlatform !== 'All Platforms') {
            allTrans = allTrans.filter(t => t.type === 'IN' || t.platform === selectedPlatform);
        }

        const totalIn = pStockIn.reduce((sum, t) => sum + t.quantity, 0);
        const totalOut = pStockOut.filter(t => selectedPlatform === 'All Platforms' || t.platform === selectedPlatform).reduce((sum, t) => sum + t.quantity, 0);

        return { transactions: allTrans, totalIn, totalOut };
    }, [transactions, selectedProductId, selectedPlatform]);

    // --- PDF Export Logic ---
    const handleExportDaily = () => {
        try {
            generateDailyReportPDF(dailyData, selectedDate, filterType, selectedPlatform);
        } catch (error) {
            console.error("PDF Export Failed:", error);
            showToast("Failed to export PDF: " + error.message, 'error');
        }
    };

    const handleExportMonthly = () => {
        try {
            generateMonthlyReportPDF(monthlyData, selectedMonth, selectedPlatform);
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
                generateProductReportPDF(productData, product, selectedPlatform);
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
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <ReportFilters
                    activeTab={activeTab}
                    selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                    selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
                    filterType={filterType} setFilterType={setFilterType}
                    products={products}
                    selectedProductId={selectedProductId}
                    setSelectedProductId={setSelectedProductId}
                    onRefresh={() => { }}
                />

                {/* Platform Filter */}
                <select
                    className="input-field"
                    style={{ width: 'auto', minWidth: '150px' }}
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                    <option value="All Platforms">All Platforms</option>
                    <option value="Tiktok">Tiktok</option>
                    <option value="Whatsapp">Whatsapp</option>
                    <option value="Lazada">Lazada</option>
                    <option value="Shopee">Shopee</option>
                    <option value="NVS SAMA SAMA">NVS SAMA SAMA</option>
                    <option value="Walk-in">Walk-in</option>
                </select>
            </div>

            {/* Selected Product Preview */}
            {selectedProductId && (activeTab === 'daily' || activeTab === 'monthly') && (
                <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {(() => {
                        const product = products.find(p => p.id === selectedProductId);
                        if (!product) return null;
                        const data = activeTab === 'daily' ? dailyData : monthlyData;
                        return (
                            <>
                                <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                                    {product.imageURL ? (
                                        <img
                                            src={product.imageURL}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=No+Img'; }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Img</div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{product.name}</h3>
                                    <div style={{ display: 'flex', gap: '2rem' }}>
                                        <div>
                                            <p style={{ color: '#666', fontSize: '0.875rem' }}>Sales</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                                                {activeTab === 'daily' ? `RM ${data.totalSales.toFixed(2)}` : `RM ${data.totalRevenue.toFixed(2)}`}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ color: '#666', fontSize: '0.875rem' }}>Stock In</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#8b5cf6' }}>{data.totalStockIn}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: '#666', fontSize: '0.875rem' }}>Stock Out</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                                {activeTab === 'daily' ? data.totalStockOut : data.totalUnitsSold}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ color: '#666', fontSize: '0.875rem' }}>Returns</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>{data.totalReturns}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* Content */}
            {activeTab === 'daily' && (
                <div className="animate-fade-in">
                    <ReportStatsCards data={dailyData} type="daily" />
                    <ReportCharts data={dailyData} type="daily" products={products} />
                    <ReportTable
                        title="Daily Transactions"
                        transactions={[...dailyData.stockIn, ...dailyData.stockOut]}
                        showTotal={true}
                        products={products}
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
                            products={products}
                        />
                        <ReportTable
                            title="Stock In History"
                            transactions={monthlyData.stockIn}
                            showDate={true}
                            products={products}
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
                                products={products}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
