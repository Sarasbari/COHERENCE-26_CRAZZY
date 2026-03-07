import admin from "firebase-admin";
import { createRequire } from "module";
import maharashtraHealthBudgetData from "./maharashtra_health_budget_data (1).js";

const require = createRequire(import.meta.url);

// Only initialize if not already initialized
if (!admin.apps.length) {
    const serviceAccount = require("./serviceAccountKey.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function seedHealthBudget() {
    const collectionName = "maharashtra_health_budget";
    const data = maharashtraHealthBudgetData;

    console.log(`\n🚀 Starting Health Budget Seeder...`);
    console.log(`   Collection: "${collectionName}"`);
    console.log(`   Records: ${data.length}\n`);

    const collectionRef = db.collection(collectionName);
    const batchSize = 400;
    let count = 0;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = db.batch();
        const chunk = data.slice(i, i + batchSize);

        chunk.forEach((record) => {
            const docRef = collectionRef.doc();
            // Normalize field names to snake_case for consistency
            batch.set(docRef, {
                division: record.Division,
                district: record.District,
                financial_year: record.Financial_Year,
                nhm_approved_budget_inr_cr: record.NHM_Approved_Budget_INR_Cr,
                nhm_funds_released_inr_cr: record.NHM_Funds_Released_INR_Cr,
                nhm_actual_expenditure_inr_cr: record.NHM_Actual_Expenditure_INR_Cr,
                utilization_rate_pct: record.Utilization_Rate_Pct,
                unspent_balance_inr_cr: record.Unspent_Balance_INR_Cr,
                per_capita_health_expenditure_inr: record.Per_Capita_Health_Expenditure_INR,
                phcs_operational: record.PHCs_Operational,
                chcs_operational: record.CHCs_Operational,
                sub_centres: record.Sub_Centres,
                asha_workers: record.ASHA_Workers,
                immunization_coverage_pct: record.Immunization_Coverage_Pct,
                maternal_mortality_rate: record.Maternal_Mortality_Rate,
                infant_mortality_rate: record.Infant_Mortality_Rate,
                data_source: record.Data_Source,
                sector: "Healthcare",
                sub_sector: "NHM District Health Budget",
                created_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();
        count += chunk.length;
        console.log(`   ✅ Committed ${count}/${data.length} records`);
    }

    console.log(`\n🎉 Done! "${collectionName}" seeded with ${count} records.`);
    console.log(`💡 Query by: division, district, financial_year, utilization_rate_pct`);
}

seedHealthBudget()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Error:", err);
        process.exit(1);
    });
