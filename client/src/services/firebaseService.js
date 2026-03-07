import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

// ========================
// COLLECTION NAMES
// ========================
const COLLECTIONS = {
    HEALTH_BUDGET: 'maharashtra_health_budget',
    AGRICULTURE: 'maharashtra_agriculture',
    AGRI_FINANCE: 'maharashtra_agri_finance',
    ENVIRONMENT: 'maharashtra_environment_real',
    DISTRICT_SUMMARIES: 'district_summaries',
    DIVISION_SUMMARIES: 'division_summaries',
};

// ========================
// GENERIC FIRESTORE FETCH
// ========================
async function fetchCollection(collectionName) {
    if (!db) {
        console.warn(`[Firebase] Skipping "${collectionName}" — db not initialized (missing env vars)`);
        return [];
    }
    try {
        const snap = await getDocs(collection(db, collectionName));
        const docs = [];
        snap.forEach((doc) => {
            docs.push({ _docId: doc.id, ...doc.data() });
        });
        console.log(`[Firebase] Fetched ${docs.length} docs from "${collectionName}"`);
        if (docs.length > 0) {
            console.log(`[Firebase] Sample fields for "${collectionName}":`, Object.keys(docs[0]));
        }
        return docs;
    } catch (err) {
        console.error(`[Firebase] Error fetching "${collectionName}":`, err);
        return [];
    }
}

// ========================
// DEPARTMENT FROM COLLECTION
// ========================
function departmentFromSource(source) {
    switch (source) {
        case COLLECTIONS.HEALTH_BUDGET: return { id: 'public_health', name: 'Public Health' };
        case COLLECTIONS.AGRICULTURE: return { id: 'agriculture', name: 'Agriculture' };
        case COLLECTIONS.AGRI_FINANCE: return { id: 'agri_finance', name: 'Agri Finance' };
        case COLLECTIONS.ENVIRONMENT: return { id: 'environment', name: 'Environment & Forest' };
        default: return { id: 'general', name: 'General' };
    }
}

// ========================
// DIVISION NAME HELPER
// ========================
const DIVISION_NAMES = {
    'Amravati': 'Amravati Division',
    'Nagpur': 'Nagpur Division',
    'Aurangabad': 'Aurangabad Division',
    'Pune': 'Pune Division',
    'Nashik': 'Nashik Division',
    'Konkan': 'Konkan Division',
};

function getDivisionId(divisionName) {
    if (!divisionName) return 'unknown';
    return divisionName.toLowerCase().replace(/\s+/g, '_');
}

// ========================
// NORMALIZE A SINGLE DOCUMENT
// ========================
let recordCounter = 0;

// Normalize fiscal year: "2018" → "2018-19", "2018-19" stays as-is
function normalizeFY(raw) {
    if (!raw) return '';
    const str = String(raw).trim();
    // Already in "YYYY-YY" format
    if (/^\d{4}-\d{2}$/.test(str)) return str;
    // Bare year like "2018" → "2018-19"
    const year = parseInt(str, 10);
    if (!isNaN(year) && year > 2000 && year < 2100) {
        return `${year}-${String(year + 1).slice(2)}`;
    }
    return str;
}

function normalizeRecord(doc, source) {
    const dept = departmentFromSource(source);
    const divisionRaw = doc.division || doc.Division || '';
    const divisionId = getDivisionId(divisionRaw);
    const divisionName = DIVISION_NAMES[divisionRaw] || `${divisionRaw} Division`;
    const district = doc.district || doc.District || '';
    const fiscalYear = normalizeFY(doc.financial_year || doc.fiscalYear || doc.year);

    // ── Budget field mapping per collection ──
    let allocated = 0, released = 0, spent = 0;

    if (source === COLLECTIONS.AGRICULTURE) {
        // maharashtra_agriculture: budget_allocated_lakhs, budget_utilized_lakhs
        allocated = (Number(doc.budget_allocated_lakhs) || 0) / 100;
        spent = (Number(doc.budget_utilized_lakhs) || 0) / 100;
        released = allocated; // no separate release field
    } else if (source === COLLECTIONS.AGRI_FINANCE) {
        // maharashtra_agri_finance: budget_sanctioned_lakhs, amount_released_lakhs, amount_spent_lakhs
        allocated = (Number(doc.budget_sanctioned_lakhs) || 0) / 100;
        released = (Number(doc.amount_released_lakhs) || 0) / 100;
        spent = (Number(doc.amount_spent_lakhs) || 0) / 100;
    } else if (source === COLLECTIONS.HEALTH_BUDGET) {
        // maharashtra_health_budget: nhm_approved_budget_inr_cr, nhm_funds_released_inr_cr, nhm_actual_expenditure_inr_cr
        // Values are in Crores
        allocated = (Number(doc.nhm_approved_budget_inr_cr) || 0);
        released = (Number(doc.nhm_funds_released_inr_cr) || 0);
        spent = (Number(doc.nhm_actual_expenditure_inr_cr) || 0);
    } else if (source === COLLECTIONS.ENVIRONMENT) {
        // To allow environmental metrics to be plotted, we trick 'allocated' and 'spent' 
        // to equal forest_cover_sqkm, giving it volume in the visualizer without destroying 'spent' logic.
        // We set 'utilization' directly from pct_geo_area next.
        allocated = Number(doc.forest_cover_sqkm) || 0;
        spent = allocated; 
        released = allocated;
    }

    // Utilization: use firebase field if available, otherwise calculate
    let baseUtil = doc.utilization_percent || doc.utilization_rate_pct;
    // For environment use forest cover pct as utilization
    if (source === COLLECTIONS.ENVIRONMENT && doc.forest_cover_pct_geo_area) {
        baseUtil = doc.forest_cover_pct_geo_area;
    }

    const utilization = (baseUtil)
        ? Number(baseUtil)
        : (allocated > 0 ? ((spent / allocated) * 100) : 0);

    // Anomaly detection from Firebase fields
    const hasAnomaly = doc.anomaly_flag === true || doc.anomaly_flag === 'true'
        || (doc.leakage_score && Number(doc.leakage_score) > 15)
        || utilization < 40;
    const leakageScore = Number(doc.leakage_score) || 0;

    const anomalyType = hasAnomaly
        ? (leakageScore > 25 ? 'spike' : utilization < 40 ? 'underspending' : 'release_gap')
        : null;
    const anomalyDescription = hasAnomaly
        ? (leakageScore > 0
            ? `Leakage score: ${leakageScore.toFixed(1)} — flagged for review`
            : `Low utilization: ${utilization.toFixed(1)}% — below threshold`)
        : null;

    return {
        id: `fb_${recordCounter++}`,
        _docId: doc._docId,
        _source: source,
        fiscalYear,
        quarter: doc.quarter || 'Annual',
        division: divisionId,
        divisionName,
        district,
        department: dept.id,
        departmentName: dept.name,
        allocated,
        released,
        spent,
        utilization,
        hasAnomaly,
        anomalyType,
        anomalyDescription,
        leakageScore,
        // Preserve all original fields for detail views
        _raw: doc,
    };
}

// ========================
// FETCH ALL DATA
// ========================
export async function fetchAllData() {
    console.log('[Firebase] Starting data fetch from all collections...');
    recordCounter = 0;

    const [healthDocs, agriDocs, agriFinDocs, envDocs, districtDocs, divisionDocs] = await Promise.all([
        fetchCollection(COLLECTIONS.HEALTH_BUDGET),
        fetchCollection(COLLECTIONS.AGRICULTURE),
        fetchCollection(COLLECTIONS.AGRI_FINANCE),
        fetchCollection(COLLECTIONS.ENVIRONMENT),
        fetchCollection(COLLECTIONS.DISTRICT_SUMMARIES),
        fetchCollection(COLLECTIONS.DIVISION_SUMMARIES),
    ]);

    // Normalize each collection
    const healthRecords = healthDocs.map((d) => normalizeRecord(d, COLLECTIONS.HEALTH_BUDGET));
    const agriRecords = agriDocs.map((d) => normalizeRecord(d, COLLECTIONS.AGRICULTURE));
    const agriFinRecords = agriFinDocs.map((d) => normalizeRecord(d, COLLECTIONS.AGRI_FINANCE));
    const envRecords = envDocs.map((d) => normalizeRecord(d, COLLECTIONS.ENVIRONMENT));

    // Combine all normalized records
    const allRecords = [...healthRecords, ...agriRecords, ...agriFinRecords, ...envRecords];

    console.log(`[Firebase] Total normalized records: ${allRecords.length}`);

    // Extract unique fiscal years, divisions, districts for filter options
    const fiscalYears = [...new Set(allRecords.map((r) => r.fiscalYear).filter(Boolean))].sort();
    const divisions = [...new Set(allRecords.map((r) => r.division).filter((v) => v && v !== 'unknown'))];
    const departments = [...new Set(allRecords.map((r) => r.department).filter(Boolean))];

    console.log('[Firebase] Available fiscal years:', fiscalYears);
    console.log('[Firebase] Available divisions:', divisions);
    console.log('[Firebase] Available departments:', departments);

    return {
        records: allRecords,
        districtSummaries: districtDocs,
        divisionSummaries: divisionDocs,
        meta: {
            fiscalYears,
            divisions,
            departments,
            totalDocs: healthDocs.length + agriDocs.length + agriFinDocs.length,
        },
    };
}
