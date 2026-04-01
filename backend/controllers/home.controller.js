import Song from '../models/songs.model.js';
import { generatePlaylists, generateAlbums } from '../services/homeService.js';

export const getHomePageData = async (req, res) => {
  try {
    const songs = await Song.find().limit(200).lean();

    if (!songs.length) {
      return res.status(404).json({ error: 'No songs found' });
    }

    const playlists = generatePlaylists(songs);
    const albums = generateAlbums(songs);

    res.json({
      playlists,
      albums,
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ error: 'Failed to fetch home data' });
  }
};
