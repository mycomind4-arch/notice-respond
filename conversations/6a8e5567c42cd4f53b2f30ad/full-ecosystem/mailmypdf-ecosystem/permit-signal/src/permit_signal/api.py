from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query

from .config import get_settings
from .engines import engine_availability
from .models import HealthResponse, IngestRequest, IngestResponse
from .pipeline import IngestionPipeline
from .store import Store

settings = get_settings()
store = Store(settings.database_path)
pipeline = IngestionPipeline(settings, store)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await store.initialize()
    yield


app = FastAPI(
    title="PermitSignal API",
    version="0.1.0",
    description="Evidence-linked municipal permit and public opportunity intelligence.",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        environment=settings.env,
        engines=engine_availability(),
    )


@app.post("/v1/ingest", response_model=IngestResponse)
async def ingest(request: IngestRequest) -> IngestResponse:
    try:
        return await pipeline.run(request)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/v1/opportunities")
async def opportunities(limit: int = Query(default=100, ge=1, le=500)) -> list[dict]:
    return await store.list_opportunities(limit)


@app.get("/v1/sources")
async def sources() -> list[dict]:
    return await store.list_sources()
