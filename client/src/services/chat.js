// lib/chat.js

const RAG_SYSTEM_PROMPT = `
You are BudgetFlow AI, an expert assistant for Maharashtra State budget intelligence.
You ONLY answer based on the provided dataset context below.
If the answer is not in the context, say "This data is not available in the current dataset."
Always cite the specific district, department, or fiscal year from the data.
Be concise, factual, and use ₹ for currency with Crore/Lakh notation.
`;

export async function sendMessage(userMessage, datasetContext, history) {
  const apiKey = import.meta.env.VITE_LLAMA_API_KEY;
  
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error("Missing API Key. Please add VITE_LLAMA_API_KEY to your .env file.");
  }

  // We are using Groq's endpoint for Llama 3.3 70B as an example
  // You can swap this to Together AI or any other endpoint that supports OpenAI format
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: RAG_SYSTEM_PROMPT },
        { role: "system", content: `DATASET CONTEXT:\n${datasetContext}` },
        ...history,
        { role: "user", content: userMessage }
      ],
      temperature: 0.2,  // low = factual, grounded responses
      max_tokens: 1024,
      stream: true  // enable streaming for real-time response
    })
  });

  if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
  }

  return response;
}
