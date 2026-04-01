"""
Main FastAPI application
Initializes FastAPI app, loads model on startup, and registers routes
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from app.routes import router
from app.model_loader import initialize_model, get_model_instance


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup/shutdown events
    """
    # Startup
    logger.info("🚀 Starting ML Service...")
    try:
        model = initialize_model(model_dir="model")
        logger.info(f"✅ Model loaded successfully. Dataset size: {len(model.df)} songs")
    except Exception as e:
        logger.warning(f"⚠️ Model not found: {str(e)}")
        logger.info("ℹ️ Run model training notebook to generate 'model/gnn_model.pth' and 'model/artifacts.pkl'")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down ML Service...")


app = FastAPI(
    title="🎵 Music Recommendation API",
    description="GNN-based music recommendation service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes - NO PREFIX so /recommend is directly available
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )