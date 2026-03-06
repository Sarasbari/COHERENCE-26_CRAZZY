// Format number as Indian currency (₹ Cr or ₹ Lakh)
export function formatCurrency(amount, inLakhs = true) {
    if (amount === 0) return '₹0';

    if (inLakhs) {
        if (amount >= 10000) {
            return `₹${(amount / 100).toFixed(1)} Cr`;
        }
        return `₹${amount.toFixed(1)} L`;
    }

    // Raw number formatting
    return `₹${amount.toLocaleString('en-IN')}`;
}

// Format percentage
export function formatPercent(value) {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(1)}%`;
}

// Format large numbers with Indian notation
export function formatNumber(num) {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)} L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)} K`;
    return num.toString();
}

// Get trend direction
export function getTrend(current, previous) {
    if (!previous || previous === 0) return { direction: 'neutral', change: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
        direction: change > 2 ? 'up' : change < -2 ? 'down' : 'neutral',
        change: Math.abs(change),
    };
}
