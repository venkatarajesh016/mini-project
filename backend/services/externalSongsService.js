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
 * Extract Song ID from JioSaavn URL
 * @param {string} urlString - JioSaavn song URL
 * @returns {Object} - { success: boolean, songId: string, error: string }
 */
export const extractSongIdFromJioSaavnUrl = (urlString) => {
  if (!urlString || typeof urlString !== 'string') {
    return { success: false, songId: null, error: 'URL must be a non-empty string' };
  }

  try {
    const url = new URL(urlString);
    
    // Check if it's a JioSaavn URL
    if (!url.hostname.includes('jiosaavn.com')) {
      return { success: false, songId: null, error: 'URL must be from jiosaavn.com' };
    }
    
    // Split path and filter empty segments
    const pathSegments = url.pathname.split('/').filter(segment => segment.trim());
    
    // Validate structure: /song/{songName}/{songId}
    if (pathSegments.length < 3 || pathSegments[0] !== 'song') {
      return { success: false, songId: null, error: 'Invalid JioSaavn song URL structure' };
    }
    
    const songId = pathSegments[2];
    
    // Validate Song ID format (typically 10-20 alphanumeric characters)
    if (!/^[a-zA-Z0-9]{8,20}$/.test(songId)) {
      return { success: false, songId: null, error: 'Invalid song ID format' };
    }
    
    console.log(`✅ Extracted Song ID from URL: ${songId}`);
    return { success: true, songId, error: null };
  } catch (error) {
    return { success: false, songId: null, error: `Invalid URL format: ${error.message}` };
  }
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

/**
 * Fetch trending Telugu songs from external API
 * @returns {Promise<Array>} - Array of trending Telugu songs
 */
export const fetchTrendingTeluguSongs = async () => {
  // Search for recently released, famous, and trending Telugu songs
  const trendingQueries = [
    'telugu new songs 2025',      // Recently released
    'telugu trending 2024',        // Currently trending
    'telugu blockbuster songs',    // Popular famous songs
    'telugu viral songs',          // Viral/trending content
  ];

  // Try multiple search queries to get diverse results
  for (const query of trendingQueries) {
    try {
      console.log(`\n🎵 Fetching: "${query}"`);
      
      const response = await axios.get(JIOSAAVN_API_URL, {
        params: {
          query: query.trim(),
        },
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Extract songs array
      const songs = response.data.data?.results || 
                    response.data.songs || 
                    response.data.results || 
                    response.data || [];
      
      if (Array.isArray(songs) && songs.length > 0) {
        console.log(`✅ Found ${songs.length} songs for: "${query}"`);
        return songs.slice(0, 6); // Return top 6
      }
    } catch (error) {
      console.error(`❌ Error fetching "${query}":`, error.message);
      continue; // Try next query
    }
  }

  // If all queries fail, return empty array
  console.log('⚠️  Could not fetch trending songs from external API');
  return [];
};

/**
 * Extract song ID from JioSaavn URL
 * Example: https://www.jiosaavn.com/song/radhika/IAEzZT9WZVw → IAEzZT9WZVw
 * @param {string} jiosaavnUrl - JioSaavn song URL
 * @returns {string|null} - Song ID or null if invalid
 */
export const extractSongIdFromUrl = (jiosaavnUrl) => {
  if (!jiosaavnUrl || typeof jiosaavnUrl !== 'string') {
    return null;
  }
  
  try {
    // Extract ID from URL - it's the last part after the last slash
    const parts = jiosaavnUrl.trim().split('/');
    const songId = parts[parts.length - 1];
    
    // Validate that it looks like a song ID (usually 12 alphanumeric characters)
    if (songId && songId.length >= 10) {
      console.log(`✅ Extracted song ID from URL: ${songId}`);
      return songId;
    }
    return null;
  } catch (error) {
    console.error('❌ Error extracting song ID:', error.message);
    return null;
  }
};

/**
 * Fetch metadata from JioSaavn page using scraping
 * This is a fallback if API doesn't return audio URL
 * @param {string} jiosaavnUrl - JioSaavn song URL
 * @returns {Promise<Object>} - Song metadata including audio URL
 */
export const fetchFromJioSaavnPage = async (jiosaavnUrl) => {
  try {
    console.log(`\n📄 Fetching metadata from JioSaavn page: ${jiosaavnUrl}`);
    
    const response = await axios.get(jiosaavnUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const html = response.data;
    
    // Try to extract JSON-LD data from page
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (jsonLd.name && (jsonLd.contentUrl || jsonLd.url)) {
          console.log(`✅ Extracted from JSON-LD: ${jsonLd.name}`);
          return {
            title: jsonLd.name,
            artist: jsonLd.byArtist?.name || 'Unknown',
            image: jsonLd.image,
            audioUrl: jsonLd.contentUrl || jsonLd.url,
            album: jsonLd.inAlbum?.name || 'Unknown',
            duration: jsonLd.duration || 'Unknown',
          };
        }
      } catch (e) {
        console.warn('Could not parse JSON-LD:', e.message);
      }
    }

    // Try to extract from meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]*)/);
    const descMatch = html.match(/<meta name="description" content="([^"]*)/);
    
    if (titleMatch) {
      console.log(`✅ Extracted title from meta: ${titleMatch[1]}`);
      return {
        title: titleMatch[1].split(' - ')[0] || 'Unknown',
        artist: titleMatch[1].split(' - ')[1] || 'Unknown',
        image: imageMatch ? imageMatch[1] : '',
        audioUrl: '', // Still can't get URL from page alone
        album: 'Unknown',
        duration: 'Unknown',
      };
    }

    console.warn('⚠️  Could not extract metadata from page');
    return null;
  } catch (error) {
    console.error('❌ Error fetching from JioSaavn page:', error.message);
    return null;
  }
};

/**
 * Try multiple strategies to get audio URL
 * @param {string} songId - JioSaavn song ID
 * @returns {Promise<string>} - Audio URL or empty string
 */
export const tryGetAudioUrl = async (songId, songData) => {
  console.log(`\n🔊 tryGetAudioUrl called`);
  console.log(`   songId: ${songId}`);
  console.log(`   songData exists: ${!!songData}`);
  
  // Strategy 1: Check if songData already has audio URL in downloadUrl array
  if (songData && songData.downloadUrl && Array.isArray(songData.downloadUrl)) {
    console.log(`\n📥 Strategy 1: downloadUrl array found with ${songData.downloadUrl.length} items`);
    
    // JioSaavn returns URLs in varying qualities:
    // downloadUrl[4] = 320kbps (highest)
    // downloadUrl[3] = 160kbps
    // downloadUrl[2] = 96kbps
    // downloadUrl[1] = preview
    
    for (let i = 4; i >= 0; i--) {
      const item = songData.downloadUrl[i];
      console.log(`   [${i}] Item type: ${typeof item}, has url: ${!!(item && item.url)}`);
      
      if (item && item.url && item.url.trim()) {
        const url = item.url;
        console.log(`   [${i}] URL found: ${url.substring(0, 80)}...`);
        // Validate audio URL (must not be a page URL)
        if (isValidAudioUrl(url)) {
          console.log(`✅ Strategy 1 SUCCESS: Valid audio URL at quality index ${i}`);
          return url;
        } else {
          console.warn(`⚠️  [${i}] Skipped - URL validation failed`);
        }
      } else {
        console.log(`   [${i}] Empty or no URL property`);
      }
    }
    console.log(`⚠️  Strategy 1 FAILED: No valid URL in downloadUrl array`);
  } else {
    console.log(`\n📥 Strategy 1: SKIPPED - downloadUrl not available or not array`);
    if (songData) {
      console.log(`   songData keys: ${Object.keys(songData).join(', ').substring(0, 100)}`);
    }
  }

  // Strategy 2: Check direct audio URL fields
  console.log(`\n🔗 Strategy 2: Checking direct audio URL fields...`);
  const directUrls = ['audioUrl', 'url', 'playUrl', 'streamUrl', 'file'];
  for (const field of directUrls) {
    if (songData && songData[field] && typeof songData[field] === 'string' && songData[field].trim()) {
      const url = songData[field];
      console.log(`   ${field}: ${url.substring(0, 60)}...`);
      if (isValidAudioUrl(url)) {
        console.log(`✅ Strategy 2 SUCCESS: Found valid URL in ${field}`);
        return url;
      } else {
        console.log(`   ${field}: Invalid (failed validation)`);
      }
    }
  }
  console.log(`⚠️  Strategy 2 FAILED: No direct audio URLs found`);

  // Strategy 3: Try to construct audio URL from song ID pattern - with jiocdn.com
  console.log(`\n🔗 Strategy 3: Trying CDN construction patterns...`);
  const cdnPatterns = [
    `https://aac.saavncdn.com/${songId}_320.mp4`,
    `https://aac.saavncdn.com/${songId}_160.mp4`,
    `https://aac.saavjio.com/${songId}_320.m4a`,
    `https://jax.saavncdn.com/${songId}_320.mp4`,
  ];

  for (const url of cdnPatterns) {
    try {
      console.log(`   Testing: ${url.substring(0, 60)}...`);
      const headResponse = await axios.head(url, {
        timeout: 2000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        maxRedirects: 5,
      });
      
      if (headResponse.status === 200 || headResponse.status === 206) {
        console.log(`✅ Strategy 3 SUCCESS: CDN URL responds with ${headResponse.status}`);
        return url;
      } else {
        console.log(`   Status: ${headResponse.status}`);
      }
    } catch (e) {
      console.log(`   Error: ${e.code || e.message}`);
    }
  }
  console.log(`⚠️  Strategy 3 FAILED: No working CDN patterns found`);

  console.log(`\n❌ tryGetAudioUrl: No audio URL found through any strategy`);
  return '';
};

/**
 * Fetch song details from JioSaavn API using song ID
 * @param {string} songId - JioSaavn song ID (e.g., IAEzZT9WZVw)
 * @returns {Promise<Object>} - Song object with metadata and streaming URL
 */
/**
 * Extract artist name(s) as string from various formats
 * Handles objects, arrays, and strings
 */
const extractArtistName = (artistData) => {
  if (!artistData) return 'Unknown Artist';
  
  // If it's already a string, return it
  if (typeof artistData === 'string') {
    return artistData;
  }
  
  // If it's an object with primary artists array
  if (artistData.primary && Array.isArray(artistData.primary) && artistData.primary.length > 0) {
    return artistData.primary.map(a => a.name || a.title).join(', ');
  }
  
  // If it's an object with all artists array
  if (artistData.all && Array.isArray(artistData.all) && artistData.all.length > 0) {
    // Filter to only show singers/primary artists (skip music directors, etc.)
    const singers = artistData.all.filter(a => a.role === 'singer' || a.role === 'primary_artists' || !a.role);
    if (singers.length > 0) {
      return singers.map(a => a.name || a.title).join(', ');
    }
    return artistData.all.slice(0, 2).map(a => a.name || a.title).join(', ');
  }
  
  // If it's an array
  if (Array.isArray(artistData)) {
    return artistData.map(a => typeof a === 'string' ? a : (a.name || a.title || '')).filter(Boolean).join(', ');
  }
  
  // Fallback
  return 'Unknown Artist';
};

/**
 * Extract song name from JioSaavn URL slug
 * Example: "https://www.jiosaavn.com/song/undiporaadhey-sad-version/GThGf0djcXs"
 * Extracts: "undiporaadhey sad version"
 */
const extractSongNameFromSlug = (urlSlug) => {
  if (!urlSlug) return '';
  // Replace hyphens with spaces and clean up
  return urlSlug.replace(/-/g, ' ').trim();
};

export const fetchSongByJioSaavnId = async (songId, jiosaavnUrl = '') => {
  if (!songId || typeof songId !== 'string') {
    throw new Error('Invalid song ID');
  }

  console.log(`\n🔍 Fetching JioSaavn song by ID: ${songId}`);
  console.log(`📍 Using Song ID: "${songId}"`);
  
  try {
    // First, try to extract song name from the URL slug for better search accuracy
    let searchQuery = songId;
    if (jiosaavnUrl) {
      // Extract song name from URL
      const urlMatch = jiosaavnUrl.match(/\/song\/([^\/]+)\//);
      if (urlMatch && urlMatch[1]) {
        searchQuery = extractSongNameFromSlug(urlMatch[1]);
        console.log(`📝 Extracted song name from URL: "${searchQuery}"`);
      }
    }

    // CHANGED: Use the working Vercel proxy API with song name search instead of song ID
    console.log(`📡 Calling Vercel Proxy API with search query...`);
    
    const endpoint = `${JIOSAAVN_API_URL.replace('/search/songs', '')}/search/songs?query=${encodeURIComponent(searchQuery)}&n=10`;
    console.log(`📍 Trying: ${endpoint.substring(0, 100)}...`);
    
    const response = await axios.get(endpoint, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // Proxy API returns: { success: true, data: { results: [...] } }
    const results = response.data?.data?.results || [];
    
    if (!results || results.length === 0) {
      console.log(`⚠️  No search results for "${searchQuery}"`);
      throw new Error('API returned no song data');
    }

    // Find song with matching ID or use first result
    let songData = results.find(song => song.id === songId);
    
    if (!songData) {
      // Use first result if ID doesn't match (likely same song in different quality/region)
      songData = results[0];
      console.log(`⚠️  No exact ID match (${songId}), using first search result: ${songData.id}`);
    }
    
    if (songData && (songData.name || songData.title)) {
      console.log(`✅ Got song from API: ${songData.name || songData.title}`);
      
      // DEBUG: Show what fields are in the response
      console.log(`\n🔍 DEBUG - API Response fields:`);
      console.log(`   - name: ${!!songData.name ? '✅' : '❌'}`);
      console.log(`   - downloadUrl: ${!!songData.downloadUrl ? '✅ (length: ' + songData.downloadUrl.length + ')' : '❌'}`);
      
      // If downloadUrl exists, show the URLs
      if (songData.downloadUrl && Array.isArray(songData.downloadUrl)) {
        console.log(`\n📥 downloadUrl array (${songData.downloadUrl.length} items):`);
        songData.downloadUrl.forEach((item, idx) => {
          if (item && item.url) {
            console.log(`   [${idx}] Quality: ${item.quality || 'unknown'}, URL: ${item.url.substring(0, 70)}...`);
          }
        });
      }
      
      return songData;
    }
    
    console.log(`⚠️  API response has no valid song data`);
    throw new Error('API returned empty song data');
  } catch (error) {
    console.log(`⚠️  Proxy API failed: ${error.message}`);
    throw error;
  }
};

/**
 * Fetch complete song data from JioSaavn URL
 * @param {string} jiosaavnUrl - JioSaavn song URL
 * @returns {Promise<Object>} - Complete song data with title, artist, image, audioUrl, etc.
 */
export const fetchSongFromJioSaavnUrl = async (jiosaavnUrl) => {
  try {
    // Step 1: Extract song ID from URL
    const songId = extractSongIdFromUrl(jiosaavnUrl);
    if (!songId) {
      throw new Error('Could not extract song ID from URL');
    }

    console.log(`\n🎵 Processing JioSaavn song: ${jiosaavnUrl}`);
    console.log(`📍 Song ID: ${songId}`);

    let songData = null;
    let audioUrl = '';
    let title = 'Unknown Song';
    let artist = 'Unknown Artist';

    // Step 2: Try to fetch from API
    try {
      console.log(`\n📍 DEBUG: About to call fetchSongByJioSaavnId()`);
      console.log(`📍 DEBUG: songId = "${songId}"`);
      console.log(`📍 DEBUG: jiosaavnUrl = "${jiosaavnUrl}"`);
      
      songData = await fetchSongByJioSaavnId(songId, jiosaavnUrl);
      
      if (songData) {
        title = songData.name || songData.title || title;
        // Use helper to extract artist name as string
        artist = extractArtistName(songData.primaryArtists || songData.artist || songData.artists);
        audioUrl = await tryGetAudioUrl(songId, songData);
      }
    } catch (apiError) {
      console.warn(`⚠️  API fetch failed: ${apiError.message}`);
      console.log(`\n🔄 FALLBACK: Using direct CDN converter instead...`);
      
      // Fallback: Use the direct converter function
      audioUrl = convertSongIdToAudioUrl(songId);
      console.log(`✅ Fallback audio URL: ${audioUrl}`);
    }

    // Step 3: If API failed or no audio URL, try scraping the page
    if (!audioUrl) {
      console.log(`\n🔄 API didn't yield audio URL, trying page scraping...`);
      const pageData = await fetchFromJioSaavnPage(jiosaavnUrl);
      if (pageData) {
        title = pageData.title || title;
        artist = pageData.artist || artist;
        audioUrl = await tryGetAudioUrl(songId, pageData);
      }
    }

    // Step 4: If still no audio URL, try CDN patterns
    if (!audioUrl) {
      console.log(`\n🔄 Trying direct CDN patterns...`);
      audioUrl = await tryGetAudioUrl(songId, null);
    }

    // Step 5: Validate that audioUrl is NOT a page URL
    if (audioUrl && (audioUrl.includes('jiosaavn.com') || audioUrl.includes('/song/'))) {
      console.error(`❌ CRITICAL: audioUrl contains page URL instead of audio stream!`);
      console.error(`   Invalid audioUrl: ${audioUrl}`);
      audioUrl = ''; // Reset to empty
    }

    // Step 6: Build final response
    const result = {
      title: title,
      artist: artist,
      image: songData?.image && Array.isArray(songData.image) && songData.image[2] ? songData.image[2].url : (songData?.image || ''),
      audioUrl: audioUrl || '', // May be empty if all strategies failed
      album: songData?.album || songData?.albumTitle || 'Unknown',
      duration: songData?.duration ? `${Math.floor(songData.duration / 60)}:${String(songData.duration % 60).padStart(2, '0')}` : '0:00',
      genre: songData?.genre || 'Unknown',
      source: 'jiosaavn',
      songId: songId,
      jiosaavnUrl: jiosaavnUrl,
    };

    console.log(`\n✅ Final result:`, {
      title: result.title,
      artist: result.artist,
      hasAudioUrl: !!result.audioUrl,
      audioUrlPreview: result.audioUrl ? result.audioUrl.substring(0, 60) + '...' : 'MISSING',
    });

    if (!result.audioUrl) {
      console.warn(`⚠️  WARNING: No audio URL found! The song may not play.`);
      console.warn(`   Song: ${title} by ${artist}`);
      console.warn(`   Source URL: ${jiosaavnUrl}`);
    }

    return result;
  } catch (error) {
    console.error('❌ Error in fetchSongFromJioSaavnUrl:', error.message);
    throw error;
  }
};

/**
 * DIRECT CONVERTER: Take a Song ID and convert to audio URL
 * Simple, synchronous function - no API calls needed
 * @param {string} songId - JioSaavn song ID (e.g., Hj1SCUBYAXs)
 * @returns {string} - Audio URL (e.g., https://aac.saavncdn.com/Hj1SCUBYAXs_320.mp4) ✅
 */
export const convertSongIdToAudioUrl = (songId) => {
  if (!songId || typeof songId !== 'string' || songId.trim() === '') {
    console.error('❌ Invalid Song ID provided');
    return '';
  }

  const cleanId = songId.trim();
  
  // Primary CDN format: https://aac.saavncdn.com/{songId}_320.mp4 ✅ Audio stream URL
  const audioUrl = `https://aac.saavncdn.com/${cleanId}_320.mp4`;
  
  console.log(`✅ Converted Song ID to Audio URL:`);
  console.log(`   Song ID: ${cleanId}`);
  console.log(`   Audio URL: ${audioUrl}`);
  
  return audioUrl;
};

/**
 * DIRECT CONVERTER: Take a JioSaavn page URL and convert to audio URL
 * Example: https://www.jiosaavn.com/song/leharaayi/Hj1SCUBYAXs 
 * → Hj1SCUBYAXs 
 * → https://aac.saavncdn.com/Hj1SCUBYAXs_320.mp4 ✅
 * @param {string} jiosaavnUrl - JioSaavn song page URL
 * @returns {string} - Audio URL or empty string if invalid
 */
export const convertJioSaavnUrlToAudioUrl = (jiosaavnUrl) => {
  if (!jiosaavnUrl || typeof jiosaavnUrl !== 'string') {
    console.error('❌ Invalid URL provided');
    return '';
  }

  try {
    // Extract Song ID from URL
    const songId = extractSongIdFromUrl(jiosaavnUrl);
    
    if (!songId) {
      console.error('❌ Could not extract Song ID from URL');
      return '';
    }

    // Convert to audio URL
    const audioUrl = convertSongIdToAudioUrl(songId);
    
    console.log(`✅ Extracted ID from JioSaavn URL and converted:`);
    console.log(`   Input URL: ${jiosaavnUrl}`);
    console.log(`   Song ID: ${songId}`);
    console.log(`   Audio URL: ${audioUrl} ✅`);
    
    return audioUrl;
  } catch (error) {
    console.error('❌ Error converting URL to audio URL:', error.message);
    return '';
  }
};
