import logging
import os
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from typing import List

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("vectorflow")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="VectorFlow API",
    description="Pipeline graph analysis backend",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
_raw_origins = os.getenv("ALLOW_ORIGINS", "*")
_wildcard = _raw_origins.strip() == "*"
_origins = ["*"] if _wildcard else [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=not _wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request timing middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    logger.info("%s %s → %d  (%.1f ms)", request.method, request.url.path, response.status_code, ms)
    return response

# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception(request: Request, exc: Exception):
    logger.error("Unhandled error on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ── Request models ────────────────────────────────────────────────────────────

class Node(BaseModel):
    id: str

    @field_validator("id")
    @classmethod
    def id_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Node id must not be empty")
        return v.strip()

class Edge(BaseModel):
    source: str
    target: str

    @field_validator("source", "target")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Edge source/target must not be empty")
        return v.strip()

class PipelineRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


# ── DAG check via iterative DFS (three-colour marking) ───────────────────────

def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """
    Returns True iff the directed graph is acyclic.

    Three colours:
      WHITE (0) – unvisited
      GRAY  (1) – on the current DFS stack
      BLACK (2) – fully processed
    A back-edge to a GRAY node means a cycle exists.
    """
    adj: dict[str, list[str]] = {n.id: [] for n in nodes}
    for e in edges:
        if e.source in adj:
            adj[e.source].append(e.target)

    WHITE, GRAY, BLACK = 0, 1, 2
    color: dict[str, int] = {n.id: WHITE for n in nodes}

    for start in adj:
        if color[start] != WHITE:
            continue
        color[start] = GRAY
        stack = [(start, iter(adj[start]))]

        while stack:
            node_id, neighbours = stack[-1]
            try:
                nbr = next(neighbours)
                state = color.get(nbr, WHITE)
                if state == GRAY:
                    return False          # back-edge → cycle
                if state == WHITE:
                    color[nbr] = GRAY
                    stack.append((nbr, iter(adj.get(nbr, []))))
            except StopIteration:
                color[node_id] = BLACK
                stack.pop()

    return True


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "service": "VectorFlow API", "version": "1.0.0"}

@app.post("/pipelines/parse", tags=["pipeline"])
def parse_pipeline(pipeline: PipelineRequest):
    logger.info("parse_pipeline: %d nodes, %d edges", len(pipeline.nodes), len(pipeline.edges))

    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag       = is_dag(pipeline.nodes, pipeline.edges)

    logger.info("Result → num_nodes=%d  num_edges=%d  is_dag=%s", num_nodes, num_edges, dag)
    return {"num_nodes": num_nodes, "num_edges": num_edges, "is_dag": dag}

