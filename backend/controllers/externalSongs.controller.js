/**
 * Controller for external songs API
 * Handles requests to search external API (JioSaavn)
 */

import { fetchExternalSongs, validateExternalSongs } from '../services/externalSongsService.js';
import { normalizeSongs } from '../utils/normalizeSong.js';
import Song from '../models/songs.model.js';

/**
 * GET /external-songs?q=<query>
 * Fetch and normalize songs from external API
 * Falls back to local database if external API fails
 */
export const getExternalSongs = async (req, res) => {
  try {
    const { q } = req.query;

    // Validate query parameter
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required',
        songs: [],
      });
    }

    console.log(`\n🔎 Search request for: "${q}"`);

    // Try to fetch from external API
    const externalSongs = await fetchExternalSongs(q);
    console.log(`📥 Received ${externalSongs.length} songs from external API`);

    // If external API returns results, use them
    if (externalSongs.length > 0) {
      const validSongs = validateExternalSongs(externalSongs);
      console.log(`✅ Validated ${validSongs.length} songs`);

      const normalizedSongs = normalizeSongs(validSongs, 'external');
      console.log(`🎵 Normalized ${normalizedSongs.length} songs`);

      return res.status(200).json({
        success: true,
        source: 'external',
        query: q,
        count: normalizedSongs.length,
        songs: normalizedSongs,
      });
    }

    // Fallback: Search local database if external API fails
    console.log('⚠️  External API returned no results, falling back to local database');
    const localSongs = await Song.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
      ]
    }).limit(20);

    console.log(`📊 Found ${localSongs.length} songs in local database`);

    const normalizedSongs = normalizeSongs(localSongs, 'local');

    res.status(200).json({
      success: true,
      source: 'local_fallback',
      query: q,
      count: normalizedSongs.length,
      songs: normalizedSongs,
      notice: externalSongs.length === 0 ? 'Results from local database (external API unavailable)' : '',
    });

  } catch (error) {
    console.error('❌ Error in getExternalSongs:', error);

    // Return with data instead of just error
    res.status(200).json({
      success: false,
      message: 'Search service temporarily unavailable',
      query: req.query.q || '',
      count: 0,
      songs: [],
      error: error.message,
    });
  }
};

/**
 * GET /trending-telugu-songs
 * Fetch trending Telugu songs 
 */
export const getTrendingTeluguSongs = (req, res) => {
  res.json({
    success: true,
    message: 'Trending endpoint working',
    count: 0,
    songs: [],
  });
};


