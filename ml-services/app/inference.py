"""
Inference Engine - Handles recommendation generation from GNN model
Uses pre-computed embeddings and cosine similarity for fast inference
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Optional, Tuple
import logging
from difflib import SequenceMatcher
import pandas as pd

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """Generates song recommendations using GNN embeddings"""
    
    def __init__(self, model_artifacts):
        """
        Initialize inference engine
        
        Args:
            model_artifacts: ModelArtifacts object containing embeddings and data
        """
        self.embeddings = model_artifacts.embeddings
        self.df = model_artifacts.df
        self.song_to_id = model_artifacts.song_to_id
        self.id_to_song = model_artifacts.id_to_song
    
    def find_song_by_id(self, song_id: str) -> Optional[int]:
        """
        Find song index by ID (tries multiple lookup strategies)
        
        Args:
            song_id: Song ID to search for
            
        Returns:
            Index in dataset or None if not found
        """
        # Strategy 1: Direct ID match
        if song_id in self.song_to_id:
            return self.song_to_id[song_id]
        
        # Strategy 2: Numeric ID
        try:
            idx = int(song_id)
            if 0 <= idx < len(self.df):
                return idx
        except (ValueError, TypeError):
            pass
        
        return None
    
    def find_song_by_title_artist(self, title: str, artist: str) -> Optional[int]:
        """
        Find song by title and artist (fuzzy matching)
        Tries multiple strategies:
        1. Full match (title + artist)
        2. Title-only match (if artist is "Unknown" or empty)
        3. Partial title match
        
        Args:
            title: Song title
            artist: Artist name
            
        Returns:
            Index in dataset or None if not found
        """
        best_match_idx = None
        best_score = 0.4  # Lower threshold for more matches
        
        # Check if artist is empty or "Unknown"
        artist_is_empty = not artist or artist.lower() in ['unknown', 'unknown artist', '']
        
        for idx, row in self.df.iterrows():
            row_title = str(row['title']).lower().strip()
            query_title = title.lower().strip()
            
            # Calculate title similarity
            title_ratio = SequenceMatcher(None, query_title, row_title).ratio()
            
            # If artist info is missing/unknown, use title-only matching
            if artist_is_empty:
                score = title_ratio
                logger.info(f"Title-only match: '{title}' vs '{row_title}' = {score:.2f}")
            else:
                # Calculate artist similarity
                row_artist = str(row['artist']).lower().strip()
                query_artist = artist.lower().strip()
                artist_ratio = SequenceMatcher(None, query_artist, row_artist).ratio()
                
                # Weighted score (title 70%, artist 30%)
                score = (title_ratio * 0.7) + (artist_ratio * 0.3)
                logger.info(f"Match: '{title}' by '{artist}' vs '{row_title}' by '{row_artist}' = {score:.2f}")
            
            if score > best_score:
                best_score = score
                best_match_idx = idx
        
        if best_match_idx is not None:
            logger.info(f"✅ Best match found at index {best_match_idx} with score {best_score:.2f}")
        
        return best_match_idx

    def find_song_by_title_only(self, title: str) -> Optional[int]:
        """
        Find song by title only (ignore artist)
        Last resort when normal matching fails
        
        Args:
            title: Song title
            
        Returns:
            Index in dataset or None if not found
        """
        best_match_idx = None
        best_score = 0.3  # Very low threshold for title-only
        
        query_title = title.lower().strip()
        
        for idx, row in self.df.iterrows():
            row_title = str(row['title']).lower().strip()
            score = SequenceMatcher(None, query_title, row_title).ratio()
            
            if score > best_score:
                best_score = score
                best_match_idx = idx
                logger.debug(f"Title-only: '{title}' matches '{row_title}' = {score:.2f}")
        
        if best_match_idx is not None:
            logger.info(f"✅ Title-only match found at index {best_match_idx} with score {best_score:.2f}")
        
        return best_match_idx
    
    def get_song_metadata(self, idx: int) -> Dict:
        """
        Get song metadata at given index
        
        Args:
            idx: Row index in dataframe
            
        Returns:
            Dictionary with song metadata
        """
        row = self.df.iloc[idx]
        return {
            "id": int(idx),
            "title": str(row.get('title', 'Unknown')),
            "singer": str(row.get('singer', 'Unknown')),
            "artist": str(row.get('artist', 'Unknown')),
            "genre": str(row.get('genre', 'Unknown')),
            "album": str(row.get('album', 'Unknown')),
            "year": int(row.get('year', -1)) if pd.notna(row.get('year')) else -1,
            # Add these if available in your database
            "image": str(row.get('image', '')),
            "url": str(row.get('url', ''))
        }
    
    def get_recommendations(
        self,
        song_id: Optional[str] = None,
        title: Optional[str] = None,
        artist: Optional[str] = None,
        top_k: int = 5
    ) -> Dict:
        """
        Get recommendations for a song
        
        Args:
            song_id: Song ID (primary lookup)
            title: Song title (fallback lookup)
            artist: Artist name (used with title for fuzzy matching)
            top_k: Number of recommendations
            
        Returns:
            Dictionary with current_song and recommendations list
            
        Raises:
            ValueError: If song not found
        """
        idx = None
        
        # Try to find song
        if song_id:
            idx = self.find_song_by_id(song_id)
        
        # Try title + artist if no ID match
        if idx is None and title:
            idx = self.find_song_by_title_artist(title, artist or "Unknown")
        
        # If still not found, try title-only (ignore artist completely)
        if idx is None and title:
            logger.info(f"Title+artist match failed, trying title-only for '{title}'")
            idx = self.find_song_by_title_only(title)
        
        if idx is None:
            logger.warning(f"❌ Song not found - ID: {song_id}, Title: '{title}', Artist: '{artist}'")
            logger.info(f"Available songs count: {len(self.df)}")
            raise ValueError(
                f"Song not found: {song_id or title} by {artist or 'Unknown'}"
            )
        
        # Get current song metadata
        current_song = self.get_song_metadata(idx)
        
        # Calculate similarities
        similarity = cosine_similarity(
            self.embeddings[idx].reshape(1, -1),
            self.embeddings
        )[0]
        
        # Exclude self
        similarity[idx] = -1
        
        # Get top-k sorted indices by similarity
        sorted_indices = similarity.argsort()[::-1][:top_k * 3]  # Get more for filtering
        
        # Prioritize recommendations: Singer → Genre → Artist → Album → Pure Similarity
        recommendations = []
        used = set()
        
        priority_rules = [
            ('singer', 'Same Singer'),
            ('genre', 'Same Genre'),
            ('artist', 'Same Artist'),
            ('album', 'Same Album'),
        ]
        
        # Apply priority-based selection
        for col, label in priority_rules:
            for i in sorted_indices:
                if (
                    len(recommendations) >= top_k or
                    i in used or
                    i == idx
                ):
                    break
                
                # Check if column values match (and not unknown)
                if (
                    self.df.iloc[i][col] == self.df.iloc[idx][col] and
                    str(self.df.iloc[i][col]).lower() != 'unknown'
                ):
                    rec = self.get_song_metadata(i)
                    rec['recommendation_reason'] = label
                    rec['similarity_score'] = float(similarity[i])
                    recommendations.append(rec)
                    used.add(i)
        
        # Fill remaining with pure similarity-based recommendations
        for i in sorted_indices:
            if len(recommendations) >= top_k:
                break
            if i not in used and i != idx:
                rec = self.get_song_metadata(i)
                rec['recommendation_reason'] = 'Similar Embedding'
                rec['similarity_score'] = float(similarity[i])
                recommendations.append(rec)
                used.add(i)
        
        return {
            "current_song": current_song,
            "recommendations": recommendations[:top_k],
            "count": len(recommendations)
        }


def get_bulk_recommendations(
    model_artifacts,
    request_list: List[Dict],
    top_k: int = 5
) -> List[Dict]:
    """
    Get recommendations for multiple songs in batch
    
    Args:
        model_artifacts: ModelArtifacts object
        request_list: List of dicts with 'song_id', 'title', 'artist'
        top_k: Number of recommendations per song
        
    Returns:
        List of recommendation results
    """
    engine = RecommendationEngine(model_artifacts)
    results = []
    
    for req in request_list:
        try:
            result = engine.get_recommendations(
                song_id=req.get('song_id'),
                title=req.get('title'),
                artist=req.get('artist'),
                top_k=top_k
            )
            result['status'] = 'success'
            results.append(result)
        except Exception as e:
            results.append({
                'status': 'error',
                'error': str(e),
                'input': req
            })
    
    return results


def get_similar_by_metadata(
    model_artifacts,
    metadata: Dict,
    top_k: int = 5
) -> List[Dict]:
    """
    Get songs similar by metadata without model inference
    Useful for cold-start or quick similarity
    
    Args:
        model_artifacts: ModelArtifacts object
        metadata: Dict with 'singer', 'artist', 'genre', 'album'
        top_k: Number of results
        
    Returns:
        List of similar songs
    """
    df = model_artifacts.df
    results = []
    
    for idx, row in df.iterrows():
        score = 0
        if row.get('singer') == metadata.get('singer') and pd.notna(row.get('singer')):
            score += 4
        if row.get('artist') == metadata.get('artist') and pd.notna(row.get('artist')):
            score += 3
        if row.get('genre') == metadata.get('genre') and pd.notna(row.get('genre')):
            score += 2
        if row.get('album') == metadata.get('album') and pd.notna(row.get('album')):
            score += 1
        
        if score > 0:
            song_data = {
                'id': idx,
                'title': row.get('title', 'Unknown'),
                'singer': row.get('singer', 'Unknown'),
                'artist': row.get('artist', 'Unknown'),
                'genre': row.get('genre', 'Unknown'),
                'album': row.get('album', 'Unknown'),
                'metadata_score': score,
                'image': row.get('image', ''),
                'url': row.get('url', '')
            }
            results.append(song_data)
    
    # Sort by score and return top-k
    results.sort(key=lambda x: x['metadata_score'], reverse=True)
    return results[:top_k]
