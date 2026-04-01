/**
 * Recommendation Service
 * Handles communication with ML FastAPI service
 * Manages caching and fallback strategies
 */

import axios from 'axios';
import { fetchExternalSongs } from './externalSongsService.js';

// Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const SERVICE_TIMEOUT = 10000; // 10 seconds

// Cache for recommendations (simple in-memory cache)
const recommendationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class RecommendationService {
  /**
   * Initialize ML service client
   */
  constructor() {
    this.client = axios.create({
      baseURL: ML_SERVICE_URL,
      timeout: SERVICE_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check if ML service is available
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/');
      return {
        available: true,
        status: response.data.status,
        model_loaded: response.data.model_loaded
      };
    } catch (error) {
      console.error('ML Service health check failed:', error.message);
      return {
        available: false,
        status: 'unavailable',
        model_loaded: false
      };
    }
  }

  /**
   * Get recommendations for a song
   * 
   * @param {string} songId - Song ID from database
   * @param {string} title - Song title (for fallback matching)
   * @param {string} artist - Artist name (for fallback matching)
   * @param {number} topK - Number of recommendations (default 5)
   * @returns {Promise} Recommendations response
   */
  async getRecommendations(songId, title, artist, topK = 5) {
    try {
      // Check cache first
      const cacheKey = `${songId}:${topK}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        console.log(`📦 Using cached recommendations for song ${songId}`);
        return cached;
      }

      // Call ML service
      const response = await this.client.post('/recommend', {
        song_id: songId,
        title: title,
        artist: artist,
        top_k: topK
      });

      // Transform response and clean "nan" values
      const recommendations = {
        current_song: this._cleanNanValues(response.data.current_song),
        recommendations: response.data.recommendations.map(rec => 
          this._cleanNanValues({
            ...rec,
            id: rec.id, // This is the index in ML model, may need mapping
            score: rec.similarity_score
          })
        ),
        count: response.data.count
      };

      // Cache the result
      this._setInCache(cacheKey, recommendations);

      console.log(`✅ Got ${recommendations.count} recommendations for song ${songId}`);
      return recommendations;

    } catch (error) {
      console.error('Error getting recommendations:', error.message);
      throw new Error(`Recommendation service error: ${error.message}`);
    }
  }

  /**
   * Clean "nan" string values from object and convert to null or empty string
   * @param {Object} obj - Object to clean
   * @returns {Object} - Cleaned object
   */
  _cleanNanValues(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const cleaned = { ...obj };
    for (const key in cleaned) {
      const value = cleaned[key];
      
      // Convert "nan" string to null or empty string
      if (typeof value === 'string' && (value === 'nan' || value === 'NaN')) {
        console.warn(`⚠️  Cleaned "nan" value from field: ${key}`);
        cleaned[key] = null;
      }
      // Also handle "null" string
      else if (typeof value === 'string' && value === 'null') {
        cleaned[key] = null;
      }
      // Handle nested objects
      else if (typeof value === 'object' && value !== null) {
        cleaned[key] = this._cleanNanValues(value);
      }
    }
    
    return cleaned;
  }

  /**
   * Get recommendations for multiple songs
   * 
   * @param {Array} songs - Array of song objects with {songId, title, artist}
   * @param {number} topK - Number of recommendations per song
   * @returns {Promise} Batch recommendations
   */
  async getBulkRecommendations(songs, topK = 5) {
    try {
      const response = await this.client.post('/recommend/batch', {
        songs: songs.map(s => ({
          song_id: s.songId,
          title: s.title,
          artist: s.artist
        })),
        top_k: topK
      });

      console.log(`✅ Got bulk recommendations for ${response.data.count} songs`);
      return response.data.results;

    } catch (error) {
      console.error('Error getting bulk recommendations:', error.message);
      throw new Error(`Bulk recommendation error: ${error.message}`);
    }
  }

  /**
   * Map ML model IDs to database song IDs
   * This is needed because ML model uses sequential indices
   * You may need to adjust based on your database setup
   * 
   * @param {number} mlId - ML model song ID
   * @param {Array} databaseSongs - Songs from database
   * @returns {string} Database song ID
   */
  mapMLIdToDBId(mlId, databaseSongs) {
    if (Array.isArray(databaseSongs) && databaseSongs.length > mlId) {
      return databaseSongs[mlId]._id;
    }
    return null;
  }

  /**
   * Get recommendations and merge with database info
   * Enriches recommendations with additional database metadata
   * 
   * @param {string} songId - Song ID from database
   * @param {Object} songData - Song data from database
   * @param {Array} allDatabaseSongs - All songs from database (for ID mapping)
   * @param {number} topK - Number of recommendations
   * @returns {Promise} Enriched recommendations
   */
  async getEnrichedRecommendations(songId, songData, allDatabaseSongs, topK = 5) {
    try {
      const recommendations = await this.getRecommendations(
        songId,
        songData.title,
        songData.artist,
        topK
      );

      // Enrich with database information
      const enriched = {
        current_song: {
          ...recommendations.current_song,
          ...songData, // Add database metadata
          _id: songId
        },
        recommendations: recommendations.recommendations.map(rec => {
          // Clean any "nan" values from ML response
          const cleanedRec = this._cleanNanValues(rec);
          
          // Try to find matching database song
          const dbSong = allDatabaseSongs.find(
            s => s.title?.toLowerCase() === cleanedRec.title?.toLowerCase() && 
                 s.artist?.toLowerCase() === cleanedRec.artist?.toLowerCase()
          );
          
          // Add metadata from database or use defaults
          return {
            ...cleanedRec,
            ...dbSong, // Add database metadata (FileUrl, ImageUrl, etc.)
            _id: dbSong?._id || cleanedRec.id,
            FileUrl: dbSong?.FileUrl || 'MISSING', // Keep explicit
            ImageUrl: dbSong?.ImageUrl || cleanedRec.image || '', // Use ML image if DB doesn't have it
            url: dbSong?.FileUrl || cleanedRec.url || null, // Fallback to ML url
            score: cleanedRec.similarity_score,
            reason: cleanedRec.recommendation_reason,
            enriched: !!dbSong, // Mark if enriched from database
            source: dbSong ? 'database' : 'model'
          };
        })
      };

      return enriched;

    } catch (error) {
      console.error('Error enriching recommendations:', error.message);
      throw error;
    }
  }

  /**
   * Fetch missing song data from external API
   * For recommendations that don't have FileUrl from database
   * @param {Array} recommendations - Array of recommendations with missing data
   * @returns {Promise<Array>} - Enhanced recommendations with audio URLs
   */
  async enrichWithExternalData(recommendations) {
    const enriched = await Promise.all(
      recommendations.map(async (rec, index) => {
        // Clean "nan" values first
        const cleanRec = this._cleanNanValues(rec);
        
        // Skip if already has valid FileUrl or url
        if ((cleanRec.FileUrl && cleanRec.FileUrl !== 'MISSING' && cleanRec.FileUrl !== null) ||
            (cleanRec.url && cleanRec.url !== null && cleanRec.url !== 'nan')) {
          console.log(`⏭️  [${index + 1}] Skipping - already has FileUrl: ${cleanRec.title}`);
          return cleanRec;
        }

        try {
          // Try to fetch from external API
          const query = `${cleanRec.title} ${cleanRec.artist}`;
          console.log(`\n🔍 [${index + 1}] Enriching song with ID: "${cleanRec._id || 'unknown'}"`);
          console.log(`   Title: ${cleanRec.title}`);
          console.log(`   Artist: ${cleanRec.artist}`);
          console.log(`   Old URL: ${cleanRec.url || cleanRec.FileUrl || 'null'}`);
          console.log(`   Search Query: "${query}"`);
          
          const externalSongs = await fetchExternalSongs(query);
          const matched = externalSongs.find(
            s => s.name?.toLowerCase().includes(cleanRec.title?.toLowerCase()) ||
                 s.title?.toLowerCase().includes(cleanRec.title?.toLowerCase())
          );

          if (matched) {
            const audioUrl = matched.downloadUrl?.[4]?.url || matched.url;
            console.log(`✅ [${index + 1}] Found external data for: ${cleanRec.title}`);
            console.log(`   Matched Song ID: ${matched.id || matched._id || 'N/A'}`);
            console.log(`   New Audio URL: ${audioUrl ? '✓ Found' : '✗ Missing'}`);
            
            return {
              ...cleanRec,
              FileUrl: audioUrl || 'MISSING',
              url: audioUrl || null,
              ImageUrl: matched.image?.[2]?.url || matched.image || cleanRec.ImageUrl,
              source: 'external',
              enriched: true
            };
          }
          console.log(`⚠️  [${index + 1}] No match found for: ${cleanRec.title}`);
        } catch (error) {
          console.warn(`⚠️  [${index + 1}] Could not fetch external data for ${cleanRec.title} (_id: "${cleanRec._id}"):`, error.message);
        }

        return cleanRec;
      })
    );

    return enriched;
  }

  /**
   * Cache management helper
   */
  _setInCache(key, data) {
    recommendationCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  _getFromCache(key) {
    const cached = recommendationCache.get(key);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      recommendationCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear all recommendations cache
   */
  clearCache() {
    recommendationCache.clear();
    console.log('Recommendation cache cleared');
  }

  /**
   * Get service statistics
   */
  async getStats() {
    try {
      const response = await this.client.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting ML service stats:', error.message);
      return null;
    }
  }
}

// Export singleton instance
export default new RecommendationService();
