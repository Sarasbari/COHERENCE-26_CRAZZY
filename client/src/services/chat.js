// File: src/services/chat.js

/**
 * Service for communicating with Llama 3.3 70B via Groq API
 */
export async function sendMessage(messages, systemPrompt = "") {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_LLAMA_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY') {
        throw new Error("Missing API Key in .env. Please set VITE_GROQ_API_KEY or VITE_LLAMA_API_KEY.");
    }

    const payloadMessages = [];
    if (systemPrompt) {
        payloadMessages.push({ role: "system", content: systemPrompt });
    }
    
    // Format messages for standard OpenAI-compatible completions API
    payloadMessages.push(...messages.map(m => ({
        role: m.role,
        content: m.content
    })));

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: payloadMessages,
                temperature: 0.2, // Low temperature for grounded analytical responses
                max_tokens: 1024,
                stream: true // Enable streaming for real-time UI feel
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        return response.body.getReader();
    } catch (error) {
        console.error("Chat API Error:", error);
        throw error;
    }
}
