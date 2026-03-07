import { THRESHOLDS } from '../config/constants';

// ========================
// Z-SCORE CALCULATION
// ========================
export function calculateZScore(value, dataset) {
    if (!dataset || dataset.length < 2) return 0;
    
    // Sort array for median calculations
    const sorted = [...dataset].sort((a, b) => a - b);
    
    // Helper to calculate median
    const getMedian = (arr) => {
        const mid = Math.floor(arr.length / 2);
        return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    };

    const median = getMedian(sorted);
    
    // Calculate Median Absolute Deviation (MAD)
    const deviations = dataset.map(v => Math.abs(v - median));
    const sortedDeviations = [...deviations].sort((a, b) => a - b);
    const mad = getMedian(sortedDeviations);
        
    // If MAD is exactly zero, fallback to sample standard deviation
    // to avoid division by zero when highly clustered data exists.
    if (mad === 0) {
        const mean = dataset.reduce((sum, v) => sum + v, 0) / dataset.length;
        const variance = dataset.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (dataset.length - 1); // Bessel's correction
        const stdDev = Math.sqrt(variance);
        if (stdDev === 0) return 0;
        return (value - mean) / stdDev;
    }
    
    // Modified Z-Score calculation (0.6745 is the ~75th percentile of normal distribution)
    return (0.6745 * (value - median)) / mad;
}

// ========================
// UTILIZATION PERCENTAGE
// ========================
export function calcUtilization(spent, allocated) {
    if (!allocated || allocated === 0) return 0;
    return (spent / allocated) * 100;
}

// ========================
// GROWTH RATE
// ========================
export function calcGrowthRate(current, previous) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
}

// ========================
// MOVING AVERAGE
// ========================
export function movingAverage(data, windowSize = 3) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        if (i < windowSize - 1) {
            result.push(null);
        } else {
            const window = data.slice(i - windowSize + 1, i + 1);
            const avg = window.reduce((sum, v) => sum + v, 0) / windowSize;
            result.push(avg);
        }
    }
    return result;
}

// ========================
// SPENDING VELOCITY
// ========================
// Predicts if funds will be fully utilized by year end based on current rate
export function predictSpendingVelocity(spentSoFar, totalAllocated, quartersElapsed) {
    if (quartersElapsed === 0) return { projected: 0, willLapse: false, lapseAmount: totalAllocated };

    const ratePerQuarter = spentSoFar / quartersElapsed;
    const remainingQuarters = 4 - quartersElapsed;
    const projected = spentSoFar + (ratePerQuarter * remainingQuarters);
    const willLapse = projected < totalAllocated * (1 - THRESHOLDS.underspending);
    const lapseAmount = Math.max(0, totalAllocated - projected);

    return {
        projected: Math.round(projected),
        willLapse,
        lapseAmount: Math.round(lapseAmount),
        projectedUtilization: totalAllocated > 0 ? (projected / totalAllocated) * 100 : 0,
    };
}

// ========================
// CORRUPTION RISK SCORE (CRS)
// ========================
// Composite score 0-100 based on multiple factors
export function calculateCRS(records) {
    if (!records || records.length === 0) return 0;

    let score = 0;
    const totalRecords = records.length;

    // Factor 1: Underspending frequency (0-25 points)
    const underspent = records.filter(r => r.utilization < THRESHOLDS.underspending * 100).length;
    score += (underspent / totalRecords) * 25;

    // Factor 2: Zero-spend incidents (0-25 points)
    const zeroSpend = records.filter(r => r.spent === 0 && r.released > 0).length;
    score += (zeroSpend / totalRecords) * 25;

    // Factor 3: Allocation-release gap (0-25 points)
    const releaseGaps = records.filter(r => {
        const gap = (r.allocated - r.released) / r.allocated;
        return gap > THRESHOLDS.allocationReleaseGap;
    }).length;
    score += (releaseGaps / totalRecords) * 25;

    // Factor 4: Spending spikes (0-25 points)
    const spikes = records.filter(r => r.spent > r.allocated * THRESHOLDS.overspendingSpike).length;
    score += (spikes / totalRecords) * 25;

    return Math.min(100, Math.round(score));
}

// ========================
// HEALTH COLOR MAPPING
// ========================
export function getHealthColor(utilization) {
    if (utilization >= 80) return '#22c55e';   // Green — healthy
    if (utilization >= 60) return '#eab308';   // Yellow — warning
    if (utilization >= 40) return '#f97316';   // Orange — concerning
    return '#ef4444';                          // Red — critical
}

export function getSeverityFromCRS(score) {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
}
