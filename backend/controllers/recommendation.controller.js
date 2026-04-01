/**
 * Recommendation Controller
 * Handles incoming recommendation requests from frontend
 * Calls ML service and formats responses
 */

import recommendationService from '../services/recommendationService.js';
import Song from '../models/songs.model.js'; // Adjust based on your model name

/**
 * GET /api/recommend/:id
 * Get recommendations for a specific song
 */
export const getRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const { topK = 5 } = req.query;

    // Get song from database
    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({
        status: 'error',
        message: 'Song not found'
      });
    }

    // Get all songs for ID mapping - INCLUDE FileUrl and ImageUrl!
    const allSongs = await Song.find({}).select('title artist album genre singer FileUrl ImageUrl duration');

    // Get recommendations from ML service
    const recommendations = await recommendationService.getEnrichedRecommendations(
      id.toString(),
      {
        title: song.title,
        artist: song.artist,
        album: song.album,
        genre: song.genre,
        singer: song.singer,
        image: song.ImageUrl || '',
        url: song.FileUrl || ''
      },
      allSongs,
      parseInt(topK)
    );

    // Check if any recommendations are missing FileUrl, enrich from external API
    const hasMissing = recommendations.recommendations?.some(r => r.FileUrl === 'MISSING');
    if (hasMissing) {
      console.log(`⚠️  Found missing FileUrl data, enriching from external API...`);
      recommendations.recommendations = await recommendationService.enrichWithExternalData(
        recommendations.recommendations
      );
    }

    res.status(200).json({
      status: 'success',
      data: recommendations
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get recommendations'
    });
  }
};

/**
 * POST /api/recommend
 * Get recommendations with custom song details
 * Useful for frontend-provided songs or fallback scenarios
 */
export const getRecommendationsByDetails = async (req, res) => {
  try {
    const { songId, title, artist, topK = 5 } = req.body;

    if (!songId && !title) {
      return res.status(400).json({
        status: 'error',
        message: 'Either songId or title is required'
      });
    }

    const recommendations = await recommendationService.getRecommendations(
      songId,
      title,
      artist,
      parseInt(topK)
    );

    res.status(200).json({
      status: 'success',
      data: recommendations
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * POST /api/recommend/from-url
 * Get recommendations for a JioSaavn song from URL
 * Extracts Song ID from JioSaavn URL and gets recommendations
 * Example: https://www.jiosaavn.com/song/radhika/IAEzZT9WZVw
 */
export const getRecommendationsByJioSaavnUrl = async (req, res) => {
  try {
    const { songUrl, topK = 5 } = req.body;

    if (!songUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Song URL is required'
      });
    }

    // Import extraction function
    const { extractSongIdFromJioSaavnUrl } = await import('../services/externalSongsService.js');
    
    // Extract Song ID from URL
    const extractionResult = extractSongIdFromJioSaavnUrl(songUrl);
    
    if (!extractionResult.success) {
      return res.status(400).json({
        status: 'error',
        message: extractionResult.error,
        url: songUrl
      });
    }

    const { songId } = extractionResult;
    console.log(`🎵 Got Song ID: ${songId} from URL`);

    // Try to find song in database first
    let songDetails = null;
    try {
      const savedSong = await Song.findById(songId);
      if (savedSong) {
        songDetails = {
          title: savedSong.title,
          artist: savedSong.artist,
          album: savedSong.album,
          genre: savedSong.genre
        };
        console.log(`✅ Found song in database: ${savedSong.title}`);
      }
    } catch (dbError) {
      console.log(`⚠️  Song not in database, using URL-extracted ID only`);
    }

    // Get recommendations using extracted Song ID
    const recommendations = await recommendationService.getRecommendations(
      songId,
      songDetails?.title || 'Unknown',
      songDetails?.artist || 'Unknown',
      parseInt(topK)
    );

    res.status(200).json({
      status: 'success',
      data: {
        extractedSongId: songId,
        sourceUrl: songUrl,
        songDetails: songDetails,
        recommendations: recommendations
      }
    });

  } catch (error) {
    console.error('Recommendation URL error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get recommendations from URL'
    });
  }
};

/**
 * POST /api/recommend/batch
 * Get recommendations for multiple songs at once
 */
export const getBulkRecommendations = async (req, res) => {
  try {
    const { songIds, topK = 5 } = req.body;

    if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'songIds array is required'
      });
    }

    // Get songs from database
    const songs = await Song.find({ _id: { $in: songIds } });
    
    if (songs.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No songs found'
      });
    }

    // Get bulk recommendations
    const bulkData = songs.map(s => ({
      songId: s._id.toString(),
      title: s.title,
      artist: s.artist
    }));

    const results = await recommendationService.getBulkRecommendations(
      bulkData,
      parseInt(topK)
    );

    res.status(200).json({
      status: 'success',
      data: results,
      count: results.length
    });

  } catch (error) {
    console.error('Bulk recommendation error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * GET /api/recommend/health
 * Check ML service health
 */
export const healthCheck = async (req, res) => {
  try {
    const health = await recommendationService.healthCheck();
    res.status(200).json({
      status: health.available ? 'success' : 'warning',
      ml_service: health
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * GET /api/recommend/stats
 * Get ML service statistics
 */
export const getStats = async (req, res) => {
  try {
    const stats = await recommendationService.getStats();

    if (!stats) {
      return res.status(503).json({
        status: 'error',
        message: 'ML service unavailable'
      });
    }

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * POST /api/recommend/cache/clear
 * Clear recommendation cache (admin only)
 */
export const clearCache = async (req, res) => {
  try {
    recommendationService.clearCache();

    res.status(200).json({
      status: 'success',
      message: 'Recommendation cache cleared'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
