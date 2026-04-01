import axios from 'axios';

const JIOSAAVN_API_BASE = 'https://www.jiosaavn.com/api.php?__call=webapi.get';

const PLAYLIST_SEARCHES = [
  { id: 'trending_telugu', query: 'telugu hits', title: 'Trending Telugu', description: 'Popular Telugu songs trending now' },
  { id: 'chill_vibes', query: 'chill vibes', title: 'Chill Vibes', description: 'Relax and unwind with smooth melodies' },
  { id: 'workout_energy', query: 'workout energy', title: 'Workout Energy', description: 'High-energy tracks to keep you motivated' },
  { id: 'sad_songs', query: 'sad songs', title: 'Sad Songs', description: 'Emotional and soulful melodies' },
  { id: 'study_focus', query: 'study music', title: 'Study Focus', description: 'Concentration-friendly instrumental tracks' },
];

const fetchFromJioSaavn = async (query) => {
  try {
    const response = await axios.get(JIOSAAVN_API_BASE, {
      params: {
        type: 'search',
        query: query,
        p: 1,
        n: 20,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (response.data && response.data.results) {
      return response.data.results.map((song) => ({
        id: song.id,
        title: song.title || '',
        artist: song.artists?.primary?.map((a) => a.name).join(', ') || 'Unknown',
        album: song.album || 'Unknown Album',
        image: song.image?.replace('150x150', '500x500') || song.thumbnail,
        url: song.url || song.permaUrl,
        duration: song.duration || 0,
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching from JioSaavn for query "${query}":`, error);
    return [];
  }
};

export const generatePlaylists = async () => {
  const playlists = [];

  for (const config of PLAYLIST_SEARCHES) {
    try {
      const songs = await fetchFromJioSaavn(config.query);
      
      if (songs.length >= 8) {
        playlists.push({
          id: config.id,
          title: config.title,
          description: config.description,
          image: songs[0]?.image || null,
          songCount: songs.length,
          songs: songs.slice(0, 12),
        });
      }
    } catch (error) {
      console.error(`Error generating playlist for ${config.id}:`, error);
    }
  }

  return playlists;
};

export const generateAlbums = async () => {
  try {
    // Fetch top songs from multiple genres to create albums
    const genreQueries = ['hindi songs', 'bollywood hits', 'latest songs', 'top songs'];
    const allSongs = [];

    for (const query of genreQueries) {
      const songs = await fetchFromJioSaavn(query);
      allSongs.push(...songs);
    }

    const albumMap = {};

    allSongs.forEach((song) => {
      const albumName = song.album || 'Unknown Album';
      if (!albumMap[albumName]) {
        albumMap[albumName] = {
          title: albumName,
          artist: song.artist || 'Unknown Artist',
          image: song.image,
          year: new Date().getFullYear(),
          songs: [],
        };
      }

      if (!albumMap[albumName].songs.find((s) => s.id === song.id)) {
        albumMap[albumName].songs.push(song);
      }
    });

    const albums = Object.entries(albumMap)
      .filter(([_, albumData]) => albumData.songs.length >= 3)
      .map(([albumName, albumData], index) => ({
        id: `album_${index}`,
        title: albumData.title,
        artist: albumData.artist,
        year: albumData.year,
        image: albumData.image,
        songCount: albumData.songs.length,
        songs: albumData.songs.slice(0, 15),
      }))
      .slice(0, 20);

    return albums;
  } catch (error) {
    console.error('Error generating albums:', error);
    return [];
  }
};
