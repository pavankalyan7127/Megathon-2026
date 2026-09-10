# TechFlow Company App (Tripwire Hackathon Simulation Layer)

This is the lightweight software company application and application gateway built for the **TRIPWIRE** hackathon project.

> **Context**: This app simulates realistic employee interactions with an AI agent across 7 distinct company roles. It does **not** implement security decisions or authorization policies directly—those belong downstream in Tripwire.

---

## Architecture Overview

```
Browser / React Frontend (Vite, Tailwind, React 18)
        │
        │ HTTP (Login / Agent Query)
        ▼
Company App Backend Gateway (Node.js, Express, Port 4000)
        │
        ├── Auth / Signup ──► MockAPI (https://6aa28cf8ccb3db9689a69eca.mockapi.io/login)
        │
        └── POST /api/agent/query ──► n8n Webhook (N8N_WEBHOOK_URL)
                                           │
                                           ▼
                                   [AI Agent Workflow]
                                           │
                                           ▼
                                    [Tripwire Security]
                                           │
                                           ▼
                                 [Protected Resources]
```

---

## Features Implemented

1. **MockAPI Authentication & Signup**:
   - User registration with Name, Corporate Email, Password, and Role selection.
   - Authentication against `https://6aa28cf8ccb3db9689a69eca.mockapi.io/login`.
   - Local demo session persistence in `localStorage` across page refreshes.
   - Session logout.

2. **7 Role-Based Dashboards**:
   - **Frontend Developer** (Build UI, Fix UI Bug, Connect API, Validate Input)
   - **Backend Developer** (Read DB, Insert Data, Update Data, Delete Data, Create API, Manage API)
   - **HR** (Employee Records, Recruitment, Interview, Leave/Attendance, Employee Concern)
   - **Project Manager** (Create Project, Assign Task, Set Deadline, Track Progress, Stakeholder Comm)
   - **Business Analyst** (Gather Req, User Story, Analyze Need, Document Requirement)
   - **Software Architect** (Design Arch, Design DB, Define API, Choose Tech, Review Security)
   - **DevOps Engineer** (Deploy App, Manage Server, CI/CD, Monitor App, Backup/Infra)

3. **AI Agent Natural Language Interface**:
   - Query input with automatic role context enrichment.
   - Real-time chat stream with role badge and timestamps.
   - Clickable quick action prompt cards.
   - Clear and graceful fallback messages when n8n webhook is not yet configured or offline.

4. **Gateway Backend**:
   - Endpoint `POST /api/agent/query` receiving `{ user, query }` and forwarding to `N8N_WEBHOOK_URL`.
   - Health check `GET /api/health`.
   - Clean error handling with timeout protection (no stack traces exposed to client).

---

## Directory Structure

```
ai agent/
├── company-app-backend/        # Lightweight Gateway Backend (Port 4000)
│   ├── src/
│   │   ├── config/index.js     # Env loader
│   │   ├── routes/
│   │   │   ├── auth.routes.js  # Auth proxy & role endpoints
│   │   │   └── agent.routes.js # POST /api/agent/query
│   │   ├── services/
│   │   │   └── n8n.service.js  # Webhook forwarding service
│   │   └── server.js           # Express app entrypoint
│   ├── .env.example
│   ├── .env
│   └── package.json
│
└── frontend/                   # Modern React Frontend (Port 5173)
    ├── src/
    │   ├── components/         # Header, Sidebar, RoleBadge, QuickActionCards, AIAssistantChat
    │   ├── context/            # AuthContext (session management)
    │   ├── dashboards/         # Role configs & action definitions
    │   ├── pages/              # LoginPage, SignupPage, DashboardPage, NotFoundPage
    │   ├── services/           # api.js (backend client)
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## How to Run

### 1. Start the Backend Gateway

```bash
cd company-app-backend
npm install
npm run dev
# Running on http://localhost:4000
```

### 2. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## Environment Variables

### Backend (`company-app-backend/.env`)

```env
PORT=4000
MOCKAPI_URL=https://6aa28cf8ccb3db9689a69eca.mockapi.io/login
N8N_WEBHOOK_URL=http://your-n8n-host:5678/webhook/your-agent-endpoint
N8N_TIMEOUT_MS=15000
```

### Frontend (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## How to Connect to n8n (Next Stage)

1. Create a Webhook trigger node in n8n (Method: `POST`).
2. Copy the Webhook URL (e.g. `http://localhost:5678/webhook/agent-query`).
3. Set `N8N_WEBHOOK_URL=http://localhost:5678/webhook/agent-query` in `company-app-backend/.env`.
4. Restart the backend server.
5. In n8n, process the incoming payload:
   ```json
   {
     "user": {
       "id": "1",
       "name": "Alex Rivera",
       "email": "alex@techflow.com",
       "role": "Backend Developer"
     },
     "query": "Read the customer records.",
     "source": "company-app",
     "timestamp": "2026-09-10T11:08:20.351Z",
     "session_id": "sess_1_demo"
   }
   ```
6. Return a response from n8n e.g. `{ "response": "..." }` to display directly in the AI Assistant chat panel.
