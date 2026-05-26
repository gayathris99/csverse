# CSVerse — AI-Powered CSV Analysis Tool

CSVerse lets you upload any CSV file and instantly get AI-generated insights, interactive charts, and smart question suggestions — no SQL or data science knowledge required.

**Live Demo:** https://csverse-three.vercel.app

---

## Features

- **AI Suggested Questions** — Upload a CSV and get 5 smart questions auto-generated based on your data
- **Interactive Charts** — Bar, line, and pie charts generated from natural language questions
- **Custom Questions** — Ask anything about your data in plain English
- **Virtual Scrolling** — Smoothly preview CSV files with 100,000+ rows without freezing the browser
- **Query History** — All past analyses saved and accessible from the dashboard
- **JWT Auth** — Secure authentication with refresh token rotation and HttpOnly cookies

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Chart.js + react-chartjs-2
- PapaParse (CSV parsing)
- @tanstack/react-virtual (virtual scrolling)
- Zustand (state management)

**Backend**
- Node.js + Express
- PostgreSQL
- JWT (access + refresh tokens)
- OpenRouter API (AI model access)

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → Render PostgreSQL

---

## Architecture Highlights

- **Web Worker based CSV parsing** — Heavy CSV parsing runs off the main thread so the UI never freezes
- **Virtual table rendering** — Only visible rows are rendered in the DOM regardless of file size
- **Refresh token rotation** — Access tokens expire in 15 minutes; refresh tokens stored in HttpOnly cookies for security
- **AI chart generation** — Natural language questions are sent to the AI with full CSV data; response includes Chart.js-compatible data structure

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL

### Setup

1. Clone the repository
```bash
git clone https://github.com/gayathris99/csverse.git
cd csverse
```

2. Setup the backend
```bash
cd server
npm install
cp .env.example .env
# Fill in your environment variables
psql csverse < config/schema.sql
npm run dev
```

3. Setup the frontend
```bash
cd client
npm install
npm run dev
```

### Environment Variables

**Server `.env`**
```
PORT=8000
DATABASE_URL=postgresql://localhost/csverse
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
OPENROUTER_API_KEY=your_openrouter_key
CLIENT_URL=http://localhost:5173
```

**Client `.env.development`**
```
VITE_API_URL=http://localhost:8000/api
```

---

## Screenshots

> Dashboard — recent files and query history

> Upload — CSV preview with virtual scrolling and AI suggested questions

> Chart — AI-generated bar chart with plain English insight

---

## Author

**Gayathri S** — Frontend Developer  
[LinkedIn](https://linkedin.com/in/gayathris99) · [GitHub](https://github.com/gayathris99)
