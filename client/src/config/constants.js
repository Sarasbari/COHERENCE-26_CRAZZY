// ========================
// DIVISIONS & DISTRICTS
// ========================
export const DIVISIONS = {
    amravati: {
        name: 'Amravati Division',
        districts: ['Amravati', 'Akola', 'Buldhana', 'Washim', 'Yavatmal'],
        color: '#3B82F6',
    },
    nagpur: {
        name: 'Nagpur Division',
        districts: ['Nagpur', 'Bhandara', 'Chandrapur', 'Gadchiroli', 'Gondia', 'Wardha'],
        color: '#1E3A8A',
    },
    aurangabad: {
        name: 'Aurangabad Division',
        districts: ['Aurangabad', 'Beed', 'Hingoli', 'Jalna', 'Latur', 'Nanded', 'Osmanabad', 'Parbhani'],
        color: '#60A5FA',
    },
    pune: {
        name: 'Pune Division',
        districts: ['Pune', 'Satara', 'Sangli', 'Solapur', 'Kolhapur'],
        color: '#8B5CF6',
    },
    nashik: {
        name: 'Nashik Division',
        districts: ['Nashik', 'Dhule', 'Jalgaon', 'Ahmednagar', 'Nandurbar'],
        color: '#F59E0B',
    },
    konkan: {
        name: 'Konkan Division',
        districts: ['Mumbai City', 'Mumbai Suburban', 'Thane', 'Raigad', 'Ratnagiri', 'Sindhudurg', 'Palghar'],
        color: '#14B8A6',
    },
};

// ========================
// DEPARTMENTS
// ========================
export const DEPARTMENTS = [
    { id: 'education', name: 'Education', icon: '📚', color: '#3B82F6' },
    { id: 'public_health', name: 'Public Health', icon: '🏥', color: '#DC2626' },
    { id: 'pwd', name: 'Public Works (PWD)', icon: '🏗️', color: '#F59E0B' },
    { id: 'agriculture', name: 'Agriculture', icon: '🌾', color: '#16A34A' },
    { id: 'agri_finance', name: 'Agri Finance', icon: '💰', color: '#8B5CF6' },
    { id: 'rural_dev', name: 'Rural Development', icon: '🏘️', color: '#1E3A8A' },
    { id: 'urban_dev', name: 'Urban Development', icon: '🏙️', color: '#60A5FA' },
    { id: 'water_supply', name: 'Water Supply & Sanitation', icon: '💧', color: '#3B82F6' },
    { id: 'revenue_forest', name: 'Revenue & Forest', icon: '🌳', color: '#16A34A' },
];

// ========================
// FISCAL YEARS
// ========================
export const FISCAL_YEARS = [
    '2018-19',
    '2019-20',
    '2020-21',
    '2021-22',
    '2022-23',
    '2023-24',
    '2024-25',
    '2025-26',
];

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

// ========================
// ANOMALY THRESHOLDS
// ========================
export const THRESHOLDS = {
    underspending: 0.40,       // < 40% utilization = flagged
    overspendingSpike: 1.50,   // > 150% quarter-on-quarter = flagged
    zeroSpendDays: 90,         // Released but 0 spent after 90 days
    allocationReleaseGap: 0.20, // > 20% gap between allocated and released
    fundLapseRiskQ4: 0.50,     // Q4 with < 50% spent = lapse risk
    zScoreThreshold: 2.0,      // Z-score > 2 standard deviations = outlier
};

// ========================
// ROLES
// ========================
export const ROLES = {
    ADMIN: 'admin',
    AUDITOR: 'auditor',
    OFFICER: 'officer',
    CITIZEN: 'citizen',
};

// ========================
// GROQ CONFIG
// ========================
export const GROQ_CONFIG = {
    functionUrl: import.meta.env.VITE_GROQ_FUNCTION_URL || 'http://localhost:5001/your-project/us-central1/groqProxy',
    model: 'llama-3.3-70b-versatile',
};

// ========================
// APP CONFIG
// ========================
export const APP_NAME = 'ARTHRAKSHAK AI';
export const APP_TAGLINE = 'National Budget Intelligence & Leakage Detection';
export const STATE_NAME = 'Maharashtra';
