// Helper to convert text to Unicode Sans-Serif Bold
const toBold = (text) => {
    const diffUpper = 0x1D5D4 - 'A'.charCodeAt(0);
    const diffLower = 0x1D5EE - 'a'.charCodeAt(0);
    const diffDigit = 0x1D7E2 - '0'.charCodeAt(0);

    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(code + diffUpper);
        if (code >= 97 && code <= 122) return String.fromCodePoint(code + diffLower);
        if (code >= 48 && code <= 57) return String.fromCodePoint(code + diffDigit);
        return char;
    }).join('');
};

export const generateDailyReportText = (dailyData, selectedDate, selectedPlatform) => {
    const { stockIn, stockOut, totalStockIn, totalReturns } = dailyData;

    // Helper to aggregate quantities by product name
    const aggregateByProduct = (transactions) => {
        const map = {};
        transactions.forEach(t => {
            const name = t.productName || 'Unknown Product';
            map[name] = (map[name] || 0) + t.quantity;
        });
        return Object.entries(map).map(([name, qty]) => `${toBold(name)} — ${qty} pcs`);
    };

    // Build the report content
    let content = `${toBold('📅 DAILY STOCK REPORT')} – ${selectedDate}\n\n`;

    if (selectedPlatform === 'All Platforms') {
        content += `${toBold('🏷️ Platform:')} All Platforms (Breakdown)\n\n`;

        // Get unique platforms from stockOut
        const platforms = [...new Set(stockOut.map(t => t.platform || 'Unknown'))].sort();

        if (platforms.length === 0) {
            content += `${toBold('📦 Stock Summary')}\nNo sales recorded.\n\n`;
        } else {
            platforms.forEach(platform => {
                const platformSales = stockOut.filter(t => (t.platform || 'Unknown') === platform);
                if (platformSales.length > 0) {
                    const salesList = aggregateByProduct(platformSales);
                    content += `----------------------------------------\n`;
                    content += `${toBold('🏷️ Platform:')} ${platform}\n`;
                    content += `${toBold('📦 Stock Summary')}\n\n`;
                    content += salesList.join('\n\n');
                    content += `\n\n`;
                }
            });
            content += `----------------------------------------\n`; // Separator before totals
        }

    } else {
        // Single Platform Mode
        const salesList = aggregateByProduct(stockOut);
        content += `${toBold('🏷️ Platform:')} ${selectedPlatform}\n`;
        content += `${toBold('📦 Stock Summary (Merged)')}\n\n`;

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
            return `${toBold(name)} — ${t.quantity} pcs${note}`;
        });
    };

    const returnsList = formatReturns(returnTransactions);

    content += `----------------------------------------\n`;
    content += `${toBold('📥 Total Stock In')}\n\n`;
    content += `${totalStockIn}\n\n`;
    if (stockInList.length > 0) {
        content += stockInList.join('\n\n');
    }

    content += `\n\n----------------------------------------\n`;
    content += `${toBold('🔄 Total Returns')}\n\n`;
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
