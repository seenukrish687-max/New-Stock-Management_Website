export const generateDailyReportText = (dailyData, selectedDate, selectedPlatform) => {
    const { stockIn, stockOut, totalStockIn, totalReturns } = dailyData;

    // Helper to aggregate quantities by product name
    const aggregateByProduct = (transactions) => {
        const map = {};
        transactions.forEach(t => {
            const name = t.productName || 'Unknown Product';
            map[name] = (map[name] || 0) + t.quantity;
        });
        return Object.entries(map).map(([name, qty]) => `${name} — ${qty} pcs`);
    };

    // 1. Stock Summary (Merged) - Sales (Stock Out)
    // "List each unique product only once"
    const salesList = aggregateByProduct(stockOut);

    // 2. Stock In
    const stockInTransactions = stockIn.filter(t => t.type === 'IN');
    const stockInList = aggregateByProduct(stockInTransactions);

    // 3. Returns
    const returnTransactions = stockIn.filter(t => t.type === 'RETURN');
    const returnsList = aggregateByProduct(returnTransactions);

    // Build the report content
    let content = `📅 DAILY STOCK REPORT – ${selectedDate}\n\n`;
    content += `🏷️ Platform: ${selectedPlatform}\n`;
    content += `📦 Stock Summary (Merged)\n\n`;

    if (salesList.length > 0) {
        content += salesList.join('\n\n');
    } else {
        content += "No sales recorded.";
    }

    content += `\n\n📥 Total Stock In\n\n`;
    content += `${totalStockIn}\n\n`;
    if (stockInList.length > 0) {
        content += stockInList.join('\n\n');
    }

    content += `\n\n🔄 Total Returns\n\n`;
    content += `${totalReturns}\n\n`;
    if (returnsList.length > 0) {
        content += returnsList.join('\n\n');
    }

    return content;
};

export const downloadTextFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
