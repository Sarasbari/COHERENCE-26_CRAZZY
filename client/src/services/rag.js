// File: src/services/rag.js
import maharashtraHealthBudget from '../data/maharashtra_health_budget.json';

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
    
    let matchedRecords = [];
    
    // If we have keywords, filter data.
    if (keywords.length > 0) {
        matchedRecords = maharashtraHealthBudget.filter(record => {
            const searchString = `${record.division} ${record.district} ${record.financial_year}`.toLowerCase();
            return keywords.some(kw => searchString.includes(kw));
        }).slice(0, 15); // Limit to top 15 records to avoid blowing up the context window
    } 
    
    // Fallback: If no direct match or query is very generic, return some statewide aggregates or a general sample.
    if (matchedRecords.length === 0) {
        matchedRecords = maharashtraHealthBudget.slice(0, 5); // Just grab the first 5 records as a sample context
    }

    let contextText = "JSON Dataset Context:\n";
    matchedRecords.forEach(record => {
        contextText += `District: ${record.district} (${record.financial_year}) | Allocated: ₹${record.nhm_approved_budget_inr_cr} Cr | Spent: ₹${record.nhm_actual_expenditure_inr_cr} Cr | Utilization: ${record.utilization_rate_pct}% | PHCs: ${record.phcs_operational} | Sub-centres: ${record.sub_centres}\n`;
    });

    return {
        contextText: contextText.trim(),
        sourceFile: "/data/maharashtra_health_budget.json"
    };
}
