"""
API Routes - FastAPI endpoints for recommendations
Handles incoming requests and returns recommendations
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas import (
    RecommendRequest,
    BulkRecommendRequest,
    RecommendResponse,
    HealthCheckResponse,
    ErrorResponse
)
from app.model_loader import get_model_instance
from app.inference import RecommendationEngine, get_bulk_recommendations
import pandas as pd
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint
    Returns model status and service availability
    """
    try:
        model_artifacts = get_model_instance()
        is_loaded = model_artifacts is not None
        
        return HealthCheckResponse(
            status="healthy" if is_loaded else "degraded",
            message="✅ ML Service is running" if is_loaded else "⚠️ Model not loaded",
            model_loaded=is_loaded
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return HealthCheckResponse(
            status="unhealthy",
            message=f"❌ Service error: {str(e)}",
            model_loaded=False
        )


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    """
    Get song recommendations
    
    Args:
        request: RecommendRequest with song details
        
    Returns:
        RecommendResponse with current song and top-k recommendations
        
    Raises:
        HTTPException: If song not found or model not loaded
    """
    try:
        # Get model
        model_artifacts = get_model_instance()
        if model_artifacts is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model not loaded. Please check ml-services"
            )
        
        # Initialize engine
        engine = RecommendationEngine(model_artifacts)
        
        # Get recommendations
        result = engine.get_recommendations(
            song_id=request.song_id,
            title=request.title,
            artist=request.artist,
            top_k=request.top_k
        )
        
        logger.info(f"✅ Recommendations generated for: {request.title or request.song_id}")
        return RecommendResponse(**result)
        
    except ValueError as e:
        logger.warning(f"Song not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Song not found: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recommendations: {str(e)}"
        )


@router.post("/recommend/batch")
async def recommend_batch(request: BulkRecommendRequest):
    """
    Get recommendations for multiple songs (batch processing)
    
    Args:
        request: BulkRecommendRequest with list of songs
        
    Returns:
        List of recommendations (some may have errors)
    """
    try:
        model_artifacts = get_model_instance()
        if model_artifacts is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model not loaded"
            )
        
        results = get_bulk_recommendations(
            model_artifacts,
            request.songs,
            top_k=request.top_k
        )
        
        logger.info(f"✅ Batch recommendations generated for {len(results)} songs")
        return {"results": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"Batch recommendation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/search")
async def search_songs(q: str = "", limit: int = 10):
    """
    Search for songs by title
    Debug endpoint to help find actual song names in database
    
    Args:
        q: Search query (song title)
        limit: Maximum results to return
        
    Returns:
        List of matching songs
    """
    try:
        model_artifacts = get_model_instance()
        if model_artifacts is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model not loaded"
            )
        
        df = model_artifacts.df
        query = q.lower().strip()
        
        # Search in titles
        matches = df[df['title'].str.lower().str.contains(query, na=False)].head(limit)
        
        results = [
            {
                "id": int(idx),
                "title": row['title'],
                "artist": row['artist'],
                "singer": row.get('singer', 'Unknown'),
                "genre": row.get('genre', 'Unknown')
            }
            for idx, row in matches.iterrows()
        ]
        
        return {
            "query": q,
            "total_found": len(matches),
            "results": results
        }
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/songs")
async def list_songs(limit: int = 50, offset: int = 0):
    """
    List all songs in database
    Debug endpoint to see dataset contents
    
    Args:
        limit: Number of songs to return
        offset: Starting position
        
    Returns:
        List of songs with metadata
    """
    try:
        model_artifacts = get_model_instance()
        if model_artifacts is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model not loaded"
            )
        
        df = model_artifacts.df
        total = len(df)
        
        # Get slice
        songs_slice = df.iloc[offset:offset+limit]
        
        results = [
            {
                "id": int(idx),
                "title": row['title'],
                "artist": row['artist'],
                "singer": row.get('singer', 'Unknown'),
                "genre": row.get('genre', 'Unknown'),
                "year": int(row.get('year', -1)) if pd.notna(row.get('year')) else -1
            }
            for idx, row in songs_slice.iterrows()
        ]
        
        return {
            "total_songs": total,
            "offset": offset,
            "limit": limit,
            "returned": len(results),
            "results": results
        }
    except Exception as e:
        logger.error(f"List songs error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    """Get statistics about loaded model"""
    try:
        model_artifacts = get_model_instance()
        if model_artifacts is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model not loaded"
            )
        
        df = model_artifacts.df
        return {
            "total_songs": len(df),
            "unique_singers": df['singer'].nunique(),
            "unique_artists": df['artist'].nunique(),
            "unique_genres": df['genre'].nunique(),
            "unique_albums": df['album'].nunique(),
            "embedding_dimension": model_artifacts.embeddings.shape[1],
            "model_status": "loaded"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )