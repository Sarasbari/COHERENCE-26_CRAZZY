# BudgetFlow AI — National Budget Intelligence Platform

> AI-powered platform tracking public fund flows across Maharashtra's administrative hierarchy — detecting leakages, forecasting risks, and enabling data-driven governance.

## 🏗️ Project Structure

```
COHERENCE-26_CRAZZY/
│
├── client/                 ← Frontend (React + Tailwind CSS)
│   ├── src/
│   │   ├── app/            # App routing and entry
│   │   ├── components/     # Reusable UI (charts, cards, layout)
│   │   ├── config/         # Firebase config, constants
│   │   ├── context/        # React context providers
│   │   ├── data/           # Simulated data generator
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Full page components
│   │   ├── services/       # Business logic (analytics, Groq)
│   │   ├── styles/         # Global CSS
│   │   └── utils/          # Utility functions
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                 ← Backend (Firebase Cloud Functions)
│   ├── index.js            # Groq API proxy function
│   ├── package.json
│   └── README.md
│
└── README.md               ← You are here
```

## 🚀 Quick Start

### Frontend (Client)

```bash
cd client
npm install
npm run dev
```
Opens at `http://localhost:5173/`

### Backend (Server)

```bash
cd server
npm install
# Add your Groq API key to server/.env:
# GROQ_API_KEY=your_key_here
firebase deploy --only functions
```

## ⚙️ Environment Setup

### Client `.env` (create in `/client`)
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GROQ_FUNCTION_URL=https://your-region-your-project.cloudfunctions.net/groqProxy
```

### Server `.env` (create in `/server`)
```env
GROQ_API_KEY=your_groq_api_key_here
```

## 👥 Team Workflow

| Team Member | Works In | Branch Naming |
|-------------|----------|---------------|
| Frontend Dev | `client/` | `feat/client-<feature>` |
| Backend Dev | `server/` | `feat/server-<feature>` |
| Full Stack | Both | `feat/<feature>` |

### Branch Strategy
```bash
git checkout -b feat/client-sankey-improvement   # Frontend work
git checkout -b feat/server-groq-endpoint        # Backend work
git checkout -b fix/client-anomaly-filter        # Bug fixes
```

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Charts | Recharts + d3-sankey |
| Animation | Framer Motion |
| Icons | Lucide React |
| Database | Firebase Firestore |
| Auth | Firebase Google Auth |
| AI/LLM | Groq API (llama-3.3-70b) |
| Backend | Firebase Cloud Functions |

## 📊 Features

- **Sankey Fund Flow Diagram** — Interactive visualization of State → Division → Department allocation
- **3-Layer Anomaly Detection** — Rule-based + Statistical Z-score + Groq LLM analysis
- **Corruption Risk Score** — Composite 0-100 score per district/department
- **AI Chat** — "Ask the Budget" conversational interface
- **Predictive Analytics** — Fund lapse risk forecasting
- **Department Leaderboard** — Gamified efficiency rankings
- **Budget Reports** — Division-level health summaries

---

*Built for COHERENCE Hackathon 2026*