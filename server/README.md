# Firebase Cloud Function - Groq API Proxy

## Setup

1. `cd functions`
2. `npm install`
3. Set your Groq API key: `firebase functions:config:set groq.api_key="YOUR_KEY"`
4. Deploy: `firebase deploy --only functions`

## For local development

Create a `.env` file in the `functions/` directory:
```
GROQ_API_KEY=your_groq_api_key_here
```
