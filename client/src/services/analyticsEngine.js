import { THRESHOLDS } from '../config/constants';
import { calculateZScore, predictSpendingVelocity, calculateCRS, getSeverityFromCRS } from '../utils/calculations';

// ========================
// LAYER 1: RULE-BASED ENGINE
// ========================
function runRuleBasedDetection(records) {
    const anomalies = [];

    records.forEach((record) => {
        // Rule 1: Underspending below threshold
        if (record.allocated > 0 && record.utilization < THRESHOLDS.underspending * 100) {
            anomalies.push({
                id: `rule_under_${record.id}`,
                recordId: record.id,
                type: 'underspending',
                severity: record.utilization < 20 ? 'critical' : 'high',
                division: record.division,
                divisionName: record.divisionName,
                district: record.district,
                department: record.department,
                departmentName: record.departmentName,
                fiscalYear: record.fiscalYear,
                quarter: record.quarter,
                detectedBy: 'rule',
                description: `Utilization at ${record.utilization.toFixed(1)}% — below ${THRESHOLDS.underspending * 100}% threshold`,
                metric: record.utilization,
                allocated: record.allocated,
                spent: record.spent,
            });
        }

        // Rule 2: Zero spend with release
        if (record.spent === 0 && record.released > 0) {
            anomalies.push({
                id: `rule_zero_${record.id}`,
                recordId: record.id,
                type: 'zero_spend',
                severity: 'critical',
                division: record.division,
                divisionName: record.divisionName,
                district: record.district,
                department: record.department,
                departmentName: record.departmentName,
                fiscalYear: record.fiscalYear,
                quarter: record.quarter,
                detectedBy: 'rule',
                description: `₹${(record.released / 100).toFixed(1)} Cr released but zero spending recorded`,
                metric: 0,
                allocated: record.allocated,
                spent: 0,
            });
        }

        // Rule 3: Large allocation-release gap
        if (record.allocated > 0) {
            const gap = (record.allocated - record.released) / record.allocated;
            if (gap > THRESHOLDS.allocationReleaseGap) {
                anomalies.push({
                    id: `rule_gap_${record.id}`,
                    recordId: record.id,
                    type: 'release_gap',
                    severity: gap > 0.4 ? 'high' : 'medium',
                    division: record.division,
                    divisionName: record.divisionName,
                    district: record.district,
                    department: record.department,
                    departmentName: record.departmentName,
                    fiscalYear: record.fiscalYear,
                    quarter: record.quarter,
                    detectedBy: 'rule',
                    description: `Only ${((1 - gap) * 100).toFixed(1)}% of ₹${(record.allocated / 100).toFixed(1)} Cr allocation released`,
                    metric: gap * 100,
                    allocated: record.allocated,
                    spent: record.spent,
                });
            }
        }

        // Rule 4: Spending spike (overspending)
        if (record.spent > record.allocated * THRESHOLDS.overspendingSpike) {
            anomalies.push({
                id: `rule_spike_${record.id}`,
                recordId: record.id,
                type: 'spike',
                severity: 'high',
                division: record.division,
                divisionName: record.divisionName,
                district: record.district,
                department: record.department,
                departmentName: record.departmentName,
                fiscalYear: record.fiscalYear,
                quarter: record.quarter,
                detectedBy: 'rule',
                description: `Spending is ${((record.spent / record.allocated) * 100).toFixed(1)}% of allocation — possible overspending`,
                metric: (record.spent / record.allocated) * 100,
                allocated: record.allocated,
                spent: record.spent,
            });
        }
    });

    return anomalies;
}

// ========================
// LAYER 2: STATISTICAL DETECTOR
// ========================
function runStatisticalDetection(records) {
    const anomalies = [];

    // Group by department to find outlier districts
    const deptGroups = {};
    records.forEach((r) => {
        const key = `${r.department}_${r.fiscalYear}_${r.quarter}`;
        if (!deptGroups[key]) deptGroups[key] = [];
        deptGroups[key].push(r);
    });

    Object.entries(deptGroups).forEach(([key, group]) => {
        if (group.length < 3) return; // Need at least 3 data points

        const utilizations = group.map((r) => r.utilization);

        group.forEach((record) => {
            const zScore = calculateZScore(record.utilization, utilizations);

            if (Math.abs(zScore) > THRESHOLDS.zScoreThreshold) {
                anomalies.push({
                    id: `stat_z_${record.id}`,
                    recordId: record.id,
                    type: zScore < 0 ? 'statistical_low' : 'statistical_high',
                    severity: Math.abs(zScore) > 3 ? 'critical' : 'high',
                    division: record.division,
                    divisionName: record.divisionName,
                    district: record.district,
                    department: record.department,
                    departmentName: record.departmentName,
                    fiscalYear: record.fiscalYear,
                    quarter: record.quarter,
                    detectedBy: 'statistical',
                    description: `Z-score of ${zScore.toFixed(2)} — ${record.district} is a statistical outlier in ${record.departmentName} spending`,
                    metric: zScore,
                    allocated: record.allocated,
                    spent: record.spent,
                });
            }
        });
    });

    return anomalies;
}

// ========================
// COMBINED ANALYTICS ENGINE
// ========================
export function runFullAnalysis(records) {
    // Layer 1: Rule-based
    const ruleAnomalies = runRuleBasedDetection(records);

    // Layer 2: Statistical
    const statAnomalies = runStatisticalDetection(records);

    // Deduplicate by record ID (keep highest severity)
    const allAnomalies = [...ruleAnomalies, ...statAnomalies];
    const deduped = {};
    allAnomalies.forEach((a) => {
        const key = a.recordId;
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (!deduped[key] || severityOrder[a.severity] > severityOrder[deduped[key].severity]) {
            deduped[key] = a;
        }
    });

    const anomalies = Object.values(deduped);

    // Calculate Corruption Risk Scores per division
    const crsScores = {};
    const divGroups = {};
    records.forEach((r) => {
        if (!divGroups[r.division]) divGroups[r.division] = [];
        divGroups[r.division].push(r);
    });

    Object.entries(divGroups).forEach(([div, divRecords]) => {
        const score = calculateCRS(divRecords);
        crsScores[div] = {
            score,
            severity: getSeverityFromCRS(score),
            division: div,
        };
    });

    // Fund lapse predictions
    const lapsePredictions = calculateLapsePredictions(records);

    // Summary stats
    const totalAllocated = records.reduce((s, r) => s + r.allocated, 0);
    const totalSpent = records.reduce((s, r) => s + r.spent, 0);
    const totalReleased = records.reduce((s, r) => s + r.released, 0);

    return {
        anomalies,
        anomalyCount: anomalies.length,
        criticalCount: anomalies.filter((a) => a.severity === 'critical').length,
        highCount: anomalies.filter((a) => a.severity === 'high').length,
        mediumCount: anomalies.filter((a) => a.severity === 'medium').length,
        crsScores,
        lapsePredictions,
        summary: {
            totalAllocated,
            totalReleased,
            totalSpent,
            overallUtilization: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
            totalRecords: records.length,
        },
    };
}

// ========================
// FUND LAPSE PREDICTIONS
// ========================
function calculateLapsePredictions(records) {
    const predictions = {};

    // Group by department + division + year
    const groups = {};
    records.forEach((r) => {
        const key = `${r.department}_${r.division}_${r.fiscalYear}`;
        if (!groups[key]) groups[key] = { records: [], department: r.department, departmentName: r.departmentName, division: r.division, divisionName: r.divisionName, fiscalYear: r.fiscalYear };
        groups[key].records.push(r);
    });

    Object.entries(groups).forEach(([key, group]) => {
        const totalAlloc = group.records.reduce((s, r) => s + r.allocated, 0);
        const totalSpent = group.records.reduce((s, r) => s + r.spent, 0);
        const quartersElapsed = group.records.length;

        const prediction = predictSpendingVelocity(totalSpent, totalAlloc, quartersElapsed);

        if (prediction.willLapse) {
            predictions[key] = {
                ...prediction,
                department: group.department,
                departmentName: group.departmentName,
                division: group.division,
                divisionName: group.divisionName,
                fiscalYear: group.fiscalYear,
            };
        }
    });

    return predictions;
}

// ========================
// DEPARTMENT LEADERBOARD
// ========================
export function getDepartmentLeaderboard(records) {
    const deptMap = {};

    records.forEach((r) => {
        if (!deptMap[r.department]) {
            deptMap[r.department] = {
                department: r.department,
                departmentName: r.departmentName,
                allocated: 0,
                spent: 0,
                released: 0,
                anomalyCount: 0,
            };
        }
        deptMap[r.department].allocated += r.allocated;
        deptMap[r.department].spent += r.spent;
        deptMap[r.department].released += r.released;
        if (r.hasAnomaly) deptMap[r.department].anomalyCount++;
    });

    return Object.values(deptMap)
        .map((d) => ({
            ...d,
            utilization: d.allocated > 0 ? (d.spent / d.allocated) * 100 : 0,
            releaseEfficiency: d.allocated > 0 ? (d.released / d.allocated) * 100 : 0,
            // Score: higher utilization + lower anomaly rate = better
            score: Math.max(0, (d.allocated > 0 ? (d.spent / d.allocated) * 100 : 0) - (d.anomalyCount * 2)),
        }))
        .sort((a, b) => b.score - a.score);
}
