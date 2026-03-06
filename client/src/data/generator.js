import { DIVISIONS, DEPARTMENTS, FISCAL_YEARS, QUARTERS } from '../config/constants';

// ========================
// DATA GENERATOR
// ========================
// Generates 5 years of quarterly budget data for 3 divisions, their districts, and 8 departments
// with realistic variance and embedded anomalies

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;

// Base budget allocations per department (in Lakhs) — annual
const BASE_ALLOCATIONS = {
    education: { min: 800, max: 2500 },
    public_health: { min: 600, max: 2000 },
    pwd: { min: 1000, max: 3000 },
    agriculture: { min: 400, max: 1500 },
    rural_dev: { min: 500, max: 1800 },
    urban_dev: { min: 700, max: 2200 },
    water_supply: { min: 300, max: 1200 },
    revenue_forest: { min: 200, max: 900 },
};

// Year-over-year growth factor
const YOY_GROWTH = { min: 1.03, max: 1.12 };

// Quarterly spending patterns (% of annual typically spent per quarter)
const QUARTER_PATTERNS = {
    Q1: { spendRatio: 0.15, variance: 0.05 },  // Slow start
    Q2: { spendRatio: 0.25, variance: 0.08 },  // Picking up
    Q3: { spendRatio: 0.30, variance: 0.07 },  // Peak
    Q4: { spendRatio: 0.30, variance: 0.10 },  // Rush to spend
};

// Anomaly injection — 15% of records get anomalous patterns
const ANOMALY_TYPES = [
    'underspending',    // Spending way below allocation
    'spike',            // Sudden jump in spending
    'zero_spend',       // Allocated and released but nothing spent
    'release_gap',      // Large gap between allocation and release
    'lapse_risk',       // Q4 with very low utilization
];

function injectAnomaly(record, type) {
    const anomaly = { ...record, hasAnomaly: true, anomalyType: type };

    switch (type) {
        case 'underspending':
            anomaly.spent = Math.floor(anomaly.allocated * randomFloat(0.05, 0.25));
            anomaly.anomalyDescription = `Severe underspending: only ${((anomaly.spent / anomaly.allocated) * 100).toFixed(1)}% utilization`;
            break;
        case 'spike':
            anomaly.spent = Math.floor(anomaly.allocated * randomFloat(1.2, 2.5));
            anomaly.anomalyDescription = `Spending spike: ${((anomaly.spent / anomaly.allocated) * 100).toFixed(1)}% of allocation used`;
            break;
        case 'zero_spend':
            anomaly.spent = 0;
            anomaly.released = Math.floor(anomaly.allocated * randomFloat(0.6, 0.9));
            anomaly.anomalyDescription = `Zero spending despite ₹${(anomaly.released / 100).toFixed(1)} Cr released`;
            break;
        case 'release_gap':
            anomaly.released = Math.floor(anomaly.allocated * randomFloat(0.3, 0.5));
            anomaly.spent = Math.floor(anomaly.released * randomFloat(0.5, 0.8));
            anomaly.anomalyDescription = `Only ${((anomaly.released / anomaly.allocated) * 100).toFixed(1)}% of allocation released`;
            break;
        case 'lapse_risk':
            anomaly.spent = Math.floor(anomaly.allocated * randomFloat(0.10, 0.30));
            anomaly.anomalyDescription = `Fund lapse risk: Q4 with only ${((anomaly.spent / anomaly.allocated) * 100).toFixed(1)}% spent`;
            break;
        default:
            break;
    }

    return anomaly;
}

export function generateBudgetData() {
    const records = [];
    let recordId = 0;

    Object.entries(DIVISIONS).forEach(([divisionId, division]) => {
        division.districts.forEach((district) => {
            DEPARTMENTS.forEach((dept) => {
                let annualBase = randomBetween(
                    BASE_ALLOCATIONS[dept.id].min,
                    BASE_ALLOCATIONS[dept.id].max
                );

                FISCAL_YEARS.forEach((fy, fyIndex) => {
                    // Apply year-over-year growth
                    if (fyIndex > 0) {
                        annualBase = Math.floor(annualBase * randomFloat(YOY_GROWTH.min, YOY_GROWTH.max));
                    }

                    QUARTERS.forEach((quarter) => {
                        const pattern = QUARTER_PATTERNS[quarter];
                        const quarterAllocation = Math.floor(annualBase * (pattern.spendRatio + randomFloat(-pattern.variance, pattern.variance)));
                        const released = Math.floor(quarterAllocation * randomFloat(0.75, 1.0));
                        const spent = Math.floor(released * randomFloat(0.50, 0.95));

                        let record = {
                            id: `rec_${recordId++}`,
                            fiscalYear: fy,
                            quarter,
                            division: divisionId,
                            divisionName: division.name,
                            district,
                            department: dept.id,
                            departmentName: dept.name,
                            allocated: quarterAllocation,
                            released,
                            spent,
                            utilization: quarterAllocation > 0 ? ((spent / quarterAllocation) * 100) : 0,
                            hasAnomaly: false,
                            anomalyType: null,
                            anomalyDescription: null,
                        };

                        // Inject anomalies into ~12% of records
                        if (Math.random() < 0.12) {
                            const anomalyType = ANOMALY_TYPES[Math.floor(Math.random() * ANOMALY_TYPES.length)];
                            // Force lapse_risk only in Q4
                            if (anomalyType === 'lapse_risk' && quarter !== 'Q4') {
                                // Skip, use underspending instead
                                record = injectAnomaly(record, 'underspending');
                            } else {
                                record = injectAnomaly(record, anomalyType);
                            }
                            record.utilization = record.allocated > 0 ? ((record.spent / record.allocated) * 100) : 0;
                        }

                        records.push(record);
                    });
                });
            });
        });
    });

    return records;
}

// ========================
// AGGREGATION HELPERS
// ========================
export function aggregateByDivision(data) {
    const result = {};
    data.forEach((record) => {
        if (!result[record.division]) {
            result[record.division] = {
                division: record.division,
                divisionName: record.divisionName,
                allocated: 0,
                released: 0,
                spent: 0,
                records: [],
            };
        }
        result[record.division].allocated += record.allocated;
        result[record.division].released += record.released;
        result[record.division].spent += record.spent;
        result[record.division].records.push(record);
    });

    Object.values(result).forEach((div) => {
        div.utilization = div.allocated > 0 ? ((div.spent / div.allocated) * 100) : 0;
    });

    return result;
}

export function aggregateByDepartment(data) {
    const result = {};
    data.forEach((record) => {
        if (!result[record.department]) {
            result[record.department] = {
                department: record.department,
                departmentName: record.departmentName,
                allocated: 0,
                released: 0,
                spent: 0,
                records: [],
            };
        }
        result[record.department].allocated += record.allocated;
        result[record.department].released += record.released;
        result[record.department].spent += record.spent;
        result[record.department].records.push(record);
    });

    Object.values(result).forEach((dept) => {
        dept.utilization = dept.allocated > 0 ? ((dept.spent / dept.allocated) * 100) : 0;
    });

    return result;
}

export function aggregateByYear(data) {
    const result = {};
    FISCAL_YEARS.forEach((fy) => {
        const yearData = data.filter((r) => r.fiscalYear === fy);
        result[fy] = {
            fiscalYear: fy,
            allocated: yearData.reduce((sum, r) => sum + r.allocated, 0),
            released: yearData.reduce((sum, r) => sum + r.released, 0),
            spent: yearData.reduce((sum, r) => sum + r.spent, 0),
        };
        result[fy].utilization = result[fy].allocated > 0
            ? ((result[fy].spent / result[fy].allocated) * 100) : 0;
    });
    return result;
}

export function filterData(data, filters = {}) {
    return data.filter((record) => {
        if (filters.fiscalYear && record.fiscalYear !== filters.fiscalYear) return false;
        if (filters.quarter && record.quarter !== filters.quarter) return false;
        if (filters.division && record.division !== filters.division) return false;
        if (filters.district && record.district !== filters.district) return false;
        if (filters.department && record.department !== filters.department) return false;
        return true;
    });
}

export function getAnomalies(data) {
    return data.filter((r) => r.hasAnomaly);
}
