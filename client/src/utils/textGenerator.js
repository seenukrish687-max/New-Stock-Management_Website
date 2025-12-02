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

    // Build the report content
    let content = `📅 DAILY STOCK REPORT – ${selectedDate}\n\n`;

    if (selectedPlatform === 'All Platforms') {
        content += `🏷️ Platform: All Platforms (Breakdown)\n\n`;

        // Get unique platforms from stockOut
        const platforms = [...new Set(stockOut.map(t => t.platform || 'Unknown'))].sort();

        if (platforms.length === 0) {
            content += `📦 Stock Summary\nNo sales recorded.\n\n`;
        } else {
            platforms.forEach(platform => {
                const platformSales = stockOut.filter(t => (t.platform || 'Unknown') === platform);
                if (platformSales.length > 0) {
                    const salesList = aggregateByProduct(platformSales);
                    content += `----------------------------------------\n`;
                    content += `🏷️ Platform: ${platform}\n`;
                    content += `📦 Stock Summary\n\n`;
                    content += salesList.join('\n\n');
                    content += `\n\n`;
                }
            });
            content += `----------------------------------------\n`; // Separator before totals
        }

    } else {
        // Single Platform Mode
        const salesList = aggregateByProduct(stockOut);
        content += `🏷️ Platform: ${selectedPlatform}\n`;
        content += `📦 Stock Summary (Merged)\n\n`;

        if (salesList.length > 0) {
            content += salesList.join('\n\n');
        } else {
            content += "No sales recorded.";
        }
        content += `\n\n`;
    }

    // 2. Stock In (Global/Total as per request context)
    const stockInTransactions = stockIn.filter(t => t.type === 'IN');
    const stockInList = aggregateByProduct(stockInTransactions);

    // 3. Returns (Global/Total as per request context)
    const returnTransactions = stockIn.filter(t => t.type === 'RETURN');

    // Custom aggregator for returns to include notes
    const formatReturns = (transactions) => {
        if (transactions.length === 0) return [];
        return transactions.map(t => {
            const name = t.productName || 'Unknown Product';
            const note = t.notes ? ` (Note: ${t.notes})` : '';
            return `${name} — ${t.quantity} pcs${note}`;
        });
    };

    const returnsList = formatReturns(returnTransactions);

    content += `📥 Total Stock In\n\n`;
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
