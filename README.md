# 🤖 ResumeAI — AI Resume Analyser & Job Match Platform

An AI-powered full-stack platform that analyses resumes, scores them against job descriptions, and generates cover letters using **Google Gemini AI**.

## ✨ Features

- 📄 **Upload Resume** — PDF or DOCX, auto text extraction
- 🤖 **AI Resume Analysis** — ATS score, resume score, strengths, weaknesses
- 🎯 **Job Match** — Paste any JD, get match %, missing keywords
- 💡 **Improvement Suggestions** — Specific, actionable AI suggestions
- ✏️ **Bullet Improver** — Side-by-side original vs AI-improved bullets
- ✉️ **Cover Letter** — Personalized, professional, role-specific
- 📊 **Visual Reports** — Radar charts, bar charts, skill chips
- 📥 **PDF Download** — Download full analysis report

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (dark glassmorphism) |
| State | Zustand |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon) |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT |
| File Upload | Multer |
| PDF Export | jsPDF + html2canvas |

## 🚀 Setup Instructions

### Step 1: Database Setup (Neon — Free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Go to **SQL Editor** and paste the contents of `backend/src/db/schema.sql`
4. Click **Run** to create all tables
5. Copy your **Connection String**

### Step 2: Configure Environment

Edit `backend/.env`:
```env
DATABASE_URL=your_neon_connection_string
JWT_SECRET=any_long_random_string_here
GEMINI_API_KEY=your_gemini_api_key_from_aistudio
```

Get Gemini API key free at: [aistudio.google.com](https://aistudio.google.com)

### Step 3: Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on: http://localhost:5000

### Step 4: Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## 📁 Project Structure

```
ai-resume-analyser/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth + Upload
│   │   ├── services/       # AI + PDF parsing
│   │   └── db/             # Neon connection + schema
│   ├── uploads/            # Uploaded resume files
│   └── server.js
└── frontend/
    └── src/
        ├── pages/          # 7 pages
        ├── components/     # Reusable components
        ├── store/          # Zustand state
        └── services/       # API client
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/resume/upload` | Upload PDF/DOCX |
| GET | `/api/resume/all` | Get all resumes |
| POST | `/api/analysis/resume/:id` | AI analyse resume |
| POST | `/api/jobs/match` | Match resume to JD |
| POST | `/api/report/generate` | Generate report |
| GET | `/api/report/:id` | Get report |

## 🚢 Deployment (Free Tier)

| Service | Provider |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon |

Built with ❤️ using Google Gemini AI
