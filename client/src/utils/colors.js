export const getCategoryColor = (category) => {
    if (!category) return { bg: '#f5f5f5', text: '#666666', hex: '#9e9e9e' };

    const colors = [
        { bg: '#e3f2fd', text: '#1565c0', hex: '#2196f3' }, // Blue
        { bg: '#f3e5f5', text: '#7b1fa2', hex: '#9c27b0' }, // Purple
        { bg: '#e0f2f1', text: '#00695c', hex: '#009688' }, // Teal
        { bg: '#fff3e0', text: '#ef6c00', hex: '#ff9800' }, // Orange
        { bg: '#fce4ec', text: '#c2185b', hex: '#e91e63' }, // Pink
        { bg: '#fff8e1', text: '#ff8f00', hex: '#ffc107' }, // Amber
        { bg: '#e8eaf6', text: '#283593', hex: '#3f51b5' }, // Indigo
        { bg: '#f1f8e9', text: '#33691e', hex: '#8bc34a' }, // Light Green
        { bg: '#ffebee', text: '#c62828', hex: '#f44336' }, // Red
        { bg: '#e0f7fa', text: '#006064', hex: '#00bcd4' }, // Cyan
        { bg: '#f9fbe7', text: '#827717', hex: '#cddc39' }, // Lime
        { bg: '#fffde7', text: '#f57f17', hex: '#ffeb3b' }, // Yellow
    ];

    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
};
