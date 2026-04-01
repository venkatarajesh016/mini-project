/**
 * Normalize songs from different sources into a unified format
 * This ensures local DB songs and external API songs have the same structure
 */

/**
 * Validate that URL is safe to use as audio stream (not a page URL)
 */
const isValidAudioUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // REJECT: Page URLs (CRITICAL FIX)
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
      console.error(`❌ Invalid URL detected (page not audio): ${url.substring(0, 80)}...`);
      return false;
    }
  }

  // ACCEPT: Valid audio stream indicators
  const validAudioPatterns = [
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

  let isValid = false;
  for (const pattern of validAudioPatterns) {
    if (url.includes(pattern)) {
      isValid = true;
      break;
    }
  }

  return isValid;
};

export const normalizeSong = (song, sourceType = 'local') => {
  if (sourceType === 'local') {
    // Normalize local database songs
    return {
      title: song.title,
      artist: song.artist,
      image: song.ImageUrl,
      audioUrl: song.FileUrl ? `http://localhost:5000${song.FileUrl}` : null,
      source: 'local',
      _id: song._id,
      album: song.album,
      genre: song.genre,
      duration: song.duration,
    };
  } else if (sourceType === 'external') {
    // Normalize JioSaavn API response songs
    let audioUrl = song.downloadUrl && song.downloadUrl[4] ? song.downloadUrl[4].url : song.audioUrl || null;
    
    // CRITICAL FIX: Validate audioUrl is NOT a page URL
    if (audioUrl && !isValidAudioUrl(audioUrl)) {
      console.warn(`❌ Rejected invalid audioUrl: ${audioUrl.substring(0, 80)}...`);
      audioUrl = null; // Must be null, never a page URL
    }
    
    // Wrap audio URL through backend proxy to avoid CORS issues
    // The proxy will handle adding appropriate headers
    if (audioUrl) {
      const encodedUrl = encodeURIComponent(audioUrl);
      audioUrl = `/api/proxy-audio?url=${encodedUrl}`;
      console.log(`🔄 Wrapped audio URL with proxy: ${audioUrl.substring(0, 80)}...`);
    }
    
    return {
      title: song.name || song.title || '',
      artist: song.primaryArtists || song.artist || '',
      image: song.image && song.image[2] ? song.image[2].url : song.image || '',
      audioUrl: audioUrl,
      source: 'external',
      _id: song.id || song._id || null,
      album: song.album || '',
      genre: song.genre || 'Unknown',
      duration: song.duration || '0',
    };
  }
  
  // Fallback for unknown sources
  return song;
};

/**
 * Normalize an array of songs
 */
export const normalizeSongs = (songs, sourceType = 'local') => {
  return songs.map(song => normalizeSong(song, sourceType));
};
