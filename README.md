<p align="center">
  <img src="client/src/assets/logo.png" alt="ArthaRakshak AI Logo" width="120" />
</p>

<h1 align="center">ARTHRAKSHAK AI</h1>

<p align="center">
  <strong>National Budget Intelligence & Leakage Detection Platform</strong>
</p>

<p align="center">
  <em>AI-powered platform tracking public fund flows across Maharashtra's administrative hierarchy — detecting leakages, forecasting risks, and enabling data-driven governance.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-10.x-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Groq_AI-LLaMA_3.3_70B-FF6600?logo=ai&logoColor=white" alt="Groq AI" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

<p align="center">
  Built for <strong>COHERENCE Hackathon 2026</strong> · Team CRAZZY
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Data Coverage](#-data-coverage)
- [Team Workflow](#-team-workflow)

---

## 🔍 Overview

**ArthaRakshak AI** is an intelligent budget monitoring platform designed for government transparency and accountability. It tracks public fund allocation and expenditure across **6 divisions**, **9 departments**, and **36+ districts** of Maharashtra State, spanning fiscal years from 2018–19 to 2025–26.

The platform uses a **3-layer anomaly detection engine** — combining rule-based checks, statistical Z-score analysis, and LLM-powered contextual reasoning — to identify fund misuse, underspending, spending spikes, and corruption risks in real time.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔀 **Sankey Fund Flow** | Interactive diagram visualizing State → Division → Department budget allocation |
| 🛡️ **3-Layer Anomaly Detection** | Rule-based + Statistical Z-score + Groq LLM analysis for comprehensive leakage detection |
| 📊 **Corruption Risk Score (CRS)** | Composite 0–100 risk scoring per division based on spending patterns |
| 🤖 **AI Chat — "Ask the Budget"** | Natural language conversational interface powered by Groq (LLaMA 3.3 70B) with RAG context |
| 📈 **Predictive Analytics** | Fund lapse risk forecasting and spending velocity predictions |
| 🏆 **Department Leaderboard** | Gamified efficiency rankings based on utilization and anomaly rates |
| 📝 **Budget Reports** | Division-level health summaries with exportable insights |
| 🔄 **District Comparison Mode** | Side-by-side analysis of spending across districts |
| 📑 **Multilingual PDF Export** | Export reports in 5 languages using browser-native print |
| 🔐 **Google Authentication** | Firebase-powered secure sign-in |
| 🌐 **Interactive Globe** | Animated landing page with 3D globe visualization |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Pages   │  │  Components  │  │      Services          │  │
│  │          │  │              │  │                        │  │
│  │ Dashboard│  │ SankeyDiagram│  │ analyticsEngine.js     │  │
│  │ Overview │  │ KPICard      │  │  ├ Rule-Based Engine   │  │
│  │ Anomalies│  │ AnomalyCard  │  │  ├ Statistical Engine  │  │
│  │ Analytics│  │ Header       │  │  └ CRS Calculator      │  │
│  │ Chat     │  │ Sidebar      │  │                        │  │
│  │ Predict  │  │ Globe        │  │ groqService.js (LLM)   │  │
│  │ Reports  │  │              │  │ firebaseService.js     │  │
│  │ Export   │  │              │  │ rag.js (RAG context)   │  │
│  └──────────┘  └──────────────┘  └────────────────────────┘  │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │    Firebase Cloud     │
              │    Functions (Proxy)  │
              │                       │
              │  groqProxy → Groq API │
              └───────────┬───────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
  ┌─────┴─────┐   ┌──────┴──────┐   ┌──────┴──────┐
  │ Firestore │   │ Firebase    │   │  Groq API   │
  │ Database  │   │ Auth        │   │ LLaMA 3.3   │
  └───────────┘   └─────────────┘   └─────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | UI framework & build tool |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **Charts** | Recharts + d3-sankey | Data visualizations & fund flow diagrams |
| **Animation** | Framer Motion | Smooth page transitions & micro-interactions |
| **Icons** | Lucide React | Modern icon set |
| **Routing** | React Router DOM 6 | Client-side navigation |
| **Database** | Firebase Firestore | Real-time NoSQL data storage |
| **Authentication** | Firebase Google Auth | Secure user sign-in |
| **AI / LLM** | Groq API (LLaMA 3.3 70B Versatile) | Anomaly analysis & conversational AI |
| **Backend** | Firebase Cloud Functions v2 | Serverless API proxy |
| **PDF Export** | html2pdf.js | Client-side PDF generation |

---

## 📁 Project Structure

```
COHERENCE-26_CRAZZY/
│
├── client/                          ← Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── app/
│   │   │   └── App.jsx             # Root app with routing
│   │   ├── assets/
│   │   │   └── logo.png            # Brand logo
│   │   ├── components/
│   │   │   ├── cards/              # KPICard, AnomalyCard
│   │   │   ├── charts/             # SankeyDiagram (d3-sankey)
│   │   │   ├── chat/               # Chat UI components
│   │   │   ├── layout/             # Header, Sidebar, DashboardLayout
│   │   │   └── ui/                 # InteractiveGlobe
│   │   ├── config/
│   │   │   ├── constants.js        # Divisions, departments, thresholds
│   │   │   └── firebase.js         # Firebase initialization
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Google Auth state management
│   │   │   └── FilterContext.jsx    # Dashboard filter state
│   │   ├── data/
│   │   │   ├── generator.js         # Simulated data generator
│   │   │   └── *.json               # Maharashtra budget datasets
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Hero + features showcase
│   │   │   ├── Dashboard.jsx        # Main dashboard with KPIs
│   │   │   ├── BudgetOverview.jsx   # Budget allocation overview
│   │   │   ├── BudgetFlowVisualization.jsx  # Sankey fund flow
│   │   │   ├── Anomalies.jsx        # Anomaly detection results
│   │   │   ├── Analytics.jsx        # Data analytics dashboard
│   │   │   ├── Predict.jsx          # Predictive analytics
│   │   │   ├── Chat.jsx             # AI chatbot interface
│   │   │   ├── Reports.jsx          # Division health reports
│   │   │   ├── Leaderboard.jsx      # Department rankings
│   │   │   ├── DistrictComparisonMode.jsx   # District vs district
│   │   │   └── ExportPDFMultilang.jsx       # Multilingual export
│   │   ├── services/
│   │   │   ├── analyticsEngine.js   # 3-layer anomaly detection
│   │   │   ├── groqService.js       # Groq LLM integration
│   │   │   ├── firebaseService.js   # Firestore CRUD operations
│   │   │   ├── rag.js               # RAG context builder
│   │   │   └── chat.js              # Chat service logic
│   │   ├── styles/                  # Global CSS styles
│   │   ├── utils/
│   │   │   ├── calculations.js      # Z-score, CRS, velocity math
│   │   │   ├── formatCurrency.js    # Indian number formatting
│   │   │   └── cn.js                # Classname utility
│   │   └── main.jsx                 # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                          ← Backend (Firebase Cloud Functions)
│   ├── index.js                     # Groq API proxy function
│   ├── seedFirebase.js              # Firestore data seeding scripts
│   ├── seedFirebaseAgri.js          # Agriculture data seeder
│   ├── seedFirebaseEnvironment.js   # Environment data seeder
│   ├── seedHealthBudget.js          # Health budget seeder
│   └── package.json
│
├── .gitignore
└── README.md                        ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Firebase project** with Firestore and Google Auth enabled
- A **Groq API key** ([get one here](https://console.groq.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/COHERENCE-26_CRAZZY.git
cd COHERENCE-26_CRAZZY
```

### 2. Setup the Frontend

```bash
cd client
npm install
npm run dev
```

The app will be running at **http://localhost:5173/**

### 3. Setup the Backend

```bash
cd server
npm install
```

To deploy the Groq proxy function:

```bash
firebase deploy --only functions
```

### 4. Seed the Database (Optional)

Populate Firestore with Maharashtra budget data:

```bash
cd server
node seedFirebase.js
node seedFirebaseAgri.js
node seedFirebaseEnvironment.js
node seedHealthBudget.js
```

---

## 🔐 Environment Variables

### Client (`client/.env`)

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GROQ_FUNCTION_URL=https://your-region-your-project.cloudfunctions.net/groqProxy
```

### Server (`server/.env`)

```env
GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ **Never commit `.env` files.** They are already included in `.gitignore`.

---

## 📜 Available Scripts

### Client

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

### Server

| Command | Description |
|---------|-------------|
| `npm run serve` | Start Firebase emulator locally |
| `npm run deploy` | Deploy Cloud Functions to Firebase |

---

## 🗺️ Data Coverage

### Divisions (6)

| Division | Districts |
|----------|-----------|
| **Amravati** | Amravati, Akola, Buldhana, Washim, Yavatmal |
| **Nagpur** | Nagpur, Bhandara, Chandrapur, Gadchiroli, Gondia, Wardha |
| **Aurangabad** | Aurangabad, Beed, Hingoli, Jalna, Latur, Nanded, Osmanabad, Parbhani |
| **Pune** | Pune, Satara, Sangli, Solapur, Kolhapur |
| **Nashik** | Nashik, Dhule, Jalgaon, Ahmednagar, Nandurbar |
| **Konkan** | Mumbai City, Mumbai Suburban, Thane, Raigad, Ratnagiri, Sindhudurg, Palghar |

### Departments (9)

📚 Education · 🏥 Public Health · 🏗️ Public Works (PWD) · 🌾 Agriculture · 💰 Agri Finance · 🏘️ Rural Development · 🏙️ Urban Development · 💧 Water Supply & Sanitation · 🌳 Revenue & Forest

### Sectors Covered

- Health · Agriculture · Environment

### Fiscal Year Range

`2018-19` → `2025-26` (8 years, quarterly data)

---

## 🧠 Anomaly Detection Engine

The analytics engine uses a **3-layer approach** to detect budget irregularities:

```
Layer 1: Rule-Based Detection
├── Underspending (< 40% utilization)
├── Zero-spend with fund release
├── Allocation-release gap (> 20%)
└── Overspending spike (> 150%)

Layer 2: Statistical Detection
└── Z-score outlier detection (> 2σ threshold)

Layer 3: AI-Powered Analysis
└── Groq LLM contextual reasoning & recommendations
```

Each anomaly is assigned a **severity level** (`critical`, `high`, `medium`, `low`) and contributes to the **Corruption Risk Score (CRS)** — a composite 0–100 score per division.

---

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

---

## 🙏 Acknowledgements

- [Groq](https://groq.com/) — Ultra-fast LLM inference
- [Firebase](https://firebase.google.com/) — Authentication, Firestore, Cloud Functions
- [Recharts](https://recharts.org/) — React charting library
- [d3-sankey](https://github.com/d3/d3-sankey) — Sankey diagram layout
- [Framer Motion](https://www.framer.com/motion/) — Animation library for React

---

<p align="center">
  Made with ❤️ by <strong>Team CRAZZY</strong> for COHERENCE Hackathon 2026
</p>