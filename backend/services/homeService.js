const PLAYLIST_CONFIGS = [
  {
    id: 'trending_telugu',
    title: 'Trending Telugu',
    description: 'Popular Telugu songs trending now',
    keywords: ['telugu', 'trending'],
  },
  {
    id: 'chill_vibes',
    title: 'Chill Vibes',
    description: 'Relax and unwind with smooth melodies',
    keywords: ['chill', 'acoustic', 'slow'],
  },
  {
    id: 'workout_energy',
    title: 'Workout Energy',
    description: 'High-energy tracks to keep you motivated',
    keywords: ['energy', 'rock', 'pop', 'upbeat'],
  },
  {
    id: 'sad_songs',
    title: 'Sad Songs',
    description: 'Emotional and soulful melodies',
    keywords: ['sad', 'emotional', 'soul', 'ballad'],
  },
  {
    id: 'study_focus',
    title: 'Study Focus',
    description: 'Concentration-friendly instrumental tracks',
    keywords: ['instrumental', 'study', 'focus', 'ambient'],
  },
];

const MOOD_KEYWORDS = {
  trending_telugu: ['telugu', 'hit', 'trending', 'popular', 'top'],
  chill_vibes: ['chill', 'acoustic', 'slow', 'mellow', 'relax', 'soft'],
  workout_energy: ['energy', 'rock', 'pop', 'upbeat', 'fast', 'electronic', 'dance'],
  sad_songs: ['sad', 'emotional', 'soul', 'ballad', 'heartbreak', 'cry', 'blue'],
  study_focus: ['instrumental', 'study', 'focus', 'calm', 'ambient', 'classical'],
};

export const generatePlaylists = (songs) => {
  const playlists = [];

  PLAYLIST_CONFIGS.forEach((config) => {
    const playlistSongs = songs
      .filter((song) => {
        const title = (song.title || '').toLowerCase();
        const artist = (song.artist || '').toLowerCase();
        const combined = `${title} ${artist}`;

        return MOOD_KEYWORDS[config.id].some(
          (keyword) => combined.includes(keyword.toLowerCase())
        );
      })
      .slice(0, 12)
      .map((song) => ({
        id: song._id || song.id,
        title: song.title,
        artist: song.artist,
        image: song.image || song.thumbnail,
        url: song.url || song.downloadUrl,
        album: song.album,
        duration: song.duration,
      }));

    if (playlistSongs.length >= 8) {
      playlists.push({
        id: config.id,
        title: config.title,
        description: config.description,
        image: playlistSongs[0]?.image || null,
        songCount: playlistSongs.length,
        songs: playlistSongs,
      });
    }
  });

  return playlists;
};

export const generateAlbums = (songs) => {
  const albumMap = {};

  songs.forEach((song) => {
    const albumName = song.album || 'Unknown Album';
    if (!albumMap[albumName]) {
      albumMap[albumName] = {
        title: albumName,
        artist: song.artist || 'Unknown Artist',
        image: song.image || song.thumbnail,
        year: song.year || new Date().getFullYear(),
        songs: [],
      };
    }

    albumMap[albumName].songs.push({
      id: song._id || song.id,
      title: song.title,
      artist: song.artist,
      image: song.image || song.thumbnail,
      url: song.url || song.downloadUrl,
      duration: song.duration,
    });
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
};
