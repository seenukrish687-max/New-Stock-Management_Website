import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { useToast } from '../context/ToastContext';
import { FileText, Camera } from 'lucide-react';
import ReportStatsCards from '../components/ReportStatsCards';
import ReportCharts from '../components/ReportCharts';
import ReportTable from '../components/ReportTable';
import ReportFilters from '../components/ReportFilters';
import ProductSelectionGrid from '../components/ProductSelectionGrid';
import { generateDailyReportPDF, generateMonthlyReportPDF, generateProductReportPDF } from '../utils/pdfGenerator';
import html2canvas from 'html2canvas';
import ErrorBoundary from '../components/ErrorBoundary';

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
        try {
            if (!transactions || !transactions.stockIn || !transactions.stockOut) {
                return { stockIn: [], stockOut: [], totalSales: 0, totalStockOut: 0, totalReturns: 0, totalStockIn: 0 };
            }

            let stockIn = transactions.stockIn.filter(t => t.date === selectedDate) || [];
            let stockOut = transactions.stockOut.filter(t => t.date === selectedDate) || [];

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

            const totalSales = stockOut.reduce((sum, t) => sum + (t.quantity * (t.sellingPriceAtTime || 0)), 0);
            const totalStockOut = stockOut.reduce((sum, t) => sum + t.quantity, 0);
            const totalReturns = stockIn.filter(t => t.type === 'RETURN').reduce((sum, t) => sum + t.quantity, 0);
            const totalStockIn = stockIn.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0);

            return { stockIn, stockOut, totalSales, totalStockOut, totalReturns, totalStockIn };
        } catch (error) {
            console.error("Error calculating daily data:", error);
            return { stockIn: [], stockOut: [], totalSales: 0, totalStockOut: 0, totalReturns: 0, totalStockIn: 0 };
        }
    }, [transactions, selectedDate, filterType, selectedProductId, selectedPlatform]);

    // --- Monthly Report Logic ---
    const monthlyData = useMemo(() => {
        try {
            if (!transactions || !transactions.stockIn || !transactions.stockOut) {
                return {
                    totalRevenue: 0, totalUnitsSold: 0, profit: 0, topProducts: [],
                    stockOut: [], stockIn: [], totalReturns: 0, totalStockIn: 0,
                    platformPerformance: [], monthlyInsights: {}, closingStock: []
                };
            }

            let stockOut = transactions.stockOut.filter(t => t.date && t.date.startsWith(selectedMonth)) || [];
            let stockIn = transactions.stockIn.filter(t => t.date && t.date.startsWith(selectedMonth)) || [];

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

            const totalRevenue = stockOut.reduce((sum, t) => sum + (t.quantity * (t.sellingPriceAtTime || 0)), 0);
            const totalUnitsSold = stockOut.reduce((sum, t) => sum + t.quantity, 0);
            const totalReturns = stockIn.filter(t => t.type === 'RETURN').reduce((sum, t) => sum + t.quantity, 0);
            const totalStockIn = stockIn.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0);

            let totalCost = 0;
            const productSales = {};

            stockOut.forEach(t => {
                const product = products ? products.find(p => p.id === t.productId) : null;
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

            // --- Platform Performance ---
            const platformStats = {};
            stockOut.forEach(t => {
                const p = t.platform || 'Unknown';
                if (!platformStats[p]) platformStats[p] = { sales: 0, returns: 0 };
                platformStats[p].sales += t.quantity;
            });
            stockIn.filter(t => t.type === 'RETURN').forEach(t => {
                const p = t.platform || 'Unknown';
                if (!platformStats[p]) platformStats[p] = { sales: 0, returns: 0 };
                platformStats[p].returns += t.quantity;
            });

            const platformPerformance = Object.entries(platformStats).map(([platform, stats]) => {
                const percentage = totalUnitsSold > 0 ? (stats.sales / totalUnitsSold) * 100 : 0;
                const net = stats.sales - stats.returns;
                return { platform, ...stats, percentage, net };
            });

            // --- Auto Insights ---
            const bestSellingProduct = topProducts[0]?.name || 'N/A';

            // Week with highest sales
            const weeklySales = {};
            stockOut.forEach(t => {
                if (!t.date) return;
                const date = new Date(t.date);
                if (isNaN(date.getTime())) return;
                const weekNum = Math.ceil((date.getDate() - 1 - date.getDay()) / 7); // Rough week number
                if (!weeklySales[weekNum]) weeklySales[weekNum] = 0;
                weeklySales[weekNum] += t.quantity;
            });
            const highestSalesWeek = Object.entries(weeklySales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

            // Platform with highest sales (Growth proxy)
            const highestGrowthPlatform = platformPerformance.sort((a, b) => b.sales - a.sales)[0]?.platform || 'N/A';

            // Products with unusual returns (Return rate > 20%)
            const unusualReturns = [];
            Object.keys(productSales).forEach(prodName => {
                const sales = productSales[prodName];
                const returns = stockIn.filter(t => t.type === 'RETURN' && t.productName === prodName).reduce((sum, t) => sum + t.quantity, 0);
                if (sales > 5 && (returns / sales) > 0.2) {
                    unusualReturns.push(prodName);
                }
            });

            const monthlyInsights = {
                bestSellingProduct,
                highestSalesWeek: `Week ${highestSalesWeek}`,
                highestGrowthPlatform,
                unusualReturns: unusualReturns.join(', ') || 'None',
                recommendations: unusualReturns.length > 0 ? `Check quality for: ${unusualReturns.join(', ')}` : 'Promote top performing products.'
            };

            // --- Closing Stock Calculation (Reverse Engineering) ---
            const [year, month] = selectedMonth.split('-');
            const lastDayOfMonth = new Date(year, month, 0); // Last day of selected month
            lastDayOfMonth.setHours(23, 59, 59, 999);

            const closingStock = (products || []).map(product => {
                let stock = product.currentStock;

                // Find transactions AFTER the selected month
                const futureTransactions = transactions.stockIn.concat(transactions.stockOut).filter(t => {
                    if (!t.date) return false;
                    const tDate = new Date(t.date);
                    return tDate > lastDayOfMonth && t.productId === product.id;
                });

                futureTransactions.forEach(t => {
                    if (t.type === 'IN') {
                        stock -= t.quantity; // Reverse Stock In
                    } else if (t.type === 'OUT') {
                        stock += t.quantity; // Reverse Stock Out
                    } else if (t.type === 'RETURN') {
                        stock -= t.quantity; // Reverse Return (which added to stock)
                    }
                });

                return {
                    name: product.name,
                    category: product.category,
                    closingStock: stock
                };
            });

            return { totalRevenue, totalUnitsSold, profit, topProducts, stockOut, stockIn, totalReturns, totalStockIn, platformPerformance, monthlyInsights, closingStock };
        } catch (error) {
            console.error("Error calculating monthly data:", error);
            return {
                totalRevenue: 0, totalUnitsSold: 0, profit: 0, topProducts: [],
                stockOut: [], stockIn: [], totalReturns: 0, totalStockIn: 0,
                platformPerformance: [], monthlyInsights: {}, closingStock: []
            };
        }
    }, [transactions, products, selectedMonth, filterType, selectedProductId, selectedPlatform]);

    // --- Product Report Logic ---
    const productData = useMemo(() => {

        if (!selectedProductId) return { transactions: [], totalIn: 0, totalOut: 0 };
        const pStockIn = transactions?.stockIn?.filter(t => t.productId === selectedProductId) || [];
        const pStockOut = transactions?.stockOut?.filter(t => t.productId === selectedProductId) || [];

        let allTrans = [...pStockIn, ...pStockOut].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (selectedPlatform !== 'All Platforms') {
            allTrans = allTrans.filter(t => t.type === 'IN' || t.platform === selectedPlatform);
        }

        const totalIn = pStockIn.reduce((sum, t) => sum + t.quantity, 0);
        const totalOut = pStockOut.filter(t => selectedPlatform === 'All Platforms' || t.platform === selectedPlatform).reduce((sum, t) => sum + t.quantity, 0);

        return { transactions: allTrans, totalIn, totalOut };
    }, [transactions, selectedProductId, selectedPlatform]);

    // --- Intelligent Notes Logic ---
    const intelligentNotes = useMemo(() => {
        if (!dailyData.stockOut.length && !dailyData.stockIn.length) return {};

        // Top-selling platform
        const platformSales = {};
        dailyData.stockOut.forEach(t => {
            const p = t.platform || 'Unknown';
            platformSales[p] = (platformSales[p] || 0) + t.quantity;
        });
        const topPlatform = Object.entries(platformSales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const lowestPlatform = Object.entries(platformSales).sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A';

        // Products with highest return rate
        const returnCounts = {};
        dailyData.stockIn.filter(t => t.type === 'RETURN').forEach(t => {
            returnCounts[t.productName] = (returnCounts[t.productName] || 0) + t.quantity;
        });
        const highestReturnProduct = Object.entries(returnCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

        // Recommendation
        let recommendation = 'Maintain current stock levels.';
        if (highestReturnProduct !== 'None') {
            recommendation = `Investigate quality issues with ${highestReturnProduct}.`;
        } else if (dailyData.totalSales > 50) {
            recommendation = 'Sales are high! Consider restocking popular items.';
        }

        return { topPlatform, lowestPlatform, highestReturnProduct, recommendation };
    }, [dailyData]);

    const generateWhatsAppSummary = () => {
        const date = selectedDate;
        let text = `🔰 📊 DAILY STOCK REPORT – ${date}\n\n`;
        text += `✔️ Auto-formatted for WhatsApp Groups\n`;
        text += `✔️ Easy to read\n`;
        text += `✔️ Clean breakdown with icons\n\n`;

        // Sales Breakdown
        text += `💻 Platform: ${selectedPlatform === 'All Platforms' ? 'All' : selectedPlatform}\n`;
        dailyData.stockOut.forEach(t => {
            text += `• 🧺 ${t.productName} — ${t.quantity} pcs\n`;
        });
        text += `\n`;

        // Stock In
        text += `📦 Total Stock In: ${dailyData.totalStockIn} units\n`;
        text += `➡️ Products Received\n`;
        dailyData.stockIn.filter(t => t.type === 'IN').forEach(t => {
            text += `• 📌 ${t.productName} — ${t.quantity}\n`;
        });
        text += `\n`;

        // Returns
        text += `↩️ Total Returns: ${dailyData.totalReturns} units\n`;
        dailyData.stockIn.filter(t => t.type === 'RETURN').forEach(t => {
            text += `• 🛑 ${t.productName} — *${t.quantity}\n`;
        });

        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    };

    const handleShareImage = async () => {
        const reportElement = document.getElementById('report-content');
        if (!reportElement) return;

        try {
            showToast("Generating image...", "info");
            const canvas = await html2canvas(reportElement, {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    showToast("Failed to generate image.", "error");
                    return;
                }

                const file = new File([blob], `Daily_Report_${selectedDate}.png`, { type: 'image/png' });

                // Check if Web Share API is supported and can share files
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Daily Stock Report',
                            text: `Daily Stock Report for ${selectedDate}`
                        });
                        showToast("Shared successfully!", "success");
                    } catch (shareError) {
                        if (shareError.name !== 'AbortError') {
                            console.error("Share failed:", shareError);
                            // Fallback to download if share fails (but not if user cancelled)
                            downloadImage(blob);
                        }
                    }
                } else {
                    // Fallback for Desktop/Unsupported browsers
                    downloadImage(blob);
                }
            }, 'image/png');

        } catch (error) {
            console.error("Error generating image:", error);
            showToast("Error generating image.", "error");
        }
    };

    const downloadImage = (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Daily_Report_${selectedDate}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Image downloaded. Attach it to WhatsApp Web.", "success");
        setTimeout(() => window.open('https://wa.me/', '_blank'), 1500);
    };

    const [showPreview, setShowPreview] = useState(false);
    const [previewType, setPreviewType] = useState('daily'); // 'daily' or 'monthly'

    // --- PDF Export Logic ---
    const handleExportDaily = () => {
        setPreviewType('daily');
        setShowPreview(true);
    };

    const confirmExportDaily = () => {
        try {
            generateDailyReportPDF(dailyData, selectedDate, filterType, selectedPlatform, intelligentNotes, products);
            setShowPreview(false);
            showToast("Report downloaded successfully!", "success");
        } catch (error) {
            console.error("PDF Export Failed:", error);
            showToast("Failed to export PDF: " + error.message, 'error');
        }
    };

    const handleExportMonthly = () => {
        setPreviewType('monthly');
        setShowPreview(true);
    };

    const confirmExportMonthly = () => {
        try {
            generateMonthlyReportPDF(monthlyData, selectedMonth, selectedPlatform, products);
            setShowPreview(false);
            showToast("Report downloaded successfully!", "success");
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
        <ErrorBoundary>
            <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem' }}>Reports Dashboard</h2>
                        <p style={{ color: '#666' }}>Overview of your inventory performance</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {activeTab === 'daily' && (
                            <>
                                <button
                                    className="btn-primary"
                                    onClick={generateWhatsAppSummary}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        backgroundColor: '#25D366', // WhatsApp Green
                                        boxShadow: '0 4px 6px rgba(37, 211, 102, 0.25)'
                                    }}
                                    title="Share as Text"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                    </svg>
                                    <span>Text</span>
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleShareImage}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        backgroundColor: '#128C7E', // WhatsApp Teal
                                        boxShadow: '0 4px 6px rgba(18, 140, 126, 0.25)'
                                    }}
                                    title="Share as Image"
                                >
                                    <Camera size={18} />
                                    <span>Image</span>
                                </button>
                            </>
                        )}
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
                    </div>
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
                    products={products}
                    selectedProductId={selectedProductId}
                    setSelectedProductId={setSelectedProductId}
                    selectedPlatform={selectedPlatform}
                    setSelectedPlatform={setSelectedPlatform}
                    onRefresh={() => { }}
                />

                {/* Selected Product Preview */}
                {selectedProductId && (activeTab === 'daily' || activeTab === 'monthly') && (
                    <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        {(() => {
                            const product = products ? products.find(p => p.id === selectedProductId) : null;
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
                    <div id="report-content" className="animate-fade-in" style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px' }}>
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
                {/* Preview Modal */}
                {showPreview && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Report Preview</h3>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontWeight: 'bold', color: '#2563EB' }}>
                                    {previewType === 'daily' ? 'Intelligent Notes' : 'Auto Insights'}
                                </h4>
                                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                                    {previewType === 'daily' ? (
                                        <>
                                            <li><strong>Top-selling Platform:</strong> {intelligentNotes.topPlatform}</li>
                                            <li><strong>Lowest Sales Platform:</strong> {intelligentNotes.lowestPlatform}</li>
                                            <li><strong>Highest Return Product:</strong> {intelligentNotes.highestReturnProduct}</li>
                                            <li><strong>Recommendation:</strong> {intelligentNotes.recommendation}</li>
                                        </>
                                    ) : (
                                        <>
                                            <li><strong>Best-selling Product:</strong> {monthlyData.monthlyInsights.bestSellingProduct}</li>
                                            <li><strong>Highest Sales Week:</strong> {monthlyData.monthlyInsights.highestSalesWeek}</li>
                                            <li><strong>Top Platform:</strong> {monthlyData.monthlyInsights.highestGrowthPlatform}</li>
                                            <li><strong>Unusual Returns:</strong> {monthlyData.monthlyInsights.unusualReturns}</li>
                                            <li><strong>Recommendation:</strong> {monthlyData.monthlyInsights.recommendations}</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setShowPreview(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}>Cancel</button>
                                <button onClick={previewType === 'daily' ? confirmExportDaily : confirmExportMonthly} className="btn-primary">Download PDF</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default Reports;
