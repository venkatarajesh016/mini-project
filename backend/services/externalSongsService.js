/**
 * Service to fetch songs from JioSaavn API
 * This is a secondary data source alongside local MongoDB
 */

import axios from 'axios';

// Get API URL from environment or use fallback
const JIOSAAVN_API_URL = process.env.JIOSAAVN_API_URL || "https://spotify-puce-xi.vercel.app/api/search/songs";

/**
 * CRITICAL: Validate that URL is an audio stream URL, not a page URL
 * Prevents playing HTML pages as audio
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is valid audio stream URL
 */
export const isValidAudioUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // REJECT: Page URLs (the main issue)
  const pageUrlPatterns = [
    'jiosaavn.com/song/',
    'saavncdn.com/html',
    'jiocdn.com/html',
    '.html',
    'index.php',
    'page=',
  ];

  for (const pattern of pageUrlPatterns) {
    if (url.includes(pattern)) {
      console.error(`❌ REJECTED: Page URL detected: ${url.substring(0, 80)}...`);
      return false;
    }
  }

  // ACCEPT: Valid audio CDNs
  const validCdnPatterns = [
    'saavncdn.com',
    'jiocdn.com',
    'aac.saavncdn.com',
    'jax.saavncdn.com',
    'aac.saavjio.com',
    '.mp3',
    '.mp4',
    '.m4a',
    '.aac',
  ];

  let isValidCdn = false;
  for (const pattern of validCdnPatterns) {
    if (url.includes(pattern)) {
      isValidCdn = true;
      break;
    }
  }

  if (!isValidCdn) {
    console.error(`⚠️  Unknown CDN URL: ${url.substring(0, 80)}...`);
    return false;
  }

  return true;
};

/**
 * Fetch songs from JioSaavn unofficial API with retry logic
 * @param {string} query - Search query (song name, artist, etc.)
 * @returns {Promise<Array>} - Array of normalized song objects
 */
export const fetchExternalSongs = async (query) => {
  if (!query || query.trim() === '') {
    throw new Error('Query cannot be empty');
  }

  const maxRetries = 1; // Only try once  
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n🔍 [Attempt ${attempt}] Fetching from: ${JIOSAAVN_API_URL}`);
      console.log(`📝 Search Query: "${query.trim()}"`);
      
      const response = await axios.get(JIOSAAVN_API_URL, {
        params: {
          query: query.trim(),
        },
        timeout: 5000, // Reduced to 5 seconds for faster fallback
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ API Response received successfully');
      console.log('Response status:', response.status);
      
      // Ensure response has expected structure
      if (!response.data) {
        console.log('⚠️  Empty response data');
        return [];
      }

      // Extract songs array - API may return different structures
      // JioSaavn API returns: { success: true, data: { results: [...] } }
      const songs = response.data.data?.results || 
                    response.data.songs || 
                    response.data.results || 
                    response.data || [];
      
      console.log(`📊 Found ${Array.isArray(songs) ? songs.length : 0} songs from API`);
      
      // Log song IDs found
      if (Array.isArray(songs) && songs.length > 0) {
        console.log('   Song IDs returned:');
        songs.slice(0, 3).forEach((song, idx) => {
          console.log(`   [${idx + 1}] ID: ${song.id || song._id || 'N/A'} - ${song.name || song.title}`);
        });
      }
      
      return Array.isArray(songs) ? songs : [];
    } catch (error) {
      lastError = error;
      const errorInfo = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
      };
      console.error(`❌ Error fetching from external API:`, errorInfo);
      console.error(`   Query that failed: "${query.trim()}"`);
    }
  }

  // Fallback: Return empty array on all failures
  console.log('⚠️  External API failed for query: "' + query.trim() + '", returning empty array for fallback to local search');
  return [];
};

/**
 * Validate that external song has required fields
 * @param {Object} song - Song object to validate
 * @returns {boolean} - True if song has minimum required fields
 */
export const isValidExternalSong = (song) => {
  return song && (song.name || song.title);
};

/**
 * Filter and validate external songs
 * @param {Array} songs - Array of songs to filter
 * @returns {Array} - Filtered array of valid songs
 */
export const validateExternalSongs = (songs) => {
  return songs.filter(song => isValidExternalSong(song));
};
