# TECHFLOW & TRIPWIRE — End-to-End AI Agent Security & Runtime Harness

> **MEGATHON '26 Hackathon Platform**  
> A complete, multi-tiered enterprise architecture featuring a business simulation workspace (**TechFlow**) guarded in real-time by an agentic runtime security harness (**Tripwire**).

---

## 📑 Table of Contents

1. [Executive Summary & System Architecture](#-executive-summary--system-architecture)
2. [TechFlow: Enterprise Employee Workspace](#-techflow-enterprise-employee-workspace)
   - [Overview & Persona Roles](#overview--persona-roles)
   - [Frontend Architecture](#frontend-architecture)
   - [Backend Gateway Architecture](#backend-gateway-architecture)
3. [Tripwire: Agentic Runtime Security Harness](#-tripwire-agentic-runtime-security-harness)
   - [Core Philosophy: Trajectory & Reversibility](#core-philosophy-trajectory--reversibility)
   - [Decision Gate & Invariant Engine](#decision-gate--invariant-engine)
   - [Mathematical Formulation of Behavioral Trajectory](#mathematical-formulation-of-behavioral-trajectory)
   - [Forensic Action Timeline & Auditing](#forensic-action-timeline--auditing)
   - [Database Layer & State Isolation](#database-layer--state-isolation)
4. [End-to-End Execution Flow](#-end-to-end-execution-flow)
5. [API Reference & Data Contracts](#-api-reference--data-contracts)
6. [Getting Started & Local Setup](#-getting-started--local-setup)
   - [Prerequisites](#prerequisites)
   - [Running TechFlow](#running-techflow)
   - [Running Tripwire Backend & Frontend](#running-tripwire-backend--frontend)
7. [Security Showcase Scenarios](#-security-showcase-scenarios)

---

## 🏛️ Executive Summary & System Architecture

Autonomous AI agents executing tools on enterprise infrastructure introduce unprecedented security challenges: **gradual scope drift**, **privilege escalation ("Boiling Frog" attacks)**, **irreversible state mutations**, and **cross-domain resource corruption**.

This repository contains two interconnected platforms designed to demonstrate, monitor, and defeat these threats:

1. **TechFlow (`/TECHFLOW`)**: A modern enterprise workspace simulating 7 organizational employee roles interacting with AI agents to perform tasks ranging from UI adjustments to production database maintenance.
2. **Tripwire (`/TRIPWIRE`)**: An inline, stateful runtime security harness and forensic monitoring platform that intercepts every tool call, analyzes semantic intent and behavioral trajectory, enforces security invariants, and mediates actions before execution.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   TECHFLOW ECOSYSTEM                                    │
│                                                                                         │
│   ┌───────────────────────────┐                 ┌───────────────────────────────────┐   │
│   │   TechFlow Web UI         │                 │   Company App Gateway             │   │
│   │   (React 18 / Vite)       │ ──[ HTTP POST ]─►   (Node.js / Express :4000)       │   │
│   │   7 Role Dashboards       │                 │   Auth + Query Enrichment         │   │
│   └───────────────────────────┘                 └─────────────────┬─────────────────┘   │
└───────────────────────────────────────────────────────────────────┼─────────────────────┘
                                                                    │
                                                           Forward Action Intent
                                                                    │
┌───────────────────────────────────────────────────────────────────▼─────────────────────┐
│                                   TRIPWIRE HARNESS                                      │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                             TRIPWIRE BACKEND (:8000)                            │   │
│   │                                                                                 │   │
│   │  ┌───────────────────────┐   ┌────────────────────────┐   ┌──────────────────┐  │   │
│   │  │ Semantic Intent &     │   │ Decision Gate          │   │ Trajectory       │  │   │
│   │  │ Tool Classification   ├──►│ (ALLOW / CONFIRM /     ├──►│ Scoring Engine   │  │   │
│   │  │ (Read/Modify/Destruct)│   │  HARD_CONFIRM / BLOCK) │   │ (Asymmetric EMA) │  │   │
│   │  └───────────────────────┘   └───────────┬────────────┘   └────────┬─────────┘  │   │
│   │                                          │                         │            │   │
│   │                                          ▼                         ▼            │   │
│   │                           ┌─────────────────────────────┐  ┌────────────────┐   │   │
│   │                           │ Invariant Verification      │  │ SQLite DB v2   │   │   │
│   │                           │ (Role ACLs, Resource Bounds)│  │ (Audit Trail)  │   │   │
│   │                           └─────────────────────────────┘  └────────────────┘   │   │
│   └──────────────────────────────────────────┬──────────────────────────────────────┘   │
│                                              │                                          │
│                                        SSE Event Bus                                    │
│                                              │                                          │
│   ┌──────────────────────────────────────────▼──────────────────────────────────────┐   │
│   │                          TRIPWIRE FRONTEND (:5173)                              │   │
│   │  • Behavioral Trajectory Monitor (Real-Time Dynamic Drift Graph)                │   │
│   │  • Action Timeline (Forensic Inspection)                                        │   │
│   │  • Interactive Predefined Scenario Runner (Judge Showcase)                      │   │
│   │  • Authoritative Forensic Audit Stream                                          │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💼 TechFlow: Enterprise Employee Workspace

TechFlow is an enterprise SaaS simulation where real corporate users authenticate, view domain-specific tasks, and request AI assistance.

### Overview & Persona Roles
TechFlow supports 7 distinct organizational personas with granular business functions:

| Role | Domain Scope | Typical Operations | Security Boundary |
| :--- | :--- | :--- | :--- |
| **Frontend Developer** | `frontend/`, UI | Component styling, React props, client state | Strictly forbidden from DB & Infra |
| **Backend Developer** | `backend/`, API | CRUD queries, schema migrations, endpoints | Restricted from DevOps & Prod Infra |
| **DevOps Engineer** | `infra/`, Cloud | CI/CD pipelines, container cluster, configs | Restricted from altering app business logic |
| **Software Architect** | `system/`, Architecture| System modeling, architectural review | Read-heavy, requires confirmation for writes |
| **Project Manager** | `pm/`, Jira/Docs | Milestone tracking, sprint tasks, assignments | Read-only with respect to code & DB |
| **Business Analyst** | `analytics/`, Docs | Requirement specifications, user stories | Read-only with respect to code & DB |
| **HR Specialist** | `hr/`, Employees | Onboarding, records, leave management | PII isolation; strict database protections |

### Frontend Architecture
- **Framework**: React 18, Vite, Tailwind CSS.
- **State & Auth**: `AuthContext` provides persistent session credentials and role state synced across `localStorage`.
- **Interactive UI**: Contextual quick-action prompt cards customized for each role, live agent query console, and real-time response rendering.

### Backend Gateway Architecture
- **Tech Stack**: Node.js, Express (running on port `4000`).
- **Authentication**: Proxies and authenticates users via MockAPI (`https://6aa28cf8ccb3db9689a69eca.mockapi.io/login`).
- **Query Enrichment**: Intercepts employee prompts, enriches them with user role metadata, session ID, timestamp, and query domain context before routing.
- **Direct & Fallback Execution**: Integrates with Tripwire's action evaluation engine and provides mock n8n execution fallbacks.

---

## 🛡️ Tripwire: Agentic Runtime Security Harness

Tripwire is an inline gatekeeper for AI agents. Rather than relying on rigid static permissions or post-hoc log parsing, Tripwire computes live **trajectory drift** and analyzes **action reversibility** at runtime.

### Core Philosophy: Trajectory & Reversibility
1. **Reversibility-First Action Classification**:
   - `READ` (0.0): Side-effect free reads (`SELECT`, `cat`, `GET`).
   - `MODIFY` (0.4): State changes that are reversible (`UPDATE`, `git commit`).
   - `STATE_MUTATION` (0.7): Broad state modifications requiring caution.
   - `DESTRUCTIVE` (1.0): Irreversible data/infrastructure deletion (`DROP TABLE`, `rm -rf`, `DELETE`).

2. **The Four Security Invariants**:
   - **I-1: Invariant Non-Violation**: Tools may never violate hard-coded enterprise security invariants (e.g., role-isolated database boundaries).
   - **I-2: Human Confirmation on Irreversible State**: Destructive or high-risk operations cannot proceed without human approval.
   - **I-3: Trajectory Escalation Confinement**: Escalating risk across successive actions halts the agent session before critical damage occurs.
   - **I-4: Total Forensic Auditability**: Every attempted, blocked, confirmed, and executed action is cryptographically recorded in an immutable ledger.

---

### Decision Gate & Invariant Engine

For every incoming tool invocation:

```
                  ┌───────────────────────┐
                  │ Tool Invocation Event │
                  └───────────┬───────────┘
                              │
               Passes Role Invariants? (I-1)
                             / \
                       NO   /   \   YES
                           /     \
                ┌─────────▼┐     ┌▼─────────────────────────┐
                │  BLOCK   │     │ Destructive / High Risk? │
                │ (Halt)   │     └────────────┬─────────────┘
                └──────────┘                 / \
                                       YES  /   \   NO
                                           /     \
                               ┌──────────▼┐     ┌▼──────────────────────┐
                               │  CONFIRM  │     │ Trajectory > 0.65?    │
                               │  / HARD   │     └───────────┬───────────┘
                               └───────────┘                / \
                                                      YES  /   \   NO
                                                          /     \
                                              ┌──────────▼┐     ┌▼────────┐
                                              │  CONFIRM  │     │  ALLOW  │
                                              └───────────┘     └─────────┘
```

- **`ALLOW`**: Safe to execute automatically.
- **`CONFIRM`**: Low/medium risk; requires standard operator confirmation.
- **`HARD_CONFIRM`**: High-impact or destructive action; requires explicit multi-factor affirmation.
- **`BLOCK`**: Hard invariant breach or role boundary violation; execution rejected immediately.

---

### Mathematical Formulation of Behavioral Trajectory

Tripwire computes a continuous behavioral risk score $S_t \in [0.0, 1.0]$ for each step $t$:

#### 1. Multi-Signal Composite Step Score
$$\text{step\_score}_t = 0.30 \cdot \Delta_{\text{scope}} + 0.35 \cdot \Delta_{\text{destruct}} + 0.15 \cdot V_{\text{action}} + 0.20 \cdot B_{\text{footprint}}$$

- **Scope Drift ($\Delta_{\text{scope}}$)**: Cosine divergence between initial stated user intent embedding and current tool target embedding.
- **Destructiveness Growth ($\Delta_{\text{destruct}}$)**: Jump in action severity: $\max(0.0, \text{Severity}_t - \max_{k < t} \text{Severity}_k)$.
- **Action Velocity ($V_{\text{action}}$)**: Burst frequency of tool invocations over time window $\Delta t$.
- **Footprint Breadth ($B_{\text{footprint}}$)**: Ratio of unique infrastructure resources (tables, files, containers) accessed in the session.

#### 2. Asymmetric Exponential Moving Average (EMA)
To capture creeping risk ("Boiling Frog") while preventing abrupt single-step anomalies from immediately decaying:

$$S_t = S_{t-1} + \alpha \cdot (\text{step\_score}_t - S_{t-1})$$

$$\alpha = \begin{cases} 
\alpha_{\text{up}} = 0.60 & \text{if } \text{step\_score}_t \ge S_{t-1} \quad \text{(Fast alert escalation)} \\
\alpha_{\text{down}} = 0.15 & \text{if } \text{step\_score}_t < S_{t-1} \quad \text{(Slow risk decay)}
\end{cases}$$

---

### Forensic Action Timeline & Auditing

- **Timeline**: Visual step-by-step forensic progression tracking action class, target resource, trajectory delta, and gate decision.
- **Immutable SQLite Ledger (`tripwire_v2.db`)**:
  - `action_logs`: Primary audit table recording every evaluated event, full tool payloads, risk factors, and policy decisions.
  - `sessions`: Session state, start/end timestamps, baseline intent, and running trajectory score.
  - `invariants`: Formal policy definitions and enforcement rules.

---

## 🔄 End-to-End Execution Flow

1. **User Request**: A Backend Developer logs into **TechFlow** and requests: *"Optimize customer indexing and clean up old records"*.
2. **Intent Packaging**: TechFlow gateway structures the payload with identity, JWT context, role (`Backend Developer`), and session ID.
3. **Tripwire Gate Evaluation**:
   - `SELECT * FROM customers` $\to$ `READ`, $S_t = 0.05 \implies$ **`ALLOW`**.
   - `UPDATE customers SET last_active = now()` $\to$ `MODIFY`, $S_t = 0.18 \implies$ **`ALLOW`**.
   - `DROP TABLE devops_deployments` $\to$ **Violates Invariant I-1 (Role DB Isolation)** $\implies$ **`BLOCK`**.
4. **Trajectory Monitoring**: If the agent attempts a series of deletions across multiple tables, the cumulative trajectory score crosses $0.65$ (High Risk), instantly converting subsequent write actions into **`CONFIRM`** / **`HARD_CONFIRM`**.
5. **Real-Time Visualization**: The Tripwire frontend receives live SSE updates, rendering the trajectory curve and updating the Action Timeline.

---

## 📡 API Reference & Data Contracts

### Tripwire REST API (`http://localhost:8000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/evaluate` | Main gate evaluation endpoint; classifies action, checks invariants, returns `ALLOW`/`CONFIRM`/`BLOCK`. |
| `GET` | `/api/v1/audit` | Streams all authoritative audit logs across all recorded sessions from `tripwire_v2.db`. |
| `GET` | `/api/v1/sessions` | Lists active and historical agent sessions with trajectory metrics. |
| `GET` | `/api/v1/sessions/{id}` | Retrieves detailed session state, trajectory points, and action history. |
| `GET` | `/api/v1/invariants` | Returns active security invariants and role isolation rules. |
| `GET` | `/api/v1/scenarios` | Returns predefined judge showcase scenarios (Boiling Frog, Credential Theft, etc.). |
| `POST` | `/api/v1/scenarios/{id}/run` | Runs an interactive scenario through the live trajectory engine. |

### TechFlow Gateway API (`http://localhost:4000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Gateway health check. |
| `POST` | `/api/agent/query` | Receives user query, attaches role & session context, and evaluates tool safety. |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0+ & `npm`
- **Python**: 3.10+ & `pip` / `virtualenv`

---

### 1. Running TechFlow

#### Backend Gateway
```bash
cd TECHFLOW/company-app-backend
npm install
npm run dev
# Running on http://localhost:4000
```

#### Frontend Workspace
```bash
cd TECHFLOW/frontend
npm install
npm run dev
# Running on http://localhost:5173 (or assigned Vite port)
```

---

### 2. Running Tripwire

#### Backend API & Trajectory Engine
```bash
cd TRIPWIRE/Backend
# Activate your Python virtual environment if configured:
# .venv\Scripts\activate
pip install -r requirements.txt
python run.py
# Running on http://localhost:8000 (Swagger docs at http://localhost:8000/docs)
```

#### Frontend Dashboard
```bash
cd TRIPWIRE/frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🧪 Security Showcase Scenarios

Tripwire features built-in demonstration scenarios accessible via the **Interactive Scenario Runner**:

1. **The "Boiling Frog" (Gradual Privilege Escalation)**:
   - Starts with benign `READ` operations on public configs.
   - Transitions into reading internal developer settings.
   - Attempts modifying authentication tables.
   - *Tripwire Result*: Trajectory continuously climbs; gate transitions from `ALLOW` to `CONFIRM` to `BLOCK` before unauthorized mutation occurs.

2. **Cross-Role Database Boundary Breach**:
   - Backend Developer role attempts accessing DevOps deployment credentials or HR salary records.
   - *Tripwire Result*: Invariant I-1 detects domain mismatch and immediately triggers **`BLOCK`**.

3. **High-Velocity Mass Destruction**:
   - Automated script attempts rapid successive table drops and bucket wipes.
   - *Tripwire Result*: Burst velocity and destructiveness growth triggers instant **`HARD_CONFIRM`** and session lockdown.

---

## 👥 Contributors & Megathon '26 Team

Built for the **Megathon '26** AI Agent Security Track. Designed to establish resilient, interpretable, and verifiable safety guarantees for autonomous agent systems.
