import { onRequest } from 'firebase-functions/v2/https';
import cors from 'cors';

const corsHandler = cors({ origin: true });

export const groqProxy = onRequest({ cors: true }, async (req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const apiKey = process.env.GROQ_API_KEY;
            if (!apiKey) {
                return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
            }

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(req.body),
            });

            if (!response.ok) {
                const error = await response.text();
                return res.status(response.status).json({ error });
            }

            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            console.error('Groq proxy error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
});
