import { getAlbums, getAlbumByName } from '../services/jioSaavnService.js';

export const getAllAlbums = async (req, res) => {
  try {
    const albums = await getAlbums();
    res.json({
      success: true,
      data: albums,
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch albums',
    });
  }
};

export const getAlbumDetails = async (req, res) => {
  try {
    const { albumName } = req.params;
    const album = await getAlbumByName(decodeURIComponent(albumName));

    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album not found',
      });
    }

    res.json({
      success: true,
      data: album,
    });
  } catch (error) {
    console.error('Error fetching album details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch album details',
    });
  }
};
