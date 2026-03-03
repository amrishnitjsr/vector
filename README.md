# VectorFlow

A visual pipeline builder that lets you drag, connect, and validate AI/data workflow nodes on an interactive canvas. Built with React + ReactFlow on the frontend and FastAPI on the backend.

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.13-blue)
![React](https://img.shields.io/badge/react-18.2-61dafb)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker](#docker)
- [Node Types](#node-types)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Scripts](#scripts)

---

## Features

- **Drag-and-drop canvas** — build pipelines visually using ReactFlow
- **9 built-in node types** — Input, Output, LLM, Text, Image, Database, Filter, Note, Timer
- **Dynamic handles** — Text nodes parse `{{variable}}` syntax and auto-generate input handles
- **DAG validation** — backend checks whether the submitted pipeline is a valid Directed Acyclic Graph using iterative three-colour DFS
- **Per-node controls** — zoom-to-node and delete buttons on every node header
- **Toast notifications** — title, duration, persistent, action-button and progress-bar support
- **Persistent canvas** — pipeline state is saved to `localStorage` with debounced writes
- **Dark theme UI** — CSS design system with custom variables
- **Docker-ready** — multi-stage frontend build (nginx) + Python backend, orchestrated via `docker-compose`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.2, ReactFlow, Zustand (persist) |
| Backend | FastAPI 0.115, Uvicorn, Pydantic v2 |
| Styling | Plain CSS with CSS custom properties |
| Container | Docker, nginx alpine, Python 3.13-slim |

---

## Project Structure

```
vector/
├── backend/
│   ├── main.py              # FastAPI app — CORS, middleware, DAG check, endpoints
│   ├── requirements.txt     # Pinned Python dependencies
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── nodes/
│   │   │   ├── BaseNode.js      # Shared node shell (header, handles, zoom, delete)
│   │   │   ├── inputNode.js
│   │   │   ├── outputNode.js
│   │   │   ├── llmNode.js
│   │   │   ├── textNode.js      # {{variable}} handle generation
│   │   │   ├── imageNode.js
│   │   │   ├── databaseNode.js
│   │   │   ├── filterNode.js
│   │   │   ├── noteNode.js
│   │   │   └── timerNode.js
│   │   ├── components/
│   │   │   ├── ToastContainer.js
│   │   │   ├── EmptyCanvas.js
│   │   │   └── ErrorBoundary.js
│   │   ├── hooks/
│   │   │   └── useToast.js
│   │   ├── store.js         # Zustand store with localStorage persistence
│   │   ├── ui.js            # Main canvas component
│   │   ├── toolbar.js       # Draggable node palette
│   │   ├── submit.js        # Submit pipeline button
│   │   └── api.js           # Fetch wrapper
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── DOCUMENTATION.md
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.11+
- **Docker & Docker Compose** (for containerised deployment)

### Local Development

#### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs at `http://localhost:8000/docs`.

#### Frontend

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`.

---

### Docker

Build and start both services with a single command:

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend (nginx) | http://localhost:3000 |
| Backend (uvicorn) | http://localhost:8000 |

To stop:

```bash
docker compose down
```

---

## Node Types

| Node | Description |
|---|---|
| **Input** | Entry point — accepts a name and type (text / file / number) |
| **Output** | Exit point — accepts a name and type |
| **LLM** | Language model config — model name, temperature, max tokens |
| **Text** | Free-form text with `{{variable}}` interpolation; generates dynamic handles |
| **Image** | Image URL input with preview toggle |
| **Database** | Database connection config — type, host, port, name |
| **Filter** | Conditional filter — field, operator, value |
| **Note** | Sticky-note style text annotation |
| **Timer** | Delay node — configurable duration in ms / s / min |

---

## API Reference

### `GET /`

Health check.

```json
{ "status": "ok", "service": "VectorFlow API", "version": "1.0.0" }
```

---

### `POST /pipelines/parse`

Validates a pipeline graph and returns statistics.

**Request body:**

```json
{
  "nodes": [{ "id": "node-1" }, { "id": "node-2" }],
  "edges": [{ "source": "node-1", "target": "node-2" }]
}
```

**Response:**

```json
{
  "num_nodes": 2,
  "num_edges": 1,
  "is_dag": true
}
```

`is_dag` is `false` when the graph contains a cycle.

---

## Configuration

### Backend — CORS origins

The backend reads allowed origins from the `ALLOW_ORIGINS` environment variable (comma-separated). It defaults to `localhost:3000` for local development.

```bash
# Example for a custom domain
ALLOW_ORIGINS=https://yourdomain.com uvicorn main:app --host 0.0.0.0 --port 8000
```

In Docker the variable is set in `docker-compose.yml`.

### Frontend — API URL

The frontend reads the backend URL from `REACT_APP_API_URL` (set at build time via CRA). It falls back to `http://localhost:8000`.

```bash
REACT_APP_API_URL=https://api.yourdomain.com npm run build
```

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start frontend dev server |
| `npm run build` | Production build → `frontend/build/` |
| `uvicorn main:app --reload` | Start backend with hot-reload |
| `docker compose up --build` | Build images and start all services |
| `docker compose down` | Stop and remove containers |
