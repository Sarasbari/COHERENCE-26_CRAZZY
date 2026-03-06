import { GROQ_CONFIG } from '../config/constants';

// ========================
// GROQ SERVICE
// ========================
// Calls Groq API through Firebase Cloud Function proxy (or directly for prototype)

const SYSTEM_PROMPT = `You are ARTHRAKSHAK AI, an expert financial intelligence analyst specializing in Indian public fund management. You analyze Maharashtra state budget data across divisions (Amravati, Nagpur, Aurangabad) and departments (Education, Public Health, PWD, Agriculture, Rural Development, Urban Development, Water Supply & Sanitation, Revenue & Forest).

Your capabilities:
- Explain anomalies in budget utilization with clear, actionable language
- Identify patterns and root causes of underspending or overspending
- Recommend fund reallocation strategies with reasoning
- Forecast fund lapse risks based on spending velocity
- Generate executive summaries for decision-makers

Always respond in a professional, data-driven tone. Use Indian currency notation (₹ Cr, ₹ Lakh). Reference specific districts, departments, and fiscal years when available. Keep responses concise but insightful.`;

export async function queryGroq(userMessage, context = {}) {
    try {
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
        ];

        // Add budget context if provided
        if (context.budgetSummary) {
            messages.push({
                role: 'system',
                content: `Current Budget Context:\n${JSON.stringify(context.budgetSummary, null, 2)}`,
            });
        }

        if (context.anomalies && context.anomalies.length > 0) {
            messages.push({
                role: 'system',
                content: `Recent Anomalies Detected:\n${context.anomalies.slice(0, 10).map(a =>
                    `- [${a.severity.toUpperCase()}] ${a.departmentName} in ${a.district}: ${a.description}`
                ).join('\n')}`,
            });
        }

        messages.push({ role: 'user', content: userMessage });

        // Try Cloud Function proxy first, fallback to direct API
        const response = await fetch(GROQ_CONFIG.functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: GROQ_CONFIG.model,
                messages,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            message: data.choices?.[0]?.message?.content || 'No response generated.',
        };
    } catch (error) {
        console.error('Groq Service Error:', error);
        return {
            success: false,
            message: generateFallbackResponse(userMessage, context),
        };
    }
}

// Fallback response when Groq API is unavailable
function generateFallbackResponse(query, context) {
    const summary = context.budgetSummary;
    if (!summary) return 'I need budget data context to analyze. Please ensure data is loaded.';

    const utilization = summary.overallUtilization?.toFixed(1) || 'N/A';

    if (query.toLowerCase().includes('underspend')) {
        return `Based on the current data, overall budget utilization is at ${utilization}%. Underspending patterns are typically concentrated in Q1 where departments receive allocations but procurement processes cause delays. I recommend reviewing department-wise quarterly trends in the Analytics tab for detailed patterns.`;
    }

    if (query.toLowerCase().includes('realloc')) {
        return `To optimize fund allocation, consider redirecting funds from departments with consistently high surplus (>80% year-end balance) to those showing strong spending velocity but allocation constraints. Check the Predict tab for reallocation simulator.`;
    }

    return `Current budget overview: Overall utilization is ${utilization}% across all divisions. ${summary.totalRecords || 0} records analyzed. For specific insights, try asking about underspending patterns, anomalies in a specific division, or reallocation recommendations.`;
}

// Explain a specific anomaly using Groq
export async function explainAnomaly(anomaly, context = {}) {
    const prompt = `Explain this budget anomaly and suggest corrective action:
- Type: ${anomaly.type}
- Severity: ${anomaly.severity}
- Location: ${anomaly.district}, ${anomaly.divisionName}
- Department: ${anomaly.departmentName}
- Period: ${anomaly.fiscalYear} ${anomaly.quarter}
- Details: ${anomaly.description}
- Allocated: ₹${(anomaly.allocated / 100).toFixed(1)} Cr
- Spent: ₹${(anomaly.spent / 100).toFixed(1)} Cr

Provide: 1) Root cause analysis 2) Impact assessment 3) Recommended action (2-3 sentences each)`;

    return queryGroq(prompt, context);
}

// Generate reallocation recommendation
export async function getReallocationAdvice(departmentData, context = {}) {
    const prompt = `Analyze these department utilization rates and recommend optimal fund reallocation:

${departmentData.map(d => `- ${d.departmentName}: ${d.utilization.toFixed(1)}% utilized (₹${(d.allocated / 100).toFixed(1)} Cr allocated, ₹${(d.spent / 100).toFixed(1)} Cr spent)`).join('\n')}

Suggest specific reallocation amounts between departments with reasoning. Consider seasonal patterns and departmental priorities.`;

    return queryGroq(prompt, context);
}

// Chat-style suggested prompts
export const SUGGESTED_PROMPTS = [
    "What are the top 3 underspending concerns across all divisions?",
    "Why is Amravati Division's PWD spending below target?",
    "Which departments should receive additional allocation this quarter?",
    "Summarize the budget health for Nagpur Division",
    "What is the fund lapse risk for the current fiscal year?",
    "Compare education spending across all three divisions",
    "Generate an executive summary of anomalies detected",
    "Recommend reallocation strategy for Water Supply department",
];
