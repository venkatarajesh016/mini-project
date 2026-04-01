from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# ===================== REQUEST SCHEMAS =====================

class RecommendRequest(BaseModel):
    """Request for song recommendations"""
    song_id: Optional[str] = Field(None, description="Song ID from backend")
    title: Optional[str] = Field(None, description="Song title")
    artist: Optional[str] = Field(None, description="Artist name")
    top_k: int = Field(5, ge=1, le=20, description="Number of recommendations")
    
    class Config:
        example = {
            "song_id": "123",
            "title": "Chamka Chamka",
            "artist": "Singer Name",
            "top_k": 5
        }


class BulkRecommendRequest(BaseModel):
    """Request for bulk recommendations"""
    songs: List[Dict[str, Any]] = Field(..., description="List of songs to get recommendations for")
    top_k: int = Field(5, ge=1, le=20)
    
    class Config:
        example = {
            "songs": [
                {"song_id": "1", "title": "Song 1", "artist": "Artist 1"},
                {"song_id": "2", "title": "Song 2", "artist": "Artist 2"}
            ],
            "top_k": 5
        }


# ===================== RESPONSE SCHEMAS =====================

class SongMetadata(BaseModel):
    """Song metadata response"""
    id: int
    title: str
    singer: str
    artist: str
    genre: str
    album: str
    year: int
    image: Optional[str] = None
    url: Optional[str] = None


class RecommendedSong(SongMetadata):
    """Song with recommendation metadata"""
    recommendation_reason: str = Field(..., description="Why this song was recommended")
    similarity_score: float = Field(..., description="Cosine similarity score (0-1)")


class RecommendResponse(BaseModel):
    """Response with recommendations"""
    current_song: SongMetadata
    recommendations: List[RecommendedSong]
    count: int


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    message: str
    model_loaded: bool


class ErrorResponse(BaseModel):
    """Error response"""
    status: str = "error"
    error: str
    detail: Optional[str] = None