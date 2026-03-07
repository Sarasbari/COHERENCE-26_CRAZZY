// File: src/services/rag.js
import maharashtraHealthBudget from '../data/maharashtra_health_budget_data.json';
import maharashtraAgriculture from '../data/maharashtra_agriculture.json';
import maharashtraEnvironment from '../data/maharashtra_environment_real.json';

/**
 * Client-side RAG simulation using actual JSON data.
 */
export async function loadDatasetContext(query) {
    console.log(`[RAG] Searching for context matching: "${query}"`);
    
    // Simulate network delay to fetch matching chunks
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerQuery = query.toLowerCase();
    
    // Simple naive semantic search: look for keyword matches in the dataset.
    const keywords = lowerQuery.split(' ').filter(word => word.length > 3 && !['what', 'when', 'where', 'which', 'show', 'tell', 'about'].includes(word));
    
    let matchedHealth = [];
    let matchedAgri = [];
    let matchedEnv = [];
    
    // If we have keywords, filter data.
    if (keywords.length > 0) {
        matchedHealth = maharashtraHealthBudget.filter(record => {
            const searchString = `${record.division} ${record.district} ${record.financial_year}`.toLowerCase();
            return keywords.some(kw => searchString.includes(kw));
        }).slice(0, 5); // Limit to top 5

        matchedAgri = maharashtraAgriculture.filter(record => {
            const searchString = `${record.Division} ${record.District} ${record.Year} ${record.Crop}`.toLowerCase();
            return keywords.some(kw => searchString.includes(kw));
        }).slice(0, 5);

        matchedEnv = maharashtraEnvironment.districtForestCover.filter(record => {
            const searchString = `${record.division} ${record.district} ${record.data_year}`.toLowerCase();
            return keywords.some(kw => searchString.includes(kw));
        }).slice(0, 5);
    } 
    
    // Fallback: If no direct match or query is very generic, return some statewide aggregates or a general sample.
    if (matchedHealth.length === 0 && matchedAgri.length === 0 && matchedEnv.length === 0) {
        matchedHealth = maharashtraHealthBudget.slice(0, 3);
        matchedAgri = maharashtraAgriculture.slice(0, 3);
        matchedEnv = maharashtraEnvironment.districtForestCover.slice(0, 3);
    }

    let contextText = "JSON Dataset Context:\n";
    
    if (matchedHealth.length > 0) {
        contextText += "\n[Health Budget Data]:\n";
        matchedHealth.forEach(record => {
            contextText += `District: ${record.district} (${record.financial_year}) | Allocated: ₹${record.nhm_approved_budget_inr_cr} Cr | Spent: ₹${record.nhm_actual_expenditure_inr_cr} Cr | Utilization: ${record.utilization_rate_pct}% | PHCs: ${record.phcs_operational} | Sub-centres: ${record.sub_centres}\n`;
        });
    }

    if (matchedAgri.length > 0) {
        contextText += "\n[Agriculture Budget Data]:\n";
        matchedAgri.forEach(record => {
            contextText += `District: ${record.District} (${record.Year}) | Crop: ${record.Crop} | Allocated: ₹${record.Budget_Allocated_Lakhs} Lakhs | Spent: ₹${record.Budget_Utilized_Lakhs} Lakhs | Utilization: ${record.Utilization_Percent}% | Farmer Count: ${record.Farmer_Count}\n`;
        });
    }

    if (matchedEnv.length > 0) {
        contextText += "\n[Environment & Forest Data]:\n";
        matchedEnv.forEach(record => {
            contextText += `District: ${record.district} (${record.data_year}) | Forest Cover: ${record.forest_cover_sqkm} sqkm (${record.forest_cover_pct_geo_area}% of geo area)\n`;
        });
    }

    return {
        contextText: contextText.trim(),
        sourceFile: "Combined Local Datasets (Health, Agri, Env)"
    };
}
