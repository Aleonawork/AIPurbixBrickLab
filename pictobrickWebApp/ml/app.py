"""
FastAPI server for PictoBrick ML endpoints.
  - POST /api/depth-grid          single-image depth estimation
  - POST /api/jobs/3d             start full 3D pipeline job (video / images)
  - GET  /api/jobs/3d/{job_id}    poll job status
  - GET  /api/jobs/3d/{job_id}/glb  download finished GLB
"""
from __future__ import annotations

import base64
import io
import logging
import threading
import uuid
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from enum import Enum
from functools import lru_cache
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI(title="PictoBrick ML API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DEPTH_MODEL_ID = "depth-anything/Depth-Anything-V2-Small-hf"
WORK_DIR = Path("/tmp/ptb_jobs")
WORK_DIR.mkdir(parents=True, exist_ok=True)


# ── Depth estimation ──────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_depth_pipe():
    from transformers import pipeline
    log.info("Loading %s…", DEPTH_MODEL_ID)
    return pipeline(task="depth-estimation", model=DEPTH_MODEL_ID, device=-1)


class DepthGridReq(BaseModel):
    image_b64: str
    grid_w: int
    grid_h: int
    max_height: int = 8


class DepthGridResp(BaseModel):
    depths: list[int]


@app.post("/api/depth-grid", response_model=DepthGridResp)
def depth_grid(req: DepthGridReq) -> DepthGridResp:
    if req.grid_w < 1 or req.grid_h < 1 or req.grid_w * req.grid_h > 25000:
        raise HTTPException(400, "Invalid grid dimensions")
    b64 = req.image_b64.split(",", 1)[-1] if "," in req.image_b64 else req.image_b64
    try:
        pil_img = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    except Exception as exc:
        raise HTTPException(400, f"Bad image: {exc}") from exc
    pipe = _get_depth_pipe()
    depth_np = np.array(pipe(pil_img)["depth"], dtype=np.float32)
    small = np.array(
        Image.fromarray(depth_np).resize((req.grid_w, req.grid_h), Image.LANCZOS),
        dtype=np.float32,
    )
    d_min, d_max = small.min(), small.max()
    norm = (small - d_min) / (d_max - d_min) if d_max > d_min else np.full_like(small, 0.5)
    heights = np.clip(np.round(norm * (req.max_height - 1) + 1).astype(int), 1, req.max_height)
    return DepthGridResp(depths=heights.flatten().tolist())


# ── 3-D pipeline jobs ─────────────────────────────────────────────────────────

class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"


@dataclass
class Job:
    id: str
    status: JobStatus = JobStatus.PENDING
    progress: str = "Queued"
    glb_path: str | None = None
    error: str | None = None


_jobs: dict[str, Job] = {}
_jobs_lock = threading.Lock()
_executor = ThreadPoolExecutor(max_workers=2)


def _set(job_id: str, **kw):
    with _jobs_lock:
        job = _jobs.get(job_id)
        if job:
            for k, v in kw.items():
                setattr(job, k, v)


def _run_pipeline(job_id: str, input_path: Path) -> None:
    try:
        _set(job_id, status=JobStatus.RUNNING, progress="Preprocessing frames…")
        try:
            from ptb_ml.pipeline import PipelineReq, run_pipeline
            from ptb_ml.preprocess.settings import MaskingSettings, PreprocessSettings
        except ImportError:
            _set(job_id, status=JobStatus.FAILED, progress="Failed",
                 error="Full pipeline not available in this container. "
                       "Run via Dockerfile.pipeline or python main.py locally.")
            return

        req = PipelineReq(
            base_dir=WORK_DIR,
            job_id=job_id,
            input_paths=[input_path],
            preprocess_settings=PreprocessSettings(
                masking=MaskingSettings(enabled=False),
            ),
        )
        result = run_pipeline(req)

        if result.instructions and result.instructions.ok and result.instructions.glb_path:
            _set(job_id, status=JobStatus.DONE, progress="Complete",
                 glb_path=str(result.instructions.glb_path))
        else:
            _set(job_id, status=JobStatus.FAILED,
                 error=result.error or "Pipeline produced no output", progress="Failed")
    except Exception as exc:
        log.exception("Job %s failed", job_id)
        _set(job_id, status=JobStatus.FAILED, error=str(exc), progress="Failed")


@app.post("/api/jobs/3d")
async def create_job(file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    input_dir = WORK_DIR / job_id / "input"
    input_dir.mkdir(parents=True, exist_ok=True)
    filename = file.filename or "upload.mp4"
    input_path = input_dir / filename
    with open(input_path, "wb") as f:
        f.write(await file.read())
    with _jobs_lock:
        _jobs[job_id] = Job(id=job_id)
    _executor.submit(_run_pipeline, job_id, input_path)
    return {"job_id": job_id}


class JobResp(BaseModel):
    job_id: str
    status: str
    progress: str
    error: str | None = None


@app.get("/api/jobs/3d/{job_id}", response_model=JobResp)
def get_job(job_id: str):
    with _jobs_lock:
        job = _jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return JobResp(job_id=job.id, status=job.status, progress=job.progress, error=job.error)


@app.get("/api/jobs/3d/{job_id}/glb")
def get_glb(job_id: str):
    with _jobs_lock:
        job = _jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    if job.status != JobStatus.DONE or not job.glb_path:
        raise HTTPException(409, f"Job not ready (status: {job.status})")
    path = Path(job.glb_path)
    if not path.exists():
        raise HTTPException(404, "GLB file missing")
    return FileResponse(str(path), media_type="model/gltf-binary",
                        filename=f"model_{job_id[:8]}.glb")


@app.get("/health")
def health():
    return {"ok": True}
