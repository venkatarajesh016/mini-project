import { generatePlaylists, generateAlbums } from '../services/homeService.js';

export const getHomePageData = async (req, res) => {
  try {
    console.log('Fetching home page data from JioSaavn API...');

    // Fetch playlists and albums directly from JioSaavn
    const [playlists, albums] = await Promise.all([
      generatePlaylists(),
      generateAlbums(),
    ]);

    if (!playlists || playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No playlists available from JioSaavn',
        data: { playlists: [], albums: [] },
      });
    }

    res.json({
      success: true,
      message: 'Home page data fetched from JioSaavn API',
      data: {
        playlists,
        albums,
      },
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home data',
      error: error.message,
    });
  }
};
