import axios from 'axios';

const API_BASE = 'https://spotify-puce-xi.vercel.app/api/search/songs?query=';

const PLAYLIST_CONFIGS = [
  {
    id: 'telugu_trending',
    query: 'telugu trending',
    title: 'Trending Telugu',
    description: 'Latest trending Telugu songs',
  },
  {
    id: 'chill_telugu',
    query: 'chill telugu songs',
    title: 'Chill Telugu',
    description: 'Relaxing Telugu melodies',
  },
  {
    id: 'sad_telugu',
    query: 'sad telugu songs',
    title: 'Sad Telugu',
    description: 'Emotional Telugu classics',
  },
  {
    id: 'workout_telugu',
    query: 'workout songs telugu',
    title: 'Workout Energy',
    description: 'High-energy workout tracks',
  },
  {
    id: 'study_music',
    query: 'study music telugu',
    title: 'Study Focus',
    description: 'Concentration-friendly songs',
  },
  {
    id: 'love_songs_telugu',
    query: 'love songs telugu',
    title: 'Love Melodies',
    description: 'Romantic Telugu love songs',
  },
  {
    id: 'party_hits',
    query: 'party songs telugu',
    title: 'Party Hits',
    description: 'Dance floor favorites',
  },
  {
    id: 'devotional_telugu',
    query: 'devotional telugu songs',
    title: 'Divine Melodies',
    description: 'Sacred and devotional classics',
  },
  {
    id: 'indie_telugu',
    query: 'indie telugu artists',
    title: 'Indie Gems',
    description: 'Independent Telugu underground hits',
  },
  {
    id: 'movie_hits',
    query: 'telugu movie hits songs',
    title: 'Movie Blockbusters',
    description: 'Hit songs from Telugu films',
  },
  {
    id: 'classical_fusion',
    query: 'telugu classical fusion',
    title: 'Classical Fusion',
    description: 'Where tradition meets modern',
  },
  {
    id: 'night_drives',
    query: 'night drive songs',
    title: 'Night Vibes',
    description: 'Perfect companion for late night drives',
  },
];

const fetchSongs = async (query) => {
  try {
    const url = `${API_BASE}${encodeURIComponent(query)}`;
    console.log(`[jioSaavnService] Fetching from: ${url}`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[jioSaavnService] Request timeout for query: ${query}`);
      controller.abort();
    }, 5000); // 5 second timeout
    
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log(`[jioSaavnService] Response status: ${response.status}, data type: ${typeof response.data}`);
    console.log(`[jioSaavnService] Response keys:`, Object.keys(response.data || {}).slice(0, 20));
    
    // Log the full response for debugging
    try {
      const jsonStr = JSON.stringify(response.data, null, 2);
      if (jsonStr.length > 2000) {
        console.log(`[jioSaavnService] Full response (first 2000 chars):`, jsonStr.slice(0, 2000));
      } else {
        console.log(`[jioSaavnService] Full response:`, jsonStr);
      }
    } catch (err) {
      console.log(`[jioSaavnService] Could not stringify response:`, err.message);
    }
    
    if (!response.data) {
      console.error(`[jioSaavnService] No data in response for query: ${query}`);
      return [];
    }

    // Handle both array and object responses
    let songsArray = [];
    
    if (Array.isArray(response.data)) {
      console.log(`[jioSaavnService] Response is an array`);
      songsArray = response.data;
    } else if (response.data.data && response.data.data.results && Array.isArray(response.data.data.results)) {
      console.log(`[jioSaavnService] Found songs in response.data.data.results (CORRECT STRUCTURE!)`);
      songsArray = response.data.data.results;
    } else if (response.data.results && Array.isArray(response.data.results)) {
      console.log(`[jioSaavnService] Found songs in response.data.results`);
      songsArray = response.data.results;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      console.log(`[jioSaavnService] Found songs in response.data.data`);
      songsArray = response.data.data;
    } else if (response.data.songs && Array.isArray(response.data.songs)) {
      console.log(`[jioSaavnService] Found songs in response.data.songs`);
      songsArray = response.data.songs;
    } else {
      console.warn(`[jioSaavnService] Could not find array in response for query: ${query}`);
      console.warn(`[jioSaavnService] Response object structure:`, Object.entries(response.data).map(([k, v]) => `${k}: ${typeof v} ${Array.isArray(v) ? `(length: ${v.length})` : ''}`));
      return [];
    }
    
    console.log(`[jioSaavnService] Found ${songsArray.length} songs for query: ${query}`);

    return songsArray.map((song) => {
      try {
        return {
          id: song.id || song.name || Math.random().toString(),
          title: song.name || song.title || 'Unknown',
          artist: song.artist || song.primaryArtists || 'Unknown Artist',
          album: song.album || 'Unknown Album',
          image: song.image || song.thumbnail || null,
          url: song.downloadUrl?.[4]?.url || song.downloadUrl?.[0]?.url || song.url || null,
          duration: song.duration || 0,
        };
      } catch (err) {
        console.error(`[jioSaavnService] Error mapping song:`, err, song);
        return null;
      }
    }).filter(s => s !== null);
  } catch (error) {
    console.error(`[jioSaavnService] Error fetching songs for query "${query}":`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
    });
    return [];
  }
};

export const getPlaylists = async () => {
  console.log('[jioSaavnService] Starting getPlaylists...');
  const playlists = [];

  for (const config of PLAYLIST_CONFIGS) {
    console.log(`[jioSaavnService] Generating playlist: ${config.title}`);
    const songs = await fetchSongs(config.query);
    
    console.log(`[jioSaavnService] Playlist "${config.title}" got ${songs.length} songs`);
    
    if (songs.length >= 8) {
      playlists.push({
        id: config.id,
        title: config.title,
        description: config.description,
        image: songs[0]?.image || null,
        songsCount: Math.min(songs.length, 10),
        songs: songs.slice(0, 10),
      });
      console.log(`[jioSaavnService] ✓ Added playlist: ${config.title}`);
    } else {
      console.warn(`[jioSaavnService] ✗ Skipped playlist "${config.title}" - only ${songs.length} songs (need 8+)`);
    }
  }

  console.log(`[jioSaavnService] Completed getPlaylists - created ${playlists.length} playlists`);
  return playlists;
};

export const getPlaylistById = async (playlistId) => {
  const config = PLAYLIST_CONFIGS.find((p) => p.id === playlistId);
  
  if (!config) {
    return null;
  }

  const songs = await fetchSongs(config.query);
  
  if (songs.length < 8) {
    return null;
  }

  return {
    id: config.id,
    title: config.title,
    description: config.description,
    image: songs[0]?.image || null,
    songsCount: Math.min(songs.length, 10),
    songs: songs.slice(0, 10),
  };
};

export const getAlbums = async () => {
  console.log('[jioSaavnService] Starting getAlbums...');
  const songs = await fetchSongs('telugu songs');
  
  console.log(`[jioSaavnService] Got ${songs.length} songs for album grouping`);
  
  const albumMap = {};

  songs.forEach((song) => {
    const albumName = song.album || 'Unknown Album';
    if (!albumMap[albumName]) {
      albumMap[albumName] = {
        title: albumName,
        artist: song.artist,
        image: song.image,
        songs: [],
      };
    }
    albumMap[albumName].songs.push(song);
  });

  const albums = Object.entries(albumMap)
    .filter(([_, albumData]) => albumData.songs.length >= 3)
    .map(([_, albumData], index) => ({
      id: `album_${index}`,
      title: albumData.title,
      artist: albumData.artist,
      image: albumData.image,
      songsCount: albumData.songs.length,
      songs: albumData.songs.slice(0, 15),
    }))
    .slice(0, 20);

  console.log(`[jioSaavnService] Completed getAlbums - created ${albums.length} albums`);
  return albums;
};

export const getAlbumByName = async (albumName) => {
  const songs = await fetchSongs(albumName);
  
  const filtered = songs.filter((s) => s.album?.toLowerCase() === albumName.toLowerCase());

  if (filtered.length === 0) {
    return null;
  }

  return {
    title: albumName,
    artist: filtered[0]?.artist || 'Unknown Artist',
    image: filtered[0]?.image || null,
    songsCount: filtered.length,
    songs: filtered,
  };
};
